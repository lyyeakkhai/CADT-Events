# CADT-Events — agent notes

## Project layout

Three separate npm packages (not a workspace monorepo):

- `backend/` — Express + TypeScript + Prisma + Supabase Postgres
- `frontend/` — student Vite + React app
- `frontend-admin/` — admin Vite + React app

Always `cd` into the package before `npm install` / `npm run *`.

## Deploy Configuration

| Piece | Host |
|-------|------|
| Database | **Supabase** Postgres |
| Backend API | **Render** (`render.yaml` — API only) |
| Student web | **Vercel** (root dir `frontend/`) |
| Admin web | **Vercel** (root dir `frontend-admin/`) |
| CI | **GitHub Actions** (`.github/workflows/ci.yml`) |

- Production URL (API): `https://cadt-events-api.onrender.com`
- Production URL (web): Vercel student project URL (set after first Vercel deploy)
- Production URL (admin): Vercel admin project URL
- Deploy workflow: push to `main` → CI build; Render + Vercel auto-deploy connected projects
- Post-deploy health check: `https://cadt-events-api.onrender.com/api/health`
- CORS: set Render `FRONTEND_URL` / `ADMIN_URL` to the two Vercel origins

### Custom deploy hooks

- Pre-merge / push: GitHub Actions CI — lint (non-blocking) + **build** all three packages
- CD API: Render auto-deploy on push to connected branch
- CD web/admin: Vercel auto-deploy per project
- Health check: `curl -sf https://cadt-events-api.onrender.com/api/health`

### Deploy docs

Full guide: [`docs/operations/deploy.md`](./docs/operations/deploy.md)

### Backend production start

```bash
cd backend
npm run build        # tsc && tsc-alias (path aliases required)
npm run start:prod   # prisma migrate deploy && node dist/server.js
```

## Local testing mode

```bash
# Terminal 1
cd backend && npm run dev          # http://localhost:4000

# Terminal 2
cd frontend && npm run dev         # http://localhost:5173

# Terminal 3
cd frontend-admin && npm run dev   # http://localhost:3000
```

Env templates: each package’s `.env.example` (placeholders only — never real secrets).

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:

- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec
