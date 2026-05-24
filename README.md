# Anar MVP — Infrastructure & Development Guide

> A comprehensive onboarding guide for all engineers working on the Anar platform.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repository Structure](#2-repository-structure)
3. [Prerequisites](#3-prerequisites)
4. [Environment Setup](#4-environment-setup)
5. [Running the Stack](#5-running-the-stack)
6. [Services & Ports Reference](#6-services--ports-reference)
7. [Email Testing with Mailpit](#7-email-testing-with-mailpit)
8. [Development Workflow](#8-development-workflow)
9. [CI/CD Pipeline](#9-cicd-pipeline)
10. [Quick Reference Cheatsheet](#10-quick-reference-cheatsheet)

---

## 1. Project Overview

Anar MVP is a **polyglot monorepo** — a single repository that houses multiple technologies working together as one unified platform:

| Layer | Technology |
|---|---|
| Authentication | .NET 9.0 |
| Business Logic | NestJS (Node.js) |
| AI Features | Python / FastAPI |
| Mobile Frontend | React Native / Flutter *(upcoming)* |
| Database | PostgreSQL |
| Infrastructure | Docker / Docker Compose |

The entire stack — including the database and email testing environment — is **fully containerized with Docker**. This means any engineer can spin up a fully working local environment with a single command, regardless of their operating system.

---

## 2. Repository Structure

```
anar-mvp/
│
├── backend/
│   ├── services/           # All microservices (NestJS + .NET)
│   │   ├── auth-service/   # .NET 9.0 — Authentication & authorization
│   │   ├── goal-service/   # NestJS — Goal management
│   │   ├── task-service/   # NestJS — Task management
│   │   └── notification-service/  # NestJS — Email & push notifications
│   │
│   └── shared/             # Shared resources across all NestJS services
│       ├── contracts/      # TypeScript interfaces & DTOs
│       └── migrations/     # SQL migration files (auto-executed on first boot)
│
├── ai-logic/               # Python FastAPI service for AI features
│
├── frontend/               # React Native / Flutter apps (upcoming)
│
├── docker-compose.yml      # Defines and wires all containers together
├── .env.example            # Template for your local environment variables
└── .env                    # Your local config (created by you, never committed)
```

### Key Design Decisions

- **`backend/shared/`** — Any TypeScript types, interfaces, or DTOs used by more than one NestJS service live here. The NestJS Dockerfiles are configured as multi-stage builds that automatically pull from this folder, so you can safely use relative imports like `../../shared/contracts/user.dto.ts`.

- **`backend/shared/migrations/`** — Drop any `.sql` file here and it will be **automatically executed** by the PostgreSQL container on its very first boot. You never need to run migrations manually.

- **`ai-logic/`** — Completely isolated Python environment. It exposes a FastAPI server and communicates with other services over HTTP, keeping Python dependencies entirely separate from the Node.js ecosystem.

---

## 3. Prerequisites

You only need two tools installed on your machine before you can run the entire project.

### Docker Desktop
Docker is the only runtime dependency. It runs all services, the database, and the email catcher in isolated containers.

- Download: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
- **After installing, make sure Docker Desktop is open and running** before executing any `docker` commands. You should see the Docker whale icon in your system tray / menu bar.

### Git
For cloning the repository and managing branches.

- Download: [https://git-scm.com/downloads](https://git-scm.com/downloads)

> **That's it.** You do not need Node.js, Python, .NET SDK, or PostgreSQL installed on your machine. Docker handles everything else.

---

## 4. Environment Setup

The project uses a `.env` file at the root of the repository to inject secrets and configuration into the containers at runtime. This file is intentionally excluded from version control (via `.gitignore`) to prevent secrets from being committed.

### Step-by-step

**1. Clone the repository**
```bash
git clone <repository-url>
cd anar-mvp
```

**2. Create your local `.env` file**

Duplicate the provided example file:

```bash
# On macOS / Linux
cp .env.example .env

# On Windows (Command Prompt)
copy .env.example .env
```

**3. Populate the `.env` file**

Open the newly created `.env` file and ensure it contains the following values for local development:

```env
# PostgreSQL Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=anar_db

# AI Service
DEEPSEEK_API_KEY=your_local_test_key
```

> **Note:** For local development, the placeholder values above are sufficient. Never commit real API keys or production credentials to this file or to the repository.

---

## 5. Running the Stack

All commands should be run from the **root of the repository**.

### Start everything (first time or after code changes)

```bash
docker compose up --build
```

The `--build` flag tells Docker to **recompile all service images** from your source code before starting. This is required:
- The very first time you run the project.
- Any time you pull new changes from `main`.
- Any time you change source code.
- Any time you add a new `npm` package or Python dependency.

Docker will pull base images, build each service, run migrations, and start all containers. The first build may take several minutes. Subsequent builds are much faster due to Docker's layer caching.

### Start without rebuilding (fast restart)

```bash
docker compose up
```

Use this when you haven't changed any dependencies or Dockerfiles and just want to restart the containers quickly.

### Stop the stack

```bash
# Option 1: Press Ctrl + C in the terminal where docker compose is running

# Option 2: Run this from any terminal in the project root
docker compose down
```

`docker compose down` stops and removes the containers. Your database data is persisted in a Docker volume, so it survives restarts.

### View logs for a specific service

```bash
docker compose logs -f goal-service
docker compose logs -f auth-service
docker compose logs -f ai-logic
```

### Rebuild a single service

```bash
docker compose up --build goal-service
```

---

## 6. Services & Ports Reference

Once the stack is running, every service is accessible on your `localhost`. Here is the complete reference:

| Service | Technology | Port | Notes |
|---|---|---|---|
| **Auth Service** | .NET 9.0 | `3001` | Handles all authentication & JWT |
| **Goal Service** | NestJS | `3002` | Goal CRUD operations |
| **Task Service** | NestJS | `3003` | Task management linked to goals |
| **AI Logic** | Python / FastAPI | `3004` | Health check: `http://localhost:3004/health` |
| **Notification Service** | NestJS | `3005` | Sends emails via Mailpit (local) |
| **Database** | PostgreSQL | `5432` | Auto-migrates on first boot |
| **Mailpit (SMTP)** | Mail Catcher | `1025` | Backend sends emails here |
| **Mailpit (UI)** | Web Interface | `8025` | View emails: `http://localhost:8025` |

### Health Check

To verify the AI service is running correctly, open your browser or run:

```bash
curl http://localhost:3004/health
```

A healthy response will return `{ "status": "ok" }`.

---

## 7. Email Testing with Mailpit

### Why Mailpit?

We do **not** use real email providers (SendGrid, Gmail, etc.) in local development. Doing so risks accidentally sending test emails to real users and exposing credentials. Instead, we use **Mailpit** — a local mail catcher that is built directly into our Docker environment.

Mailpit acts as a "black hole" for emails: it accepts every email sent by the notification service but never delivers them to a real inbox. Instead, it displays them in a clean web UI.

### Configuring the Notification Service

When sending emails from the `notification-service`, configure your email client (e.g., `nodemailer`) with these settings:

```typescript
// nodemailer transport configuration for local development
const transporter = nodemailer.createTransport({
  host: 'mailpit',      // Docker service name (resolves automatically inside Docker network)
  port: 1025,
  secure: false,        // No TLS
  auth: undefined,      // No authentication required
});
```

> **Important:** Inside the Docker network, services communicate using their **service names** as hostnames (e.g., `mailpit`, `postgres`), not `localhost`. `localhost` only works from your host machine's browser.

### Viewing Sent Emails

1. Make sure the stack is running.
2. Open your browser and navigate to: **[http://localhost:8025](http://localhost:8025)**
3. Every email sent by the notification service will appear here in real time.

This is the correct way to verify:
- HTML email template rendering
- Email content and subject lines
- Cron job email triggers
- Welcome emails, password resets, and notifications

---

## 8. Development Workflow

### Making Code Changes

1. Edit your source files as normal.
2. If your service supports **hot-reload** (most NestJS services do in dev mode), changes will apply automatically without restarting Docker.
3. If hot-reload is not available, restart the specific service:
   ```bash
   docker compose restart goal-service
   ```

### Adding a New npm Package

```bash
# 1. Stop the stack
docker compose down

# 2. Add your package to the correct service's package.json
#    (Edit manually or run npm install locally just to update package.json)

# 3. Rebuild so Docker installs the new package inside the container
docker compose up --build
```

> **Why can't I just `npm install` directly?** Packages must be installed *inside* the Docker container, not on your host machine. The `--build` flag triggers the Dockerfile's `npm install` / `pip install` step, which runs inside the container's environment.

### Adding a New Python Dependency

1. Add the package to `ai-logic/requirements.txt`.
2. Stop and rebuild:
   ```bash
   docker compose down
   docker compose up --build
   ```

### Adding a Database Migration

1. Create a new `.sql` file in `backend/shared/migrations/`.
2. Use a naming convention to control execution order:
   ```
   001_create_users_table.sql
   002_create_goals_table.sql
   003_add_status_to_tasks.sql
   ```
3. **The migration runs automatically** the next time you run `docker compose up` on a fresh database volume.

> **Warning:** Migrations only run on the **first boot** of the database container (when the data volume is empty). If you need to re-run migrations against an existing database, connect to it directly with a PostgreSQL client on port `5432`.

### Using Shared TypeScript Contracts

If you need a type or DTO in multiple services, place it in `backend/shared/contracts/`. From any NestJS service, import using a relative path:

```typescript
import { CreateGoalDto } from '../../shared/contracts/goal.dto';
```

The multi-stage Docker builds are pre-configured to resolve these paths correctly at build time.

---

## 9. CI/CD Pipeline

The project uses **GitHub Actions** for automated testing and validation.

### When does it run?

- On every **push to `main`**
- On every **Pull Request** targeting `main`

### What does it do?

1. Checks out the code in a clean environment.
2. Runs `docker compose up --build` to validate the entire stack builds successfully.
3. Executes all unit and integration tests across services.
4. Reports pass/fail status on the PR or commit.

### Rules

- **Never push directly to `main`** with code that fails locally. If it doesn't build and pass tests on your machine, it will fail in CI.
- **Always run the stack locally and verify** before opening a PR.
- A failing CI pipeline will block merging.

---

## 10. Quick Reference Cheatsheet

```bash
# ── First time setup ──────────────────────────────────────────
cp .env.example .env              # Create your local env file
docker compose up --build         # Build and start everything

# ── Daily usage ───────────────────────────────────────────────
docker compose up                 # Start without rebuilding
docker compose down               # Stop all containers
docker compose up --build         # Rebuild after code/dep changes

# ── Debugging ─────────────────────────────────────────────────
docker compose logs -f <service>  # Stream logs for a service
docker compose ps                 # See status of all containers
docker compose restart <service>  # Restart one service

# ── Adding dependencies ───────────────────────────────────────
# After editing package.json or requirements.txt:
docker compose down && docker compose up --build

# ── Service URLs ──────────────────────────────────────────────
# Auth Service       → http://localhost:3001
# Goal Service       → http://localhost:3002
# Task Service       → http://localhost:3003
# AI Logic           → http://localhost:3004
# Notification Svc   → http://localhost:3005
# AI Health Check    → http://localhost:3004/health
# Mailpit UI         → http://localhost:8025
# PostgreSQL         → localhost:5432  (user: postgres / pass: postgres / db: anar_db)
```

---

> **Questions?** Reach out to the team or open an issue in the repository.