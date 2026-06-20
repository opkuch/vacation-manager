# Monorepo-aware build. Build context is the repo root (see docker-compose.yml).
# Install and build happen in one stage: pnpm's workspace symlinks cannot be
# safely copied across Docker stages, so we never COPY node_modules between them.
FROM node:20-alpine AS build
RUN corepack enable
WORKDIR /app

# Manifests first for dependency-layer caching.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile

# Then sources (host node_modules excluded via .dockerignore).
COPY packages/shared packages/shared
COPY apps/web apps/web

# baseURL is same-origin `/api`; nginx proxies it to the API service.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm --filter @vm/web build

# --- Runtime: nginx serving the SPA + reverse-proxying the API ---
FROM nginx:alpine AS runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
