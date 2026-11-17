# RentSetu backend foundation

Node.js 20+, Express, Prisma 6, and PostgreSQL backend for the RentSetu monorepo. Authentication and dashboard APIs are implemented. Property, unit, tenant, lease, payment, and maintenance CRUD routes remain placeholders for their assigned teammates.

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

The API listens at `http://localhost:8000`; Swagger UI is at `http://localhost:8000/api/docs`. `GET /api/health` does not require a database query. `db:migrate` applies the checked-in initial schema migration and the partial-index migration in order.

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

- `GET /api/health` — health status and timestamp.
- `POST /api/auth/register` — create a landlord account. Public registration cannot assign manager or tenant roles.
- `POST /api/auth/login` — verify credentials and return a bearer token.
- `GET /api/auth/me` — return the authenticated user.
- `POST /api/auth/change-password` — change the authenticated user's password.
- `GET /api/dashboard/landlord` — landlord/manager portfolio summary, occupancy, collected and expected rent, overdue summary, open maintenance count, recent payments, and six-month collection series.
- `GET /api/dashboard/tenant` — signed-in tenant active lease, rent, next due date, current billing status, last payment, and open maintenance count.

The landlord dashboard scopes every property-related query by `ownerId` for landlords or `managerId` for managers. Tenant scope comes from the authenticated user's tenant profile. No dashboard endpoint accepts client-supplied ownership IDs.

### Frontend inspection snapshot and field-name mapping

The frontend has six screens: Dashboard, Properties, Tenants, Rent & Payments, Maintenance, and Login. Login has an auth service in `src/services/auth.js`; it uses mock behavior by default and can call these backend auth endpoints when `VITE_USE_MOCK_DATA=false`. Property, tenant, payment, and maintenance pages still use local mock objects through `src/services/api.js`. The data object's fields are:

- `initialProperties`: `id`, `name`, `address`, `type`, `units`, `occupied`, `rent`.
- `initialTenants`: `id`, `name`, `email`, `phone`, `property`, `unit`, `lease`, `rentStatus`.
- `payments`: `id`, `tenant`, `property`, `amount`, `due`, `paid`, `status`.
- `requests`: `id`, `tenant`, `property`, `issue`, `date`, `status`.
- Dashboard summary cards, trend values, and chart labels are currently hardcoded in `src/App.jsx`.

The UI uses denormalized display fields, while this foundation follows the requested normalized schema:

- Tenant mock `name`, `email`, `phone` map to `User.name`, `User.email`, and `TenantProfile.phone`; mock `property`, `unit`, and `lease` are joined from Property, Unit, and Lease. `rentStatus` is computed from Payment/Lease data, never stored.
- Property mocks use a combined `address`, unit-count `units`, and `occupied`; storage is `Property.address/city/state/pincode`, `Unit` rows, and `Unit.status`. Unit rent is `Unit.rent` (the UI's property card can aggregate/format that value).
- Payment mocks use `due`, `paid`, and `status`. The schema stores `billingMonth`, `paidOn`, `amount`, and `method`; the due date and `Paid`/`Due`/`Overdue` status are computed. `billingMonth` is always the first day of its month.
- Maintenance mocks use `issue` and `date`; persistence uses `title`, `description`, and `createdAt`. A future maintenance API can expose display aliases without changing the history-preserving model.
- The dashboard page currently displays fixed sample totals/chart labels. The dashboard endpoints return calculated values using the prompt's API field names (`totalProperties`, `rentCollectedThisMonth`, `overdueCount`, and so on). `recentPayments` includes presentation fields `tenant`, `property`, `unit`, `amount`, `due`, `paid`, and computed `status` alongside canonical IDs and `billingMonth`. The frontend must be connected to those fields in a later integration step.

Rental-resource API reads/writes do not exist in the frontend yet, and its demo data is presentation-shaped. Authentication can call the backend when mock mode is disabled. The backend uses the required schema names and provides the dashboard response fields requested in this task rather than persisting derived UI strings/statuses.

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
