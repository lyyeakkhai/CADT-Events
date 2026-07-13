# Pre-deploy test plan (before Render / Vercel)

**Goal:** Prove the demo works end-to-end **locally first**, then smoke-test after host.  
**Audience:** Student demo / presentation (not full production QA).

Do **not** deploy until **Phase A + Phase B P0** pass.

---

## What can break (highest risk first)

| Risk | Why it breaks | Severity |
|------|----------------|----------|
| **Clerk auth / tokens** | Wrong keys, expired session, missing Bearer token → 401 on book/admin | P0 |
| **Admin role missing** | Webhook or whitelist never set `publicMetadata.role = ADMIN` → admin portal denied | P0 |
| **CORS** | API rejects browser calls from Vite/Vercel origins | P0 |
| **Wrong `VITE_API_URL`** | Frontends still call `localhost` after deploy | P0 |
| **Admin redirects hardcoded to localhost** | `frontend-admin` ProtectedRoute uses `http://localhost:5173` — **breaks on Vercel** | P0 |
| **DB / migrations** | Schema out of date; `migrate deploy` fails on Render start | P0 |
| **Capacity / double booking** | Seat cap not enforced; or user books twice | P0 |
| **Env missing on host** | `DATABASE_URL`, Clerk, CORS URLs unset → crash loop | P0 |
| **Cold start (Render free)** | API asleep; demo looks “down” for 30–60s | P1 |
| **Image upload** | Cloudinary missing → create event with cover fails | P1 |
| **Telegram** | Bot token / webhook wrong → connect/reminders fail (optional for demo) | P2 |
| **Export / check-in** | Admin roster wrong for live door flow | P1 |
| **Lint/build CI** | `npm run build` fails on host | P0 |

---

## Test accounts to prepare

| Account | Role | Purpose |
|---------|------|---------|
| Student A | normal Clerk user | browse, book, cancel, favorites |
| Student B | second Clerk user | capacity edge, double-book isolation |
| Admin | email on whitelist **or** Clerk `publicMetadata.role = ADMIN` | create events, check-in, export |

Also need:

- At least **1 DRAFT** and **1 PUBLISHED** event with capacity ≥ 2  
- Optional: 1 event with capacity **1** for “sold out” test  

---

## Phase A — Local smoke (must pass before deploy)

Run all three apps locally (`SETUP.md`). Backend first.

### A1. Infrastructure (5 min)

| # | Test | Pass criteria |
|---|------|----------------|
| A1.1 | Backend starts | No env crash; log shows listening |
| A1.2 | `GET /api/health` | `{ "status": "ok" }` |
| A1.3 | User frontend loads | No blank screen; Clerk publishable key works |
| A1.4 | Admin frontend loads | Auth gate appears (not crash) |

### A2. Auth & roles (10 min) — **P0**

| # | Test | Pass criteria |
|---|------|----------------|
| A2.1 | Student sign-up / sign-in | Lands on Discover, not error loop |
| A2.2 | Sign out | Session cleared; protected pages redirect |
| A2.3 | Admin sign-in | Admin shell loads (dashboard) |
| A2.4 | Student opens admin URL | “Access Denied” (not full admin UI) |
| A2.5 | API with no token on `POST /api/bookings` | **401** |

### A3. Admin: event lifecycle (15 min) — **P0**

| # | Test | Pass criteria |
|---|------|----------------|
| A3.1 | Create event as DRAFT | Saved; not shown on public Discover |
| A3.2 | Publish event | Appears on public Discover / search |
| A3.3 | Edit event (title, capacity, time) | Public page updates |
| A3.4 | Upload cover image (if Cloudinary set) | Image URL persists; card shows image |
| A3.5 | Create without required fields | Validation error, no crash |
| A3.6 | Delete or cancel event (if UI supports) | Removed / not bookable |

### A4. Student: discovery & booking (20 min) — **P0**

| # | Test | Pass criteria |
|---|------|----------------|
| A4.1 | List published events | Cards show title, date, location, seats |
| A4.2 | Search / filter | Results match query (or empty state) |
| A4.3 | Event detail page | Full info; Register CTA works |
| A4.4 | Book seat (Student A) | Success → confirmation + ticket code |
| A4.5 | My Bookings | New booking listed |
| A4.6 | Book same event again | **409 / clear error** — not second booking |
| A4.7 | Capacity = 1 event: Student A books | Student B gets full / no seats |
| A4.8 | Cancel booking | Booking removed/cancelled; seat freed if designed |
| A4.9 | Favorite / unfavorite | Favorites page updates |
| A4.10 | Calendar view | Booked/published events visible without crash |

### A5. Admin: attendance & export (10 min) — **P1**

| # | Test | Pass criteria |
|---|------|----------------|
| A5.1 | Open event roster | Sees Student A registration |
| A5.2 | Check-in toggle | Status updates and stays after refresh |
| A5.3 | Export CSV/Excel | File downloads with name/email/event |
| A5.4 | Users list | Students appear (synced via Clerk webhook if enabled) |

### A6. Optional integrations (skip if not demoing) — **P2**

| # | Test | Pass criteria |
|---|------|----------------|
| A6.1 | Telegram connect link | Opens bot; status shows linked |
| A6.2 | Disconnect Telegram | Status cleared |
| A6.3 | Notifications page | Loads; mark-as-read if implemented |

### A7. Build gate (local production build) — **P0**

```bash
cd backend && npm run build && echo BACKEND_OK
cd frontend && npm run build && echo WEB_OK
cd frontend-admin && npm run build && echo ADMIN_OK
```

All three must succeed before you open Render/Vercel.

---

## Phase B — Pre-deploy config checks (no host yet)

| # | Check | Why |
|---|--------|-----|
| B1 | `.env` / `.env.local` not committed | Secrets leak |
| B2 | List **all** env vars for Render + Vercel (see `deploy.md`) | Missing var = crash |
| B3 | Fix **admin localhost redirects** in `frontend-admin` ProtectedRoute | Will hard-break on Vercel |
| B4 | CORS will use `FRONTEND_URL` + `ADMIN_URL` on API | Browser blocks otherwise |
| B5 | Clerk dashboard: add future Vercel URLs (can add after first deploy) | Auth redirects fail |
| B6 | Supabase: migrations applied (`prisma migrate deploy` works with `DIRECT_URL`) | Render start fails |
| B7 | Decide demo data seed (3–5 events) | Empty UI looks broken |

---

## Phase C — After first deploy (host smoke, 20 min)

Do this **once** APIs are live (Render free may need a wake).

### C1. Health & wiring

| # | Test | Pass criteria |
|---|------|----------------|
| C1.1 | `curl https://API/api/health` | 200 + `status: ok` |
| C1.2 | Open student Vercel URL | Loads; no console flood of `localhost` API errors |
| C1.3 | Open admin Vercel URL | Auth works; not redirected to localhost forever |
| C1.4 | Browser Network tab: API calls go to Render URL | Correct host |

### C2. Critical path on host

| # | Test | Pass criteria |
|---|------|----------------|
| C2.1 | Admin creates + publishes event | Visible on student site |
| C2.2 | Student books event | Ticket confirmation |
| C2.3 | Admin check-in | Persists after refresh |
| C2.4 | CORS: no red Network errors on book | Headers allow Vercel origin |
| C2.5 | Cold start: wait 20 min idle → first request | Eventually 200 (warn: slow) |

---

## Demo-day script (what must work on stage)

Minimum happy path to rehearse **twice**:

1. Admin login → create short “Demo Event” → publish  
2. Student login → Discover → open event → book  
3. Admin → roster → check-in student  
4. (Optional) Show export download  

If anything else fails, demo still survives.

---

## Suggested order this week

```text
Day 1  Phase A1–A4 locally (core product)
Day 1  Fix any P0 bugs found
Day 2  Phase A5 + A7 builds
Day 2  Phase B (especially admin localhost + env list)
Day 3  Deploy Render API → Vercel frontends
Day 3  Phase C smoke
Day 4  Rehearse demo script + wake API before presentation
```

---

## Out of scope for student demo (don’t block deploy)

- Load testing hundreds of concurrent bookers  
- Full accessibility audit  
- Payment flows (none)  
- Perfect lint score (CI already non-blocking)  
- Redis/BullMQ queues (not required on API boot)  
- Production Clerk keys (test keys OK for class demo)  

---

## Bug log template

When something fails, note:

```text
ID:
Phase: A / B / C
Severity: P0 / P1 / P2
Steps:
Expected:
Actual:
Env: local / Render / Vercel
Screenshot / network status:
```

---

## Related docs

- Local setup: [`SETUP.md`](../../SETUP.md)  
- Free host guide: [`deploy.md`](./deploy.md)  
- API routes (verify against code; some auth docs are outdated vs Clerk): [`docs/api/api-spec.md`](../api/api-spec.md)  
