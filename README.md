# qris-pay

QRIS payment monitoring and reporting system scaffold.

Stack:
- Backend: Node.js (Express) + Sequelize + PostgreSQL + JWT
- Frontend: Next.js + Tailwind CSS + Chart.js
- Docker Compose for local development

Security & Hardening (what I added)
- Helmet for secure HTTP headers
- Morgan request logging
- Rate limiting on auth and webhook endpoints
- Input validation using express-validator
- Centralized error handler
- Webhook signature verification using raw request body and HMAC-SHA256 (timing-safe comparison)
- CORS configured via ALLOWED_ORIGINS env var

Quick start (requires Docker):

1. Copy environment example for backend and update secrets:
   cp backend/.env.example backend/.env
   # Edit backend/.env and set JWT_SECRET, WEBHOOK_SECRET, and ALLOWED_ORIGINS

2. Start services:
   docker-compose up --build

3. Seed data (create admin + sample transactions):
   docker-compose exec backend npm run seed

4. Backend API: http://localhost:4000/api/health
   Frontend: http://localhost:3000

Security notes before production:
- Replace secrets (JWT_SECRET, WEBHOOK_SECRET) with strong values and store them securely (vault, secrets manager).
- Use migrations (Sequelize CLI / Umzug) instead of sequelize.sync() in production.
- Limit CORS to trusted origins only.
- Add HTTPS/SSL termination and proper certificate management.
- Consider advanced logging and monitoring (structured logs, Sentry, Prometheus).

Webhook testing (example):

BODY='{"qrisId":"QRIS-12345","amount":"100000.00","status":"success","merchantId":"M-200","paymentMethod":"qris","timestamp":"2026-10-16T12:00:00Z"}'
SECRET="change_this_webhook_secret"
SIG=$(echo -n "$BODY" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.*= //')

curl -X POST http://localhost:4000/api/webhook/notify \
  -H "Content-Type: application/json" \
  -H "x-qris-signature: $SIG" \
  -d "$BODY"

Notes:
- This scaffold is for demo and development only. Do not use as-is in production without applying the production notes above.
