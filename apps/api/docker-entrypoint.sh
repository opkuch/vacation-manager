#!/bin/sh
# Run migrations, then start the CEF local server. Env (DATABASE_URL, JWT_SECRET,
# FRONT_END_URL, PORT) is supplied by the container environment.
set -e

cd /app/apps/api

echo "[entrypoint] Applying database migrations..."
pnpm db:migrate

echo "[entrypoint] Starting API on port ${PORT:-8888}..."
exec pnpm exec tsx src/index.ts --local "${PORT:-8888}"
