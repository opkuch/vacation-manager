# Vacation Manager

## Install

Requires **Node 20+**, **pnpm**, and **Docker**. One-time setup from the repo root:

```bash
pnpm install
cp .env.example .env
```

Demo logins (all modes):


| Role      | Email                 | Password       |
| --------- | --------------------- | -------------- |
| Validator | `maya@vacation.local` | `Password123!` |
| Requester | `dana@vacation.local` | `Password123!` |


## Run

### Option A: Docker (Recommended)

API, web (nginx), and Postgres all run in containers. nginx proxies HTTP and  
WebSocket traffic under `/api` (including `/api/ws` for realtime toasts).

```bash
docker compose up --build
docker compose exec api pnpm db:seed   # first time only
```

Open **[http://localhost:8080](http://localhost:8080)**. Stop with `docker compose down`.

Uses `.env` only (`DATABASE_URL` host `db`, `FRONT_END_URL=http://localhost:8080`).  
Do not rely on `.env.local` in this mode — the API container reads compose env, not  
host overrides.

### **Option B: Postgres in Docker and client+server locally**

Best for day-to-day development: Vite dev server + API on the host, with Postgres  
in Docker.

```bash
cp .env.local.example .env.local
```

```bash
docker compose up -d db
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Use `.env.local.example` as-is (`localhost:5433` matches `POSTGRES_PORT` in `.env`).

*Open [http://localhost:5173](http://localhost:5173)*

## Test

```bash
pnpm test
pnpm typecheck
```

## Scalability

This project intentionally favors **simplicity**: a single API process, in-process  
WebSockets and event bus, and a straightforward Docker Compose stack. That keeps  
the app easy to run locally and the architecture easy to follow.

In a real production environment at higher traffic, you would typically choose  
more scalable options - multiple API instances behind a load balancer, managed  
PostgreSQL with connection pooling, externalized realtime (e.g. Redis pub/sub),  
async event delivery, caching, and observability. The layered design (handlers →  
services → ports) is meant so those upgrades can be added without rewriting  
core business logic.

## Technical decisions

- **Monorepo with a shared contract** — `@vm/shared` owns types, Zod schemas, routes,  
error codes, and pagination so the API and web app cannot drift apart.
- **CEF (Common Event Framework)** — HTTP routing and handler wiring come from  
`root.yaml`; handlers stay thin and delegate to controllers/services.
- **Layered backend** — `handlers → controllers → services → domain`, with TypeORM  
repositories implementing ports. Writes go through the `VacationRequest` aggregate;  
reads go service → repository (DAL) → DTO.
- **Domain events, not a command bus** — actions such as create/approve/reject live in  
`VacationService`; successful writes publish events (`VacationRequestSubmitted`,  
`VacationRequestApproved`, `VacationRequestRejected`) through an in-process  
`EventBus` for audit, realtime, and future notification channels.
- **JWT in an httpOnly cookie** — session survives refresh without storing tokens in  
JavaScript; authentication (identity) and authorization (role checks) are separate.
- **PostgreSQL + TypeORM** — explicit migrations (`synchronize: false`); passwords stored  
as bcrypt hashes (`password_hash`), never plaintext.
- **Vue 3 Composition API** — feature-based folders, Pinia for session/list state,  
Vue Router guards aligned with `API_ROUTES` access rules, Axios for typed API calls,  
Tailwind CSS v4 for layout and responsive behavior.

## Known limitations

- **Single API process** — Docker Compose runs one API container with in-process  
WebSockets and event dispatch; horizontal scaling would need externalized realtime  
and async events (see Scalability).
- **Team planning pagination** — the team view loads one page (50 rows); very large  
teams may not see every pending/approved request without paging UI.
- **Validator user filter** — the employee dropdown is built from users on the  
current result page, not a full directory of all employees.
- **Same-day vacations allowed** — end date must be on or after the start date (not  
strictly after), so a one-day request uses the same start and end date.
- **Notifications are stubbed** — approve/reject events are logged only; no email or  
push delivery yet (realtime toasts cover the main UX path).

