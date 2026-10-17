# Task Management API

A full-stack task management app.

**Backend** — **.NET 10 / ASP.NET Core Web API** in a **Clean / DDD-style** layered architecture: JWT authentication (with refresh tokens), role-based authorization, admin user management, task CRUD with ownership rules, Redis caching, and a background worker.

**Frontend** (`frontend/`) — a **React 19 + TypeScript (Vite)** single-page app: JWT auth with protected and role-based routes, a task list with status filter / title search / pagination, create + update tasks, an admin area (users list, create, delete), and **live background-status updates over SSE**.

> **Walkthrough Backend Video:** `[VideoUrl](https://drive.google.com/file/d/1w8IvHywta17tG4sWJyzKuBl-q7ZJ0L-m/view?usp=sharing)`

> **Live Demo Video** `[VideoUrl](https://drive.google.com/file/d/15foXhnyl156l6l4IjIi2MUsrAcFsiAT8/view?usp=drive_link)`
---



## Setup instructions



### Prerequisites

- **To run with Docker (Option A):** just [Docker Desktop](https://www.docker.com/products/docker-desktop/) — no .NET SDK, SQL Server, or Redis needed locally (the compose stack provides them).
- **To run locally (Option B):**
  - [.NET 10 SDK](https://dotnet.microsoft.com/download)
  - [Node.js 20+](https://nodejs.org/) and npm (for the frontend)
  - SQL Server (local Express/Developer)
  - Redis (or run just Redis in Docker)



### Configuration & secrets

Non-secret settings live in `src/TaskManagement.Api/appsettings.json` (`Admin:Name`, `Admin:Email`, `Jwt:Issuer`, `Jwt:Audience`, `Jwt:ExpiryMinutes`, `Jwt:RefreshTokenDays`).

Secrets are read through `IConfiguration` and are **not** committed. For local runs, set them with **User Secrets** (from `src/`):

```bash
# Database
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,1433;Database=TaskManagementDb;User Id=sa;Password=YOUR_DB_PASSWORD;TrustServerCertificate=True;Encrypt=True" --project TaskManagement.Api

# Redis (include the password if your Redis requires one)
dotnet user-secrets set "ConnectionStrings:Redis" "localhost:6379,password=YOUR_REDIS_PASSWORD" --project TaskManagement.Api

# JWT signing key (at least 32 characters)
dotnet user-secrets set "Jwt:Key" "a-long-dev-only-signing-key-change-me-0123456789" --project TaskManagement.Api

# Seeded admin password
dotnet user-secrets set "Admin:Password" "Admin@123" --project TaskManagement.Api
```

For Docker these same values are provided as environment variables in `docker-compose.yml` (dev-only defaults).

### Frontend environment variables

The frontend reads its config from `frontend/.env` (copy `frontend/.env.example`). Vite inlines `VITE_*` variables at **build time**, so no API address is hardcoded in components.


| Variable       | Example                                                                            | Notes                                      |
| -------------- | ---------------------------------------------------------------------------------- | ------------------------------------------ |
| `VITE_API_URL` | `http://localhost:5206/api` (local API) · `http://localhost:8080/api` (Docker API) | Base URL of the API, **including** `/api`. |


For Docker, `VITE_API_URL` is passed as a build arg in `docker-compose.yml`.

---



## How to run the project



### Option A — Docker (easiest, everything in one command)

Starts the **frontend, API, SQL Server, and Redis** together:

```bash
docker compose up --build
```

- **App (frontend): [http://localhost:3000](http://localhost:3000)**
- API: **[http://localhost:8080](http://localhost:8080)**  ·  Swagger: **[http://localhost:8080/swagger](http://localhost:8080/swagger)**  ·  Health: **[http://localhost:8080/](http://localhost:8080/)**
- Log in with the seeded admin (see below).
- Reset everything: `docker compose down -v`



### Option B — Local

1. Set the User Secrets (see above).
2. Start Redis if needed: `docker run -d --name redis -p 6379:6379 redis redis-server --requirepass "YOUR_REDIS_PASSWORD"`
3. Run the API:
  ```bash
   cd src
   dotnet run --project TaskManagement.Api
  ```

- API: **[http://localhost:5206](http://localhost:5206)**  ·  Swagger: **[http://localhost:5206/swagger](http://localhost:5206/swagger)**  ·  Health: **[http://localhost:5206/](http://localhost:5206/)**

On first run (Development) EF Core migrations are applied automatically and the admin user is seeded.

1. In a second terminal, run the frontend:
  ```bash
   cd frontend
   npm install
   cp .env.example .env      # then set VITE_API_URL=http://localhost:5206/api
   npm run dev
  ```
  - App: **[http://localhost:5173](http://localhost:5173)** (calls the API at `VITE_API_URL`).

Run the backend tests:

```bash
dotnet test
```

---



## Seeded admin credentials

A default admin is seeded on startup:

- **Email:** `admin@example.com`
- **Password:** value of the `Admin:Password` secret / env var (Docker default: `Admin@123`)

---



## API endpoints


| Method | Route                    | Access        | Description                                                                                                          |
| ------ | ------------------------ | ------------- | -------------------------------------------------------------------------------------------------------------------- |
| GET    | `/`                      | Public        | Health check (`Healthy`)                                                                                             |
| POST   | `/api/auth/register`     | Public        | Register a new user (role `User`)                                                                                    |
| POST   | `/api/auth/login`        | Public        | Log in → access token + refresh token                                                                                |
| POST   | `/api/auth/refresh`      | Public        | Exchange a refresh token for new tokens                                                                              |
| POST   | `/api/auth/logout`       | Public        | Revoke a refresh token                                                                                               |
| GET    | `/api/auth/me`           | Authenticated | Current user's profile                                                                                               |
| POST   | `/api/users`             | Admin         | Create a user (role `User` or `Admin`)                                                                               |
| GET    | `/api/users`             | Admin         | List users (soft-deleted hidden)                                                                                     |
| DELETE | `/api/users/{id}`        | Admin         | Soft-delete a user                                                                                                   |
| POST   | `/api/tasks`             | Authenticated | Create a task (owned by the caller)                                                                                  |
| GET    | `/api/tasks`             | Authenticated | List the caller's tasks (sorted) — supports `?status=`, `?search=`, `?page=`, `?pageSize=`; returns a paged envelope |
| GET    | `/api/tasks/{id}`        | Authenticated | Get one of the caller's tasks (cached)                                                                               |
| PATCH  | `/api/tasks/{id}/status` | Authenticated | Update a task's status                                                                                               |
| GET    | `/api/tasks/stream`      | Authenticated | Server-Sent Events: live task status changes for the caller                                                          |


---



## Changes since Stage 1

All changes added in Backend — no Stage 1 behaviour was removed.

- **CORS enabled** for the frontend origins (`http://localhost:5173` for `vite dev`, `http://localhost:3000` for the Docker frontend). *Reason:* the browser SPA calls the API cross-origin. (`Program.cs` + `Cors:AllowedOrigins` in `appsettings.json`.)
- `GET /api/tasks` **— filter, search & pagination.** Optional `status` (enum) and `search` (title-contains) filters, plus `page`/`pageSize` returning a `{ data, page, pageSize, totalCount, totalPages }` envelope (default page 1, size 10, max 50). *Reason:* the task-list screen needs status filtering, title search, and server-side pagination. (`TaskFilterRequest`, `PaginationQuery`, `PagedResult<T>`, repo `Skip/Take/Count`.)
- `GET /api/users` **— pagination.** Same `PagedResult` envelope + `page`/`pageSize`. *Reason:* admin users-list pagination.
- **SSE stream** `GET /api/tasks/stream`**.** Streams `task-updated` events; an in-memory per-user `TaskEventHub` is published to by the background worker when it moves a task to `InProgress`. *Reason:* show the background status change in the UI without a reload. (`ITaskEventPublisher`/`TaskEventHub`, worker publish, SSE controller action.)
---



## Assumptions

- **Email** is Unique field that user can log in with it, also it have restriction that no two users have same email
- **Admins can create other admins** through `POST /api/users` (role is part of the request).
- **Soft delete for users:** a global EF Core query filter hides `IsDeleted` rows from every query; the email unique index is filtered so a deleted user's email can be reused.
- **Migrations auto-apply at startup in Development**; other environments would apply them out-of-band.
- **Enums are exposed as strings** in JSON (`"High"`, `"Pending"`) but stored as integers in the DB.
- **Refresh tokens** are stored hashed and rotated on every use; access tokens are short-lived (15 min), refresh tokens last 7 days.
- Secrets come from User Secrets locally and environment variables in Docker/production.



### Frontend

- **Auth tokens are stored in** `localStorage` so the session survives a refresh (an accepted XSS trade-off for this assessment). The access token is attached to every request, and a `401` triggers **one** refresh attempt, else logout.
- **The header's name/role come from the login/refresh response** (persisted with the session); `GET /api/auth/me` exists and could hydrate it, but the UI uses the stored session and self-corrects on the next 401.
- **Background-status visibility uses SSE** (`@microsoft/fetch-event-source`, which can send the `Authorization` header) rather than polling.
- **Filtering, search, and pagination are server-side**; pagination defaults to 10 per page (max 50).

---



## How AI tools were used

I used Claude Code as a pair programmer to assist with implementation and code review.

Every line submitted was reviewed and is understood - I can explain it and extend it live.

---



## Video Backend walkthrough

Link: [https://drive.google.com/file/d/1w8IvHywta17tG4sWJyzKuBl-q7ZJ0L-m/view?usp=sharing](https://drive.google.com/file/d/1w8IvHywta17tG4sWJyzKuBl-q7ZJ0L-m/view?usp=sharing)

The recording covers the points below (summarized here for reference).

### The project structure

Four projects under `src/` and a test project:

```
TaskManagement.Api            → controllers, middleware, DI wiring, JWT/Swagger setup
TaskManagement.Application    → use-case services, DTOs, interfaces
TaskManagement.Infrastructure → EF Core, repositories, Redis, JWT, background worker, seeding
TaskManagement.Domain         → entities, enums, constants
TaskManagement.UnitTests      → service unit tests
```



### The architecture approach

Clean / DDD-style layering with dependencies pointing inward (`Domain` depends on nothing). Request flow: `Controller → Service (Application) → Repository (Infrastructure) → DbContext`. The Application layer defines interfaces (`IUserRepository`, `ITokenService`, `ICacheService`, …) that Infrastructure implements, so business logic stays free of infrastructure concerns.

### The authentication and authorization flow

`POST /api/auth/login` validates credentials and returns a JWT (claims: `sub`, `email`, `name`, `role`; 15-min expiry) plus a refresh token. Clients send `Authorization: Bearer <token>`. JWT bearer validation is configured in an extension method; `[Authorize]` protects endpoints and `[Authorize(Roles = "Admin")]` gates admin-only ones. Bad credentials return `401`, missing role returns `403`. Refresh tokens are stored hashed and rotated on each `/refresh`; `/logout` revokes them.

### The seeded admin user

On startup `AdminSeeder` runs after migrations: it reads `Admin:Name/Email/Password` from config, and if the admin doesn't already exist it creates one (role `Admin`) inside an EF Core transaction. It is idempotent and tolerant of concurrent startups, so the admin is created exactly once.

### The implemented user and admin APIs

- `POST /api/auth/register` — public self-registration (role `User`).
- `GET /api/auth/me` — the current user's profile (authenticated).
- `POST /api/users` — admin creates a user (role `User` or `Admin`).
- `GET /api/users` — admin lists users (soft-deleted hidden).
- `DELETE /api/users/{id}` — admin soft-deletes a user.



### The implemented task APIs

- `POST /api/tasks` — create a task owned by the current user.
- `GET /api/tasks` — list the current user's tasks (sorted).
- `GET /api/tasks/{id}` — get one of the current user's tasks (cached).
- `PATCH /api/tasks/{id}/status` — update a task's status.

Every task endpoint is owner-scoped: another user's task returns `404`.

### How Redis is used

`GET /api/tasks/{id}` is cached under a per-user key (`task:{userId}:{taskId}`). First request → DB + cache (10-min expiry); subsequent requests → Redis. A status update invalidates the key. Connection settings fail fast and the cache degrades gracefully: if Redis is down the request falls back to the DB, and it resumes using Redis automatically when it recovers (no restart).

### How the background processing works

On create, the task is saved and its id is pushed to an in-process `Channel<Guid>`. A `BackgroundService` (`TaskProcessingWorker`) consumes the queue, simulates work, moves the task `Pending → InProgress`, and invalidates its cache entry.

### The business logic

- **Sorting:** `GET /api/tasks` orders by priority (High → Low), then creation date (newest first).
- **No duplicate title per day:** a task whose title matches an existing one for the same user on the same day is rejected with `409 Conflict`.

