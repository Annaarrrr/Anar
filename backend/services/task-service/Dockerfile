# --- Build Stage ---
FROM node:18-alpine AS builder

# Set the working directory to the root of the container
WORKDIR /app

# 1. Copy the shared contracts so the NestJS build can access them
COPY backend/shared ./backend/shared

# 2. Copy the entire task-service code
COPY backend/services/task-service ./backend/services/task-service

# 3. Change working directory into the specific service folder
WORKDIR /app/backend/services/task-service

# 4. Install dependencies and build the TypeScript code
RUN npm install
RUN npm run build

# --- Production Stage ---
FROM node:18-alpine

# Set the working directory for the final lightweight image
WORKDIR /app

# 5. Copy ONLY the compiled code and dependencies from the builder stage
COPY --from=builder /app/backend/services/task-service/node_modules ./node_modules
COPY --from=builder /app/backend/services/task-service/dist ./dist
COPY --from=builder /app/backend/services/task-service/package*.json ./

# 6. Expose the port matching our docker-compose.yml mapping (task-service runs on 3003)
EXPOSE 3003

# 7. Start the compiled NestJS application
CMD ["npm", "run", "start:prod"]