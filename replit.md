# Bei Yangu — Healthcare Price Comparison Platform

A healthcare price transparency app for Kenya. Patients compare procedure costs across hospitals, filter by insurance, and use AI to search when they only know their symptoms.

## Run & Operate

- Frontend (Vite + React): runs via the `bei-yangu` workflow in Replit
- Backend (FastAPI): run locally → `cd bei_yangu_backend && uvicorn app.main:app --reload`
- DB: PostgreSQL via Docker (see `bei_yangu_backend/README.md` for the docker run command)

## Stack

- **Frontend**: Vite + React 19, TypeScript, Tailwind CSS v4, Framer Motion, wouter, React Query
- **Backend**: FastAPI 0.115, SQLAlchemy 2.0, PostgreSQL, Pydantic v2, Gemini AI
- pnpm workspaces, Node.js 24, TypeScript 5.9

## Where things live

- `artifacts/bei-yangu/` — Vite + React frontend
- `bei_yangu_backend/` — FastAPI backend (Python)
- `bei_yangu_backend/app/models/entities.py` — DB schema (SQLAlchemy models)
- `bei_yangu_backend/app/seed_faker.py` — realistic Kenyan hospital seed data
- `CLAUDE.md` — detailed AI guide for the project

## Architecture decisions

- Price ranges (min/max), not exact prices — avoids gaming while still useful
- Gemini AI maps symptom queries to procedure slugs; falls back to keyword matching if no key
- DB auto-seeds with real Kenyan hospitals on first startup
- Slug-based URLs for hospitals and procedures
- Frontend configured via `VITE_API_URL` env var (defaults to `http://localhost:8000`)

## User preferences

- No Replit-native auth or DB — uses FastAPI + PostgreSQL running locally
- Code must be portable / GitHub-pushable
- UI should be state of the art — polished, animated, modern

## Gotchas

- Frontend calls backend at `VITE_API_URL` (default: `http://localhost:8000`)
- Backend needs `GEMINI_API_KEY` set for AI search to work
- DB runs via Docker on port 5501 (not the default 5432)
- Backend auto-seeds on first startup; force re-seed with `SEED_FORCE=true`
