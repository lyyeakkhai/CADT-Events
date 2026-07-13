# Deploy guide (student demo / testing)

Free-tier stack for learning and presentation demos (not high-traffic production).

| Piece | Free host | Notes |
|-------|-----------|--------|
| Database | **Supabase** (already used) | Free Postgres project |
| API | **Render** free Web Service | Sleeps after ~15 min idle; ~30–60s cold start |
| User web | **Render** free Static Site | Always free for static Vite builds |
| Admin web | **Render** free Static Site | Same as above |
| Auth | **Clerk** free / development | Use `pk_test_` / `sk_test_` for demos |

> Before a live presentation: open the API URL once so it wakes from sleep.

---

## Prerequisites

1. GitHub repo: `https://github.com/lyyeakkhai/CADT-Events`
2. Free [Render](https://render.com) account (sign in with GitHub)
3. Supabase project (existing `DATABASE_URL` / `DIRECT_URL`)
4. Clerk application with publishable + secret keys
5. Optional: Cloudinary, Telegram bot token

---

## One-time: deploy with Render Blueprint

1. Push this repo to GitHub (including `render.yaml` and `.github/workflows/ci.yml`).
2. Render dashboard → **New** → **Blueprint** → select `CADT-Events`.
3. Render creates three services from `render.yaml`:
   - `cadt-events-api` (Node web service)
   - `cadt-events-web` (static)
   - `cadt-events-admin` (static)
4. In each service, fill environment variables (see below).
5. After first deploy, copy the public URLs and set cross-service vars:
   - API → `FRONTEND_URL`, `ADMIN_URL`
   - Web → `VITE_API_URL`, `VITE_ADMIN_URL`
   - Admin → `VITE_API_URL`
6. Redeploy static sites after setting `VITE_*` vars (they are baked in at **build** time).

Typical free URLs look like:

```text
https://cadt-events-api.onrender.com
https://cadt-events-web.onrender.com
https://cadt-events-admin.onrender.com
```

Health check:

```bash
curl -s https://cadt-events-api.onrender.com/api/health
# {"status":"ok","env":"production",...}
```

---

## Environment variables

### Backend (`cadt-events-api`)

| Variable | Required | Example / notes |
|----------|----------|-----------------|
| `NODE_ENV` | yes | `production` (set by blueprint) |
| `DATABASE_URL` | yes | Supabase **pooler** URI (`?pgbouncer=true`) |
| `DIRECT_URL` | yes | Supabase direct/session URI (migrations) |
| `CLERK_PUBLISHABLE_KEY` | yes | `pk_test_...` for demos |
| `CLERK_SECRET_KEY` | yes | `sk_test_...` |
| `CLERK_WEBHOOK_SECRET` | recommended | Clerk Dashboard → Webhooks |
| `ADMIN_EMAILS` | yes for demos | Comma-separated teacher emails that get `role=ADMIN` (e.g. `yeakkhai.ly@student.cadt.edu.kh,teacher@cadt.edu.kh`) |
| `FRONTEND_URL` | yes (CORS) | `https://cadt-events-web.onrender.com` |
| `ADMIN_URL` | yes (CORS) | `https://cadt-events-admin.onrender.com` |
| `CLOUDINARY_URL` | optional | image uploads |
| `TELEGRAM_BOT_TOKEN` | optional | bot DMs |

Start command (already in blueprint):

```bash
npm run start:prod   # prisma migrate deploy && node dist/server.js
```

### User frontend (`cadt-events-web`)

| Variable | Required | Notes |
|----------|----------|--------|
| `VITE_CLERK_PUBLISHABLE_KEY` | yes | Same Clerk publishable key |
| `VITE_API_URL` | yes | `https://cadt-events-api.onrender.com/api` |
| `VITE_ADMIN_URL` | optional | admin site URL |
| `VITE_TELEGRAM_BOT_USERNAME` | optional | without `@` |

### Admin frontend (`cadt-events-admin`)

| Variable | Required | Notes |
|----------|----------|--------|
| `VITE_CLERK_PUBLISHABLE_KEY` | yes | Same as user app |
| `VITE_API_URL` | yes | `https://cadt-events-api.onrender.com/api` |
| `VITE_USER_FRONTEND_URL` | yes on deploy | Student app origin for login redirect / sign-out (e.g. `https://cadt-events.vercel.app`) |

### Clerk dashboard checklist

After you have live URLs:

1. **Paths** → add frontend + admin URLs (sign-in / sign-up redirects).
2. **Webhooks** → endpoint `https://cadt-events-api.onrender.com/api/webhooks` (or your actual webhook path).
3. Keep development instance for demos; upgrade only if you need production keys.

### Telegram (production)

If using the bot, set webhook to the public API:

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://cadt-events-api.onrender.com/api/telegram/webhook"
```

(Confirm the exact webhook path in `docs/features/telegram-bot.md`.)

---

## CI (GitHub Actions)

Workflow: `.github/workflows/ci.yml`

On every push/PR to `main`:

| Job | What it does |
|-----|----------------|
| `backend` | `npm ci` → Prisma generate → lint (non-blocking) → `tsc` + `tsc-alias` |
| `frontend` | lint (non-blocking) → Vite production build |
| `frontend-admin` | lint (non-blocking) → Vite production build |

Deploy is **not** done by GitHub Actions. Render auto-deploys on push to the connected branch (usually `main`).

---

## Local production-like smoke test

```bash
# Backend
cd backend
cp .env.example .env   # fill real values
npm ci --legacy-peer-deps
npm run build
NODE_ENV=production npm start
# curl http://localhost:4000/api/health

# Frontends (separate terminals)
cd frontend && npm ci && npm run build && npm run preview
cd frontend-admin && npm ci && npm run build && npm run preview
```

---

## Demo-day tips

1. Hit `/api/health` 1–2 minutes before presenting (wake free tier).
2. Use a **separate** Supabase project for demos if classmates will hammer the DB.
3. Seed a few events with `backend/scripts` so the UI is not empty.
4. Free Render services can pause if the account is inactive — check the dashboard the morning of the demo.

---

## Security notes

- Never commit real `.env` files. Use Render dashboard secrets.
- `backend/.env.example` must stay **placeholders only**.
- If secrets were ever committed, **rotate** them in Supabase, Clerk, Cloudinary, and Telegram.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| API 502 after deploy | Build failed / wrong start command | Check Render logs; ensure `npm run build` + `start:prod` |
| CORS errors in browser | Missing `FRONTEND_URL` / `ADMIN_URL` | Set both on API, redeploy API |
| Frontends call `localhost` | `VITE_API_URL` not set at build | Set env, **clear cache & redeploy** static site |
| Migrations fail | Bad `DIRECT_URL` | Use Supabase session/direct URI, not pooler only |
| Clerk “invalid key” | Wrong env / production vs test mix | Match `pk_test_` with `sk_test_` |
| Cold start timeout | Free tier sleep | Prefetch `/api/health` before demo |
