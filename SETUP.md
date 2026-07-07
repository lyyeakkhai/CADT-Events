# CADT Events - Setup Guide for New Developers

This guide helps you get the full stack running locally after cloning.

## Prerequisites

- Node.js 20+ (recommended)
- npm
- Access to:
  - Supabase project (or your own Postgres)
  - Clerk account (for auth)
  - (Optional) Cloudinary, Telegram bot

## 1. Clone the Repository

```bash
git clone <your-repo-url>
cd CADT-Events
```

## 2. Backend Setup

```bash
cd backend

# Install dependencies (this will also run `prisma generate`)
npm install

# Copy environment variables
cp .env.example .env
```

### Edit `.env`

You **must** fill in:

- `DATABASE_URL` and `DIRECT_URL` (from Supabase or your Postgres)
- `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET` (if using Clerk webhooks for roles)

**Important:** Because we recently updated the Prisma schema significantly, run:

```bash
# Option A (recommended for development - will reset DB)
npx prisma migrate reset

# Option B (if you don't want to lose data in Supabase)
npx prisma db push
```

Then start the backend:

```bash
npm run dev
```

Backend will run on **http://localhost:4000**

## 3. User Frontend Setup

```bash
cd frontend

npm install

# (Optional) Create env file
cp .env.example .env.local 2>/dev/null || true

npm run dev
```

Runs on **http://localhost:5173**

## 4. Admin Frontend Setup

```bash
cd frontend-admin

npm install

npm run dev
```

Runs on **http://localhost:3000**

## Common Issues & Fixes

### "Prisma Client is not generated" or schema mismatch errors
```bash
cd backend
npx prisma generate
```

### Module not found / alias errors (`@/`)
Make sure you're running `npm install` from the correct folder (`frontend` or `frontend-admin`).

### Clerk role not working (can't access admin)
The backend has a webhook that promotes specific emails to ADMIN.
Currently only `admin123@stuff.cadt.edu.kh` is whitelisted by default.
You can edit `backend/src/modules/webhooks/clerk.routes.ts` to add your email.

After changing, the user must log out and log in again.

### Database errors after pulling
Because the Prisma schema was modernized, you usually need to run:
```bash
npx prisma db push
# or
npx prisma migrate reset
```

### Different ports
- Backend: 4000
- User frontend: 5173 (Vite default)
- Admin frontend: 3000

Update `VITE_API_URL` in the frontends if you change the backend port.

## Recommended Workflow

1. `cd backend && npm run dev`
2. In another terminal: `cd frontend && npm run dev`
3. (For admin work) `cd frontend-admin && npm run dev`

Happy coding!
