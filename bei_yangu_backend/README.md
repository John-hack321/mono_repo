# Bei Yangu API

FastAPI backend for healthcare price comparison in Kenya.

## Database (Docker)

```bash
docker run -d \
  --name bei_yangu_db \
  -e POSTGRES_DB=bei_yangu_db \
  -e POSTGRES_USER=bei_yangu_admin \
  -e POSTGRES_PASSWORD="1423Okello," \
  -p 5501:5432 \
  postgres:17
```

Connection URL (matches `.env.example`):

```
postgresql://bei_yangu_admin:1423Okello,@localhost:5501/bei_yangu_db
```

## Setup

```bash
cd bei_yangu_backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Add GEMINI_API_KEY for AI symptom search
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/home` | Home page aggregates |
| GET | `/api/hospitals` | List hospitals |
| GET | `/api/hospitals/{slug}` | Hospital detail + services |
| GET | `/api/search?q=` | Procedure/synonym search, ranked by price |
| POST | `/api/search/ai` | Gemini-powered symptom search |
| GET | `/api/insurance` | Insurance partners |
| GET | `/api/procedures` | Procedure catalogue |
