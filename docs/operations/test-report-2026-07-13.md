# Pre-deploy test report — 2026-07-13

**Environment:** local  
**Stack:** backend `:4000`, frontend `:5173`, admin `:3000`  
**DB:** Supabase (connected)  
**Auth:** Clerk development keys  

---

## Summary

| Area | Result |
|------|--------|
| Infrastructure smoke | **PASS** |
| Public API + event list/detail | **PASS** |
| Auth gates (401 without token) | **PASS** |
| CORS localhost | **PASS** |
| CORS production origin (local env) | **FAIL (expected)** — need `FRONTEND_URL`/`ADMIN_URL` on host |
| Production builds (3 apps) | **PASS** |
| Student UI (discover, detail, login gate) | **PASS** |
| Admin unauthenticated redirect | **PASS** (local) |
| Logged-in book / check-in / admin CRUD | **NOT RUN** (needs real Clerk login) |
| Deploy readiness | **Almost** — fix data dupes + set host env; booking path still manual |

**Verdict:** Safe to keep building and prep deploy config. **Do not call demo-ready** until you manually verify login → book → admin check-in once.

---

## Phase results

### A1 Infrastructure — PASS

| Test | Result | Evidence |
|------|--------|----------|
| Backend starts | PASS | `Server running on http://localhost:4000` |
| `GET /api/health` | PASS | `200` `{"status":"ok","env":"development",...}` |
| User frontend | PASS | `200` at `:5173` |
| Admin frontend | PASS | `200` at `:3000` (then auth redirect) |
| Telegram bot | PASS | Log: bot running + reminder cron |

### A7 Builds — PASS

| Package | Result |
|---------|--------|
| `backend` (`tsc` + `tsc-alias`) | PASS |
| `frontend` (`tsc -b` + `vite build`) | PASS |
| `frontend-admin` (`vite build`) | PASS |

### Public API — PASS

| Test | Result | Notes |
|------|--------|-------|
| `GET /api/events` | PASS | 7 published events, ~400ms |
| `GET /api/events/:id` | PASS | 200 with full payload |
| `GET /api/events?search=AI` | PASS | 2 matches |
| Invalid event id | PASS | 404 `Event not found` |

### Auth gates — PASS

| Endpoint | Status | Body |
|----------|--------|------|
| `POST /api/bookings` | 401 | Missing Authorization header |
| `GET /api/bookings/me` | 401 | same |
| `GET /api/events/all` | 401 | same |
| `GET /api/users` | 401 | same |
| `POST /api/events` | 401 | same |
| `GET /api/favorites/me` | 401 | same (route is `/me`, not `/`) |
| `GET /api/telegram/status` | 401 | same |
| `GET /api/events/:id/seats` | 401 | same |
| `PATCH /api/bookings/:id/checkin` | 401 | same |

### CORS

| Origin | Result |
|--------|--------|
| `http://localhost:5173` | PASS — `Access-Control-Allow-Origin` echoed |
| `https://cadt-events.vercel.app` | **No ACAO** on local env (expected). **Must set** `FRONTEND_URL` + `ADMIN_URL` on Render before Vercel frontends work |

### Browser UI — PASS (unauthenticated)

| Flow | Result |
|------|--------|
| Discover feed loads real API events | PASS — titles, seats, cards visible |
| Event detail (“Future of AI…”) | PASS — REGISTER NOW, seats, agenda |
| Log In page / Clerk widget | PASS — email/password + Google/Microsoft |
| My Booking without login | PASS — redirects to `/login` |
| Admin without login | PASS — redirects to student login |
| Console JS errors | PASS — only Clerk “development keys” warnings |

Screenshots: `/tmp/cadt-qa/*.png`

---

## Issues found

### Fixed during this run

1. **P0 — Admin hardcodes `http://localhost:5173`**  
   Would break login redirect / sign-out on Vercel.  
   **Fixed:** `VITE_USER_FRONTEND_URL` via `frontend-admin/src/lib/urls.ts` (ProtectedRoute, main, Sidebar, Navbar).

### Still open

| Sev | Issue | Impact | Action |
|-----|--------|--------|--------|
| **P1** | **Duplicate seed events** (3 titles × 2) | Confusing UI for demo | Delete duplicates in admin or DB |
| **P1** | **Logged-in flows not automated** (book, cancel, check-in, create event) | Core demo path unproven in this run | You log in once and run demo script |
| **P1** | **CORS for Vercel not set yet** | Frontends blocked after deploy | Set `FRONTEND_URL` / `ADMIN_URL` on API |
| **P2** | Event detail refetches same id **5×** | Slow (~1–2s extra) | Dedupe `getEvent` / StrictMode cleanup |
| **P2** | Junk event title `emwpoer` | Looks unprofessional | Delete or rename before demo |
| **P2** | Clerk **development keys** only | OK for class demo; not for real prod | Keep `pk_test_` for now |
| **P2** | Lint debt (many errors) | CI lint non-blocking | Clean later |

---

## Manual tests YOU should run (15 min, with login)

Use student + admin Clerk accounts:

1. Student: Log in → open event → **REGISTER NOW** → see ticket in My Booking  
2. Student: Book same event again → must show error  
3. Admin: Log in → create short “Demo Event” → publish  
4. Student: see new event → book it  
5. Admin: open roster → check-in → refresh still checked  
6. Admin: export CSV/Excel once  

If those 6 pass, the demo path is green.

---

## Deploy gate

Ship when:

- [x] Health + public events + builds pass  
- [x] Admin localhost hardcodes fixed  
- [ ] Manual book + check-in once  
- [ ] Demo data cleaned (no dupes / junk titles)  
- [ ] Host env vars set (Render + Vercel + CORS)  

---

## Related

- Plan: [`pre-deploy-test-plan.md`](./pre-deploy-test-plan.md)  
- Deploy: [`deploy.md`](./deploy.md)  
