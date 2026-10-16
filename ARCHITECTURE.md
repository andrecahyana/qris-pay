ARCHITECTURE

Overview
--------
QRIS Pay is a typical full-stack web application with a clear separation of responsibilities:

- Frontend: Next.js application renders UI, handles client-side routing, and calls backend APIs. Built with Tailwind CSS and Chart.js for visualization.
- Backend: Express.js REST API that handles authentication (JWT), transaction CRUD, analytics queries, webhook processing, and CSV export.
- Database: PostgreSQL for production; SQLite in-memory for tests. Sequelize ORM handles models and queries.
- DevOps: Docker Compose for local development; multi-stage Dockerfiles for production builds.
- CI/CD: GitHub Actions runs tests and triggers deploys to Vercel (frontend) and Render (backend).

Component Diagram (text)
------------------------
User Browser
  -> (HTTPS)
  Vercel Frontend (Next.js)
    -> (HTTPS, API calls)
    Backend API (Express on Render)
      -> Postgres (Render Managed DB)
      -> Background workers (optional)

Key Flows
---------
1. User Authentication
   - Frontend sends email/password to backend /api/auth/login
   - Backend validates, returns JWT
   - Frontend stores token and uses it for subsequent API calls

2. Transaction Ingestion (Simulated Webhook)
   - External system (simulator) posts JSON to /api/webhook/notify
   - Backend verifies HMAC signature using WEBHOOK_SECRET (raw request body) => timing-safe comparison
   - Backend creates or updates transaction record, stores raw payload for audit

3. Analytics & Reporting
   - Frontend requests /api/analytics/overview and /api/analytics/summary/daily
   - Backend runs aggregate queries (date_trunc, SUM, COUNT) and returns JSON
   - Frontend renders charts and cards (Chart.js)

4. Export
   - Frontend requests /api/transactions/export with filters
   - Backend streams or builds CSV and returns with Content-Disposition header to trigger download

Security Considerations
-----------------------
- HMAC verification for webhook using raw body and timing-safe comparison
- Helmet for secure headers, CORS limited via ALLOWED_ORIGINS
- Rate-limiting for auth and webhook endpoints
- Input validation using express-validator
- JWT expiry and strong secret (JWT_SECRET)
- Use migrations and not sequelize.sync() for production

Scalability Notes
-----------------
- For high transaction volume:
  - Move webhook ingestion to a queue (Redis + Bull) and process in workers
  - Use partitioned tables or time-series optimized stores for analytics
  - Cache heavy analytics with Redis and regenerate periodically
  - Use read replicas for analytical queries

Observability
-------------
- Add structured logging (pino/winston), request IDs, and central logging aggregation (e.g., Datadog, ELK)
- Expose health and metrics endpoints for Prometheus/Grafana

Deployment
----------
- Frontend: Vercel (automatic builds from repo, environment variables for NEXT_PUBLIC_API_URL)
- Backend: Render service (Dockerfile.prod) with managed Postgres or external DATABASE_URL
- GitHub Actions used to run tests and trigger deploys

