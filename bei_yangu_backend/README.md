# Bei Yangu Backend

FastAPI + PostgreSQL backend for the Bei Yangu healthcare price comparison platform.

## Quick Start

### 1. Start the database (Docker)

```bash
docker run -d \
  --name bei_yangu_db \
  -e POSTGRES_DB=bei_yangu_db \
  -e POSTGRES_USER=bei_yangu_admin \
  -e POSTGRES_PASSWORD="1423Okello," \
  -p 5501:5432 \
  postgres:17
```

### 2. Set up environment

```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY for AI search
```

### 3. Install dependencies

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at http://localhost:8000

- API docs: http://localhost:8000/api/docs
- Health check: http://localhost:8000/health

## Notes

- The database is automatically created and seeded with real Kenyan hospitals on first startup.
- Set `SEED_FORCE=true` in `.env` to re-seed the database.
- Set `GEMINI_API_KEY` to enable AI-powered symptom-to-procedure mapping.
