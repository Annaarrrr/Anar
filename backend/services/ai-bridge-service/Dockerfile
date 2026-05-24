# --- Build Stage ---
FROM node:18-alpine AS builder

WORKDIR /app

# 1. Copy the shared contracts (so the service can understand shared types)
COPY backend/shared ./backend/shared

# 2. Copy the actual service code
COPY backend/services/ai-bridge-service ./backend/services/ai-bridge-service

# 3. Move into the service folder
WORKDIR /app/backend/services/ai-bridge-service

# 4. Install ALL dependencies (including devDependencies like TypeScript)
RUN npm install

# 5. Compile the TypeScript into the /dist folder
RUN npm run build


# --- Production Stage ---
FROM node:18-alpine

WORKDIR /app

# 6. Copy only the necessary runtime files from the builder stage
COPY --from=builder /app/backend/services/ai-bridge-service/node_modules ./node_modules
COPY --from=builder /app/backend/services/ai-bridge-service/dist ./dist
COPY --from=builder /app/backend/services/ai-bridge-service/package*.json ./

# 7. Expose a fresh port so it doesn't crash into the Python service
EXPOSE 3006

# 8. Start the compiled JavaScript application
CMD ["npm", "run", "start:prod"]

