# RentSetu

RentSetu is a full-stack rental management platform for landlords, property managers, and tenants. It provides portfolio dashboards, property and tenant management, rent tracking, payment history, and maintenance workflows through a responsive React interface and an Express API backed by PostgreSQL.

## Features

### Landlords and managers

- View portfolio occupancy and rent collection summaries.
- Create, update, and remove properties and units.
- Add tenants, assign them to vacant units, and create leases.
- Record monthly payments and review payment history.
- Assign managers to properties and view manager accounts.
- Update maintenance request status and priority.

### Tenants

- View the active lease and rent details.
- Review monthly rent status and payment history.
- Report maintenance issues for the leased unit.
- Change the account password.

### Platform capabilities

- JWT bearer authentication with role-based access control.
- PostgreSQL-backed data with Prisma migrations and seed data.
- Browser-persistent demo mode for presentations without a database.
- Swagger API documentation at `/api/docs`.
- Health and database-readiness endpoints.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 18, Vite 6 |
| Backend | Node.js 20+, Express 4 |
| Database | PostgreSQL 14+, Prisma 6 |
| Authentication | JSON Web Tokens, bcrypt |
| Validation and API docs | Zod, Swagger/OpenAPI |

## Repository structure

```text
RentSetu/
├── src/
│   ├── context/          Authentication state
│   ├── services/         API and demo-data adapters
│   ├── App.jsx           Application screens and components
│   └── main.jsx          React entry point
├── backend/
│   ├── prisma/           Database schema, migrations, and seed
│   └── src/
│       ├── config/       Environment and Prisma configuration
│       ├── middleware/   Auth, authorization, validation, and errors
│       ├── modules/      Feature-specific routes and controllers
│       ├── routes/       API route composition
│       └── utils/        Shared response and pagination helpers
├── package.json          Frontend scripts and dependencies
└── backend/package.json  Backend scripts and dependencies
```

## Quick start

### Prerequisites

- Node.js 20 or newer
- npm
- PostgreSQL 14 or newer for live API mode

### Run in demo mode

Demo mode is the fastest way to present or explore the application. It uses sample records and stores changes in browser `localStorage`; no database or credentials are required.

From the repository root:

```sh
npm install
npm run dev
```

Open `http://localhost:5173`. Enter any email and password, then select the role you want to present.

Demo changes persist across refreshes but are isolated to the current browser. To reset the demo, clear the `rentsetu-demo-data-v2` local-storage key in browser developer tools.

### Run with the API

Set up PostgreSQL and the backend:

```sh
cd backend
npm install
cp .env.example .env
```

Update `DATABASE_URL` and `JWT_SECRET` in `.env`, then initialize and start the backend:

```sh
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

The API runs at `http://localhost:8000`. See [backend/README.md](backend/README.md) for environment variables, seed accounts, API endpoints, database scripts, and deployment instructions.

In another terminal, start the frontend in live mode:

```sh
VITE_USE_MOCK_DATA=false \
VITE_API_BASE_URL=http://localhost:8000/api \
npm run dev
```

Create a landlord account in the UI or sign in with a seeded account. See [backend/README.md](backend/README.md) for the seeded credentials.

## Frontend configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_USE_MOCK_DATA` | `true` | Set to `false` to use the Express API instead of browser demo data. |
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | Base URL for live API requests. |

Environment variables in Vite are embedded in the browser bundle. Never place private API keys or JWT secrets in `VITE_*` variables.

## Scripts

Run frontend scripts from the repository root:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production frontend build |
| `npm run preview` | Preview the production build locally |

Run backend scripts from [backend/](backend/):

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API with nodemon |
| `npm start` | Start the API in production |
| `npm test` | Run backend authentication tests |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Create and apply development migrations |
| `npm run db:deploy` | Apply committed migrations |
| `npm run db:seed` | Seed the development database |
| `npm run db:studio` | Open Prisma Studio |

## API overview

The complete API reference is available in Swagger UI while the backend is running:

```text
http://localhost:8000/api/docs
```

Core route groups include:

- `/api/auth` - registration, login, current user, and password changes
- `/api/users` - manager accounts
- `/api/dashboard` - landlord and tenant dashboards
- `/api/properties` - property management
- `/api/units` - unit management
- `/api/tenants` - tenant profiles
- `/api/leases` - lease creation and lifecycle
- `/api/payments` - rent payments
- `/api/maintenance` - maintenance requests

Protected endpoints require a bearer token:

```http
Authorization: Bearer <JWT>
```

## Health checks

- `GET /api/health` verifies that the API process is responding.
- `GET /api/health/ready` verifies API and PostgreSQL readiness.

## Development notes

- Demo mode is for local presentation only and does not create real accounts or database records.
- Live mode uses the role from the authenticated user to scope properties, payments, leases, and maintenance requests.
- Public registration creates a landlord account; tenant and manager roles are managed through the backend workflows.
- The frontend stores only presentation state and bearer tokens for API access. Do not use demo credentials or demo data as production credentials.
