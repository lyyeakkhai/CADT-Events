# CADT-Events — agent notes

## Project layout

Three separate npm packages (not a workspace monorepo):

- `backend/` — Express + TypeScript + Prisma + Supabase Postgres
- `frontend/` — student Vite + React app
- `frontend-admin/` — admin Vite + React app

Always `cd` into the package before `npm install` / `npm run *`.

## Deploy Configuration (configured by /setup-deploy)

- Platform: **Render** (free tier Blueprint via `render.yaml`)
- Production URL (API): `https://cadt-events-api.onrender.com` (confirm after first Blueprint deploy)
- Production URL (web): `https://cadt-events-web.onrender.com`
- Production URL (admin): `https://cadt-events-admin.onrender.com`
- Deploy workflow: auto-deploy on push to the branch connected in Render (usually `main`)
- Deploy status command: HTTP health check
- Merge method: squash
- Project type: web app + API (3 services)
- Post-deploy health check: `https://cadt-events-api.onrender.com/api/health`

### Custom deploy hooks

- Pre-merge: GitHub Actions CI (`.github/workflows/ci.yml`) — lint (non-blocking) + build all three packages
- Deploy trigger: automatic on push to main (Render Blueprint)
- Deploy status: poll `GET /api/health` until HTTP 200
- Health check: `curl -sf https://cadt-events-api.onrender.com/api/health`

### Deploy docs

Full student/demo free-host guide: [`docs/operations/deploy.md`](./docs/operations/deploy.md)

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
