# RentSetu backend foundation

Node.js 20+, Express, Prisma 6, and PostgreSQL backend for the RentSetu monorepo. Authentication, dashboard, properties, units, tenants, leases, payments, and maintenance APIs are fully implemented.

## Prerequisites and setup

- Node.js 20 or newer and npm
- PostgreSQL 14 or newer
- A local database named `rentsetu`

From the repository root:

```sh
cd backend
npm install
createdb rentsetu
cp .env.example .env
# Edit .env and set DATABASE_URL and a private JWT_SECRET (32+ characters).
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

The API listens at `http://localhost:8000`; Swagger UI is at `http://localhost:8000/api/docs`. `GET /api/health` does not require a database query; `/api/health/ready` checks the database connection. `db:migrate` applies all checked-in schema and constraint migrations in order.

## Environment variables

| Variable | Required | Default/example | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | `postgresql://postgres:postgres@localhost:5432/rentsetu?schema=public` | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Set a private 32+ character value | Verifies bearer tokens |
| `JWT_EXPIRES_IN` | No | `7d` | JWT lifetime for authentication tokens |
| `PORT` | No | `8000` | HTTP port |
| `CLIENT_URL` | No | `http://localhost:5173` | Single allowed browser origin; credentials are enabled |
| `NODE_ENV` | No | `development` | Runtime mode; dev headers and destructive reseed are dev-only |

Never commit `.env`. `.env.example` is safe to commit.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start with nodemon |
| `npm start` | Start the production server |
| `npm test` | Run backend authentication unit tests |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Run `prisma migrate dev` |
| `npm run db:deploy` | Apply committed migrations in deployment |
| `npm run db:seed` | Clear and seed the development database |
| `npm run db:studio` | Open Prisma Studio |

## API and responses

Successful responses use `{ "success": true, "data": ..., "message?": ..., "meta?": ... }`. Errors use `{ "success": false, "error": { "code": "...", "message": "...", "details?": ... } }`. Validation details contain a field path and message. Protected routes accept `Authorization: Bearer <JWT>`; the temporary development fallback accepts `x-dev-user-id` and `x-dev-user-role` only when `NODE_ENV=development`.

- `GET /api/health` — API liveness status and timestamp (does not query PostgreSQL).
- `GET /api/health/ready` — readiness status; returns 503 when PostgreSQL cannot be reached.
- `POST /api/auth/register` — create a landlord account. Public registration cannot assign manager or tenant roles.
- `POST /api/auth/login` — verify credentials and return a bearer token.
- `GET /api/auth/me` — return the authenticated user.
- `POST /api/auth/change-password` — change the authenticated user's password.
- `GET /api/users/managers` — list active manager accounts for landlord property assignment.
- `GET /api/dashboard/landlord` — landlord/manager portfolio summary, occupancy, collected and expected rent, overdue summary, open maintenance count, recent payments, and six-month collection series.
- `GET /api/dashboard/tenant` — signed-in tenant active lease, rent, next due date, current billing status, last payment, and open maintenance count.

### Payments API (`/api/payments`)

All routes require authentication (`Authorization: Bearer <token>` or dev headers in development).

| Method | Endpoint | Allowed Roles | Description |
| --- | --- | --- | --- |
| `GET` | `/api/payments` | `LANDLORD`, `MANAGER`, `TENANT` | List payments scoped to the user (landlords see owned properties, managers see managed properties, tenants see their own history). Supports filters: `leaseId`, `propertyId`, `tenantId`, `method`, `billingMonth`, `startDate`, `endDate`, `page`, `limit`. |
| `POST` | `/api/payments` | `LANDLORD`, `MANAGER` | Record a payment for a lease. Validates amounts, dates, and payment method (`CASH`, `UPI`, `BANK_TRANSFER`, `CHEQUE`, `CARD`). Enforces one payment per lease per billing month with a 409 `CONFLICT` response. |
| `GET` | `/api/payments/:id` | `LANDLORD`, `MANAGER`, `TENANT` | View payment details by UUID. Enforces ownership/tenant isolation (403 `FORBIDDEN` if unauthorized). |
| `PUT` / `PATCH` | `/api/payments/:id` | `LANDLORD`, `MANAGER` | Update payment details (`amount`, `method`, `paidOn`, `notes`, `billingMonth`). Rejects unauthorized edits or monthly payment conflicts. |

**Payment Request & Response Shapes:**

- `POST /api/payments` body:
  ```json
  {
    "leaseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "billingMonth": "2026-11-01",
    "amount": 25000,
    "method": "UPI",
    "paidOn": "2026-11-04",
    "notes": "Rent payment for November"
  }
  ```
- Payment item format: includes canonical fields (`id`, `leaseId`, `billingMonth`, `amount`, `method`, `paidOn`, `notes`, `createdAt`, `updatedAt`, `lease` details) alongside presentation convenience fields (`due`, `paid`, `status: "Paid"`, `tenant`, `property`, `unit`).
- Error codes: `400 VALIDATION_ERROR` (invalid input), `401 UNAUTHORIZED`, `403 FORBIDDEN` (ownership mismatch or tenant attempting to record payment), `404 NOT_FOUND` (lease/payment not found), `409 CONFLICT` (duplicate payment for lease and billing month).

### Maintenance API (`/api/maintenance`)

All routes require authentication.

| Method | Endpoint | Allowed Roles | Description |
| --- | --- | --- | --- |
| `GET` | `/api/maintenance` | `LANDLORD`, `MANAGER`, `TENANT` | List maintenance requests scoped to user portfolio or tenant profile. Supports filters: `status`, `priority`, `unitId`, `propertyId`, `tenantId`, `leaseId`, `page`, `limit`. |
| `POST` | `/api/maintenance` | `TENANT`, `LANDLORD`, `MANAGER` | Create a maintenance request. Tenants can create requests for their leased unit; landlords/managers can create for units in their portfolio. Priority defaults to `MEDIUM` if omitted. Status starts at `OPEN`. |
| `GET` | `/api/maintenance/:id` | `LANDLORD`, `MANAGER`, `TENANT` | View maintenance request details. Enforces ownership and tenant isolation. |
| `PATCH` / `PUT` | `/api/maintenance/:id` | `LANDLORD`, `MANAGER` | Update maintenance request status (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`) and/or `priority` (`LOW`, `MEDIUM`, `HIGH`, `URGENT`). Automatically sets `resolvedAt` timestamp when resolved or closed, and clears `resolvedAt` to `null` when reopened to `OPEN` or `IN_PROGRESS`. |
| `DELETE` | `/api/maintenance/:id` | `LANDLORD`, `MANAGER`, `TENANT` | Rejects deletion with 400 `BAD_REQUEST` to preserve maintenance audit history. |

**Maintenance Request & Response Shapes:**

- `POST /api/maintenance` body:
  ```json
  {
    "title": "Water leakage in bathroom",
    "description": "Pipe beneath sink has a continuous drip.",
    "priority": "HIGH",
    "unitId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }
  ```
- `PATCH /api/maintenance/:id` body:
  ```json
  {
    "status": "RESOLVED",
    "priority": "HIGH"
  }
  ```
- Error codes: `400 VALIDATION_ERROR` / `BAD_REQUEST` (invalid payload or deletion attempt), `401 UNAUTHORIZED`, `403 FORBIDDEN` (ownership mismatch or tenant attempting status change), `404 NOT_FOUND` (unit or maintenance request not found).

The landlord dashboard scopes every property-related query by `ownerId` for landlords or `managerId` for managers. Tenant scope comes from the authenticated user's tenant profile. No dashboard endpoint accepts client-supplied ownership IDs.

### Frontend integration

The React frontend uses `src/services/api.js` as its data boundary. By default it runs a browser-persistent demo mode for classroom presentations. Set `VITE_USE_MOCK_DATA=false` and `VITE_API_BASE_URL` to use authenticated backend requests for dashboards, properties, units, tenants, leases, payments, and maintenance.

The UI maps normalized API records into presentation fields such as tenant/property labels and payment due status. Dashboard amounts and rent status come from API data in live mode. Property creation creates the property and its units; tenant creation can create an active lease for a selected vacant unit. Tenant accounts are created with the password entered in the tenant form.

Demo mode stores sample data in local browser storage, so demo edits survive page refreshes without a database. It is a presentation mode and does not validate real credentials or write to PostgreSQL.

## Seed accounts

All demo accounts use password `Password@123`:

| Role | Email |
| --- | --- |
| Landlord | `arjun.landlord@rentsetu.demo` |
| Landlord | `kavya.landlord@rentsetu.demo` |
| Manager | `dev.manager@rentsetu.demo` |
| Tenant | `aarav.tenant@rentsetu.demo` |
| Tenant | `priya.tenant@rentsetu.demo` |
| Tenant | `rohan.tenant@rentsetu.demo` |
| Tenant | `meera.tenant@rentsetu.demo` |

The seed prints the generated user IDs for the dev-header dashboard examples. It is intentionally destructive to the configured database and refuses to run when `NODE_ENV` is not `development`.

After seeding, for example:

```sh
curl -H 'x-dev-user-id: <LANDLORD_ID printed by seed>' \
     -H 'x-dev-user-role: LANDLORD' \
     http://localhost:8000/api/dashboard/landlord

curl -H 'x-dev-user-id: <TENANT_ID printed by seed>' \
     -H 'x-dev-user-role: TENANT' \
     http://localhost:8000/api/dashboard/tenant
```

## Folder structure

```text
backend/
  prisma/                 schema, migrations, seed
  src/config/             validated env and Prisma singleton
  src/middleware/         authentication, role authorization, validation, errors, 404
  src/modules/             teammate modules and dashboard implementation
  src/routes/              API router composition
  src/utils/               errors, responses, pagination, payment status
  src/app.js                Express app (no listener)
  src/server.js             listener and graceful shutdown
```

## Team ownership and Git rules

| Owner | Area |
| --- | --- |
| Lead | Setup, `schema.prisma`, migrations, seed, shared utilities, dashboard, docs, deployment |
| Person 2 | Auth endpoints, real authentication middleware, auth tests, and auth API documentation |
| Person 3 | Properties, units, tenants, and leases |
| Person 4 | Payments and maintenance |

Only the lead edits `prisma/schema.prisma`; teammates send schema change requests. After pulling schema changes, run `npx prisma migrate dev` from `backend/`. Use one branch per feature and coordinate migration order before merging.

## Deployment

Use PostgreSQL from Neon, Render, Railway, or an equivalent managed provider. Configure `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, `CLIENT_URL`, and `NODE_ENV=production` in the host's environment settings.

- Build command: `npm install && npx prisma generate`
- Release command: `npx prisma migrate deploy`
- Start command: `npm start`

Never run `prisma migrate dev` against production. The seed script is development-only and must not be used as a production release step.
