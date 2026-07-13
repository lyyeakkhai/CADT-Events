# Production readiness — CADT Events

**Date:** 2026-07-13  
**Scope:** Full product (API + student web + admin web) for real production use  

---

## Test results (this pass)

| Check | Result |
|-------|--------|
| API health | PASS `GET /api/health` 200 |
| Public events | PASS (live Supabase data) |
| Student mobile 375px | PASS — no horizontal overflow |
| Student tablet 768px | PASS |
| Admin mobile layout | **FIXED** — drawer + hamburger (was desktop-only fixed sidebar) |
| Empty event image | **FIXED** — no more `src=""` React error |
| Admin page title | **FIXED** — was “My Google AI Studio App” |

Screenshots (local): `/tmp/cadt-prod-qa/`

---

## What is production-ready enough

| Area | Status |
|------|--------|
| Clerk auth (real users) | Working |
| Create / publish / draft events | Working (type mapping + admin_id fixed) |
| Student discover / book (API) | Working |
| Admin check-in + export | Working |
| Soft delete / unpublish | Working |
| Cloudinary upload | Working when env set |
| Telegram bot | Running in dev when token set |
| Responsive student app | Good baseline |
| Responsive admin app | **Now** mobile drawer + fluid padding |

---

## Must fix / configure before real production traffic

### 1. Environment & secrets (ops)

| Item | Action |
|------|--------|
| `NODE_ENV=production` on API host | Required |
| Separate **production** Clerk instance (or production keys) | Dev keys are rate-limited and branded “Development mode” |
| `ADMIN_EMAILS` = all teacher emails | Comma-separated |
| `VITE_ADMIN_EMAILS` on admin host | Same list |
| `FRONTEND_URL` / `ADMIN_URL` CORS | Exact production origins |
| `CLERK_WEBHOOK_SECRET` + live webhook URL | User sync + roles |
| Never commit real secrets | Rotate if ever leaked in git |
| Production Supabase project (or hard backups) | Avoid demo DB for live students |

### 2. Product / security gaps still open

| Gap | Risk | Priority |
|-----|------|----------|
| Maintenance mode flag not enforced on student site | Setting saved but not applied | P1 |
| Settings SMTP not actually sending mail | Invite uses **Clerk**, not SMTP | P2 (document) |
| No automated test suite (e2e/unit) | Regressions ship silently | P1 |
| Rate limits / abuse on booking | Contended seminars | P1 |
| Audit log (who published / checked in) | Ops disputes | P2 |
| Backup / restore runbook | Data loss | P1 |
| Error monitoring (Sentry etc.) | Blind in prod | P1 |
| Image CDN fail states | Partial | P2 |

### 3. Responsive remaining polish

| Surface | Notes |
|---------|--------|
| Admin calendar FullCalendar | Usable on phone; dense — consider day view default on mobile |
| Admin wide tables | Horizontal scroll (OK); sticky first column optional |
| Student navbar | Has mobile menu — re-verify Discover → book flow on 375px after login |
| Safe-area (iPhone notch) | Partial on admin; extend if needed |

### 4. Content / data hygiene

- Duplicate seed event titles still possible if re-seeded  
- Prefer real cover images on all published events  
- Clean junk titles before launch day  

---

## Production launch checklist

```text
[ ] API deployed (Render/etc.) with all env vars
[ ] Student app + Admin app deployed with VITE_* pointing at API
[ ] Clerk production: domains, redirects, webhooks, Google OAuth
[ ] ADMIN_EMAILS + VITE_ADMIN_EMAILS set for every teacher
[ ] CORS FRONTEND_URL + ADMIN_URL exact match
[ ] Smoke: teacher create → publish → student sees → book → admin check-in → export
[ ] Smoke mobile 375px: student browse + book; admin hamburger → create
[ ] Disable Clerk “Development mode” branding (prod keys)
[ ] Database backup enabled
[ ] Change any passwords that were shared in chat
```

---

## Demo script for teachers (production)

1. Open **admin URL** → sign in with Clerk  
2. **Create Event** → fill required fields → **Publish Event**  
3. Open **student URL** (phone or laptop) → Discover shows event  
4. Student signs in → registers  
5. Admin → event detail → **check-in** + **export**  

---

## Changes made in this production pass

1. **Admin fully responsive shell** — mobile drawer, backdrop, menu button, content full-width  
2. **Responsive padding** on dashboard, create, events, users, calendar, export, activity  
3. **Empty image guard** on student EventCard  
4. **Admin HTML title** production naming  
5. Prior fixes kept: event type mapping, admin_id, invite API, settings DB, publish/unpublish/delete  

---

## Bottom line

| Question | Answer |
|----------|--------|
| Can this run in production for CADT? | **Yes, with env + Clerk prod + smoke path above** |
| Biggest UX hole found? | Admin was **not mobile-usable** — now fixed |
| Biggest remaining risk? | **Ops**: prod keys, webhooks, backups, monitoring, no automated tests |

Treat launch as: **config + smoke + mobile check**, not a rewrite.
