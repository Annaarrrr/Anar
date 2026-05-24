# ─────────────────────────────────────────────────────────────────────────────
#  ai-bridge-service — Dockerfile (multi-stage)
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy manifests using full monorepo path
COPY backend/services/ai-bridge-service/package*.json ./

# Install ALL dependencies
RUN npm install

# Copy source and compile
COPY backend/services/ai-bridge-service/ .
RUN npm run build


# ── Stage 2: Runner ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Only install production dependencies
COPY backend/services/ai-bridge-service/package*.json ./
RUN npm install --omit=dev

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

EXPOSE 3004
USER node

CMD ["node", "dist/main"]