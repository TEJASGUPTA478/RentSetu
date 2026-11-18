import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import { env } from './config/env.js'
import apiRouter from './routes/index.js'
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'
import { sendSuccess } from './utils/response.js'

const app = express()
const openapi = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: { title: 'RentSetu API', version: '1.0.0', description: 'Authentication and dashboard API for the RentSetu rental-management app.' },
    servers: [{ url: `http://localhost:${env.PORT}`, description: 'Local development' }],
    tags: [
      { name: 'Health', description: 'Service health' },
      { name: 'Dashboard', description: 'Role-scoped dashboard summaries' },
      { name: 'Auth', description: 'Registration, sign-in, and authenticated account endpoints' },
      { name: 'Properties and Units', description: 'Person 3: add property and unit endpoints here' },
      { name: 'Tenants and Leases', description: 'Person 3: add tenant and lease endpoints here' },
      { name: 'Payments', description: 'Payment listing, detail, and recording endpoints' },
      { name: 'Maintenance', description: 'Maintenance request listing, creation, and status management endpoints' },
    ],
    components: {
      securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
      schemas: {
        SuccessEnvelope: { type: 'object', required: ['success', 'data'], properties: { success: { type: 'boolean', example: true }, data: { type: 'object' }, message: { type: 'string' }, meta: { type: 'object' } } },
        ErrorEnvelope: { type: 'object', required: ['success', 'error'], properties: { success: { type: 'boolean', example: false }, error: { type: 'object', required: ['code', 'message'], properties: { code: { type: 'string' }, message: { type: 'string' }, details: { type: 'array', items: { type: 'object' } } } } } },
        RegisterRequest: { type: 'object', required: ['name', 'email', 'password'], properties: { name: { type: 'string', minLength: 2, maxLength: 100 }, email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 8, maxLength: 100 }, role: { type: 'string', enum: ['LANDLORD'], default: 'LANDLORD' } } },
        LoginRequest: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 1 } } },
        ChangePasswordRequest: { type: 'object', required: ['currentPassword', 'newPassword'], properties: { currentPassword: { type: 'string', minLength: 1 }, newPassword: { type: 'string', minLength: 8, maxLength: 100 } } },
        LandlordDashboard: { type: 'object', required: ['totalProperties', 'totalUnits', 'occupiedUnits', 'vacantUnits', 'occupancyRate', 'rentCollectedThisMonth', 'expectedRentThisMonth', 'overdueCount', 'overdueAmount', 'openMaintenanceRequests', 'recentPayments', 'rentCollectedByMonth'], properties: {
          totalProperties: { type: 'integer' }, totalUnits: { type: 'integer' }, occupiedUnits: { type: 'integer' }, vacantUnits: { type: 'integer' }, occupancyRate: { type: 'number' },
          rentCollectedThisMonth: { type: 'number' }, expectedRentThisMonth: { type: 'number' }, overdueCount: { type: 'integer' }, overdueAmount: { type: 'number' }, openMaintenanceRequests: { type: 'integer' },
          recentPayments: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, tenant: { type: 'string' }, tenantEmail: { type: 'string' }, property: { type: 'string' }, unit: { type: 'string' }, amount: { type: 'number' }, billingMonth: { type: 'string', format: 'date' }, due: { type: 'string', format: 'date' }, paid: { type: 'string', format: 'date' }, status: { type: 'string', enum: ['Paid'] } } } },
          rentCollectedByMonth: { type: 'array', items: { type: 'object', properties: { billingMonth: { type: 'string', format: 'date' }, amount: { type: 'number' } } } },
        } },
        TenantDashboard: { type: 'object', required: ['activeLease', 'monthlyRent', 'nextDueDate', 'currentMonthStatus', 'lastPayment', 'openMaintenanceRequestCount'], properties: {
          activeLease: { nullable: true, type: 'object', properties: { id: { type: 'string' }, unitId: { type: 'string' }, unit: { type: 'string' }, propertyId: { type: 'string' }, property: { type: 'string' }, address: { type: 'string' }, startDate: { type: 'string', format: 'date' }, endDate: { type: 'string', format: 'date' } } },
          monthlyRent: { type: 'number' }, nextDueDate: { type: 'string', format: 'date', nullable: true }, currentMonthStatus: { type: 'string', enum: ['PAID', 'PENDING', 'OVERDUE'] },
          lastPayment: { type: 'object', nullable: true }, openMaintenanceRequestCount: { type: 'integer' },
        } },
        CreatePropertyRequest: {
          type: 'object',
          required: ['name', 'address', 'city', 'state', 'pincode', 'type'],
          properties: {
            name: { type: 'string', example: 'Maple Residency' },
            address: { type: 'string', example: '24, 12th Main Road' },
            city: { type: 'string', example: 'Bengaluru' },
            state: { type: 'string', example: 'Karnataka' },
            pincode: { type: 'string', example: '560038' },
            type: { type: 'string', example: 'Apartment' },
            managerId: { type: 'string', format: 'uuid', nullable: true },
          },
        },
        CreateUnitRequest: {
          type: 'object',
          required: ['propertyId', 'unitNumber', 'rent', 'bedrooms'],
          properties: {
            propertyId: { type: 'string', format: 'uuid' },
            unitNumber: { type: 'string', example: 'A-101' },
            rent: { type: 'number', example: 25000 },
            bedrooms: { type: 'integer', example: 2 },
            status: { type: 'string', enum: ['VACANT', 'OCCUPIED'], default: 'VACANT' },
          },
        },
        CreateTenantRequest: {
          type: 'object',
          required: ['name', 'email', 'phone'],
          properties: {
            name: { type: 'string', example: 'Aarav Sharma' },
            email: { type: 'string', format: 'email', example: 'aarav.tenant@example.com' },
            phone: { type: 'string', example: '+91 98765 43210' },
            password: { type: 'string', example: 'Password@123' },
            emergencyContactName: { type: 'string' },
            emergencyContactPhone: { type: 'string' },
            idProofType: { type: 'string' },
            idProofNumber: { type: 'string' },
          },
        },
        CreateLeaseRequest: {
          type: 'object',
          required: ['unitId', 'tenantId', 'startDate', 'endDate', 'monthlyRent', 'securityDeposit', 'dueDay'],
          properties: {
            unitId: { type: 'string', format: 'uuid' },
            tenantId: { type: 'string', format: 'uuid' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            monthlyRent: { type: 'number', example: 25000 },
            securityDeposit: { type: 'number', example: 50000 },
            dueDay: { type: 'integer', minimum: 1, maximum: 28, example: 5 },
            status: { type: 'string', enum: ['ACTIVE', 'ENDED', 'TERMINATED'], default: 'ACTIVE' },
          },
        },
        CreatePaymentRequest: {
          type: 'object',
          required: ['leaseId', 'billingMonth', 'amount', 'method'],
          properties: {
            leaseId: { type: 'string', format: 'uuid' },
            billingMonth: { type: 'string', format: 'date', example: '2026-11-01' },
            amount: { type: 'number', example: 25000 },
            method: { type: 'string', enum: ['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD'], example: 'UPI' },
            paidOn: { type: 'string', format: 'date', example: '2026-11-04' },
            notes: { type: 'string', example: 'Rent for November' },
          },
        },
        UpdatePaymentRequest: {
          type: 'object',
          properties: {
            amount: { type: 'number', example: 25000 },
            method: { type: 'string', enum: ['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD'] },
            billingMonth: { type: 'string', format: 'date' },
            paidOn: { type: 'string', format: 'date' },
            notes: { type: 'string' },
          },
        },
        CreateMaintenanceRequest: {
          type: 'object',
          required: ['title', 'description'],
          properties: {
            title: { type: 'string', example: 'Kitchen sink tap leaking' },
            description: { type: 'string', example: 'Tap drips continuously under the counter.' },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
            unitId: { type: 'string', format: 'uuid' },
            leaseId: { type: 'string', format: 'uuid' },
            tenantId: { type: 'string', format: 'uuid' },
          },
        },
        UpdateMaintenanceRequest: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] },
            priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] },
            title: { type: 'string' },
            description: { type: 'string' },
          },
        },
      },
    },
    paths: {
      '/api/health': { get: { tags: ['Health'], summary: 'Check API health', responses: { 200: { description: 'Service is available', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } } } } },
      '/api/auth/register': {
        post: {
          tags: ['Auth'], summary: 'Register a landlord account',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } },
          responses: {
            201: { description: 'Account created', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
            400: { description: 'Invalid registration details', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } } },
            409: { description: 'Email is already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } } },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'], summary: 'Sign in and receive a bearer token',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } } },
          responses: {
            200: { description: 'Signed in', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
            400: { description: 'Invalid request', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } } },
            401: { description: 'Invalid email or password', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } } },
            403: { description: 'Account is deactivated', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } } },
          },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'], summary: 'Get the authenticated user', security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Authenticated user', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
            401: { description: 'Authentication required', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } } },
          },
        },
      },
      '/api/auth/change-password': {
        post: {
          tags: ['Auth'], summary: 'Change the authenticated user password', security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ChangePasswordRequest' } } } },
          responses: {
            200: { description: 'Password changed', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
            400: { description: 'Invalid request or current password', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } } },
            401: { description: 'Authentication required', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } } },
            404: { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } } },
          },
        },
      },
      '/api/dashboard/landlord': {
        get: {
          tags: ['Dashboard'], summary: 'Get a landlord or manager dashboard', security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Portfolio summary', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/LandlordDashboard' } } } } } },
            401: { description: 'Authentication required', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } } },
            403: { description: 'Role is not allowed', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } } },
          },
        },
      },
      '/api/dashboard/tenant': {
        get: {
          tags: ['Dashboard'], summary: 'Get the signed-in tenant dashboard', security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Active lease summary', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/TenantDashboard' } } } } } },
            401: { description: 'Authentication required', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } } },
            403: { description: 'Role is not allowed', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } } },
          },
        },
      },
      '/api/properties': {
        get: {
          tags: ['Properties and Units'], summary: 'List properties for authenticated landlord/manager', security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'search', schema: { type: 'string' } },
            { in: 'query', name: 'city', schema: { type: 'string' } },
            { in: 'query', name: 'type', schema: { type: 'string' } },
            { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
            { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
          ],
          responses: {
            200: { description: 'Properties list', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
            401: { description: 'Authentication required', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } } },
          },
        },
        post: {
          tags: ['Properties and Units'], summary: 'Create a property', security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePropertyRequest' } } } },
          responses: {
            201: { description: 'Property created', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
            400: { description: 'Invalid data', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } } },
            401: { description: 'Authentication required', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } } },
          },
        },
      },
      '/api/properties/{id}': {
        get: {
          tags: ['Properties and Units'], summary: 'Get property by ID', security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Property details', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
            404: { description: 'Property not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } } },
          },
        },
        put: {
          tags: ['Properties and Units'], summary: 'Update property', security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: {
            200: { description: 'Property updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
            404: { description: 'Property not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } } },
          },
        },
        delete: {
          tags: ['Properties and Units'], summary: 'Delete property', security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Property deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
            400: { description: 'Cannot delete property with units', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } } },
          },
        },
      },
      '/api/units': {
        get: {
          tags: ['Properties and Units'], summary: 'List units', security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'propertyId', schema: { type: 'string', format: 'uuid' } },
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['VACANT', 'OCCUPIED'] } },
            { in: 'query', name: 'search', schema: { type: 'string' } },
            { in: 'query', name: 'page', schema: { type: 'integer' } },
            { in: 'query', name: 'limit', schema: { type: 'integer' } },
          ],
          responses: {
            200: { description: 'Units list', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
          },
        },
        post: {
          tags: ['Properties and Units'], summary: 'Create a unit', security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateUnitRequest' } } } },
          responses: {
            201: { description: 'Unit created', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
            409: { description: 'Duplicate unit number', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } } },
          },
        },
      },
      '/api/units/{id}': {
        get: {
          tags: ['Properties and Units'], summary: 'Get unit by ID', security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Unit details', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
          },
        },
        put: {
          tags: ['Properties and Units'], summary: 'Update unit', security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: {
            200: { description: 'Unit updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
          },
        },
        delete: {
          tags: ['Properties and Units'], summary: 'Delete unit', security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Unit deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
          },
        },
      },
      '/api/tenants': {
        get: {
          tags: ['Tenants and Leases'], summary: 'List tenants', security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'search', schema: { type: 'string' } },
            { in: 'query', name: 'page', schema: { type: 'integer' } },
            { in: 'query', name: 'limit', schema: { type: 'integer' } },
          ],
          responses: {
            200: { description: 'Tenants list', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
          },
        },
        post: {
          tags: ['Tenants and Leases'], summary: 'Create a tenant profile and account', security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateTenantRequest' } } } },
          responses: {
            201: { description: 'Tenant created', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
          },
        },
      },
      '/api/tenants/me': {
        get: {
          tags: ['Tenants and Leases'], summary: 'Get signed-in tenant profile', security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Tenant profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
          },
        },
      },
      '/api/tenants/{id}': {
        get: {
          tags: ['Tenants and Leases'], summary: 'Get tenant profile by ID', security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Tenant details', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
          },
        },
        put: {
          tags: ['Tenants and Leases'], summary: 'Update tenant profile', security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: {
            200: { description: 'Tenant updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
          },
        },
        delete: {
          tags: ['Tenants and Leases'], summary: 'Delete tenant profile', security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Tenant deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
          },
        },
      },
      '/api/leases': {
        get: {
          tags: ['Tenants and Leases'], summary: 'List leases', security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'propertyId', schema: { type: 'string', format: 'uuid' } },
            { in: 'query', name: 'unitId', schema: { type: 'string', format: 'uuid' } },
            { in: 'query', name: 'tenantId', schema: { type: 'string', format: 'uuid' } },
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['ACTIVE', 'ENDED', 'TERMINATED'] } },
            { in: 'query', name: 'page', schema: { type: 'integer' } },
            { in: 'query', name: 'limit', schema: { type: 'integer' } },
          ],
          responses: {
            200: { description: 'Leases list', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
          },
        },
        post: {
          tags: ['Tenants and Leases'], summary: 'Create a lease', security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateLeaseRequest' } } } },
          responses: {
            201: { description: 'Lease created', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
          },
        },
      },
      '/api/leases/{id}': {
        get: {
          tags: ['Tenants and Leases'], summary: 'Get lease by ID', security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Lease details', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
          },
        },
        put: {
          tags: ['Tenants and Leases'], summary: 'Update lease or terminate', security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
          responses: {
            200: { description: 'Lease updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
          },
        },
        delete: {
          tags: ['Tenants and Leases'], summary: 'Delete lease', security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Lease deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
          },
        },
      },
      '/api/payments': {
        get: {
          tags: ['Payments'], summary: 'List payments', security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'leaseId', schema: { type: 'string', format: 'uuid' } },
            { in: 'query', name: 'propertyId', schema: { type: 'string', format: 'uuid' } },
            { in: 'query', name: 'tenantId', schema: { type: 'string', format: 'uuid' } },
            { in: 'query', name: 'method', schema: { type: 'string', enum: ['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD'] } },
            { in: 'query', name: 'billingMonth', schema: { type: 'string', format: 'date' } },
            { in: 'query', name: 'page', schema: { type: 'integer' } },
            { in: 'query', name: 'limit', schema: { type: 'integer' } },
          ],
          responses: {
            200: { description: 'Payments list', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
          },
        },
        post: {
          tags: ['Payments'], summary: 'Record a payment', security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePaymentRequest' } } } },
          responses: {
            201: { description: 'Payment recorded', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
            409: { description: 'Duplicate payment for lease and billing month', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } } },
          },
        },
      },
      '/api/payments/{id}': {
        get: {
          tags: ['Payments'], summary: 'Get payment by ID', security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Payment details', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
            404: { description: 'Payment not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } } },
          },
        },
        put: {
          tags: ['Payments'], summary: 'Update payment', security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdatePaymentRequest' } } } },
          responses: {
            200: { description: 'Payment updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
          },
        },
      },
      '/api/maintenance': {
        get: {
          tags: ['Maintenance'], summary: 'List maintenance requests', security: [{ bearerAuth: [] }],
          parameters: [
            { in: 'query', name: 'status', schema: { type: 'string', enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] } },
            { in: 'query', name: 'priority', schema: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] } },
            { in: 'query', name: 'unitId', schema: { type: 'string', format: 'uuid' } },
            { in: 'query', name: 'propertyId', schema: { type: 'string', format: 'uuid' } },
            { in: 'query', name: 'page', schema: { type: 'integer' } },
            { in: 'query', name: 'limit', schema: { type: 'integer' } },
          ],
          responses: {
            200: { description: 'Maintenance requests list', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
          },
        },
        post: {
          tags: ['Maintenance'], summary: 'Create maintenance request', security: [{ bearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateMaintenanceRequest' } } } },
          responses: {
            201: { description: 'Maintenance request created', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
          },
        },
      },
      '/api/maintenance/{id}': {
        get: {
          tags: ['Maintenance'], summary: 'Get maintenance request by ID', security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Maintenance request details', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
            404: { description: 'Maintenance request not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } } },
          },
        },
        patch: {
          tags: ['Maintenance'], summary: 'Update maintenance request status or priority', security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateMaintenanceRequest' } } } },
          responses: {
            200: { description: 'Maintenance request updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessEnvelope' } } } },
          },
        },
        delete: {
          tags: ['Maintenance'], summary: 'Delete maintenance request (rejected to preserve history)', security: [{ bearerAuth: [] }],
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            400: { description: 'Cannot delete maintenance request to preserve history', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorEnvelope' } } } },
          },
        },
      },

    },
  },
  apis: [],
})

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: env.CLIENT_URL, credentials: true }))
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '1mb' }))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }))

app.get('/api/health', (req, res) => sendSuccess(res, { status: 'ok', timestamp: new Date().toISOString() }))
// Swagger UI includes an inline bootstrap script; scope the CSP exception to docs only.
app.use('/api/docs', (req, res, next) => { res.removeHeader('Content-Security-Policy'); next() }, swaggerUi.serve, swaggerUi.setup(openapi, { explorer: true }))
app.use('/api', apiRouter)
app.use(notFound)
app.use(errorHandler)

export { app }
