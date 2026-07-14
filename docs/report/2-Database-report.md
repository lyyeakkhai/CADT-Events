# Database Report — CADT Events

| Field | Value |
|---|---|
| **Course / Module** | Database |
| **Project** | CADT Events Platform |
| **Focus (assessment)** | Requirements → ERD → Relational schema · SQL · DBA |
| **DBMS** | PostgreSQL (Supabase managed) |
| **ORM / migrations** | Prisma |
| **Schema source of truth** | `backend/prisma/schema.prisma` |
| **Date** | 2026-07-13 |
| **Version** | 1.2 (backup strategy + Cloudinary image storage) |
| **Team** | _[Names / Student IDs]_ |

> **Design order used in this report (as required):**  
> **1) Data requirements (detailed)** → **2) ERD** → **3) Relational schema** → **4) SQL** → **5) DBA (hosting, backup, ops)**

**Related code/docs:**  
`backend/prisma/schema.prisma` · `backend/prisma/migrations/` · `backend/.env.example` · `docs/operations/deploy.md` · `docs/architecture/database/`

---

## 1. Introduction

### 1.1 Introduction to the project

**CADT Events** is a centralized event management platform for the **Cambodia Academy of Digital Technology (CADT)**. Students discover and register for campus events; administrators publish events, manage capacity, and track attendance. The application stack is:

| Layer | Technology |
|---|---|
| Student / Admin UIs | React (Vite) |
| API | Express + TypeScript |
| **Database** | **PostgreSQL on Supabase** |
| Access layer | **Prisma** (`DATABASE_URL` pooler + `DIRECT_URL` for migrations) |
| Identity | Clerk (user id stored as `user_account.user_id`) |

The database is the **system of record**. No client talks to Postgres directly; the API uses Prisma for all reads/writes.

### 1.2 Objectives of this report

1. **Detail data requirements** derived from product features (what must be stored and why).  
2. Produce an **ERD** with entities, relationships, and cardinalities.  
3. Present the **relational schema** (tables, keys, constraints, normalization).  
4. Provide **SQL** (DDL excerpts, DML use cases, useful queries).  
5. Cover **DBA concepts**: environments, hosting (local vs provider), migrations, backup/recovery, security, monitoring.  
6. Link design choices to **business rules** (capacity, one booking per user, soft delete, check-in).

### 1.3 Why a relational database?

| Need | Why RDBMS fits |
|---|---|
| Multi-user registrations | ACID transactions; integrity on FKs |
| Capacity & uniqueness | Constraints + transactional counts |
| Attendance & credits | Structured joins (user ↔ registration ↔ event) |
| Admin reporting | SQL aggregation, indexes |
| Evolving schema | Versioned migrations (Prisma) |

---

## 2. Data requirements analysis (detailed first)

> **Teacher focus:** requirements before diagrams.  
> **Project fit:** requirements below are checked against **live CADT Events code** (`backend/src/modules/*` + `schema.prisma`), not generic campus-DB textbooks.  
> **Status legend:**  
> - **Implemented** — used by running API/features today  
> - **Partial** — table/API exists but behaviour differs or is secondary  
> - **Schema-ready** — in Prisma for future/extension; not primary path of current UI/API

### 2.0 Scope of data this project actually needs

| Package feature (product) | Data the DB must hold | Status |
|---|---|---|
| Clerk sign-in + webhook sync | Local user/admin rows keyed by Clerk id | Implemented |
| Student browse events | Published (and related) event rows + optional venue name | Implemented |
| Student book / cancel | `registration` + capacity rules | Implemented |
| Optional seat pick (A1, B2…) | `registration.seat_label` + occupancy from other regs | Implemented |
| Dynamic form on book | `event_question` + `registration_answer` | Implemented |
| Favorites | `favorite` | Implemented |
| Admin create/edit/publish/delete event | `event` (+ questions, reminders) | Implemented |
| Admin attendees + check-in | `registration` list + `checked_in_at` | Implemented |
| Admin users list + credits | Users/admins + **computed** credits from check-ins | Implemented |
| Admin invite | Clerk API (not a local “invite” table) | Implemented (no invite table) |
| Admin settings UI | `system_setting` key/value | Implemented |
| Image cover | **URL string** on event (file in Cloudinary, not DB BLOB) | Implemented |
| Telegram link + DMs + reminders | `telegram_chat_id` + `event_reminder` | Implemented |
| Student notification inbox | `notification` table | Partial (read/mark; write path limited) |
| Admin notification bell | **Not** only `notification` rows — synthetic from recent regs/events | Implemented differently |
| Full venue seat map engine | `venue_seat_template` / `event_seat` | Schema-ready (secondary) |
| Speakers / departments M:N | `speaker`, bridges, `department` | Schema-ready (secondary) |
| Telegram SQL outbox table | `telegram_notification` | Schema-ready (app sends via Bot API live) |
| Badge tier tables / credit ledger | PRD idea | **Not in live schema** (credits = sum of `credit_value` on checked-in events) |

### 2.1 Business context & problem (CADT Events)

| Pain at CADT (product) | Data implication in **this** system |
|---|---|
| Events buried in Telegram chats | Structured **`event`** catalog with status `draft`/`published`/… |
| Manual sign-up sheets | **`registration`** linked to `user_account` + `event` |
| Overbooking workshops | **`event.capacity`** + count of active registrations |
| No door list / attendance | **`registration.checked_in_at`** + admin list API |
| Students forget events | **`user_account.telegram_chat_id`** + **`event_reminder`** + live Telegram send |
| Organizers need control | **`admin`** + event soft delete `deleted_at` + publish flow |
| Extra questions at signup | **`event_question`** / **`registration_answer`** |
| “Save for later” | **`favorite`** unique per user–event |
| App configuration | **`system_setting`** (not hard-coded only) |

### 2.2 Stakeholders and data interests (project)

| Stakeholder | Data they use in CADT Events |
|---|---|
| **Student** (`frontend/`) | Public events, own registrations, favorites, Telegram link status, notification inbox |
| **Admin** (`frontend-admin/`) | All events, create/update, attendee lists, check-in, user directory, settings, upload URL |
| **API / Cron** | Booking transactions, reminder rows, Clerk webhook upserts |
| **External** | Clerk (identity), Cloudinary (images), Telegram (messages) — **not stored as full provider data**, only ids/URLs/chat ids |

### 2.3 Functional data requirements (detailed + project-fit)

Each **DR** states: need, fields as in schema, how the app fills them, enforcement, and honesty about status.

---

#### DR-01 — User identity storage (**Implemented**)

| Aspect | Project-accurate detail |
|---|---|
| **Why** | Bookings, favorites, Telegram, and inbox need a local user row even though **login is Clerk**. |
| **Primary key** | `user_id` = Clerk user id (`sub`), `VARCHAR(50)` |
| **Must store** | `full_name`, `email` (unique), `role` enum `student`/`staff`/`guest`, `password_hash` placeholder **`managed-by-clerk`**, optional `student_staff_id`, `organization`, `avatar_url`, `account_status`, `telegram_chat_id` (unique), optional `department_id`, `created_at` |
| **Must not store** | Real bcrypt passwords for normal students (auth is Clerk) |
| **How rows are created** | (1) Clerk webhook upsert by email · (2) lazy create on first booking/favorite/Telegram if missing |
| **API / code** | `webhooks/clerk.routes.ts`, `bookings.controller`, `favorites.controller`, `telegram.service` |
| **Maps to** | **`user_account`** |

---

#### DR-02 — Administrator storage (**Implemented**)

| Aspect | Project-accurate detail |
|---|---|
| **Why** | Event ownership (`event.admin_id`), admin user directory merge, some admin notification gate |
| **Must store** | `admin_id` (often Clerk id), `full_name`, unique `email`, `admin_level` (default `event_organizer`), `password_hash` placeholder, `created_at` |
| **How rows are created** | Webhook if email ∈ `ADMIN_EMAILS`; `ensureAdminRecord` on create event; list merges `admin` + `user_account` by email |
| **Auth note** | **Admin API permission** is Clerk `publicMetadata.role` / allowlist — not only this table. Table supports listing + FK. |
| **Maps to** | **`admin`** |

---

#### DR-03 — Event catalog (**Implemented**)

| Aspect | Project-accurate detail |
|---|---|
| **Why** | Core product: discover + manage campus events |
| **Must store** | `event_title`, `description`, `event_type`, `status`, `start_time`, `end_time`, **`location` (free-text — primary in create form)**, optional `venue_id`, `cover_image_url` (Cloudinary URL), `capacity`, **`credit_value`**, `is_featured`, `badge`, `admin_id`, `created_at`, **`deleted_at`** |
| **Status used by API** | Public list: `published`, `ongoing`, `completed` (default). Create/update: mainly `draft` / `published`. Enum also has `cancelled`. |
| **Rules (app)** | End > start; soft delete sets `deleted_at`; public queries exclude deleted |
| **Not stored** | Image binary (only URL); category join table is **not** the live path (type enum used instead of separate categories product path) |
| **API** | `GET/POST/PATCH/DELETE /api/events`, `GET /api/events/all` |
| **Maps to** | **`event`** |

---

#### DR-04 — Registration / booking (**Implemented**)

| Aspect | Project-accurate detail |
|---|---|
| **Why** | Student “book ticket” / registration for published events |
| **Must store** | `registration_id`, **`booking_reference` unique** (format `CADT-YYYYMMDD-XXXX` in app), `user_id`, `event_id`, optional `seat_label`, optional `event_seat_id`, `qr_code`, `created_at`, `checked_in_at`, **`deleted_at`** (cancel) |
| **Rules (app — match code)** | Event must be **`published`** and not deleted; capacity: count(`deleted_at IS NULL`) &lt; capacity; **one active reg per user per event**; seat label unique among active regs if provided; required questions enforced; cancel forbidden if `start_time` already past |
| **Transaction** | Prisma `$transaction` in `createBooking` |
| **API** | `POST /api/bookings`, `GET /me`, `DELETE /:id`, admin list/check-in |
| **Maps to** | **`registration`** |

---

#### DR-05 — Attendance / check-in (**Implemented**)

| Aspect | Project-accurate detail |
|---|---|
| **Why** | Door attendance + credit calculation in admin user list |
| **Must store** | `registration.checked_in_at` null or timestamp |
| **Rules** | Admin **toggles** (set now or clear) via `PATCH /api/bookings/:id/checkin` |
| **Credits** | Admin list: `eventsJoined` / `totalCredits` = registrations with **`checked_in_at IS NOT NULL`**, sum `event.credit_value` — **no separate credit table** |
| **Maps to** | **`registration.checked_in_at`** (+ read `event.credit_value`) |

---

#### DR-06 — Capacity & seating (**Implemented** primary path; seat-map tables **Schema-ready**)

| Aspect | Project-accurate detail |
|---|---|
| **Why** | Prevent overbooking; optional cinema-style seat label |
| **Primary storage (live app)** | `event.capacity` (nullable = unlimited); `registration.seat_label` (e.g. `A1`); seats API returns **occupied labels** from registrations |
| **Computed** | `availableSeats = capacity - activeRegistrationCount` (not a stored column) |
| **Schema-ready only** | `venue`, `venue_seat_template`, `event_seat` exist for fuller seat inventory; **booking path does not require writing `event_seat` today** |
| **Maps to** | **Primary:** `event.capacity`, `registration.seat_label` · **Optional:** `venue*`, `event_seat` |

---

#### DR-07 — Favorites (**Implemented**)

| Aspect | Project-accurate detail |
|---|---|
| **Why** | Student bookmark events |
| **Must store** | `favorite_id`, `user_id`, `event_id`, `created_at` |
| **Rules** | UNIQUE `(user_id, event_id)`; toggle add/remove API |
| **API** | `GET /api/favorites/me`, `POST /api/favorites/toggle` |
| **Maps to** | **`favorite`** |

---

#### DR-08 — Dynamic registration questions (**Implemented**)

| Aspect | Project-accurate detail |
|---|---|
| **Why** | Admin can attach form fields when creating an event; answers at book time |
| **Must store** | `event_question`: text, `question_type` (text/textarea/multiple_choice/checkboxes), `options` JSON string, `is_required`, `order_index` · `registration_answer`: value per question |
| **Rules** | Required questions validated in `createBooking`; unique answer per (registration, question) |
| **API** | Created with `POST /api/events` body `questions[]`; answered in `POST /api/bookings` `answers` map |
| **Maps to** | **`event_question`**, **`registration_answer`** |

---

#### DR-09 — In-app notifications (**Partial / dual behaviour**)

| Aspect | Project-accurate detail |
|---|---|
| **Why** | Student inbox; admin “activity” UI |
| **Student path** | Table **`notification`**: title, message, type enum, `is_read`, `user_id`, optional `event_id` · `GET /me`, `PATCH /:id/read` |
| **Admin path (important project fact)** | `GET /api/notifications/admin` builds a **synthetic feed** from latest **registrations** + **events** — does **not** only read `notification` rows |
| **Gap honesty** | Many operational alerts (booking confirm) go to **Telegram**, not necessarily insert into `notification` |
| **Maps to** | **`notification`** (student) · derived queries (admin feed) |

---

#### DR-10 — Telegram linkage & messaging (**Implemented**; outbox table **Schema-ready**)

| Aspect | Project-accurate detail |
|---|---|
| **Why** | Connect account; send booking confirm, publish broadcast, reminders |
| **Must store for live path** | **`user_account.telegram_chat_id`** (set by bot `/start <userId>`) |
| **How send works** | Live **Telegram Bot API** using chat id — **not** a required write to `telegram_notification` first |
| **Schema-ready** | Table **`telegram_notification`** (pending/sent/failed) for future durable outbox |
| **Also** | Clerk metadata may mirror chat id for frontend |
| **Maps to** | **Primary:** `user_account.telegram_chat_id` · **Optional:** `telegram_notification` |

---

#### DR-11 — Event reminders (**Implemented**)

| Aspect | Project-accurate detail |
|---|---|
| **Why** | “Notify N minutes before start” scheduled at event create |
| **Must store** | `event_reminder`: `event_id`, `minutes_before`, `scheduled_time`, `is_sent`, `created_at` |
| **How filled** | `POST /api/events` with `reminderSchedules: number[]` → `scheduled_time = start - minutes` |
| **How processed** | `node-cron` every minute: due & not sent → message registrants with Telegram → `is_sent = true` |
| **Maps to** | **`event_reminder`** |

---

#### DR-12 — Venue (optional) / masters (**Partial + Schema-ready**)

| Aspect | Project-accurate detail |
|---|---|
| **Live create event** | Primarily stores **`event.location` string**; venue relation optional for display when present |
| **Seats API** | May return `venue.venue_name` **or** fall back to `event.location` |
| **Schema-ready (low current API write volume)** | `department` (+ user FK), `speaker`, `event_speaker`, `event_department`, full seat templates |
| **Maps to** | **Used lightly:** `venue` · **Schema-ready:** `department`, `speaker`, bridges, seat templates |

---

#### DR-13 — System settings (**Implemented**)

| Aspect | Project-accurate detail |
|---|---|
| **Why** | Admin Settings screens persist config |
| **Must store** | `system_setting.key` (e.g. `settings.<section>`), `value` JSON text, `updated_at`, `updated_by` |
| **API** | `GET/PUT /api/users/settings` |
| **Maps to** | **`system_setting`** |

---

#### DR-14 — Identity sync side-effects (**Implemented**, cross-cutting)

| Aspect | Project-accurate detail |
|---|---|
| **Why** | Keep DB + Clerk roles aligned for CADT Events |
| **Data effects** | On Clerk `user.created`/`updated`: upsert `user_account`; if email in **`ADMIN_EMAILS`**, upsert `admin` + set Clerk `publicMetadata.role=ADMIN` |
| **Not a table** | Allowlist lives in **env** (`ADMIN_EMAILS`), not a DB table |
| **Maps to** | `user_account` + `admin` + external Clerk metadata |

---

#### DR-15 — Media references / cloud image storage (**Implemented**)

| Aspect | Project-accurate detail |
|---|---|
| **Why** | Event cover images for student/admin UI (and optional Telegram photo) |
| **Store in DB (Supabase)** | URL string only — `event.cover_image_url` |
| **Store outside DB** | Image **binary** on **Cloudinary** (folder `events`) via admin `POST /api/upload` |
| **Not used** | Supabase Storage buckets; Postgres BLOB; files on Render disk |
| **Security** | Upload requires Clerk auth + **ADMIN** role |
| **Backup note** | Full DB dump restores URLs; file retention is on Cloudinary (see §6.5) |
| **Maps to** | `event.cover_image_url` + Cloudinary account |

---

### 2.4 Non-functional data requirements (project)

| ID | Category | Requirement (project) | How CADT Events addresses it |
|---|---|---|---|
| NFR-D1 | Integrity | No orphan bookings | FKs registration → user/event CASCADE |
| NFR-D2 | Consistency | Capacity under concurrent book | Prisma transaction + counts (app-level) |
| NFR-D3 | Uniqueness | Email, booking_reference, favorite pair, telegram chat | UNIQUE indexes |
| NFR-D4 | Soft history | Cancel/delete without hard wipe | `deleted_at` on event & registration |
| NFR-D5 | Performance | Event list by date; inbox | `idx_event_dates`, `idx_user_inbox`, reminder schedule index |
| NFR-D6 | Security | No SPA DB credentials; no real passwords in app auth | API-only Prisma; Clerk |
| NFR-D7 | Recoverability | Demo/prod restore | Supabase + **full** `pg_dump` + migrations in Git |
| NFR-D8 | Deployability | Migrate on API boot | `prisma migrate deploy` in `start:prod` |
| NFR-D9 | Hosting split | Free-tier demo | **Supabase Postgres** + Render API |
| NFR-D10 | Media scale | Covers without bloating DB | **Cloudinary** binaries; DB stores URL only |

### 2.5 Requirement → entity matrix (honest)

| DR | Primary entity(ies) | Project status |
|---|---|---|
| DR-01 User identity | `user_account` | Implemented |
| DR-02 Admin | `admin` | Implemented |
| DR-03 Event catalog | `event` | Implemented |
| DR-04 Registration | `registration` | Implemented |
| DR-05 Check-in / credits | `registration.checked_in_at`, `event.credit_value` | Implemented (credits computed) |
| DR-06 Capacity / seat labels | `event.capacity`, `registration.seat_label` | Implemented |
| DR-06b Full seat inventory | `venue`, `venue_seat_template`, `event_seat` | Schema-ready |
| DR-07 Favorites | `favorite` | Implemented |
| DR-08 Questions | `event_question`, `registration_answer` | Implemented |
| DR-09 Notifications | `notification` (+ synthetic admin feed) | Partial / dual |
| DR-10 Telegram link | `user_account.telegram_chat_id` | Implemented |
| DR-10b Telegram outbox table | `telegram_notification` | Schema-ready |
| DR-11 Reminders | `event_reminder` | Implemented |
| DR-12 Masters | `venue` light; `department`/`speaker`/bridges | Partial / schema-ready |
| DR-13 Settings | `system_setting` | Implemented |
| DR-14 Identity sync | `user_account`, `admin` | Implemented |
| DR-15 Media URL | `event.cover_image_url` | Implemented |

### 2.6 Business rules summary (as enforced in **this** project)

| BR-ID | Rule | DB constraint | App code |
|---|---|---|---|
| BR-01 | Unique user/admin email | UNIQUE | — |
| BR-02 | Unique booking_reference | UNIQUE | Generated `CADT-…` |
| BR-03 | One favorite per user–event | UNIQUE `(user_id,event_id)` | Toggle |
| BR-04 | One **active** registration per user–event | Not partial unique index | Yes (findFirst + TX) |
| BR-05 | Capacity not exceeded | No CHECK | Yes (count in TX) |
| BR-06 | Active lists ignore soft-deleted | — | `deleted_at: null` |
| BR-07 | Book only **published** events | — | Yes |
| BR-08 | Required questions answered | — | Yes |
| BR-09 | Seat label unique among active regs | — | Yes |
| BR-10 | Cannot cancel after event start | — | Yes |
| BR-11 | Check-in toggle | — | Yes |
| BR-12 | Telegram chat id unique | UNIQUE nullable | Bot link |
| BR-13 | Admin invite only if email allowlisted | — | `ADMIN_EMAILS` env |
| BR-14 | Credits = sum credit_value where checked in | — | `listAllUsers` |

### 2.7 Explicit non-requirements (do **not** over-claim)

These appear in older PRD/docs or generic designs but are **not** current DB requirements of the live app:

| Not required as live tables/features | Why |
|---|---|
| Custom JWT user password auth tables | Auth = **Clerk** |
| Separate `bookings` vs `registration` dual model | Live name is **`registration`** |
| Category M:N product path | Live uses **`event_type` enum** (+ search) |
| Credit ledger / badge tier tables | Credits **computed**; badge is optional string on event/user display only as designed |
| Storing uploaded images in Postgres | **Cloudinary URL** only |
| Durable Telegram outbox required for send | Live **direct Bot API** send |

---

## 3. Conceptual design — ERD

### 3.1 Entity list (core vs extension — project fit)

| Entity | Role in **this** project |
|---|---|
| **UserAccount** | **Core** — Clerk-backed student/user |
| **Admin** | **Core** — organizer rows + event FK |
| **Event** | **Core** — catalog |
| **Registration** | **Core** — booking / check-in / cancel |
| **Favorite** | **Core** — bookmarks |
| **EventQuestion** / **RegistrationAnswer** | **Core** — dynamic forms |
| **EventReminder** | **Core** — cron reminders |
| **SystemSetting** | **Core** — admin settings |
| **Notification** | **Core (partial writes)** — student inbox |
| **Venue** | **Optional** — display if linked; create form prefers `location` text |
| **Department** | **Schema-ready** — optional user FK |
| **Speaker** / **EventSpeaker** | **Schema-ready** |
| **EventDepartment** | **Schema-ready** |
| **VenueSeatTemplate** / **EventSeat** | **Schema-ready** — full seat inventory (live seats use `seat_label`) |
| **TelegramNotification** | **Schema-ready** — durable outbox (live send is Bot API) |

### 3.2 ERD (Crow’s foot / Mermaid)

```mermaid
erDiagram
    DEPARTMENT ||--o{ USER_ACCOUNT : "has members"
    DEPARTMENT ||--o{ EVENT_DEPARTMENT : "tagged"
    ADMIN ||--o{ EVENT : "manages"
    VENUE ||--o{ EVENT : "hosts"
    VENUE ||--o{ VENUE_SEAT_TEMPLATE : "defines seats"
    EVENT ||--o{ EVENT_SPEAKER : "features"
    SPEAKER ||--o{ EVENT_SPEAKER : "speaks at"
    EVENT ||--o{ EVENT_DEPARTMENT : "for dept"
    EVENT ||--o{ EVENT_SEAT : "allocates"
    VENUE_SEAT_TEMPLATE ||--o{ EVENT_SEAT : "template"
    USER_ACCOUNT ||--o{ REGISTRATION : "books"
    EVENT ||--o{ REGISTRATION : "receives"
    EVENT_SEAT ||--o{ REGISTRATION : "optional seat"
    USER_ACCOUNT ||--o{ FAVORITE : "saves"
    EVENT ||--o{ FAVORITE : "favorited"
    USER_ACCOUNT ||--o{ NOTIFICATION : "receives"
    EVENT ||--o{ NOTIFICATION : "about"
    NOTIFICATION ||--o{ TELEGRAM_NOTIFICATION : "outbox"
    EVENT ||--o{ EVENT_QUESTION : "asks"
    REGISTRATION ||--o{ REGISTRATION_ANSWER : "answers"
    EVENT_QUESTION ||--o{ REGISTRATION_ANSWER : "answered"
    EVENT ||--o{ EVENT_REMINDER : "schedules"

    USER_ACCOUNT {
        varchar user_id PK
        varchar email UK
        varchar full_name
        enum role
        varchar telegram_chat_id UK
        enum account_status
    }

    ADMIN {
        varchar admin_id PK
        varchar email UK
        varchar full_name
        enum admin_level
    }

    EVENT {
        varchar event_id PK
        varchar admin_id FK
        varchar venue_id FK
        varchar event_title
        enum event_type
        enum status
        timestamp start_time
        timestamp end_time
        int capacity
        int credit_value
        timestamp deleted_at
    }

    REGISTRATION {
        varchar registration_id PK
        varchar booking_reference UK
        varchar user_id FK
        varchar event_id FK
        varchar seat_label
        timestamp checked_in_at
        timestamp deleted_at
    }

    FAVORITE {
        varchar favorite_id PK
        varchar user_id FK
        varchar event_id FK
    }

    EVENT_QUESTION {
        varchar question_id PK
        varchar event_id FK
        text question_text
        enum question_type
        boolean is_required
    }

    REGISTRATION_ANSWER {
        varchar answer_id PK
        varchar registration_id FK
        varchar question_id FK
        text answer_value
    }

    EVENT_REMINDER {
        varchar reminder_id PK
        varchar event_id FK
        int minutes_before
        timestamp scheduled_time
        boolean is_sent
    }

    NOTIFICATION {
        varchar notification_id PK
        varchar user_id FK
        varchar event_id FK
        varchar title
        enum type
        boolean is_read
    }

    SYSTEM_SETTING {
        varchar key PK
        text value
    }

    DEPARTMENT {
        varchar department_id PK
        varchar department_name
    }

    VENUE {
        varchar venue_id PK
        varchar venue_name
        int total_capacity
    }

    SPEAKER {
        varchar speaker_id PK
        varchar speaker_name
    }
```

### 3.3 Cardinalities (exam-friendly)

| Relationship | Cardinality | Explanation |
|---|---|---|
| Admin — Event | 1 : N (optional on event) | One admin manages many events |
| Venue — Event | 1 : N (optional) | Venue hosts many events |
| UserAccount — Registration | 1 : N | User many bookings |
| Event — Registration | 1 : N | Event many attendees |
| UserAccount — Event (via Registration) | M : N | Through registration |
| UserAccount — Event (via Favorite) | M : N | Through favorite |
| Event — Speaker | M : N | Through event_speaker |
| Event — Department | M : N | Through event_department |
| Event — EventQuestion | 1 : N | Many questions per event |
| Registration — RegistrationAnswer | 1 : N | Many answers per booking |
| EventQuestion — RegistrationAnswer | 1 : N | Many answers per question |
| Notification — TelegramNotification | 1 : N | Outbox lines |
| Event — EventReminder | 1 : N | Multiple reminder offsets |

### 3.4 Conceptual notes

- **Registration** is the associative entity for User–Event bookings with extra attributes (reference, seat, check-in, soft delete).  
- **Favorite** is a pure M:N associative entity with uniqueness.  
- **Soft delete** on Event and Registration preserves history (DR-04, NFR-D4).  
- Identity is external (Clerk); DB stores profile projection.

---

## 4. Logical & physical relational schema

### 4.1 Design approach

| Step | Choice |
|---|---|
| Model | Relational (3NF target) |
| Keys | Natural varchar PKs (often UUID strings from app) |
| ORM mapping | Prisma `@@map` to snake table names |
| Enums | PostgreSQL ENUM types |
| Soft delete | Nullable `deleted_at` timestamps |
| Migrations | Prisma Migrate |

### 4.2 Normalization discussion

| Form | Status | Notes |
|---|---|---|
| 1NF | Yes | Atomic attributes; no repeating groups (questions as rows) |
| 2NF | Yes | Non-key attrs depend on full PK (composite PKs only on pure bridges) |
| 3NF | Yes | No transitive dependency of non-keys on other non-keys |

**Intentional denormalization / app-level:**

- Capacity remaining is **computed** (not stored `available_seats`) → avoids dual-write drift.  
- Seat occupancy often uses `registration.seat_label` string for simple seat maps without always materializing `event_seat`.  
- Credits for leaderboard computed from check-ins × `event.credit_value` (not a separate credit ledger in current app path).

### 4.3 Enumerations (PostgreSQL)

| Enum type | Values |
|---|---|
| `user_role_enum` | student, staff, guest |
| `admin_level_enum` | super_admin, department_head, event_organizer |
| `account_status_enum` | active, inactive, suspended |
| `event_status_enum` | draft, published, ongoing, completed, cancelled |
| `event_type_enum` | workshop, seminar, competition, conference, career_fair, networking, other |
| `event_seat_status_enum` | available, held, booked |
| `notification_type_enum` | announcement, registration, event_reminder, system, telegram |
| `question_type_enum` | text, textarea, multiple_choice, checkboxes |
| `telegram_status_enum` | pending, sent, failed |

### 4.4 Relation schemas (logical)

Notation: **PK**, *UK*, → FK

```
ADMIN (
  admin_id PK,
  full_name,
  email *UK*,
  password_hash,
  admin_level,
  created_at
)

DEPARTMENT (
  department_id PK,
  department_name,
  specialization
)

USER_ACCOUNT (
  user_id PK,
  department_id → DEPARTMENT,
  full_name,
  email *UK*,
  password_hash,
  role,
  student_staff_id,
  organization,
  avatar_url,
  telegram_chat_id *UK*,
  account_status,
  created_at
)

VENUE (
  venue_id PK,
  venue_name,
  total_capacity
)

VENUE_SEAT_TEMPLATE (
  seat_template_id PK,
  venue_id → VENUE,
  seat_label,
  seating_zone
)

EVENT (
  event_id PK,
  admin_id → ADMIN,
  venue_id → VENUE,
  event_title,
  description,
  event_type,
  status,
  start_time,
  end_time,
  cover_image_url,
  badge,
  is_featured,
  capacity,
  credit_value,
  location,
  created_at,
  deleted_at
)

SPEAKER (
  speaker_id PK,
  speaker_name,
  title_role,
  organization,
  bio,
  profile_image_url
)

EVENT_SPEAKER (
  event_id → EVENT,
  speaker_id → SPEAKER,
  PRIMARY KEY (event_id, speaker_id)
)

EVENT_DEPARTMENT (
  event_id → EVENT,
  department_id → DEPARTMENT,
  PRIMARY KEY (event_id, department_id)
)

EVENT_SEAT (
  event_seat_id PK,
  event_id → EVENT,
  seat_template_id → VENUE_SEAT_TEMPLATE,
  status,
  held_time,
  expired_time
)

REGISTRATION (
  registration_id PK,
  booking_reference *UK*,
  qr_code,
  created_at,
  user_id → USER_ACCOUNT,
  event_id → EVENT,
  event_seat_id → EVENT_SEAT,
  seat_label,
  checked_in_at,
  deleted_at
)

FAVORITE (
  favorite_id PK,
  user_id → USER_ACCOUNT,
  event_id → EVENT,
  created_at,
  UNIQUE (user_id, event_id)
)

NOTIFICATION (
  notification_id PK,
  user_id → USER_ACCOUNT,
  event_id → EVENT,
  title,
  message,
  type,
  is_read,
  created_at
)

TELEGRAM_NOTIFICATION (
  telegram_notification_id PK,
  notification_id → NOTIFICATION,
  message_text,
  status,
  created_at
)

EVENT_QUESTION (
  question_id PK,
  event_id → EVENT,
  question_text,
  question_type,
  options,
  is_required,
  order_index
)

REGISTRATION_ANSWER (
  answer_id PK,
  registration_id → REGISTRATION,
  question_id → EVENT_QUESTION,
  answer_value,
  UNIQUE (registration_id, question_id)
)

EVENT_REMINDER (
  reminder_id PK,
  event_id → EVENT,
  minutes_before,
  scheduled_time,
  is_sent,
  created_at
)

SYSTEM_SETTING (
  key PK,
  value,
  updated_at,
  updated_by
)
```

### 4.5 Keys, FKs, indexes (physical)

| Table | PK | Important UK / indexes | Notable FKs |
|---|---|---|---|
| admin | admin_id | email UK | — |
| user_account | user_id | email UK, telegram_chat_id UK | department_id → department SET NULL |
| event | event_id | idx (start_time, end_time) | admin SET NULL, venue SET NULL |
| registration | registration_id | booking_reference UK | user CASCADE, event CASCADE, event_seat SET NULL |
| favorite | favorite_id | unique (user_id, event_id) | user CASCADE, event CASCADE |
| notification | notification_id | idx (user_id, is_read) | user CASCADE, event SET NULL |
| telegram_notification | … | idx (status) | notification CASCADE |
| event_seat | … | idx (event_id, status) | event CASCADE, template CASCADE |
| event_reminder | … | idx (is_sent, scheduled_time) | event CASCADE |
| registration_answer | … | unique (registration_id, question_id) | both CASCADE |

### 4.6 Prisma mapping

- File: `backend/prisma/schema.prisma`  
- Datasource:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

- **Pooler URL** (`DATABASE_URL`, often port 6543 + `pgbouncer=true`) for app runtime.  
- **Direct URL** (`DIRECT_URL`, port 5432) for migrations.

---

## 5. SQL code

### 5.1 DDL — enums (from init migration)

```sql
CREATE TYPE "user_role_enum" AS ENUM ('student', 'staff', 'guest');
CREATE TYPE "admin_level_enum" AS ENUM ('super_admin', 'department_head', 'event_organizer');
CREATE TYPE "account_status_enum" AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE "event_status_enum" AS ENUM ('draft', 'published', 'ongoing', 'completed', 'cancelled');
CREATE TYPE "event_type_enum" AS ENUM (
  'workshop', 'seminar', 'competition', 'conference',
  'career_fair', 'networking', 'other'
);
CREATE TYPE "event_seat_status_enum" AS ENUM ('available', 'held', 'booked');
CREATE TYPE "notification_type_enum" AS ENUM (
  'announcement', 'registration', 'event_reminder', 'system', 'telegram'
);
CREATE TYPE "telegram_status_enum" AS ENUM ('pending', 'sent', 'failed');
-- question_type_enum also defined in schema for form fields
```

### 5.2 DDL — core tables (representative)

```sql
CREATE TABLE "user_account" (
    "user_id"          VARCHAR(50)  NOT NULL,
    "department_id"    VARCHAR(50),
    "full_name"        VARCHAR(100) NOT NULL,
    "email"            VARCHAR(100) NOT NULL,
    "password_hash"    VARCHAR(255) NOT NULL,
    "role"             "user_role_enum" NOT NULL,
    "student_staff_id" VARCHAR(50),
    "organization"     VARCHAR(100),
    "avatar_url"       VARCHAR(255),
    "telegram_chat_id" VARCHAR(50),
    "account_status"   "account_status_enum" NOT NULL DEFAULT 'active',
    "created_at"       TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_account_pkey" PRIMARY KEY ("user_id")
);

CREATE TABLE "event" (
    "event_id"        VARCHAR(50)  NOT NULL,
    "admin_id"        VARCHAR(50),
    "venue_id"        VARCHAR(50),
    "event_title"     VARCHAR(150) NOT NULL,
    "description"     TEXT,
    "event_type"      "event_type_enum" NOT NULL,
    "status"          "event_status_enum" NOT NULL DEFAULT 'draft',
    "start_time"      TIMESTAMP(6) NOT NULL,
    "end_time"        TIMESTAMP(6) NOT NULL,
    "cover_image_url" VARCHAR(255),
    "badge"           VARCHAR(50),
    "is_featured"     BOOLEAN DEFAULT false,
    "capacity"        INTEGER,
    "credit_value"    INTEGER NOT NULL DEFAULT 0,
    "location"        VARCHAR(255),
    "created_at"      TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at"      TIMESTAMP(6),
    CONSTRAINT "event_pkey" PRIMARY KEY ("event_id")
);

CREATE TABLE "registration" (
    "registration_id"   VARCHAR(50)  NOT NULL,
    "booking_reference" VARCHAR(100) NOT NULL,
    "qr_code"           VARCHAR(255),
    "created_at"        TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "user_id"           VARCHAR(50)  NOT NULL,
    "event_id"          VARCHAR(50)  NOT NULL,
    "event_seat_id"     VARCHAR(50),
    "seat_label"        VARCHAR(20),
    "checked_in_at"     TIMESTAMP(6),
    "deleted_at"        TIMESTAMP(6),
    CONSTRAINT "registration_pkey" PRIMARY KEY ("registration_id")
);
```

### 5.3 DDL — constraints & indexes (representative)

```sql
CREATE UNIQUE INDEX "user_account_email_key"
  ON "user_account"("email");

CREATE UNIQUE INDEX "user_account_telegram_chat_id_key"
  ON "user_account"("telegram_chat_id");

CREATE UNIQUE INDEX "registration_booking_reference_key"
  ON "registration"("booking_reference");

CREATE UNIQUE INDEX "unique_user_bookmark"
  ON "favorite"("user_id", "event_id");

CREATE INDEX "idx_event_dates"
  ON "event"("start_time", "end_time");

CREATE INDEX "idx_user_inbox"
  ON "notification"("user_id", "is_read");

CREATE INDEX "idx_event_reminder_schedule"
  ON "event_reminder"("is_sent", "scheduled_time");

ALTER TABLE "registration"
  ADD CONSTRAINT "registration_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "user_account"("user_id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "registration"
  ADD CONSTRAINT "registration_event_id_fkey"
  FOREIGN KEY ("event_id") REFERENCES "event"("event_id")
  ON DELETE CASCADE ON UPDATE CASCADE;
```

Full migration history: `backend/prisma/migrations/`.

### 5.4 DML — use-case SQL (aligned to app behavior)

#### Q1 — List public events with remaining seats

```sql
SELECT
  e.event_id,
  e.event_title,
  e.start_time,
  e.end_time,
  e.location,
  e.capacity,
  e.capacity - COUNT(r.registration_id) FILTER (
    WHERE r.deleted_at IS NULL
  ) AS available_seats
FROM event e
LEFT JOIN registration r ON r.event_id = e.event_id
WHERE e.deleted_at IS NULL
  AND e.status IN ('published', 'ongoing', 'completed')
GROUP BY e.event_id
ORDER BY e.start_time ASC;
```

#### Q2 — Create registration (transaction pattern)

```sql
BEGIN;

-- 1) Lock/check event exists & published
SELECT event_id, capacity, status
FROM event
WHERE event_id = $1 AND deleted_at IS NULL AND status = 'published'
FOR UPDATE;  -- stronger than app default; recommended hardening

-- 2) Capacity
SELECT COUNT(*) AS cnt
FROM registration
WHERE event_id = $1 AND deleted_at IS NULL;

-- 3) Duplicate user booking
SELECT 1 FROM registration
WHERE user_id = $2 AND event_id = $1 AND deleted_at IS NULL;

-- 4) Insert
INSERT INTO registration (
  registration_id, booking_reference, user_id, event_id, seat_label, created_at
) VALUES ($3, $4, $2, $1, $5, NOW());

COMMIT;
```

> **Note:** Production app uses Prisma `$transaction` with count checks (not always `FOR UPDATE`). Documented here as SQL equivalent + optional hardening.

#### Q3 — Cancel booking (soft delete)

```sql
UPDATE registration
SET deleted_at = NOW()
WHERE registration_id = $1
  AND user_id = $2
  AND deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM event e
    WHERE e.event_id = registration.event_id
      AND e.start_time > NOW()
  );
```

#### Q4 — Admin attendee list with check-in

```sql
SELECT
  r.registration_id,
  r.booking_reference,
  r.seat_label,
  r.checked_in_at,
  r.created_at,
  u.full_name,
  u.email
FROM registration r
JOIN user_account u ON u.user_id = r.user_id
WHERE r.event_id = $1
  AND r.deleted_at IS NULL
ORDER BY r.created_at ASC;
```

#### Q5 — Toggle check-in

```sql
UPDATE registration
SET checked_in_at = CASE
  WHEN checked_in_at IS NULL THEN NOW()
  ELSE NULL
END
WHERE registration_id = $1;
```

#### Q6 — Student credits (checked-in only)

```sql
SELECT
  u.user_id,
  u.full_name,
  u.email,
  COUNT(r.registration_id) AS events_attended,
  COALESCE(SUM(e.credit_value), 0) AS total_credits
FROM user_account u
LEFT JOIN registration r
  ON r.user_id = u.user_id
 AND r.deleted_at IS NULL
 AND r.checked_in_at IS NOT NULL
LEFT JOIN event e ON e.event_id = r.event_id
GROUP BY u.user_id, u.full_name, u.email
ORDER BY total_credits DESC;
```

#### Q7 — Due event reminders (cron)

```sql
SELECT rem.reminder_id, rem.event_id, rem.minutes_before, e.event_title, e.start_time, e.location
FROM event_reminder rem
JOIN event e ON e.event_id = rem.event_id
WHERE rem.is_sent = false
  AND rem.scheduled_time <= NOW();
```

#### Q8 — Registrants with Telegram for a reminder

```sql
SELECT u.user_id, u.full_name, u.telegram_chat_id, r.seat_label
FROM registration r
JOIN user_account u ON u.user_id = r.user_id
WHERE r.event_id = $1
  AND r.deleted_at IS NULL
  AND u.telegram_chat_id IS NOT NULL;
```

#### Q9 — Favorites for a user

```sql
SELECT f.favorite_id, e.event_id, e.event_title, e.start_time, e.cover_image_url
FROM favorite f
JOIN event e ON e.event_id = f.event_id
WHERE f.user_id = $1
  AND e.deleted_at IS NULL
ORDER BY f.created_at DESC;
```

#### Q10 — Upsert system setting

```sql
INSERT INTO system_setting (key, value, updated_at, updated_by)
VALUES ('settings.general', '{"theme":"light"}', NOW(), $1)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    updated_at = NOW(),
    updated_by = EXCLUDED.updated_by;
```

### 5.5 How the app issues SQL (Prisma)

The application does not hand-write most SQL; Prisma generates parameterized SQL. Example conceptual mapping:

| Feature | Prisma-style operation |
|---|---|
| Book event | `$transaction` + `registration.create` + `registrationAnswer.createMany` |
| List events | `event.findMany({ where: { deleted_at: null, status: { in: [...] } } })` |
| Soft delete | `update({ data: { deleted_at: new Date() } })` |

This still relies on the relational schema above.

---

## 6. Database administration (DBA)

### 6.1 Hosting architecture

| Environment | Hosting | Notes |
|---|---|---|
| **Local development** | Option A: local PostgreSQL; Option B: **remote Supabase free project** used from laptop | Team commonly uses Supabase URLs in `.env` |
| **Production** | **Supabase managed PostgreSQL** | API on **Render** connects via `DATABASE_URL` |
| **API host** | Render Web Service | Runs `prisma migrate deploy` on start (`npm run start:prod`) |

```
[Student SPA / Admin SPA]
         │
         ▼
   [Render API] ──Prisma──► [Supabase PostgreSQL]   ← structured data + image URLs
         │                          │
         │                          └── Platform backups (plan-dependent)
         │
         └──POST /api/upload──► [Cloudinary CDN]   ← event cover image binaries
                                      │
                                      └── returns secure_url → saved in event.cover_image_url
```

#### Why Supabase (provider) vs only local DB

| Criterion | Local Postgres only | Supabase (chosen for prod/demo) |
|---|---|---|
| Setup | Install/maintain Postgres | Managed in minutes |
| Shared team data | Hard without VPN/tunnel | Shared project URL |
| Backups | DIY `pg_dump` cron | Platform backups (plan-dependent) |
| SSL / internet | Manual | Built-in for cloud API |
| Cost (student) | Free local | Free tier limits |
| Cold start coupling | N/A | API may sleep on Render; DB stays up |

**Decision:** Production/demo database is **provider-hosted (Supabase)**. Local may point to the same or a separate Supabase project; pure local Postgres is supported by Prisma if `DATABASE_URL` points to localhost.

**Decision (images):** Binary media is **not** stored in Supabase Storage or as Postgres BLOBs. CADT Events uses **Cloudinary** cloud object storage/CDN; the database stores only the **URL** (see §6.5).

### 6.2 Connection model

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Runtime (often **transaction pooler** `:6543` + `pgbouncer=true`) |
| `DIRECT_URL` | Migrations / session mode `:5432` |

From `backend/.env.example`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"
```

**DBA rule:** Never commit real passwords; use dashboard secrets on Render/Supabase.

### 6.3 Schema change management (migrations)

| Phase | Command / practice |
|---|---|
| Develop | Edit `schema.prisma` → `npx prisma migrate dev --name <name>` |
| Generate client | `npx prisma generate` (also `postinstall`) |
| Production | `prisma migrate deploy` inside `npm run start:prod` |
| Forbidden | Ad-hoc DDL in production without migration file |

Migration folders:

- `20260708080657_init` — base schema  
- `20260708085318_add_checkin_to_bookings` — evolution (history may include intermediate renames; **live models** follow current `schema.prisma`)

### 6.4 Backup strategy (Supabase + team full dumps)

Because CADT Events uses **Supabase managed PostgreSQL**, the team does **not** implement a DIY WAL / incremental backup chain on a VPS. Backup is a **hybrid** of provider features and team-owned **full logical backups**.

#### 6.4.1 Goals (RPO / RTO — practical for student project)

| Metric | Target (demo / course) | Meaning |
|---|---|---|
| **RPO** | ≤ 24 hours (free tier realistic) | Max acceptable data loss |
| **RTO** | ≤ 1–2 hours | Time to restore service |

#### 6.4.2 Backup types — what we use with Supabase

| Backup type (DBA vocabulary) | Do we implement it ourselves? | CADT Events practice |
|---|---|---|
| **Full backup** | **Yes (primary team action)** | Full **logical** dump with `pg_dump` of the entire database (schema + data) |
| **Incremental backup** | **No DIY** | Not built by the team (needs continuous WAL archiving). Rely on **Supabase plan** if daily/PITR is available |
| **Differential backup** | **No DIY** | Same — overkill for free-tier student demo |
| **Physical base + WAL (PITR)** | **Provider only** | Available on some Supabase plans; check Dashboard → Database → Backups |
| **Schema-only recovery** | **Yes (always)** | Prisma migrations in Git rebuild empty structure |
| **Media / image files** | **Cloudinary** | Images are **not** inside Postgres; restore DB URLs + ensure Cloudinary assets still exist (see §6.5) |

**Chosen strategy for this project:**

1. **Supabase** = primary host + any automated backups the plan provides.  
2. **Full logical backup (`pg_dump`)** = what the team **implements and can demonstrate**.  
3. **Prisma migrations** = schema rebuild.  
4. **Do not** implement custom incremental/differential pipelines.

#### 6.4.3 Strategy layers

| Layer | What | How for CADT Events |
|---|---|---|
| **L1 — Supabase automated backups** | Provider daily / PITR (plan-dependent) | Supabase Dashboard → **Database → Backups**; leave enabled where available on free/paid plan |
| **L2 — Full logical dump (team-owned)** | Complete portable copy of DB | `pg_dump` using **`DIRECT_URL`** (session port 5432 — **not** the pooler) |
| **L3 — Schema as code** | Rebuild empty DB structure | `backend/prisma/migrations/` in Git + `prisma migrate deploy` |
| **L4 — Seed / demo scripts** | Non-prod sample data only | `backend/scripts/*` — **not** a substitute for production backup |
| **L5 — Image assets** | Cover photos outside DB | Cloudinary account retention; DB only holds `cover_image_url` |

#### 6.4.4 Why full dump fits Supabase free/demo

| Approach | Fit for our stack |
|---|---|
| Full `pg_dump` | Portable, works on free tier, easy to restore into a new Supabase project, easy to show in a report |
| DIY incremental | Requires base backup + WAL archive + tools — not how we operate Supabase free |
| Only Supabase UI restore | Good when plan includes it; **not always enough alone** on free tier → keep L2 dumps |
| Dump via pooler URL | Unreliable; always use **direct** connection for dump/restore |

#### 6.4.5 Full backup commands (implemented procedure)

```bash
# Load DIRECT_URL from backend/.env (session/direct Supabase connection)
export DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/postgres"

# Full logical backup (schema + data) — custom format (recommended)
pg_dump "$DIRECT_URL" \
  --format=custom \
  --file="cadt_events_full_$(date +%Y%m%d_%H%M).dump"

# Full logical backup — plain SQL (readable / portable)
pg_dump "$DIRECT_URL" \
  --format=plain \
  --file="cadt_events_full_$(date +%Y%m%d_%H%M).sql"
```

**Storage of dump files:** private team drive / encrypted folder. **Never commit dumps with real user data to public Git.**

#### 6.4.6 Restore procedure (full backup)

```bash
# Custom format → new or cleaned database
pg_restore --clean --if-exists --no-owner --dbname="$DIRECT_URL" \
  cadt_events_full_YYYYMMDD_HHMM.dump

# Plain SQL
psql "$DIRECT_URL" -f cadt_events_full_YYYYMMDD_HHMM.sql
```

After restore:

1. Confirm tables: `SELECT count(*) FROM event; SELECT count(*) FROM registration;`  
2. Point Render API env to restored Supabase URLs if the project URL changed.  
3. Run `prisma migrate deploy` if migration history is behind.  
4. Smoke: `GET /api/health`, list events, one booking.  
5. Spot-check a few `cover_image_url` values still open in the browser (Cloudinary).

#### 6.4.7 Backup schedule (policy)

| Environment | What | Frequency | Retention | Owner |
|---|---|---|---|---|
| Production (Supabase) | L1 provider backups | Continuous / daily (per plan) | Per Supabase plan | Team |
| Production | **L2 full `pg_dump`** | **Weekly** + before presentation week | ≥ 7–14 days | Backup owner |
| Before `migrate deploy` risk | L2 full dump | Immediate | Until migration verified | Deployer |
| Local / shared dev | Optional dump | As needed | Short | Developer |

#### 6.4.8 What is *not* enough alone

| Approach | Why incomplete |
|---|---|
| Git only | Has schema, not live registration/user data |
| Render disk | Ephemeral; API has no durable DB files |
| Soft delete only | Helps cancel mistakes; fails if project/DB is deleted |
| Screenshots | Not restorable |
| Full DB dump only | Restores rows/URLs; **does not re-upload lost Cloudinary files** if images were deleted at provider |

#### 6.4.9 Application-level soft delete as “logical safety”

Soft deletes on `event` and `registration` reduce accidental permanent loss of attendance history, but **do not replace** backups (dropped tables, corrupt DB, or compromised project still need L1/L2).

#### 6.4.10 Backup summary (one paragraph for oral defense)

> CADT Events hosts PostgreSQL on **Supabase**. We use **Supabase platform backups** when available on our plan, and we **implement full logical backups** with `pg_dump` / `pg_restore` on the direct connection string on a weekly (and pre-migration) schedule. Schema can also be rebuilt from **Prisma migrations** in Git. We do **not** run a custom incremental/differential backup system; that is unnecessary for our free-tier managed host. Event **images** are backed up/retained separately on **Cloudinary**, while Postgres only stores image URLs.

---

### 6.5 Cloud storage for images (how we handle media)

Event cover images are part of the product, but they are **not** stored as binary data in Supabase Postgres. CADT Events uses a **cloud object/CDN provider (Cloudinary)** for files and the **database for references**.

#### 6.5.1 Design decision

| Option | Used? | Reason |
|---|---|---|
| Postgres `BYTEA` / base64 in DB | **No** | Bloats DB, slow backups, poor CDN caching |
| Files on Render server disk | **No** | Ephemeral filesystem; lost on redeploy |
| **Supabase Storage** buckets | **No** (current project) | Possible alternative; we chose Cloudinary for upload SDK + CDN |
| **Cloudinary** cloud storage | **Yes** | Managed upload, CDN `secure_url`, folder organization |

#### 6.5.2 End-to-end flow (implemented)

```
Admin SPA (create/edit event)
    │  select image file (cached locally until Save/Publish)
    ▼
POST /api/upload   (multipart field "image")
    │  requireAuth + requireRole('ADMIN')
    ▼
Express + Multer (memory storage — no local file kept)
    │  buffer → base64 data URI
    ▼
Cloudinary uploader (folder: "events")
    │  returns secure_url, public_id
    ▼
Admin form sets coverImageUrl
    ▼
POST/PATCH /api/events  →  event.cover_image_url  (VARCHAR URL in Supabase)
    ▼
Student/Admin UIs + Telegram (optional photo) load image by HTTPS URL
```

#### 6.5.3 What is stored where

| Location | Content |
|---|---|
| **Cloudinary** | Image binary, transformations/CDN delivery, `public_id`, folder `events` |
| **Supabase Postgres** | `event.cover_image_url` (and similar URL fields if any) — **string only** |
| **Git / repo** | No production images |
| **Render** | No durable image store |

#### 6.5.4 Security & access control

| Control | Implementation |
|---|---|
| Who can upload | **Admin only** — `requireAuth` + `requireRole('ADMIN')` on `/api/upload` |
| Credentials | `CLOUDINARY_URL` or `CLOUDINARY_CLOUD_NAME` / `API_KEY` / `API_SECRET` in env (see `backend/.env.example`) |
| Public read | Cover URLs are typically publicly readable HTTPS links for event display |
| DB secrets | Cloudinary secrets never stored in tables |

#### 6.5.5 Code / config map

| Piece | Location |
|---|---|
| Upload route | `backend/src/modules/upload/upload.routes.ts` |
| Cloudinary config | `backend/src/config/cloudinary.ts` |
| Mount | `app.ts` → `/api/upload` |
| Admin UI | `frontend-admin` Create/Edit event views → `POST /upload` then save event |
| DB column | `event.cover_image_url` in `schema.prisma` |

#### 6.5.6 Backup implication for images

| Asset | Backup handling |
|---|---|
| Relational data (users, events, regs) | Supabase + **full `pg_dump`** (§6.4) |
| Image **URLs** in DB | Included automatically in full DB dump |
| Image **files** | Retained by **Cloudinary** account; full DB restore reuses the same URLs if files still exist |
| If Cloudinary asset deleted | URL in DB becomes broken link — re-upload via admin and update event |

**Operational note:** A successful Postgres restore does **not** by itself recreate deleted Cloudinary objects. Keep the Cloudinary account active for demos; treat media as a second store.

#### 6.5.7 Alternatives considered (media)

| Alternative | Why not chosen for current CADT Events |
|---|---|
| Supabase Storage | Valid; team standardized on Cloudinary upload path already in code |
| Local `/uploads` folder | Lost on Render redeploy; not multi-instance safe |
| Only external pasted URLs | No controlled admin upload pipeline |

---

### 6.6 Security administration

| Control | Practice |
|---|---|
| Access path | Only API uses DB credentials; SPAs never get `DATABASE_URL` |
| Auth data | Passwords in Clerk; DB placeholder hash |
| Least privilege | Prefer restricted DB user for runtime vs owner for migrations (ideal hardening) |
| SSL | Use Supabase connection strings with SSL |
| Secrets | Render env + Supabase dashboard + Cloudinary env; rotate if leaked |
| SQL injection | Prisma parameterized queries |
| Image upload | Admin-only API; binaries outside DB |

### 6.7 Monitoring & maintenance

| Task | Tool / action |
|---|---|
| Connectivity | API health does not deep-check DB; monitor failed Prisma queries in logs |
| Disk / plan limits | Supabase dashboard (free tier row/storage limits) |
| Slow queries | Supabase query stats / `EXPLAIN ANALYZE` on heavy reports |
| Index health | Keep `idx_event_dates`, inbox, reminder indexes as data grows |
| Vacuum/analyze | Managed by Postgres/Supabase defaults |
| Image delivery | Cloudinary dashboard / broken `cover_image_url` checks |

### 6.8 Environments

| Env | Purpose | DB | Images |
|---|---|---|---|
| Development | Feature work | Local Postgres **or** Supabase dev project | Cloudinary (dev or shared folder) |
| Production | Live demo / users | Supabase prod project + Render API | Cloudinary `events` folder |

**Rule:** Do not run experimental migrations on prod without **full** L2 dump first.

### 6.9 Recovery playbook (short)

1. Confirm outage (API errors vs Supabase status).  
2. If data loss/corruption: restore latest provider backup **or** `pg_restore` **full** weekly dump to DB.  
3. Point `DATABASE_URL` / `DIRECT_URL` to restored instance.  
4. Run `prisma migrate deploy` if schema behind.  
5. Verify: sample `SELECT count(*) FROM event;` + book test event.  
6. Verify sample event cover URLs still load (Cloudinary).  
7. Redeploy API if needed; smoke `GET /api/health` and one booking.

### 6.10 DBA responsibilities (team)

| Role | Responsibility |
|---|---|
| Schema owner | Prisma migrations, review DDL |
| Secrets owner | Env vars (Supabase, Clerk, Cloudinary), rotation |
| Backup owner | Weekly **full** `pg_dump` + pre-demo dump; check Supabase Backups UI |
| Media owner | Cloudinary credentials; avoid deleting production `events` assets before demos |
| Deploy owner | Render + migrate on release |

---

## 7. Integrity, concurrency, and transactions

### 7.1 Referential integrity

- CASCADE on user/event children for cleanup.  
- SET NULL on optional links (admin, venue, event on notification).  

### 7.2 Application vs DB constraints

| Rule | DB | App |
|---|---|---|
| Unique email / booking ref / favorite | Yes | — |
| Capacity | No CHECK | Yes (count in TX) |
| One active reg per user/event | Partial unique index **not** currently on (user_id, event_id) WHERE deleted_at IS NULL | Yes |
| End > start | No | Yes (Zod + controller) |

**Future hardening (recommended in report discussion):**

```sql
CREATE UNIQUE INDEX registration_one_active_per_user_event
ON registration (user_id, event_id)
WHERE deleted_at IS NULL;
```

### 7.3 Booking transaction (as implemented)

1. Begin transaction  
2. Load published event + questions  
3. Validate required answers  
4. Count active registrations vs capacity  
5. Reject duplicate user booking / seat collision  
6. Insert registration (+ answers)  
7. Commit  
8. Side effects (Telegram) **outside** critical path  

---

## 8. Evaluation

### 8.1 Strengths

- Clear relational model matching campus events domain  
- Soft delete supports cancel/history  
- Indexes for common access paths  
- Migrations + dual URL for pooler-safe deploys  
- Provider hosting suitable for student production demo  

### 8.2 Limitations (honest to current product)

- Capacity / one-active-booking rules are **application-enforced**, not full DB partial unique indexes  
- Free-tier backup/PITR may be limited — compensate with `pg_dump`  
- Older docs (`erd-schema.md`, analytics.sql) use **different table names**; **this report + app use `user_account` / `registration` / `event`**  
- No credit ledger / badge-tier tables (credits **computed** from check-ins)  
- Admin notification feed is **synthetic**, not only `notification` rows  
- Telegram outbox table is **not** required for live sends  
- Venue/speaker/department seat-engine tables are largely **schema-ready**, not the main write path  

### 8.3 Requirements compliance check

| DR | Fits live project? | Evidence |
|---|---|---|
| DR-01–DR-05, DR-07–DR-08, DR-11, DR-13–DR-15 | Yes | Controllers + Prisma usage |
| DR-06 primary (capacity + seat_label) | Yes | `createBooking`, `getEventSeats` |
| DR-06b / DR-12 masters | Schema only / light | Tables exist; limited writes |
| DR-09 admin feed | Yes with caveat | Synthetic query path documented |
| DR-10 chat id | Yes | Bot + column |
| Badge ledger / custom JWT users | Out of scope | Not claimed as live DR |

### 8.4 Alternatives considered

| Alternative | Why not primary for CADT Events |
|---|---|
| MongoDB document store | Weaker multi-row integrity for capacity + check-in reporting |
| Storing `available_seats` counter only | Dual-write races; we **compute** from registrations |
| Self-hosted VPS Postgres only | Higher ops burden for student free-tier demo |
| Custom auth user tables with passwords | Project uses **Clerk** |

---

## 9. Conclusion

This database report followed the required design order and **fits the real CADT Events codebase**:

1. **Detailed data requirements (DR-01–DR-15)** — marked Implemented / Partial / Schema-ready against live modules  
2. **ERD** with core vs extension entities  
3. **Relational schema** matching `schema.prisma` (`user_account`, `registration`, `event`, …)  
4. **SQL** for list / book / cancel / check-in / credits / reminders  
5. **DBA**: Supabase hosting, dual URLs, migrations, **full backup strategy on Supabase**, and **Cloudinary cloud image storage**  

Non-requirements (custom JWT passwords, credit ledger tables, mandatory Telegram outbox) are explicitly excluded so the report does not over-claim beyond the project.

The system of record for structured data is **PostgreSQL on Supabase**. Event **images** are handled by **Cloudinary**; the database stores only **URLs**. Recovery combines provider backups, team **full logical dumps**, Prisma migrations, and Cloudinary asset retention.

---

## References

1. `backend/prisma/schema.prisma`  
2. `backend/prisma/migrations/`  
3. `backend/.env.example`  
4. `docs/operations/deploy.md`  
5. `docs/architecture/database/database-administration.md`  
6. `docs/product/prd.md`  
7. PostgreSQL & Supabase documentation  
8. Prisma Migrate documentation  

---

## Appendices

### A. Requirement checklist (submission)

- [x] Requirements detailed **before** ERD  
- [x] Requirements **fit live project** (Implemented / Partial / Schema-ready)  
- [x] Non-requirements listed (no over-claim)  
- [x] ERD with cardinalities  
- [x] Relational schemas + keys  
- [x] SQL DDL/DML samples  
- [x] Hosting (local vs Supabase provider)  
- [x] Backup strategy (Supabase + **full** `pg_dump` + why not DIY incremental)  
- [x] Cloud image storage (Cloudinary flow + DB URL only)  
- [ ] Team names / IDs  
- [ ] Optional: ERD screenshot from Prisma Studio / dbdiagram  

### B. Table count (from schema)

Core operational tables include: `admin`, `department`, `user_account`, `venue`, `venue_seat_template`, `event`, `speaker`, `event_speaker`, `event_department`, `event_seat`, `registration`, `favorite`, `notification`, `telegram_notification`, `event_question`, `registration_answer`, `system_setting`, `event_reminder`.

### C. Quick commands

```bash
cd backend
npx prisma migrate dev --name <name>   # local/dev
npx prisma migrate deploy              # prod
npx prisma studio                      # browse data
npx prisma generate
```

---

*End of Database Report — CADT Events v1.0*
