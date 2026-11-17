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
      { name: 'Payments', description: 'Person 4: add payment endpoints here' },
      { name: 'Maintenance', description: 'Person 4: add maintenance endpoints here' },
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
