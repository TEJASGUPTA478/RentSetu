# RentSetu

RentSetu is a rental-management application with a React + Vite frontend and a Node.js + Express + Prisma + PostgreSQL backend. The frontend uses sample rental data by default for a reliable demo.

## Current functionality

- Authentication API: landlord registration, login, current-user lookup, and password change.
- Role-scoped dashboard APIs for landlords/managers and tenants.
- PostgreSQL schema, migrations, and development seed data for properties, units, tenants, leases, payments, and maintenance requests.
- The frontend login uses mock authentication by default. Property, tenant, payment, and maintenance screens still use sample data; their backend CRUD routes are not implemented yet.

## Run the frontend

```sh
npm install
npm run dev
```

Use `npm run build` to create the production bundle in `dist/`.

## Run the backend

See [backend/README.md](backend/README.md) for PostgreSQL setup, environment variables, migrations, seed accounts, API documentation, and deployment instructions.

The backend API listens at `http://localhost:8000`; Swagger UI is at `http://localhost:8000/api/docs`. Run the authentication tests with:

```sh
cd backend
npm test
```

## Connect frontend authentication

Set these variables in the frontend environment to use the backend authentication API instead of mock sign-in:

```sh
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCK_DATA=false
```

The current frontend data services for properties, tenants, payments, and maintenance remain mock-only. The sample object shapes in `src/services/api.js` document the fields those screens expect; they are not implemented backend endpoints yet.
