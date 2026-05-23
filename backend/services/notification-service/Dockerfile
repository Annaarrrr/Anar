# ────────────────────────────────────────────────────────────────────────────────
# Stage 1 — deps
# Install production + dev dependencies in a dedicated layer so Docker can cache
# them and only re-run npm install when package*.json actually changes.
# ────────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

# Set the working directory to match the service path
WORKDIR /app/backend/services/notification-service

# Copy from the root context
COPY backend/services/notification-service/package*.json ./
RUN npm ci


# ────────────────────────────────────────────────────────────────────────────────
# Stage 2 — build
# Copy source, compile TypeScript, prune to production-only node_modules.
# ────────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build

# Start at the root to copy everything properly
WORKDIR /app

# Copy the shared contracts so the NestJS build can access them
COPY backend/shared ./backend/shared

# Copy the entire notification service code
COPY backend/services/notification-service ./backend/services/notification-service

# Re-use the full (dev) install from the deps stage
COPY --from=deps /app/backend/services/notification-service/node_modules ./backend/services/notification-service/node_modules

# Change directory into the service to run the build
WORKDIR /app/backend/services/notification-service

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

# Set WORKDIR to match where the app was built
WORKDIR /app/backend/services/notification-service

# Copy only what the running process needs from the build stage
COPY --from=build /app/backend/services/notification-service/dist        ./dist
COPY --from=build /app/backend/services/notification-service/node_modules ./node_modules
COPY --from=build /app/backend/services/notification-service/package.json ./package.json

# Hand ownership to the non-root user before switching to it
RUN chown -R appuser:appgroup /app
USER appuser

# Document the port — overrides via docker-compose (notification-service runs on 3005)
EXPOSE 3005

# Use the compiled entry point directly (no ts-node, no shell wrapper)
CMD ["node", "dist/main"]