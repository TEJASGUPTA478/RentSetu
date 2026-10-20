# RentSetu owner portal

A small React + Vite demo for a rental-management system. It runs entirely on sample data by default; the sign-in screen is a demo gate and accepts any email and password.

## Run locally

```sh
npm install
npm run dev
```

Use `npm run build` to produce the static production bundle in `dist/`.

## Backend integration

Connect the UI through `src/services/api.js`. That module exports `API_BASE_URL`, `useMockData`, and named service functions for properties, tenants, payments, and maintenance requests. Set `VITE_API_BASE_URL` to the backend API root and `VITE_USE_MOCK_DATA=false` when switching the service functions to `fetch`; mock mode is currently retained by the UI for a reliable demo.

Expected resource shapes are represented by the sample objects in that file:

- `GET /properties`: `{ id, name, address, type, units, occupied, rent }[]`; create properties with `POST /properties` using the same fields.
- `GET /tenants`: `{ id, name, email, phone, property, unit, lease, rentStatus }[]`; create tenants with `POST /tenants` using tenant details and lease dates.
- `GET /payments`: `{ id, tenant, property, amount, due, paid, status }[]`.
- `GET /maintenance-requests`: `{ id, tenant, property, issue, date, status }[]`.

The UI expects dates as readable strings and statuses `Paid`, `Due`, `Overdue`, `Open`, `In progress`, or `Resolved`. No authentication, payment processing, or backend behavior is implemented. Add request/error handling and map backend response fields inside the service module when the API contract is available.
