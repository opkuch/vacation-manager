# Vacation Manager

## Install

Requires **Docker** (recommended) or **Node 20+**, **pnpm**, and **PostgreSQL**.

```bash
pnpm install
cp .env.example .env
```

## Run (Docker)

```bash
docker compose up --build
docker compose exec api pnpm db:seed
```

Open **http://localhost:8080**.

| Role | Email | Password |
| --- | --- | --- |
| Validator | `maya@vacation.local` | `Password123!` |
| Requester | `rachel@vacation.local` | `Password123!` |

Stop with `docker compose down`.

## Run (local)

Postgres runs in Docker; API and web run on the host via `pnpm dev`.

```bash
docker compose up -d db
cp .env.local.example .env.local
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open **http://localhost:5173**. API on **http://localhost:8888**.

`.env.local` overrides `.env` with `DATABASE_URL` pointing at `localhost` (the root `.env` uses host `db`, which only resolves inside Docker Compose).

**Windows (PowerShell)** — same steps; use `Copy-Item .env.local.example .env.local` instead of `cp`.

> If migrate fails with `role "…" does not exist`, another PostgreSQL may be bound to port 5432. Stop it or change `POSTGRES_PORT` in `.env` / `.env.local` (e.g. `5433`) and update `DATABASE_URL` accordingly.

## Test

```bash
pnpm test
pnpm typecheck
```
