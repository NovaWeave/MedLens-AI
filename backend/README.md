# MedLens AI Backend (FastAPI)

## Features
- FastAPI app with structured logging (structlog), security headers, rate limiting
- PostgreSQL via SQLAlchemy + Alembic
- Symptom checker with Hugging Face NER + heuristic fallback
- Misinformation scanner with heuristics + optional OpenAI/Cohere summary
- Redis cache (optional) for memoizing model outputs
- Sentry integration (optional)

## Quickstart (Docker)
```bash
# In repo root
docker compose up --build -d
# Docs: http://localhost:8000/docs
```

## Local Dev (without Docker)
```bash
cd backend
python -m venv .venv
. .venv/Scripts/activate  # Windows
pip install -r requirements.txt
set DATABASE_URL=postgresql+psycopg2://medlens:medlens@localhost:5432/medlens
alembic upgrade head
uvicorn app.main:app --reload
```

## Environment
- `DATABASE_URL` (required)
- `OPENAI_API_KEY` (optional)
- `OPENAI_MODEL` (default: gpt-4o-mini)
- `COHERE_API_KEY` (optional)
- `COHERE_MODEL` (default: command-r-plus)
- `SENTRY_DSN` (optional)
- `REDIS_URL` (optional, e.g. redis://localhost:6379/0)

## Endpoints
- `GET /api/health` – health check
- `POST /api/symptom-check` – analyze symptoms
- `POST /api/misinformation-scan` – scan article text
- `GET /api/logs` – recent interactions
- `POST /api/feedback` – store feedback

## Notes
- First call to `/api/symptom-check` may download a HF model; subsequent calls are cached (if Redis present).
- Rate limits default to 60/min.
