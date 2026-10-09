# Simple-Invoice API

NestJS + PostgreSQL REST API. Setup, credentials, seeding and design notes are in the [root README](../Readme.md).

```bash
cp .env.example .env
npm install
npm run seed        # migrations + reviewer account + sample invoices
npm run start:dev   # http://localhost:3000, Swagger at /api/docs
npm test            # unit tests
npm run test:e2e    # end-to-end against the configured DB
```
