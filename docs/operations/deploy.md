# Deploy guide — production (CADT Events)

Student/demo stack with managed free/hobby hosts.

| Piece | Host | Notes |
|-------|------|--------|
| Database | **Supabase** Postgres | `DATABASE_URL` (pooler) + `DIRECT_URL` (migrations) |
| **Backend API** | **Render** free Web Service | Blueprint: `render.yaml` (API only) |
| **Student + Admin web** | **Vercel** | **One project**, repo root; build `scripts/build-web.sh` → `deploy/` (`/` student, `/admin` admin) |
| Auth | **Clerk** | Same app keys; **one origin** → shared session |
| Images | **Cloudinary** | Admin upload → URL in DB |
| CI | **GitHub Actions** | `.github/workflows/ci.yml` — lint + build all packages |

> Render free tier sleeps after ~15 min idle. Before a live demo, open `GET /api/health` once to wake the API.

---

## Architecture (production)

```
GitHub (main)
    │
    ├─► GitHub Actions CI (test/build on PR + push)
    │
    ├─► Render auto-deploy  →  cadt-events-api.onrender.com
    │         │
    │         └── Prisma + Supabase Postgres
    │
    └─► Vercel auto-deploy  →  one site: / + /admin
              │
              └── VITE_API_URL → Render API
```

**CD (continuous deployment):** after CI is green, hosts rebuild from the connected branch (usually `main`):

| Service | Trigger |
|---------|---------|
| API | Push to branch linked in Render |
| Web (student + admin) | Push to branch linked in the **single** Vercel project |

---

## Prerequisites

1. GitHub repo with this codebase  
2. [Render](https://render.com) account (API)  
3. [Vercel](https://vercel.com) account (both frontends)  
4. Supabase project (`DATABASE_URL` / `DIRECT_URL`)  
5. Clerk application keys  
6. Optional: Cloudinary, Telegram bot token  

---

## 1. Continuous integration (GitHub Actions)

Workflow: [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)

| Job | What it does |
|-----|----------------|
| `backend` | `npm ci` → `prisma generate` → lint (non-blocking) → `npm run build` |
| `frontend` | `npm ci` → lint (non-blocking) → `npm run build` |
| `frontend-admin` | same for admin package |

**When:** every `push` and `pull_request` to `main` / `master`.

**Secrets in CI:** none required for build (placeholder env for Vite/Prisma generate only). Real secrets live only on Render / Vercel / Supabase.

---

## 2. Backend on Render

### One-time setup

1. Push repo to GitHub (includes `render.yaml`).  
2. Render → **New** → **Blueprint** → select this repo.  
3. Blueprint creates **`cadt-events-api`** only (frontends are on Vercel).  
4. Set environment variables (table below).  
5. Deploy → confirm health:

```bash
curl -sf https://cadt-events-api.onrender.com/api/health
# {"status":"ok","env":"production",...}
```

### Backend env (Render)

| Variable | Required | Notes |
|----------|----------|--------|
| `NODE_ENV` | yes | `production` (blueprint) |
| `DATABASE_URL` | yes | Supabase **pooler** (`?pgbouncer=true`) |
| `DIRECT_URL` | yes | Supabase direct (migrations) |
| `CLERK_PUBLISHABLE_KEY` | yes | `pk_…` |
| `CLERK_SECRET_KEY` | yes | `sk_…` |
| `CLERK_WEBHOOK_SECRET` | recommended | Clerk webhooks |
| `ADMIN_EMAILS` | yes for demos | Comma-separated admin emails |
| `FRONTEND_URL` | yes (CORS) | Web origin, e.g. `https://cadt-events.vercel.app` |
| `ADMIN_URL` | yes (CORS) | Same origin (or same + `/admin` host only — use same origin) e.g. `https://cadt-events.vercel.app` |
| `PUBLIC_WEB_URL` | recommended | HTTPS student URL for Telegram buttons |
| `CLOUDINARY_URL` | optional | Image upload |
| `TELEGRAM_BOT_TOKEN` | optional | Bot DMs |

### Production start (already in blueprint)

```bash
cd backend
npm ci --legacy-peer-deps
npx prisma generate
npm run build          # tsc && tsc-alias
npm run start:prod     # prisma migrate deploy && node dist/server.js
```

---

## 3. Frontends on Vercel (one project, `/` + `/admin`)

Student and admin stay in **separate folders** (`frontend/`, `frontend-admin/`) but ship as **one site**.

1. Vercel → **Add New Project** (or edit existing) → import this repo.  
2. **Root Directory:** leave empty / `.` (repo root) — uses root `vercel.json`.  
3. Build: `bash scripts/build-web.sh` → output `deploy/`.  
4. Env (Production) on **this one project**:

| Variable | Example |
|----------|---------|
| `VITE_CLERK_PUBLISHABLE_KEY` | `pk_…` |
| `VITE_API_URL` | `https://cadt-events.onrender.com/api` |
| `VITE_ADMIN_EMAILS` | `yeakkhai.ly@student.cadt.edu.kh` (merged with code defaults) |
| `VITE_TELEGRAM_BOT_USERNAME` | bot username without `@` |

5. Deploy → URLs:  
   - Student: `https://cadt-events.vercel.app/`  
   - Admin: `https://cadt-events.vercel.app/admin`  
6. Set Render `FRONTEND_URL` + `ADMIN_URL` + `PUBLIC_WEB_URL` to that origin.  
7. **Retire** the old second Vercel admin project (optional).

> `VITE_*` vars are baked in at **build** time. Change them → redeploy.  
> Local still uses two ports (`5173` + `3000`); only production is unified.

### Same-origin auth

| Who | Where they log in | Expected |
|-----|-------------------|----------|
| Student | `/` or `/login` | Stays on student UI |
| Admin | `/` or `/login` | Auto-redirect to `/admin` (same cookie — no second login) |
| Admin | `/admin` | Dashboard if admin; else send to `/` |
| Student | `/admin` | After sign-in, redirected to student home |

---

## 4. Clerk dashboard checklist

- Allowed origins / redirect URLs: **one** production web origin + local ports  
- Webhook endpoint: `https://cadt-events.onrender.com/api/webhooks`  
- Events: `user.created`, `user.updated`  
- Signing secret → Render `CLERK_WEBHOOK_SECRET`

---

## 5. Typical production URLs

```text
API:    https://cadt-events.onrender.com
Web:    https://cadt-events.vercel.app
Admin:  https://cadt-events.vercel.app/admin
Health: https://cadt-events.onrender.com/api/health
```

---

## 6. CI/CD flow (summary)

| Stage | Tool | Action |
|-------|------|--------|
| **CI** | GitHub Actions | On PR/push: install, lint (soft), **build** backend + both frontends |
| **CD API** | Render | Auto-deploy on push to connected branch |
| **CD Web** | Vercel | Auto-deploy unified student + admin |
| **DB migrate** | Render start command | `prisma migrate deploy` before `node dist/server.js` |
| **Verify** | Health check | `curl -sf …/api/health` |

### Recommended team workflow

1. Feature branch → open PR.  
2. Wait for **CI green** (builds must pass).  
3. Merge to `main` (squash if preferred).  
4. Render + Vercel deploy automatically.  
5. Smoke: health, student login, admin create event, one booking.

---

## 7. Local development (not production)

```bash
# Terminal 1
cd backend && npm run dev          # http://localhost:4000

# Terminal 2
cd frontend && npm run dev         # http://localhost:5173

# Terminal 3
cd frontend-admin && npm run dev   # http://localhost:3000
```

Env templates: each package’s `.env.example` only — never commit real `.env` / `.env.local`.

---

## 8. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| CORS errors from Vercel → API | `FRONTEND_URL` / `ADMIN_URL` wrong on Render | Set exact Vercel origins, redeploy API |
| Frontend calls wrong API / localhost | Stale or missing `VITE_API_URL` | Set on Vercel, **redeploy** frontend |
| Admin bounces to student after login | Missing `publicMetadata.role=ADMIN` and email not on allowlist | Clerk public metadata + `VITE_ADMIN_EMAILS` / Render `ADMIN_EMAILS`, redeploy |
| Admin 404 on `/admin` | Old dual-project deploy or missing rewrite | Root Directory = repo root; `vercel.json` + `scripts/build-web.sh` |
| Admin assets 404 under `/admin` | Admin built without `ADMIN_BASE_PATH=/admin/` | Use unified `npm run build:web` only |
| Admin opens student site and stays there | Role/email not detected as admin | Set Clerk `role: ADMIN` or allowlist email |
| 401 on admin API | Clerk key mismatch or role not ADMIN | Same Clerk app; set role ADMIN; allowlist email |
| Migrate fail on Render | Bad `DIRECT_URL` | Use session/direct Supabase URL |
| Cold start timeout | Free Render sleep | Hit `/api/health` once before demo |
| SPA 404 on refresh | Missing rewrite | Ensure `vercel.json` rewrites present |

---

## 9. Repo cleanliness (production)

Do not commit: `.env`, dumps, `dist/`, `node_modules/`, agent folders, one-off test scripts.  
See root `.gitignore`. Keep only `.env.example` for secrets shape.
