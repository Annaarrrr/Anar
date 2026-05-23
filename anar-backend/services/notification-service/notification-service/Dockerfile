# ────────────────────────────────────────────────────────────────────────────────
# Stage 1 — deps
# Install production + dev dependencies in a dedicated layer so Docker can cache
# them and only re-run npm install when package*.json actually changes.
# ────────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --frozen-lockfile


# ────────────────────────────────────────────────────────────────────────────────
# Stage 2 — build
# Copy source, compile TypeScript, prune to production-only node_modules.
# ────────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Re-use the full (dev) install from the deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Prune devDependencies so the final image carries only what the app needs
RUN npm prune --production


# ────────────────────────────────────────────────────────────────────────────────
# Stage 3 — runner (final image)
# Thin Alpine image — only compiled output + production node_modules.
# ────────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Security: run as a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only what the running process needs
COPY --from=build /app/dist        ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# Hand ownership to the non-root user before switching to it
RUN chown -R appuser:appgroup /app
USER appuser

# Document the port — override via docker run -p or compose ports
EXPOSE 3000

# Use the compiled entry point directly (no ts-node, no shell wrapper)
CMD ["node", "dist/main"]