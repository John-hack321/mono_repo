# Bei Yangu — CLAUDE.md

AI assistant guide for the Bei Yangu healthcare price comparison platform.

## What this project is

**Bei Yangu** (Swahili: "My Price") is a healthcare price transparency platform for Kenya. It lets patients compare procedure costs across hospitals, filter by insurance, and use AI to search when they only know their symptoms — not the medical name.

The name was inspired by a real situation: a patient about to undergo testicular exploration at Metropolitan Hospital (KES 350k) got a call from a friend who found the same procedure elsewhere for less. This platform prevents that information gap.

## Project structure

```
bei_yangu_backend/   # FastAPI + PostgreSQL backend (Python)
artifacts/bei-yangu/ # Vite + React frontend (TypeScript)
```

## Stack

- **Backend**: FastAPI 0.115, SQLAlchemy 2.0, PostgreSQL (via psycopg2), Pydantic v2, Gemini AI
- **Frontend**: Vite + React 19, TypeScript, Tailwind CSS v4, Framer Motion, wouter (routing), React Query

## Running locally

### Database (Docker)

```bash
docker run -d \
  --name bei_yangu_db \
  -e POSTGRES_DB=bei_yangu_db \
  -e POSTGRES_USER=bei_yangu_admin \
  -e POSTGRES_PASSWORD="1423Okello," \
  -p 5501:5432 \
  postgres:17
```

### Backend

```bash
cd bei_yangu_backend
cp .env.example .env          # then add GEMINI_API_KEY
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd artifacts/bei-yangu
VITE_API_URL=http://localhost:8000 npm run dev
```

## API endpoints

All routes are prefixed with `/api`:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/home` | Featured hospitals, top insurers, popular procedures, stats |
| GET | `/api/hospitals` | List all hospitals (supports `?ownership=` and `?county=` filters) |
| GET | `/api/hospitals/{slug}` | Hospital detail with services, insurers, equipment |
| GET | `/api/insurance` | List all insurance providers |
| GET | `/api/procedures` | List all procedures |
| GET | `/api/search?q=&max_budget=` | Search services by keyword, ranked by price |
| POST | `/api/search/ai` | AI-powered symptom → procedure → price search (Gemini) |
| GET | `/health` | Health check |
| GET | `/api/docs` | Swagger UI |

## Database schema

Core tables:
- `hospitals` — name, slug, tier, ownership, location, county, rating, review_count
- `procedures` — name, slug, category, description
- `procedure_synonyms` — alternative names for search matching
- `procedure_relations` — related procedures (many-to-many)
- `hospital_services` — price_min, price_max, currency, notes per hospital-procedure pair
- `insurance_providers` — name, slug
- `hospital_insurance` — which insurers each hospital accepts
- `equipment` — medical equipment types
- `hospital_equipment` — which equipment each hospital has

## Key architecture decisions

1. **Price ranges, not exact prices** — hospitals provide min/max to avoid gaming while still being useful
2. **Gemini AI layer** — maps symptom queries to procedure slugs from the catalogue; falls back to keyword matching if no API key is set
3. **Seed on startup** — the DB auto-populates with real Kenyan hospitals and realistic prices on first run (see `seed_faker.py`)
4. **Slug-based routing** — hospitals and procedures use URL slugs, not numeric IDs, for clean URLs and shareability
5. **CORS configured** — backend allows the frontend origin; update `CORS_ORIGINS` in `.env` for production domains

## Ownership types

- `government` — public hospitals (KNH, county referrals)
- `private` — commercial hospitals (Aga Khan, MP Shah, Nairobi Hospital)
- `faith-based` — mission hospitals (Mater, Tenwek, Kijabe)

## Hospital tiers

- **Level 6** — National referral hospitals (KNH, KUTRRH)
- **Level 5** — County referral hospitals + major private
- **Level 4** — Sub-county / community level

## Environment variables (backend)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://bei_yangu_admin:1423Okello,@localhost:5501/bei_yangu_db` | PostgreSQL connection |
| `GEMINI_API_KEY` | `""` | Google Gemini API key for AI search |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Allowed frontend origins |
| `SEED_ON_STARTUP` | `true` | Auto-seed database when empty |
| `SEED_FORCE` | `false` | Re-seed every startup |

## Frontend environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | FastAPI backend URL |

## Common tasks

### Add a new procedure

1. Add it to `PROCEDURES` list in `seed_faker.py`
2. Add synonyms to the `PROCEDURE_SYNONYMS` dict
3. Re-seed: `SEED_FORCE=true uvicorn app.main:app --reload`

### Add a new hospital

Edit `KENYAN_HOSPITALS` list in `seed_faker.py` with the new entry.

### Enable AI search

1. Get a free Gemini API key from https://aistudio.google.com/app/apikey
2. Set `GEMINI_API_KEY=your-key` in `bei_yangu_backend/.env`
3. Restart the backend

### Add auth

Auth is intentionally deferred. When implementing, consider:
- Hospital admin accounts to manage their own listings
- JWT tokens with FastAPI's OAuth2PasswordBearer
- Keep patient searches fully public (no auth needed)
