# Vacation Manager

## Install

Requires **Node 20+**, **pnpm**, and **PostgreSQL**. **Docker is optional** — use it for
the full stack or only for Postgres; see [Run](#run) below.

```bash
pnpm install
cp .env.example .env
```

## Run

Demo logins (all modes):


| Role      | Email                   | Password       |
| --------- | ----------------------- | -------------- |
| Validator | `maya@vacation.local`   | `Password123!` |
| Requester | `rachel@vacation.local` | `Password123!` |


### Docker (Recommended)

API, web, and Postgres all run in containers.

```bash
docker compose up --build
docker compose exec api pnpm db:seed
```

Open **[http://localhost:8080](http://localhost:8080)**. Stop with `docker compose down`.

### Local - Without Docker

Install and start **PostgreSQL 16+** on your machine, then create a database and
user (adjust names/passwords if you prefer):

```sql
CREATE USER vacation WITH PASSWORD 'vacation_dev_pw';
CREATE DATABASE vacation_manager OWNER vacation;
```

Copy env overrides so the API talks to `localhost` instead of the Docker service
name `db`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` if your Postgres listens on the default port **5432** (the example
uses **5433**, which matches the Docker Postgres port in `.env`):

```env
DATABASE_URL=postgresql://vacation:vacation_dev_pw@localhost:5432/vacation_manager
FRONT_END_URL=http://localhost:5173
```

Then migrate, seed, and start API + web on the host:

```bash
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open **[http://localhost:5173](http://localhost:5173)**. API on **[http://localhost:8888](http://localhost:8888)**.

**Windows (PowerShell)** — use `Copy-Item .env.local.example .env.local` instead of `cp`.

### Run Postgres in Docker only (for development)

Same as above, but Postgres runs in Docker while API and web use `pnpm dev`:

```bash
docker compose up -d db
cp .env.local.example .env.local
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Use the `.env.local.example` values as-is (`localhost:5433` matches `POSTGRES_PORT`
in `.env`). Open **[http://localhost:5173](http://localhost:5173)**.

> If migrate fails with `role "…" does not exist`, check that Postgres is running
> and that `DATABASE_URL` host/port/user/password match your setup.

## Test

```bash
pnpm test
pnpm typecheck
```

