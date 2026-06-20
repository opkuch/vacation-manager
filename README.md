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

```bash
docker compose up -d db
export DATABASE_URL=postgresql://vacation:vacation_dev_pw@localhost:5432/vacation_manager
pnpm --filter @vm/api db:migrate
pnpm --filter @vm/api db:seed
pnpm dev
```

API on `:8888`, web on `:5173`.

## Test

```bash
pnpm test
pnpm typecheck
```
