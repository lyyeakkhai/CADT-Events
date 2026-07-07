# CADT Events - Complete Setup Guide

**Goal:** Get the full stack (Backend + User Frontend + Admin Frontend) running locally with zero friction.

This guide is written so that an AI assistant (Claude, Grok, Cursor, etc.) can read it and successfully set up the project for you.

---

## Project Overview

This is a full-stack event management platform for CADT:

- **Backend** (`backend/`) — Express + TypeScript + Prisma + PostgreSQL (hosted on Supabase)
- **User Frontend** (`frontend/`) — React + Vite (students browse and book events)
- **Admin Frontend** (`frontend-admin/`) — Separate React + Vite app (admin creates, publishes, and manages events)

**Important:** These are **three separate projects**. You must run `npm install` inside each folder.

---

## ⚠️ Critical Warning — Recent Breaking Changes

We recently updated the Prisma schema significantly to support the Admin create/publish event workflow.

**After pulling the latest code, you will almost always need to run database migration commands.**

Failing to do this is the #1 cause of "dependency errors" and runtime crashes.

---

## Prerequisites

- Node.js **20+** (LTS recommended)
- npm (comes with Node)
- Git
- A Supabase project (or local Postgres)
- A Clerk account (https://clerk.com)

---

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <repo-url>
cd CADT-Events
```

### 2. Backend Setup (Most Important)

```bash
cd backend

# Install all dependencies
# This will automatically run `prisma generate` thanks to postinstall script
npm install

# Create your environment file
cp .env.example .env
```

#### Edit `backend/.env`

You **must** provide these values:

```env
NODE_ENV=development
PORT=4000

# Supabase (use the values from your Supabase project)
DATABASE_URL="postgresql://postgres.xxx:password@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:password@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Clerk (from https://dashboard.clerk.com → API Keys)
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxx

# Clerk Webhook (required for admin role assignment)
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx   # Optional but recommended

# Optional services
CLOUDINARY_URL=...
TELEGRAM_BOT_TOKEN=...
```

### 3. Apply Database Schema (Critical Step)

Because the Prisma schema was modernized, run one of these:

**Recommended for development (resets database):**

```bash
npx prisma migrate reset
```

**If you don't want to delete data in Supabase:**

```bash
npx prisma db push
```

Then regenerate the client (usually not needed after above):

```bash
npx prisma generate
```

Start the backend:

```bash
npm run dev
```

✅ Backend should be running at **http://localhost:4000**

---

### 4. User Frontend Setup

Open a **new terminal**:

```bash
cd frontend

npm install

# Create environment file
cp .env.example .env.local
```

Edit `frontend/.env.local`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxx
VITE_API_URL=http://localhost:4000/api
```

Start it:

```bash
npm run dev
```

✅ Runs at **http://localhost:5173**

---

### 5. Admin Frontend Setup

Open another **new terminal**:

```bash
cd frontend-admin

npm install
```

Create `frontend-admin/.env.local` (recommended):

```env
VITE_API_URL=http://localhost:4000/api
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxx
```

Start it:

```bash
npm run dev
```

✅ Runs at **http://localhost:3000**

---

## Running Order (Recommended)

1. Terminal 1: `cd backend && npm run dev`
2. Terminal 2: `cd frontend && npm run dev`
3. Terminal 3: `cd frontend-admin && npm run dev`

Always start the **backend first**.

---

## Clerk Authentication & Admin Access

The project uses **Clerk** for authentication.

### How Admin Role Works

1. User signs up/logs in via Clerk.
2. Backend webhook (`/api/webhooks`) checks the email.
3. If the email is in the whitelist, it sets `publicMetadata.role = "ADMIN"`.

**Current default admin email:**
`admin123@stuff.cadt.edu.kh`

### To Give Yourself Admin Access

1. Go to `backend/src/modules/webhooks/clerk.routes.ts`
2. Add your email to this array:

```ts
const adminEmails = ['admin123@stuff.cadt.edu.kh', 'your.email@stuff.cadt.edu.kh'];
```

3. Save the file (backend will hot-reload).
4. **Log out completely** from Clerk in both frontends.
5. Log in again.

You should now be able to access the Admin dashboard at `http://localhost:3000`.

---

## Testing the Admin Create & Publish Flow

After everything is running:

1. Go to Admin app: `http://localhost:3000`
2. Login with an admin account
3. Click **"Add New Event"**
4. Fill in the form (Title, Description, Start time, Location, etc.)
5. Click **"Publish Event"**

The event should appear in:
- Admin Dashboard
- User Frontend (Discover page) if published

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable                    | Required | Description                          |
|----------------------------|----------|--------------------------------------|
| `DATABASE_URL`             | Yes      | Supabase pooler URL                  |
| `DIRECT_URL`               | Yes      | Supabase direct URL                  |
| `CLERK_PUBLISHABLE_KEY`    | Yes      | Clerk public key                     |
| `CLERK_SECRET_KEY`         | Yes      | Clerk secret key                     |
| `CLERK_WEBHOOK_SECRET`     | Recommended | For role assignment webhook       |
| `PORT`                     | No       | Default: 4000                        |

### User Frontend (`frontend/.env.local`)

| Variable                        | Required | Default                     |
|--------------------------------|----------|-----------------------------|
| `VITE_CLERK_PUBLISHABLE_KEY`   | Yes      | -                           |
| `VITE_API_URL`                 | No       | `http://localhost:4000/api` |

### Admin Frontend (`frontend-admin/.env.local`)

| Variable                        | Required | Default                     |
|--------------------------------|----------|-----------------------------|
| `VITE_API_URL`                 | No       | `http://localhost:4000/api` |
| `VITE_CLERK_PUBLISHABLE_KEY`   | Yes      | -                           |

---

## Common Errors & Fixes

### 1. Prisma Errors ("Client not generated", "Unknown field", schema mismatch)

```bash
cd backend
npx prisma generate
npx prisma db push     # or migrate reset
```

### 2. "Failed to resolve import" or `@/` alias errors

- You ran `npm install` from the wrong folder.
- Solution: `cd` into `frontend` or `frontend-admin`, then run `npm install` again.

### 3. "Module not found" after pulling

Run `npm install` again in the affected folder.

### 4. Clerk login not working / role not recognized

- Make sure `VITE_CLERK_PUBLISHABLE_KEY` is correct in `.env.local`
- Add your email to the admin whitelist in `backend/src/modules/webhooks/clerk.routes.ts`
- Fully log out and log back in

### 5. Backend can't connect to Supabase

- Use the **correct** `DATABASE_URL` and `DIRECT_URL` from Supabase dashboard
- Make sure you are using the **pooler** URL for `DATABASE_URL`
- Check if your IP is allowed in Supabase (or use connection pooling)

### 6. Admin dashboard redirects or shows nothing

- You are not logged in as ADMIN
- Check browser console for role in Clerk user metadata

### 7. Port already in use

- Change port in `.env` or kill the process using the port

---

## Project Structure (Quick Reference)

```
CADT-Events/
├── backend/                 # Express API + Prisma
│   ├── prisma/schema.prisma
│   └── src/
├── frontend/                # Student-facing app (Vite)
│   └── src/
├── frontend-admin/          # Admin dashboard (Vite)
│   └── src/views/CreateEventView.tsx   ← Main file for creating events
├── SETUP.md
└── docs/
```

---

## After `git pull` (Important)

Whenever you pull latest code:

```bash
# In backend
cd backend
npm install
npx prisma generate
npx prisma db push     # or migrate reset
```

Then restart all services.

---

## For AI Assistants Reading This File

If you are an AI helping set this up:

1. Always `cd` into the correct folder before running npm commands.
2. Backend must be running before testing frontends.
3. After any Prisma schema change, run `prisma db push` or `migrate reset`.
4. Admin features require proper Clerk role setup via webhook.
5. The main admin creation flow lives in `frontend-admin/src/views/CreateEventView.tsx`.
6. All API calls go through the Axios client that attaches Clerk tokens automatically.

Follow the numbered steps in order. Do not skip the database migration section.

---

## Quick Commands Cheat Sheet

```bash
# Backend
cd backend && npm run dev

# User Frontend
cd frontend && npm run dev

# Admin Frontend
cd frontend-admin && npm run dev

# Fix database after pull
cd backend && npx prisma db push

# Full reset (development only)
cd backend && npx prisma migrate reset
```

---

**You are now ready.** 

Start with the Backend setup, then the two frontends. Everything should work if you follow the database step.

If you still get errors, copy the exact error message and ask your AI to re-read this `SETUP.md` file.