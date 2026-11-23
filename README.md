# RentSetu

RentSetu is a rental-management web app with a React + Vite frontend and an Express + Prisma + PostgreSQL API. It supports landlord/manager portfolio workflows and a tenant portal.

## What works

- Landlord registration and sign-in, session restoration, sign-out, and role-aware navigation.
- Portfolio dashboard with occupancy, rent collection, overdue rent, recent payments, and maintenance summaries.
- Property and unit creation, property updates, tenant creation with an optional lease, and tenant profile updates.
- Payment history and rent recording, with due and overdue rent generated from active leases.
- Maintenance request listing, tenant issue reporting, and landlord/manager status updates.
- Responsive owner and tenant views.
- Offline demo mode that accepts any email/password and saves edits in browser storage.

## Start an offline demo

```sh
npm install
npm run dev
```

The default demo mode uses sample records and local browser storage. You can add a property or tenant, record demo rent, and report maintenance; refresh the page to see saved changes. Use the sign-in screen with any email and password, then choose a landlord, manager, or tenant view to present the role-specific screens.

## Start with the real API

Set up the backend and PostgreSQL by following [backend/README.md](backend/README.md), then start the frontend with:

```sh
VITE_API_BASE_URL=http://localhost:8000/api VITE_USE_MOCK_DATA=false npm run dev
```

Create a landlord account from the sign-in page, or use the seeded demo accounts listed in the backend README. The frontend uses bearer tokens for API calls. Tenants created by a landlord receive the password entered in the tenant form.

To build the frontend bundle:

```sh
npm run build
```

## Health endpoints

- `GET /api/health` checks that the API process responds.
- `GET /api/health/ready` checks API and PostgreSQL readiness.
- Swagger UI is at `http://localhost:8000/api/docs` when the backend is running.

## Configuration

The frontend defaults to demo mode. Set `VITE_USE_MOCK_DATA=false` to use the backend and set `VITE_API_BASE_URL` if it is hosted elsewhere. Do not put secrets in frontend environment variables; they are included in the browser bundle.
