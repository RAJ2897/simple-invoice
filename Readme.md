# Simple-Invoice

A full-stack invoicing app: sign in, browse invoices with search / filter / sort / pagination,
open an invoice to see its line items and totals, and create new invoices.

| Layer    | Stack                                                                                   |
| -------- | --------------------------------------------------------------------------------------- |
| Frontend | React 19 + TypeScript, Vite, Mantine UI, TanStack Query, React Router, react-hook-form + Zod |
| Backend  | NestJS + TypeScript, TypeORM, PostgreSQL, Passport JWT, class-validator, Swagger        |
| Tests    | Vitest (both apps), Testing Library (frontend), Supertest (backend e2e)                  |
| Infra    | Docker Compose: Postgres + API + nginx serving the built SPA                            |

## Quick start (Docker)

Requires Docker with Compose v2.

```bash
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
docker compose up --build   # legacy: docker-compose up --build
```

On start the API applies migrations and seeds the database (idempotent), then:

| Service  | URL                              | Notes                                       |
| -------- | -------------------------------- | ------------------------------------------- |
| Web app  | http://localhost:8080            | nginx; proxies `/api/*` to the API          |
| API      | http://localhost:3000            | NestJS                                      |
| Swagger  | http://localhost:3000/api/docs   | Click **Authorize** and paste `accessToken` |
| Postgres | localhost:5432                   | user/db from `.env`                         |

Host ports can be changed with `WEB_HOST_PORT`, `API_HOST_PORT` and `DB_HOST_PORT` in `.env`.

### Default login

| Email                     | Password    |
| ------------------------- | ----------- |
| `admin@simpleinvoice.dev` | `Admin@123` |

(These come from `SEED_USER_EMAIL` / `SEED_USER_PASSWORD`; change them in `.env` before seeding if you like.)

## Running without Docker

Requires Node.js 22+ (developed on Node 24) and a PostgreSQL 14+ database (local or hosted, e.g. Supabase).

### 1. Backend (port 3000)

```bash
cd backend
cp .env.example .env    # fill in DB_*, JWT_SECRET (32+ chars), SEED_USER_PASSWORD
npm install
npm run seed            # runs migrations, creates the reviewer account and ~41 invoices
npm run start:dev
```

For Supabase use the values from *Project Settings → Database* and set `DB_SSL=true`.

### 2. Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api/*` to `http://localhost:3000`
(override with `API_PROXY_TARGET`), the same way nginx does in Docker.

## Seeding

`npm run seed` (in `backend/`) applies pending migrations, upserts the reviewer account and inserts
the Appendix A invoice plus 40 generated invoices with a mix of statuses, currencies, dates and amounts.
It is idempotent - invoices whose number already exists are skipped. `npm run seed -- --reset`
removes all invoices first. In Docker the seed runs automatically every time the API container starts.

## Tests

```bash
cd backend
npm test             # unit tests: calculations, Overdue derivation, due-date validation, unique numbers, auth, error filter
npm run test:e2e     # HTTP round trip against the configured DB (seed first): login -> create -> list -> detail -> 409 -> 400 -> 404

cd frontend
npm test             # login flow & route guard, list (search/filter/paging), detail, create form, schema and helpers
```

## Project structure

```
.
├── backend/                 NestJS API
│   ├── src/
│   │   ├── auth/            login, /auth/me, JWT strategy, global guard (@Public opt-out)
│   │   ├── invoices/        controller, service, DTOs, entities, calculator, status derivation
│   │   ├── users/
│   │   ├── database/        TypeORM config, migrations, seed/
│   │   ├── common/          exception filter, validators, utils
│   │   └── config/          env validation (Joi)
│   ├── test/                e2e tests
│   └── Dockerfile
├── frontend/                React SPA
│   ├── src/
│   │   ├── api/             axios client + endpoint functions
│   │   ├── auth/            session storage, AuthProvider, RequireAuth
│   │   ├── features/invoices/  list params (URL state), filters, table, form schema, queries
│   │   ├── pages/           Login, InvoiceList, InvoiceDetail, CreateInvoice
│   │   └── test/            test setup & helpers
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
└── .env.example             Compose configuration
```

A monorepo keeps the API contract and the client in one review and lets one `docker compose up` start everything.

## API

All endpoints except `POST /auth/login` and `GET /health` require `Authorization: Bearer <token>`.

| Method | Path            | Description                                           |
| ------ | --------------- | ----------------------------------------------------- |
| POST   | `/auth/login`   | Returns `{ accessToken, tokenType, expiresIn, user }` |
| GET    | `/auth/me`      | Current user profile                                  |
| GET    | `/invoices`     | `page, pageSize (≤100), sortBy, ordering, status, keyword, fromDate, toDate` → `{ data, paging: { page, pageSize, total } }` |
| GET    | `/invoices/:id` | Invoice with customer, items and totals               |
| POST   | `/invoices`     | Create (always `Draft`); totals computed server-side  |
| GET    | `/health`       | Liveness + DB check used by Docker                    |

Errors always have the shape `{ statusCode, message, error }` (validation errors use a `message` array).

## Design decisions & assumptions

- **Totals are server-side only.** `subTotal = qty × rate`, `tax = subTotal × tax% / 100`,
  `total = subTotal + tax − discount`, `balance = total − totalPaid`, using `decimal.js` and rounded to
  2 decimals. Money columns are `numeric(12,2)`; a discount larger than subtotal + tax is rejected (400).
- **Overdue is derived, never stored.** The DB enum is `Draft | Pending | Paid`; at read time a non-Paid
  invoice whose due date is before today is returned as `Overdue`. The status filter uses the same rule,
  so an overdue Pending invoice appears under *Overdue* and not under *Pending*. "Today" is the server's date.
- **Unique invoice number** is enforced by a unique constraint; a violation maps to `409 Conflict`.
- **Customer is embedded** in the `invoices` table (`customer_*` columns): the spec has no customer
  management, and an invoice should keep the customer details as they were when it was issued.
- **Items** live in `invoice_items` (FK, cascade delete) so multiple lines can be added later; the API
  currently accepts exactly one.
- **Tax rate is stored** on the invoice (`tax_rate`) so the detail page can show "Tax (10%)".
- **Currency** is one of a fixed list (AUD, USD, GBP, EUR, SGD, INR, NZD, CAD, JPY); the symbol is derived server-side.
- **Indexes** on invoice date, due date, total amount and (status, due date) back the sort and filter
  options; `pg_trgm` GIN indexes on invoice number and customer name back the `ILIKE '%keyword%'` search.
- **JWT storage.** The token is kept in `localStorage` so a refresh keeps you signed in. That is readable
  by scripts on the page, so the token is short-lived (`JWT_EXPIRES_IN`, default 3600s), the client signs
  out exactly when it expires, and any 401 ends the session. An httpOnly refresh-cookie flow would be the
  next step for production.
- **List state lives in the URL** (`?status=Paid&keyword=acme&page=2`) so filters survive a refresh,
  can be shared, and work with the back button.
- **Hardening:** helmet, CORS allow-list, request throttling, whitelisted DTOs (unknown fields → 400),
  bcrypt password hashes, env validated at boot.

### Extras beyond the brief

Invoice-date range filter, due-date hints ("Due in 3 days", "12 days overdue"), responsive card list on
mobile, print-friendly invoice detail, server validation errors mapped back onto form fields,
and a Docker health check that also verifies the DB.

## Known limitations

- No invoice editing, deleting, payments or status transitions (not in scope); seeded invoices carry `totalPaid`.
- Single user role; no registration or password reset.
- Exactly one line item per invoice in the API and form.
- No refresh tokens - the user signs in again after the token expires.
- The e2e test uses the configured database rather than a disposable one (it cleans up its own `E2E-` rows).
