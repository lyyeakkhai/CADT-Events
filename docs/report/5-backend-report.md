# Backend Report — CADT Events

| Field | Value |
|---|---|
| **Course / Module** | Backend Development / Web Services |
| **Project** | CADT Events Platform |
| **Document** | Full backend technical report |
| **Codebase** | `backend/` (Express + TypeScript + Prisma) |
| **Date** | 2026-07-13 |
| **Version** | 1.0 (complete from code & project docs) |

> **Sources:** `backend/src/**`, `backend/prisma/schema.prisma`, `backend/package.json`, `backend/.env.example`, `docs/architecture/backend/backend.md`, `docs/product/prd.md`, `docs/api/api-spec.md` (legacy notes; live routes take precedence), `Claude.md` deploy config.

---

## 1. Introduction

### 1.1 Introduction to the project

**CADT Events** is a centralized event management and discoverability platform for the **Cambodia Academy of Digital Technology (CADT)** community. It reduces fragmented communication (busy Telegram channels, ad-hoc forms, paper lists) by providing:

| Surface | Package | Role |
|---|---|---|
| Student web | `frontend/` | Discover events, register, favorites, Telegram link |
| Admin web | `frontend-admin/` | Create/publish events, users, check-in, settings |
| **Backend API** | **`backend/`** | AuthZ, business rules, persistence, integrations |
| Database | PostgreSQL (Supabase) | System of record via Prisma |

The backend is the **single REST API** both UIs call. It does not serve HTML; it returns JSON, enforces roles, talks to PostgreSQL, and integrates **Clerk** (identity), **Cloudinary** (images), and **Telegram** (notifications/reminders).

### 1.2 Objectives of this report

1. Introduce CADT Events and the backend’s role in the overall system.  
2. Document the **technology stack** and **architecture** (including architecture and file trees).  
3. Describe the **implementation methodology** used to build and ship the API.  
4. Document **API design**, auth, and a complete endpoint catalog from live code.  
5. Explain **core domain features** (events, bookings, users, favorites, notifications, upload, webhooks, Telegram).  
6. Cover **data access**, middleware, **security**, **integrations**, testing, and **production deploy**.  
7. Record challenges, decisions, limitations, and future work.

### 1.3 Purpose

This report is a submission-ready technical description of the CADT Events backend as implemented in the repository: architecture, APIs, integrations, security, and operations.

### 1.4 System role

```
┌─────────────────┐     ┌──────────────────┐
│  Student SPA    │     │   Admin SPA      │
│  (Vite/React)   │     │   (Vite/React)   │
└────────┬────────┘     └────────┬─────────┘
         │  HTTPS + Bearer JWT   │
         └───────────┬───────────┘
                     ▼
         ┌───────────────────────┐
         │  CADT Events Backend  │
         │  Express + TypeScript │
         └───────────┬───────────┘
                     │
     ┌───────────────┼───────────────┬────────────────┐
     ▼               ▼               ▼                ▼
 PostgreSQL      Clerk API      Cloudinary      Telegram Bot
 (Supabase)    (auth/users)     (images)       (notify/remind)
```

### 1.5 Scope

| In scope | Out of scope |
|---|---|
| HTTP API, auth/RBAC, modules, Prisma/DB access, integrations, deploy | Detailed frontend UI/UX report |
| Implementation methodology and production ops | Native mobile apps |

---

## 2. Technology stack

### 2.1 Stack table (as implemented)

| Concern | Technology | Version / notes | Why used |
|---|---|---|---|
| Runtime | Node.js | CommonJS package | Mature, fits Express ecosystem |
| Language | TypeScript | `typescript` 6.x | Type safety across modules |
| HTTP framework | **Express** | `express` 5.x | Lightweight, ADR: Express over NestJS |
| ORM | **Prisma** | 5.12 | Migrations, typed client, Postgres |
| Database | **PostgreSQL** | Supabase-hosted | Relational integrity for bookings/capacity |
| Auth provider | **Clerk** | `@clerk/express` | Hosted auth; API verifies Bearer JWT |
| Webhook verification | **Svix** | Used for Clerk webhooks | Signed `user.created` / `user.updated` |
| Validation | **Zod** | v4 | Request schemas at route boundary |
| Security headers | **helmet** | | Hardens HTTP responses |
| CORS | **cors** | Allowlist of frontends | Credentials + multi-origin |
| Rate limiting | **express-rate-limit** | 200 req / 15 min | Basic abuse protection |
| Media | **Multer** + **Cloudinary** | Memory upload → cloud | Event cover images |
| Messaging | **node-telegram-bot-api** | Polling bot | Link account + notifications |
| Scheduling | **node-cron** | Telegram reminder cron | Event reminders |
| Queues (optional) | **BullMQ** + **ioredis** | Present in `lib/queue.ts` | Optional Redis jobs; not required for basic demo |
| Logging | **pino** | server bootstrap | Structured logs |
| Env loading | **dotenv** + Zod | `config/env.ts` | Fail-fast invalid config |
| Build | `tsc` + **tsc-alias** | Path aliases (`@/…`) | Production `dist/` |
| Deploy host (API) | **Render** | Free web service; `render.yaml` API only |
| Deploy host (SPAs) | **Vercel** | Student + admin Vite apps (root dirs) |
| CI | **GitHub Actions** | `.github/workflows/ci.yml` — lint soft + build |

### 2.2 Key npm scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `tsx watch src/server.ts` | Hot reload local API |
| `build` | `tsc && tsc-alias` | Compile to `dist/` |
| `start` | `node dist/server.js` | Run compiled server |
| `start:prod` | `prisma migrate deploy && node dist/server.js` | Prod migrate + start |
| `lint` | `eslint src/` | Static checks |
| `postinstall` | `prisma generate` | Client after install |

### 2.3 Architecture tree (logical)

```
CADT-Events/
├── frontend/                 # Student SPA → calls API
├── frontend-admin/           # Admin SPA → calls API
├── backend/                  # ★ This report
│   ├── prisma/               # Schema + SQL migrations
│   ├── src/
│   │   ├── server.ts         # Process entry: listen + Telegram init
│   │   ├── app.ts            # createApp(): middleware + routers
│   │   ├── config/           # env, admins allowlist, cloudinary
│   │   ├── common/           # errors, middleware, shared schemas
│   │   ├── lib/              # prisma client, queue helpers, cloudinary
│   │   └── modules/          # Feature vertical slices
│   │       ├── events/
│   │       ├── bookings/
│   │       ├── users/
│   │       ├── favorites/
│   │       ├── notifications/
│   │       ├── telegram/
│   │       ├── upload/
│   │       └── webhooks/     # Clerk
│   └── package.json
└── docs/                     # Architecture, API, operations, reports
```

### 2.4 File tree (backend source — actual)

```
backend/
├── package.json
├── package-lock.json
├── tsconfig.json
├── eslint.config.mjs
├── prisma.config.ts
├── .env.example
├── README.md
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│       ├── 20260708080657_init/
│       │   └── migration.sql
│       ├── 20260708085318_add_checkin_to_bookings/
│       │   └── migration.sql
│       └── migration_lock.toml
├── scripts/
│   ├── api-create-events.ts
│   ├── clean-demo-events.ts
│   ├── seed-tech-events.ts
│   └── sync-users.ts
└── src/
    ├── server.ts
    ├── app.ts
    ├── config/
    │   ├── env.ts
    │   ├── admins.ts
    │   └── cloudinary.ts
    ├── common/
    │   ├── errors/
    │   │   └── app-error.ts
    │   ├── middleware/
    │   │   ├── auth.middleware.ts
    │   │   ├── error-handler.middleware.ts
    │   │   └── validate.middleware.ts
    │   ├── prisma/
    │   │   └── client.ts
    │   └── schemas/
    │       └── index.ts          # Zod: CreateEvent, CreateBooking, …
    ├── lib/
    │   ├── prisma.ts
    │   ├── cloudinary.ts
    │   └── queue.ts              # BullMQ helpers (optional Redis)
    └── modules/
        ├── events/
        │   ├── events.routes.ts
        │   └── events.controller.ts
        ├── bookings/
        │   ├── bookings.routes.ts
        │   └── bookings.controller.ts
        ├── users/
        │   ├── users.routes.ts
        │   └── users.controller.ts
        ├── favorites/
        │   ├── favorites.routes.ts
        │   └── favorites.controller.ts
        ├── notifications/
        │   ├── notifications.routes.ts
        │   └── notifications.controller.ts
        ├── telegram/
        │   ├── telegram.routes.ts
        │   ├── telegram.controller.ts
        │   ├── telegram.service.ts
        │   └── telegram.cron.ts
        ├── upload/
        │   └── upload.routes.ts
        └── webhooks/
            └── clerk.routes.ts
```

**Module convention (project ADRs / architecture docs):** routes wire middleware + handlers; controllers hold HTTP and call Prisma (and external SDKs); shared validation lives in `common/schemas`; cross-cutting auth/errors in `common/middleware`.

---

## 3. Architecture

### 3.1 Architectural style

CADT Events backend is a **modular monolith REST API**:

- One deployable Node process  
- Feature modules under `src/modules/*`  
- Shared infrastructure under `src/common` and `src/lib`  
- No microservices; external systems are **integrations**, not separate CADT services  

Guiding principles (from `docs/architecture/backend/backend.md` and code):

1. **Predictability** — same module layout per feature.  
2. **Validate at the boundary** — Zod on write routes.  
3. **Typed errors, catch once** — `AppError` → `errorHandler`.  
4. **Thin HTTP layer** — controllers map status codes; domain rules co-located with Prisma access.

### 3.2 Layering

| Layer | Responsibility | Location |
|---|---|---|
| Transport | HTTP, status codes, routing | `*.routes.ts`, `app.ts` |
| Application / domain | Business rules, orchestration | `*.controller.ts`, telegram service |
| Validation | Input shape | `common/schemas`, `validate` middleware |
| AuthZ | Bearer verify + admin role | `auth.middleware.ts`, `config/admins.ts` |
| Infrastructure | DB, Cloudinary, Telegram, Redis helpers | `lib/*`, `config/*`, Prisma |

### 3.3 Request lifecycle

```
Client request
    │
    ▼
helmet ──► cors
    │
    ├── /api/webhooks  → raw body → Svix verify → Clerk user sync
    │
    ▼
express.json ──► rateLimit ──► clerkMiddleware
    │
    ▼
Route match (/api/events, /bookings, …)
    │
    ├── requireAuth (Bearer JWT via Clerk verifyToken)
    ├── requireRole('ADMIN') when needed
    ├── validate(ZodSchema) when needed
    ▼
Controller
    │
    ├── prisma.* / clerkClient / cloudinary / telegram
    ▼
JSON success  OR  next(err) ──► errorHandler ──► JSON error
```

**Note:** Clerk webhook is registered **before** `express.json()` so the body stays raw for signature verification.

### 3.4 App composition (`createApp`)

From `src/app.ts`, routers are mounted as:

| Mount path | Module | Auth default |
|---|---|---|
| `/api/webhooks` | Clerk webhooks | Svix secret (not user JWT) |
| `/api/health` | Inline | Public |
| `/api/events` | events | Mixed public / admin |
| `/api/bookings` | bookings | Authenticated (+ admin for some) |
| `/api/telegram` | telegram | Authenticated |
| `/api/notifications` | notifications | Authenticated (+ admin feed) |
| `/api/favorites` | favorites | Authenticated |
| `/api/users` | users | Admin |
| `/api/upload` | upload | Admin only |

### 3.5 Process entry (`server.ts`)

1. Load env (via imports).  
2. `createApp()` and `listen(PORT)`.  
3. `initTelegramBot()` — polling bot if `TELEGRAM_BOT_TOKEN` set.  
4. `initTelegramCron()` — scheduled event reminders.

---

## 4. Implementation methodology

### 4.1 Development approach

| Item | Practice in this project |
|---|---|
| Process | Iterative, feature-driven vertical slices |
| Design inputs | PRD (`docs/product/prd.md`), system design, backend architecture, ADRs |
| Code organization | Express feature modules under `src/modules/` |
| Quality | TypeScript compile, ESLint, CI package builds |
| VCS | Git / GitHub; deploy on push to `main` (Render) |

### 4.2 Implementation principles

1. **One module per domain** (`events`, `bookings`, …).  
2. **Zod at write boundaries** (`CreateEventSchema`, `CreateBookingSchema`).  
3. **Clerk owns passwords/sessions**; API stores `password_hash: 'managed-by-clerk'` for local user rows.  
4. **Soft deletes** where needed (`deleted_at` on events/registrations).  
5. **Admin allowlist** (`ADMIN_EMAILS`) for demo-safe role assignment when webhooks lag.  
6. **Non-blocking side effects** — Telegram notify uses `.catch()` so HTTP still succeeds.  
7. **Env fail-fast** — invalid required env exits process in `config/env.ts`.

### 4.3 Implementation workflow (new feature)

```
1. Requirement / user story (PRD or issue)
        ↓
2. Prisma model / migration if data changes
        ↓
3. Zod schema (if body/query input)
        ↓
4. Controller logic + Prisma / external calls
        ↓
5. Routes: auth + validate + handler
        ↓
6. Mount in app.ts (if new router)
        ↓
7. Local test (curl / admin / student app)
        ↓
8. Commit → CI build → Render deploy → GET /api/health
```

### 4.4 Feature delivery order (as reflected in code)

| Phase | Focus | Deliverables |
|---|---|---|
| 1 | Foundation | `app.ts`, helmet, cors, rate limit, health, env |
| 2 | Identity | Clerk middleware, `requireAuth`/`requireRole`, webhook sync |
| 3 | Core domain | Events CRUD + public list; bookings + capacity + check-in |
| 4 | Admin | Users list/invite, system settings, image upload |
| 5 | Engagement | Favorites, in-app notifications, Telegram connect + reminders |
| 6 | Ship | Migrations, `start:prod`, production URLs |

### 4.5 Integration methodology

| Integration | How it was wired | Verification |
|---|---|---|
| Supabase Postgres | `DATABASE_URL` + `DIRECT_URL`, Prisma | migrate + CRUD |
| Clerk | JWT verify + webhook + `clerkClient` | Protected routes; user rows appear |
| Cloudinary | Multer memory → `uploader.upload` | Admin gets `secure_url` |
| Telegram | Bot token, deep link `?start=<userId>` | chat_id stored; messages send |
| Frontends | CORS + `FRONTEND_URL` / `ADMIN_URL` | Browser calls succeed |
| Render | build + `start:prod` | `/api/health` 200 |

### 4.6 Quality gates (feature done)

- Correct `requireAuth` / `requireRole`  
- Zod validation on mutating inputs where defined  
- Errors via `AppError` + central handler (or explicit 4xx where noted)  
- Migration safe for existing data  
- Happy path + failure path (capacity full, forbidden, not found)  
- Secrets only in env  

---

## 5. API design

### 5.1 Conventions

| Topic | Convention |
|---|---|
| Base path | `/api` |
| Local base | `http://localhost:4000/api` |
| Production base | `https://cadt-events-api.onrender.com/api` |
| Format | JSON request/response |
| Success envelope (most modules) | `{ success: true, data: … }` |
| Auth header | `Authorization: Bearer <Clerk session JWT>` |
| Versioning | No URL version prefix (single evolving API) |

### 5.2 Authentication & authorization

| Mechanism | Implementation |
|---|---|
| Identity provider | **Clerk** (not custom local JWT auth) |
| API verification | `requireAuth` uses `verifyToken` from `@clerk/express` with `CLERK_SECRET_KEY` |
| User id | Clerk `sub` → `user_id` in `user_account` |
| Admin role | Clerk `publicMetadata.role` ∈ `{ADMIN, SUPER_ADMIN}` **or** email ∈ `ADMIN_EMAILS` |
| Admin heal | If allowlisted email missing role, middleware may patch Clerk metadata |
| Webhook sync | `user.created` / `user.updated` → upsert `user_account` (+ `admin` if allowlisted) |

**Important:** Older docs/README snippets mentioning custom JWT register/login do **not** match current production code. Live auth is **Clerk-only**.

### 5.3 Error response shapes

| Source | HTTP | Body |
|---|---|---|
| `AppError` subclasses | 400–409 as set | `{ error, code? }` |
| `ZodError` | 400 | `{ error: "Validation failed", code: "VALIDATION_ERROR", issues: […] }` |
| Unhandled | 500 | Generic message (stack only in development) |
| `requireAuth` failure | 401 | `{ success: false, message: … }` |

### 5.4 Complete endpoint catalog (from routes)

#### Health

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Liveness: `{ status, env, timestamp }` |

#### Webhooks

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/webhooks/` | Svix signature | Clerk user create/update sync |

#### Events (`/api/events`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/events` | Public | List published/ongoing/completed (filter: `status`, `search`, `featured`) |
| GET | `/api/events/all` | Admin | List all non-deleted events including drafts |
| GET | `/api/events/:id` | Public | Event detail + questions |
| GET | `/api/events/:id/seats` | Auth | Occupied seat labels + capacity snapshot |
| POST | `/api/events` | Admin | Create event (draft/published); optional questions & reminders |
| PATCH | `/api/events/:id` | Admin | Update fields; draft→published triggers Telegram broadcast |
| DELETE | `/api/events/:id` | Admin | Soft delete (`deleted_at`) |

#### Bookings (`/api/bookings`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/bookings` | Auth | Create registration (capacity, seat, answers) |
| GET | `/api/bookings/me` | Auth | Current user’s bookings |
| GET | `/api/bookings/event/:eventId` | Admin | All bookings for an event |
| PATCH | `/api/bookings/:id/checkin` | Admin | Toggle check-in timestamp |
| DELETE | `/api/bookings/:id` | Auth | Soft-cancel own booking (not if event already started) |

#### Favorites

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/favorites/me` | Auth | List favorites |
| POST | `/api/favorites/toggle` | Auth | Body `{ eventId }` add/remove |

#### Notifications

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications/me` | Auth | User inbox |
| PATCH | `/api/notifications/:id/read` | Auth | Mark read |
| GET | `/api/notifications/admin` | Admin | Synthetic admin feed (recent regs/events) |

#### Users (admin)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | Merged user_account + admin list with credits stats |
| POST | `/api/users/invite` | Admin | Clerk invitation email; admin invites restricted to allowlist |
| GET | `/api/users/settings` | Admin | Load `system_setting` key/values |
| PUT | `/api/users/settings` | Admin | Upsert settings section JSON |

#### Telegram

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/telegram/connect` | Auth | Deep link `t.me/<bot>?start=<userId>` |
| GET | `/api/telegram/status` | Auth | `{ configured, isConnected }` |
| DELETE | `/api/telegram/disconnect` | Auth | Clear `telegram_chat_id` (+ Clerk metadata) |

#### Upload

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/upload` | Admin | Multipart field `image` → Cloudinary → `{ url, public_id }` |

### 5.5 Example: create booking

**Request**

```http
POST /api/bookings HTTP/1.1
Host: cadt-events-api.onrender.com
Authorization: Bearer <clerk_jwt>
Content-Type: application/json

{
  "eventId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "seatLabel": "A1",
  "answers": {
    "question-uuid": "My answer"
  }
}
```

**Success (201)**

```json
{
  "success": true,
  "data": {
    "id": "…",
    "bookingReferenceId": "CADT-20260713-ABCD",
    "userId": "user_…",
    "eventId": "…",
    "seatLabel": "A1",
    "status": "CONFIRMED",
    "event": { "title": "…", "startTimestamp": "…", "…": "…" }
  }
}
```

**Failure cases:** event not published (404), capacity full (409), already booked (409), seat taken (409), required question missing (400).

### 5.6 Example: health

```http
GET /api/health HTTP/1.1
```

```json
{
  "status": "ok",
  "env": "production",
  "timestamp": "2026-07-13T00:00:00.000Z"
}
```

### 5.7 Status codes used

| Code | When |
|---|---|
| 200 | OK |
| 201 | Created (event, booking, invite) |
| 400 | Validation / bad request |
| 401 | Missing/invalid Bearer token |
| 403 | Authenticated but not admin (or role fail) |
| 404 | Resource not found |
| 409 | Conflict (capacity, duplicate booking, seat) |
| 500 | Server / misconfiguration |

---

## 6. Core domain features

### 6.1 Health & system

- **GET `/api/health`** — used by Render and humans for smoke tests.  
- Env exposed as `env.NODE_ENV` only (no secrets).

### 6.2 Authentication & user provisioning

**Paths into `user_account`:**

1. Clerk webhook upsert on `user.created` / `user.updated`.  
2. Lazy create on first booking/favorite/Telegram if webhook missed (fetch Clerk profile).  
3. Admin invite via Clerk Invitations API.

**Admin identity:**

- `ADMIN_EMAILS` env (comma-separated) + defaults in `config/admins.ts`.  
- Webhook sets Clerk `publicMetadata.role` to `ADMIN` or `STUDENT`.  
- Webhook also upserts `admin` table for allowlisted emails.  
- `requireRole('ADMIN')` checks metadata **or** allowlisted email.

### 6.3 Events

**Public list** returns non-deleted events in `published | ongoing | completed` by default so calendars can show history.

**Admin create** accepts:

- Title, description, start/end, location, capacity, cover URL, type, credits, featured, status  
- Optional **registration questions**  
- Optional **reminder schedules** (minutes before start → `event_reminder` rows)

**Publish side effect:** when status becomes `published` (create or draft→publish), backend triggers Telegram broadcast to users with linked `telegram_chat_id` (non-blocking).

**Delete:** soft delete via `deleted_at`.

**Seats endpoint:** returns occupied `seat_label`s from registrations + remaining capacity (label-based seat map, not full venue matrix required).

### 6.4 Bookings (registrations)

Implemented as `Registration` rows with:

| Rule | Behavior |
|---|---|
| Event must be published & not deleted | Else 404 |
| Capacity | Count active regs; if `capacity` set and full → 409 |
| One booking per user per event | Else 409 |
| Optional seat label | Unique among active regs for event |
| Required questions | Validated against event questions |
| Reference | `CADT-YYYYMMDD-XXXX` |
| Cancel | Soft delete; blocked if `start_time` in the past |
| Check-in | Admin toggles `checked_in_at` |
| Telegram | Confirm/cancel messages if user linked |

Booking create runs inside **`prisma.$transaction`** for capacity + seat + insert consistency (application-level; not serializable isolation guarantees under extreme concurrency — see limitations).

### 6.5 Favorites

- Unique `(user_id, event_id)`.  
- Toggle endpoint adds or removes.  
- Lazy user create from Clerk if missing.

### 6.6 Notifications

- Student inbox from `notification` table.  
- Mark as read with ownership check.  
- Admin “notifications” endpoint builds a **derived feed** from recent registrations and events (not only `notification` rows).

### 6.7 Admin users & settings

- **List users:** merge `user_account` + `admin` by email; compute `eventsJoined` / `totalCredits` from checked-in registrations.  
- **Invite:** Clerk invitation; cannot invite as admin unless email on allowlist.  
- **Settings:** key/value `system_setting` with JSON values, keys like `settings.<section>`.

### 6.8 Upload

- Admin-only multipart `image`.  
- Multer memory storage → base64 data URI → Cloudinary folder `events`.  
- Returns CDN `secure_url` for event cover fields.

### 6.9 Telegram

| Capability | Detail |
|---|---|
| Connect | Deep link embeds Clerk user id |
| Bot `/start <userId>` | Stores `telegram_chat_id` on user + Clerk metadata |
| Status / disconnect | HTTP APIs for student settings |
| Booking confirm/cancel | Per-user message |
| Publish broadcast | All linked users when event published |
| Cron reminders | `telegram.cron` + `event_reminder` schedule |

If `TELEGRAM_BOT_TOKEN` unset, bot is null; connect API reports not configured.

---

## 7. Data access layer

### 7.1 Database technology

- **PostgreSQL** on Supabase.  
- Prisma `datasource` uses `DATABASE_URL` (pooler) and `directUrl` = `DIRECT_URL` (migrations).  
- Enums mapped to Postgres enum types (`event_status_enum`, etc.).

### 7.2 Core models (summary)

| Model | Table | Role |
|---|---|---|
| `UserAccount` | `user_account` | Students/staff users; Clerk id as PK |
| `Admin` | `admin` | Organizers; synced for allowlisted admins |
| `Event` | `event` | Core catalog; soft delete |
| `Registration` | `registration` | Bookings + check-in + seat_label |
| `Favorite` | `favorite` | Bookmarks |
| `Notification` / `TelegramNotification` | | In-app + Telegram outbox shapes |
| `EventQuestion` / `RegistrationAnswer` | | Dynamic registration forms |
| `EventReminder` | | Reminder schedule rows |
| `Venue` / seats / speakers / departments | | Extended schema (partial UI use) |
| `SystemSetting` | `system_setting` | Admin settings JSON |

### 7.3 Prisma usage patterns

- Singleton client via `@/lib/prisma`.  
- Controllers query with `include` / `select` and **map to camelCase API DTOs** (`mapEvent`, booking normalizers).  
- Soft delete filters: `deleted_at: null`.  
- Credits: sum `event.credit_value` for checked-in registrations in admin user list.

### 7.4 Transactions

- Booking creation uses `$transaction` for read capacity + create registration + answers.  
- Event create may createMany questions/reminders after main insert.

### 7.5 Migrations (production)

```bash
cd backend
npm run build
npm run start:prod   # prisma migrate deploy && node dist/server.js
```

Migrations present:

1. `20260708080657_init`  
2. `20260708085318_add_checkin_to_bookings`

### 7.6 Environment variables (names only)

| Variable | Purpose |
|---|---|
| `NODE_ENV` | development / production / test |
| `PORT` | Listen port (default 4000) |
| `DATABASE_URL` | Prisma runtime (pooler) |
| `DIRECT_URL` | Migrations / direct Postgres |
| `CLERK_PUBLISHABLE_KEY` | Clerk (middleware) |
| `CLERK_SECRET_KEY` | Token verify + server Clerk API |
| `CLERK_WEBHOOK_SECRET` | Svix verify |
| `ADMIN_EMAILS` | Comma-separated admin allowlist |
| `CLOUDINARY_*` / `CLOUDINARY_URL` | Image upload |
| `TELEGRAM_BOT_TOKEN` | Bot polling |
| `TELEGRAM_BOT_USERNAME` | Deep link username |
| `FRONTEND_URL` / `ADMIN_URL` | CORS origins |
| `PUBLIC_WEB_URL` | HTTPS links in Telegram buttons |
| `ADMIN_INVITE_REDIRECT_URL` | Clerk invite redirect |
| `REDIS_URL` | Optional BullMQ (default localhost) |

Validated required at boot (Zod): `DATABASE_URL`, `DIRECT_URL`, Clerk keys, `PORT`, `NODE_ENV`.

---

## 8. Middleware & cross-cutting concerns

### 8.1 Security middleware stack

| Middleware | Role |
|---|---|
| `helmet()` | Secure HTTP headers |
| `cors({ origin: […], credentials: true })` | Localhost + env frontends |
| `rateLimit({ windowMs: 15m, limit: 200 })` | Basic throttling |
| `clerkMiddleware` | Clerk Express integration |
| `requireAuth` | Manual Bearer JWT verify |
| `requireRole` | Admin/student gate |
| `validate(schema)` | Zod body parse |
| `errorHandler` | Last middleware |

### 8.2 CORS allowlist (code)

- `http://localhost:5173`, `3000`, `3001`, `5174`  
- `process.env.FRONTEND_URL`, `process.env.ADMIN_URL`  

Production must set front-end URLs or browsers will block.

### 8.3 Validation

Shared schemas in `common/schemas/index.ts`:

- `CreateEventSchema` / `UpdateEventSchema`  
- `CreateBookingSchema` (`eventId` UUID, optional seat `A1` style, answers map)

### 8.4 Error hierarchy

```
AppError
├── BadRequestError    (400)
├── UnauthorizedError  (401)
├── ForbiddenError     (403)
├── NotFoundError      (404)
└── ConflictError      (409)
```

### 8.5 Logging

- `pino` at server start.  
- Controllers also use `console.log` / `console.error` for demo diagnostics (upload, createEvent, Telegram).

### 8.6 Optional queues

`lib/queue.ts` exposes BullMQ `createQueue` / `createWorker` / `createQueueEvents` against Redis. Core booking/event paths do **not** require Redis; Telegram reminders use **node-cron** instead.

---

## 9. Security

### 9.1 Threat model (summary)

| Threat | Mitigation in codebase |
|---|---|
| Unauthenticated API use | Bearer JWT required on protected routes |
| Privilege escalation | `requireRole('ADMIN')` + allowlist + Clerk metadata |
| SQL injection | Prisma parameterized queries |
| Forged webhooks | Svix signature with `CLERK_WEBHOOK_SECRET` |
| Brute force / abuse | Rate limit 200/15min (coarse) |
| Secret leakage | Env vars; `.env.example` placeholders only |
| XSS via API | JSON API; clients responsible for render escaping |
| Over-upload | Admin-only upload; Cloudinary remote store |

### 9.2 AuthN vs AuthZ

- **AuthN:** Is the Clerk JWT valid? (`requireAuth`)  
- **AuthZ:** Is this principal an admin for this mutation? (`requireRole`, invite allowlist)

### 9.3 Secrets management

- Never commit real keys.  
- Render / local `.env` only.  
- Report and repo examples use placeholders.

### 9.4 Known security / production limitations

1. Rate limit is global and relatively permissive.  
2. Booking capacity uses transactional reads/writes but is not database-level `SELECT FOR UPDATE` / advisory locks — rare race under extreme concurrency possible.  
3. Some admin notification path checks `prisma.admin` row; role middleware also allowlists emails — keep both in sync via webhooks.  
4. Verbose logging may include body snippets in createEvent (trim in hardened production).  
5. Default admin emails exist in `admins.ts` for demo fallback if env empty — production should set `ADMIN_EMAILS` explicitly.  
6. Free-tier cold starts on Render can delay first request.

---

## 10. Integrations (end-to-end)

### 10.1 Clerk

```
[SPA Clerk SDK] --Bearer JWT--> [API requireAuth]
[Clerk Cloud]  --signed webhook--> [POST /api/webhooks] --> user_account / admin upsert
[API] --clerkClient--> invite users, getUser, update metadata
```

### 10.2 PostgreSQL / Supabase

```
Controller --> Prisma Client --> DATABASE_URL (pooler)
prisma migrate deploy --> DIRECT_URL (session)
```

### 10.3 Cloudinary

```
Admin SPA multipart --> POST /api/upload --> Multer memory --> Cloudinary upload --> secure_url
Admin create/update event stores cover_image_url
```

### 10.4 Telegram

```
GET /api/telegram/connect --> deep link
User opens Telegram /start <clerkId> --> bot saves telegram_chat_id
Booking/publish/cron --> notifyUserViaTelegram / broadcast
```

### 10.5 Frontends

| Client | Typical local port | Calls |
|---|---|---|
| Student | 5173 | events, bookings, favorites, telegram, notifications |
| Admin | 3000 | events CRUD, bookings check-in, users, upload, settings |

---

## 11. Testing the backend

### 11.1 Strategy (current practice)

| Level | Status in project | Approach |
|---|---|---|
| Unit | Limited | Controllers are integration-style with Prisma |
| Integration / manual | Primary | curl, Postman, real frontends |
| Scripts | Present | `backend/scripts/*` seed/sync helpers |
| CI | GitHub Actions | Lint (non-blocking) + **build** all packages |
| Ops reports | `docs/operations/` | E2E / pre-deploy plans and dated test reports |

`createApp()` is separated from `listen()` so supertest-style tests can attach later without binding a port.

### 11.2 Critical scenarios to verify

1. `GET /api/health` → 200  
2. Public `GET /api/events` without token  
3. Student booking with valid JWT  
4. Double booking same event → 409  
5. Capacity full → 409  
6. Admin create event without admin → 403  
7. Admin create + publish → event visible + optional Telegram  
8. Check-in toggle  
9. Cancel past event booking → 400  
10. Upload without admin → 401/403  
11. Webhook without signature → 400  

### 11.3 Evidence

Attach screenshots/logs from:

- Local or production health response  
- Admin create event + student booking  
- Optional: `docs/operations/test-report-*.md`

---

## 12. Deployment, hosting & CI/CD

### 12.1 Production hosting model

CADT Events uses a **split hosting** design: the **backend API** is a long-running Node service; the **UIs** are static Vite builds.

| Piece | Host | Config in repo |
|---|---|---|
| PostgreSQL | **Supabase** | `DATABASE_URL` + `DIRECT_URL` (env only) |
| **Backend API** | **Render** free Web Service | `render.yaml` (API service only) |
| **Student frontend** | **Vercel** | Root dir `frontend/`, `frontend/vercel.json` SPA rewrites |
| **Admin frontend** | **Vercel** | Root dir `frontend-admin/`, `frontend-admin/vercel.json` |
| Auth | **Clerk** | Same app keys across API + both SPAs |
| Images | **Cloudinary** | Upload API; URL in `event.cover_image_url` |
| CI | **GitHub Actions** | `.github/workflows/ci.yml` |

```
GitHub main
   │
   ├─ CI: GitHub Actions (lint soft + build ×3)
   │
   ├─ CD API:  Render auto-deploy  →  https://cadt-events-api.onrender.com
   │                └── start:prod → prisma migrate deploy + node dist/server.js
   │                └── Supabase Postgres
   │
   └─ CD Web:  Vercel auto-deploy
                ├── student  (frontend/)
                └── admin    (frontend-admin/)
                     └── VITE_API_URL → Render API
```

### 12.2 Why this split

| Concern | Choice |
|---|---|
| API needs Node process, migrations, Telegram polling | **Render** web service |
| SPAs are static after Vite build | **Vercel** (fast CDN, free hobby tier) |
| Shared schema / one monorepo | Single GitHub repo; each host uses a **root directory** |
| CORS | Render `FRONTEND_URL` + `ADMIN_URL` = Vercel origins |

Full ops guide: `docs/operations/deploy.md`.

### 12.3 Continuous Integration (GitHub Actions)

Workflow: **`.github/workflows/ci.yml`**

| Trigger | `push` and `pull_request` to `main` / `master` |
| Jobs | `backend`, `frontend`, `frontend-admin` (parallel) |
| Backend steps | `npm ci` → `prisma generate` → lint (`continue-on-error`) → `npm run build` |
| Frontend steps | `npm ci` → lint (soft) → `npm run build` with placeholder `VITE_*` |
| Goal | Fail the PR if **TypeScript/build** breaks before deploy |

CI does **not** deploy. It only validates that the three packages build cleanly.

### 12.4 Continuous Deployment

| Service | CD mechanism |
|---|---|
| API | Render auto-deploy when the connected branch updates (usually after merge to `main`) |
| Student / Admin | Vercel project auto-deploy from the same repo (filter by root directory) |
| Database schema | On API boot: `prisma migrate deploy` inside `npm run start:prod` |

**Recommended team flow:** feature branch → PR → **CI green** → merge `main` → Render + Vercel rebuild → smoke `GET /api/health`.

### 12.5 Production topology (URLs)

| Service | Typical URL |
|---|---|
| API | `https://cadt-events-api.onrender.com` |
| Student web | `https://<project>.vercel.app` (set after Vercel create) |
| Admin | `https://<admin-project>.vercel.app` |
| Health | `GET /api/health` |

After first Vercel deploy, set on Render:

- `FRONTEND_URL` / `PUBLIC_WEB_URL` → student origin  
- `ADMIN_URL` → admin origin  

On each Vercel project set `VITE_API_URL=https://cadt-events-api.onrender.com/api` (rebuild required when changed).

### 12.6 Backend build & start (Render)

```bash
cd backend
npm ci --legacy-peer-deps
npx prisma generate
npm run build          # tsc && tsc-alias
npm run start:prod     # prisma migrate deploy && node dist/server.js
```

Local:

```bash
cd backend
npm run dev            # http://localhost:4000
```

### 12.7 Runbook (common issues)

| Symptom | Likely cause | Action |
|---|---|---|
| Process exits at boot | Missing env (DB/Clerk) | Check Zod error output on Render logs |
| 401 on all protected routes | Bad/expired Clerk token or secret mismatch | Align Clerk keys API + Vercel |
| 403 on admin | Email not in `ADMIN_EMAILS` / metadata | Fix env; re-login; webhook heal |
| CORS from Vercel → API | `FRONTEND_URL` / `ADMIN_URL` not Vercel origins | Set exact HTTPS origins on Render |
| Frontend wrong API host | Stale `VITE_API_URL` | Update Vercel env + **redeploy** frontend |
| Migration fail on deploy | Bad `DIRECT_URL` | Session/direct Supabase URL |
| No Telegram | Token missing / bot down | Set `TELEGRAM_BOT_TOKEN` |
| Upload 500 | Cloudinary credentials | Set `CLOUDINARY_*` |
| Cold start timeout | Render free tier sleep | Hit `/api/health` once before demo |

### 12.8 Observability

- Pino logs + console diagnostics on Render  
- Health endpoint for uptime / post-deploy checks  
- GitHub Actions run history for build failures  
- No full APM SaaS wired by default  

### 12.9 Repo hygiene for production

Removed from the tree for a cleaner production repo: local agent packs, one-off test scripts, empty logs, duplicate root logo, AI prompt scripts. Secrets stay in host dashboards only; root `.gitignore` blocks `.env`, dumps, `dist/`, `.agents/`, etc.

---

## 13. Challenges & decisions

### 13.1 Major challenges

| Challenge | Approach | Outcome |
|---|---|---|
| Cross-origin session quirks with Clerk | Manual `verifyToken` in `requireAuth` | Reliable Bearer auth for SPAs |
| Admin role lag after signup | `ADMIN_EMAILS` + metadata heal | Demo teachers can admin without manual Clerk UI |
| Capacity under concurrent booking | Prisma transaction + count | Good enough for campus scale; note race caveat |
| Dual admin/user tables | Merge by email in listUsers | Single admin UI directory |
| Notifications to muted students | Telegram link + publish/reminder | Complements in-app inbox |
| Multi-package monorepo (non-workspace) | Separate npm projects | Clear deploy units on Render |

### 13.2 Alternatives considered

| Decision | Choice | Alternative rejected |
|---|---|---|
| HTTP framework | Express | NestJS (more ceremony for small team) — ADR 0001 |
| Auth | Clerk | Custom JWT register/login (older README) |
| ORM | Prisma | Raw SQL / other ORMs |
| Hosting | Render free Blueprint | VPS-only Docker (heavier for course demo) |
| Images | Cloudinary | Local disk (ephemeral on PaaS) |

### 13.3 Lessons learned

1. Document **live** auth (Clerk), not outdated JWT tutorial paths.  
2. Webhooks + allowlist beats manual role clicking for demos.  
3. Soft deletes simplify “cancel” without losing audit rows.  
4. Map snake_case DB ↔ camelCase API consistently in one place (`mapEvent`).  
5. Keep side effects (Telegram) non-blocking so UX is not blocked by third parties.

---

## 14. Conclusion & future work

### 14.1 Conclusion

The CADT Events backend is a production-deployed **Express + TypeScript modular API** that:

- Serves student and admin SPAs over REST  
- Authenticates with **Clerk** and authorizes **admin** operations  
- Persists domain data in **PostgreSQL** via **Prisma**  
- Enforces booking rules (capacity, uniqueness, seats, questions, check-in)  
- Integrates **Cloudinary** and **Telegram** for media and messaging  
- Deploys on **Render** with migrate-on-start and a health check  

Architecture trees and the source file tree show a clear split between **app bootstrap**, **shared middleware**, and **feature modules**, which matches the project’s stated goal of predictability for a small student engineering team.

### 14.2 Future backend work

1. Automated integration tests (supertest) for bookings and admin routes  
2. OpenAPI/Swagger generation from Zod or routes  
3. Stronger concurrency control for capacity (row locks / atomic counters)  
4. Structured audit log for admin mutations  
5. Reduce debug logging; add request-id correlation  
6. Harden rate limits per route class  
7. Production Redis + BullMQ if job volume grows beyond cron  
8. Align/remove legacy JWT wording in `backend/README.md` and `docs/api/api-spec.md`  

---

## References

1. Project PRD — `docs/product/prd.md`  
2. Backend architecture — `docs/architecture/backend/backend.md`  
3. Telegram integration — `docs/architecture/backend/telegram_integration.md`  
4. ADRs — `docs/architecture/decisions/` (Express, feature modules)  
5. Deploy notes — `docs/operations/deploy.md`, root `Claude.md`  
6. Source — `backend/src/**`, `backend/prisma/schema.prisma`  
7. Express, Prisma, Clerk, Cloudinary, Telegram Bot API official documentation  

---

## Appendices

### A. Route quick reference

```
GET    /api/health
POST   /api/webhooks/
GET    /api/events
GET    /api/events/all
GET    /api/events/:id
GET    /api/events/:id/seats
POST   /api/events
PATCH  /api/events/:id
DELETE /api/events/:id
POST   /api/bookings
GET    /api/bookings/me
GET    /api/bookings/event/:eventId
PATCH  /api/bookings/:id/checkin
DELETE /api/bookings/:id
GET    /api/favorites/me
POST   /api/favorites/toggle
GET    /api/notifications/me
PATCH  /api/notifications/:id/read
GET    /api/notifications/admin
GET    /api/users
POST   /api/users/invite
GET    /api/users/settings
PUT    /api/users/settings
GET    /api/telegram/connect
GET    /api/telegram/status
DELETE /api/telegram/disconnect
POST   /api/upload
```

### B. Booking sequence (summary)

```
Student SPA                 API                      DB / Telegram
    |                        |                            |
    |  POST /bookings + JWT  |                            |
    |----------------------->| verifyToken                |
    |                        | ensure user_account        |
    |                        | BEGIN TX                   |
    |                        |   load event published     |
    |                        |   count regs / capacity    |
    |                        |   unique user+event        |
    |                        |   seat conflict?           |
    |                        |   insert registration      |
    |                        |   insert answers           |
    |                        | COMMIT                     |
    |                        | async Telegram notify      |
    |  201 { booking }       |                            |
    |<-----------------------|                            |
```

### C. Sample curl

```bash
# Health
curl -s https://cadt-events-api.onrender.com/api/health

# Public events
curl -s https://cadt-events-api.onrender.com/api/events

# Authenticated (replace TOKEN)
curl -s https://cadt-events-api.onrender.com/api/bookings/me \
  -H "Authorization: Bearer TOKEN"
```

### D. Related internal docs

| Doc | Use |
|---|---|
| `docs/architecture/database/*` | Full ERD / DB report depth |
| `docs/operations/*` | Deploy and test evidence |
| `docs/report/2-Database-report.md` | Dedicated database submission |
| `docs/report/4-SE-report.md` | Process & UML context |

---

## Checklist before submission

- [x] Architecture tree included  
- [x] Source file tree included  
- [x] Implementation methodology documented  
- [x] Tech stack matches `package.json` and code  
- [x] Endpoint catalog matches live routers  
- [x] Auth described as Clerk (not outdated custom JWT)  
- [x] Integrations: Clerk, Postgres, Cloudinary, Telegram, Render  
- [x] Security + limitations honest  
- [x] Deploy/health URLs listed  
- [ ] Team member names / IDs filled in cover table if required by lecturer  
- [ ] Screenshots / curl evidence attached for course rubric  
- [ ] Export to PDF if required  

---

*End of Backend Report — CADT Events v1.0*
