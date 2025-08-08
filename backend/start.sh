#!/bin/sh
set -eu

echo "[backend] Waiting for database..."
python - <<'PY'
import time, os
import psycopg2
url = os.getenv('DATABASE_URL', 'postgresql://medlens:medlens@db:5432/medlens')
url = url.replace('postgresql+psycopg2://', 'postgresql://')
for _ in range(60):
    try:
        psycopg2.connect(url)
        print('DB is up')
        break
    except Exception as e:
        print('Waiting for DB...', e)
        time.sleep(2)
else:
    raise SystemExit('Database connection timed out')
PY

echo "[backend] Running migrations"
alembic upgrade head || true

echo "[backend] Starting server"
exec uvicorn app.main:app --host 0.0.0.0 --port 8000


