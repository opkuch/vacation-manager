# Monorepo-aware build. Build context is the repo root (see docker-compose.yml).
# Single stage: the API runs via `tsx` (a devDependency), and pnpm's workspace
# symlinks cannot be safely copied across Docker stages, so we install and run
# in one place.
FROM node:20-alpine AS runtime
RUN corepack enable
WORKDIR /app

# Manifests first for dependency-layer caching.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile

# Then sources (host node_modules excluded via .dockerignore).
COPY packages/shared packages/shared
COPY apps/api apps/api

WORKDIR /app/apps/api
# Normalize CRLF (defensive: host checkout may carry Windows line endings),
# make executable, and generate the handler registry from root.yaml.
RUN sed -i 's/\r$//' docker-entrypoint.sh && chmod +x docker-entrypoint.sh && pnpm codegen

EXPOSE 8888
# Entrypoint runs migrations, then starts the CEF local server.
ENTRYPOINT ["/app/apps/api/docker-entrypoint.sh"]
