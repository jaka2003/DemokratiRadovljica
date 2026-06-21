# syntax=docker/dockerfile:1

# ---- Base ----
FROM node:22-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
# sharp / native odvisnosti potrebujejo libc – slim (debian) je varnejši od alpine.
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# ---- Dependencies ----
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# ---- Build ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Med gradnjo Payload ne potrebuje žive baze; podamo varne nadomestne vrednosti.
ENV NODE_ENV=production
ENV DATABASE_URI=file:./build.db
ENV PAYLOAD_SECRET=build-time-placeholder-secret
RUN npm run build

# ---- Runner ----
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
# Standalone izhod Next.js
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public

# Mapa za naložene medije (priklopi se kot volume v docker-compose).
RUN mkdir -p /app/media && chown -R node:node /app
USER node

EXPOSE 3000
CMD ["node", "server.js"]
