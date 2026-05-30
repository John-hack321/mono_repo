# Bei Yangu (MediCompare KE) — AI project guide

## What this is

**Bei Yangu** is a healthcare **price transparency** platform for Kenya. Patients compare hospital **price ranges** for procedures before care. Hospitals and insurers are partners; patients use the product for free.

**Problem (one sentence):** Patients lack a central place to compare what hospitals charge for the same procedure.

**Not in scope for v0:** Auth, payments, bookings, exact real-time pricing guarantees, medical diagnosis.

## Repos

| Directory | Stack |
|-----------|--------|
| `bei_yangu_backend/` | FastAPI, SQLAlchemy, PostgreSQL, Gemini |
| `bei_yangu_frontend/` | Next.js 16, React 19, Tailwind 4 |

## Run locally

### 1. PostgreSQL (Docker)

```bash
docker run -d \
  --name bei_yangu_db \
  -e POSTGRES_DB=bei_yangu_db \
  -e POSTGRES_USER=bei_yangu_admin \
  -e POSTGRES_PASSWORD="1423Okello," \
  -p 5501:5432 \
  postgres:17
```

`DATABASE_URL=postgresql://bei_yangu_admin:1423Okello,@localhost:5501/bei_yangu_db`

### 2. Backend

```bash
cd bei_yangu_backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Set GEMINI_API_KEY for AI search (optional; keyword fallback exists)
uvicorn app.main:app --reload --port 8000
```

Seeds Kenyan sample hospitals on first start (`SEED_ON_STARTUP=true`).

### 3. Frontend

```bash
cd bei_yangu_frontend
cp .env.local.example .env.local
npm run dev
```

`NEXT_PUBLIC_API_URL=http://localhost:8000`

## Domain model

- **Hospital** — name, slug, location, tier, ownership (`government` | `private` | `faith-based`), **rating** + review_count
- **Procedure** — catalogue item (e.g. testicular exploration, normal delivery)
- **ProcedureSynonym** — fuzzy text match
- **procedure_relations** — related procedures (exploration ↔ prostate biopsy)
- **HospitalService** — `price_min`, `price_max` in KES per hospital+procedure
- **InsuranceProvider** + **HospitalInsurance**
- **Equipment** + **HospitalEquipment**

## API (backend)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/home` | Featured hospitals, insurers, stats |
| `GET /api/hospitals` | List; filter `?ownership=government` |
| `GET /api/hospitals/{slug}` | Detail + services sorted by price |
| `GET /api/search?q=` | Taxonomy search; results **ranked by `price_min` asc** |
| `POST /api/search/ai` | Body `{ "query": "..." }` — Gemini maps symptoms → procedures |
| `GET /health` | Liveness |

## Search behaviour

1. **Direct search** — matches procedure name, slug, description, synonyms; expands related procedures.
2. **AI search** — Gemini returns `summary` + `procedure_slugs` from catalogue; then same price ranking.
3. **Ranking** — lowest `price_min` first, then higher hospital rating.

## Frontend routes

- `/` — hero search, hospital grid, insurers
- `/hospitals/[slug]` — services & price ranges
- `/search?q=&ai=1` — results; `ai=1` uses POST `/api/search/ai`

## Conventions for AI edits

- Keep **KES** and **price ranges** (not single fixed prices) unless product changes.
- Sample data is **illustrative** — label UI as indicative where needed.
- Do not add auth until explicitly requested.
- Match existing Tailwind **teal** healthcare UI.
- Backend changes: update `app/seed.py` if new entities need demo data.
- CORS: `CORS_ORIGINS` in backend `.env`.

## Hackathon / event requirements

- **Gemini API** — `app/services/gemini_search.py`, model `gemini-2.0-flash`
- Precise problem: **information asymmetry on hospital pricing in Kenya**

## User story anchor

Found cheaper testicular exploration at another hospital after a friend's tip — product goal is that discovery **without** the phone call.
