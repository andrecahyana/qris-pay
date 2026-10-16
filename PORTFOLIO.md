PORTFOLIO

Short version (for GitHub profile/README):

QRIS Pay — a full-stack monitoring and reporting demo for QRIS-style payment events.
- Next.js frontend, Tailwind CSS, Chart.js
- Express.js backend, Sequelize + PostgreSQL
- JWT auth, HMAC-protected webhook simulator, transaction analytics, CSV export
- Dockerized with CI/CD to Vercel (frontend) and Render (backend)

Long version (for portfolio page):

Project: QRIS Pay — Payment Monitoring & Reporting System

Overview
--------
QRIS Pay is a demo application built to showcase a realistic monitoring and reporting system for QRIS-style payment transactions. It provides secure user authentication, transaction ingestion (simulated webhook), analytics dashboards, and reporting tools for operations teams.

Key Features
------------
- Authentication: JWT-based login & protected APIs
- Transaction lifecycle: create, update, list, filter, view detail
- Webhook simulator: accepts signed event payloads (HMAC-SHA256) and performs idempotent create/update of transactions
- Analytics: daily summaries, top merchants, revenue totals, and chart visualizations
- Export: CSV export for filtered transaction sets for reconciliation and reporting
- DevOps: Docker Compose for local dev, production-ready Dockerfiles, CI pipeline for automated testing & deployment

Technical Highlights
--------------------
- Frontend: Next.js + Tailwind CSS for a responsive UI, Chart.js for visualizations
- Backend: Express.js, Sequelize as ORM, PostgreSQL for persistence
- Security: Helmet, express-rate-limit, input validation, timing-safe HMAC verification for webhooks
- Testing: Jest + Supertest with SQLite in-memory for deterministic tests
- Deployment: Vercel for frontend, Render for backend with GitHub Actions for CI/CD

Screens / UX
-----------
- Login / authentication screen with demo account
- Dashboard overview with cards for total transactions, success/failed counts, and revenue
- Daily trend chart showing transaction volume/amount
- Transactions list with filters (status, merchant, date range, search) and pagination
- Transaction detail page with raw payload and timeline view
- Admin / ops oriented UX for quick inspection and export

What I learned / demonstrated
-----------------------------
- Designing robust webhook receivers (raw-body HMAC validation + idempotency considerations)
- Building analytics endpoints optimized for aggregates (date_trunc, SUM, COUNT) while keeping the DB schema simple
- End-to-end dev experience: local Docker, seed data, tests, CI/CD and deployment
- UX considerations for operations dashboards: concise cards, filters, exports, and detailed audit views

How to run
----------
See the repository README for quickstart (Docker Compose) and deployment instructions.

Contact
-------
Author: Andre Cahyana
Link: https://github.com/andrecahyana/qris-pay

Short blurb for portfolio listing (1–2 sentences):
An end-to-end QRIS payment monitoring demo: realtime-like webhook ingestion (HMAC-signed), analytics, and CSV reporting built with Next.js and Express. Includes Dockerized local dev, tests, and CI/CD to Vercel/Render.
