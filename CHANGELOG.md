# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]
- Production deploy pipeline: Vercel (frontend) + Render (backend)
- CI: tests and deploy workflow
- Frontend: filters, pagination, export CSV, transaction detail
- Security hardening: helmet, rate-limit, validation, webhook raw-body HMAC

## [2026-10-16] - Initial scaffold and demo
- Project scaffold: Next.js frontend, Express backend, Postgres, Docker Compose
- Auth (JWT), transactions API, analytics endpoints
- Webhook simulator (HMAC signature)
- Seed script and demo data
- Basic dashboard, charts, transaction list
