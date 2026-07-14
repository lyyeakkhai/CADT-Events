# CADT Events App - Implementation Plan

## Overview
Fullstack event management platform for CADT (school events/seminars). Students browse events, book specific seats, and receive automated Telegram alerts. Admins manage events, layouts, and send notifications.

**Tech Stack:**
- **Frontend:** React 19 + Vite + Tailwind CSS 4 + TypeScript
- **Backend:** Express + TypeScript + Prisma ORM + PostgreSQL
- **Background Jobs:** Redis + BullMQ (for scheduled notifications and seat hold sweeping)
- **Notifications:** Telegram Bot API (node-telegram-bot-api)
- **Validation:** Zod (shared schemas where possible)

---

## Phase 1: Foundation (Day 1-2)

### Backend Setup
| Task | Status | Notes |
|------|--------|-------|
| Prisma schema complete | PENDING | Models including `Seat_Hold` |
| Database migration | PENDING | `npx prisma migrate dev` |
| Prisma Client singleton | PENDING | `src/lib/prisma.ts` |
| Redis & BullMQ Setup | PENDING | Configure connection & worker queues |
| JWT auth middleware | PENDING | Access + refresh tokens |
| Password hashing (bcrypt) | PENDING | User registration/login |
| Role-based access control | PENDING | `student`, `admin` enum |

### Frontend Setup
| Task | Status | Notes |
|------|--------|-------|
| Shadcn/ui init | PENDING | `npx shadcn@latest init` |
| API client setup | PENDING | Fetch wrapper with auth headers |
| Auth context/provider | PENDING | Login state, token refresh |
| Route guards | PENDING | Protect /admin, /dashboard |

### Telegram Bot Setup
| Task | Status | Notes |
|------|--------|-------|
| Bot registration | PENDING | @BotFather |
| Webhook or polling | PENDING | Polling for dev, webhook for prod |
| Store chat_id mapping | PENDING | Link Telegram to user account |

---

## Phase 2: Core Features (Day 3-5)

### 1. Authentication System
- **POST** `/api/auth/register` - Student signup (name, email, password, student_id)
- **POST** `/api/auth/login` - Login, return JWT
- **POST** `/api/auth/refresh` - Refresh access token
- **GET** `/api/auth/me` - Get current user

**Frontend:**
- Login page (`/login`)
- Register page (`/register`)

### 2. Event Management (Admin)
- **POST** `/api/admin/events` - Create event (with venue, seat layouts, speakers)
- **PUT** `/api/admin/events/:id` - Update event
- **DELETE** `/api/admin/events/:id` - Delete event (Soft delete)
- **GET** `/api/admin/events` - List all events (admin view)
- **GET** `/api/admin/events/:id/bookings` - View bookings for event
- **GET** `/api/admin/events/:id/export` - Export attendee list to CSV/Excel
- **PUT** `/api/admin/users/:id/block` - Block/Manage users

**Frontend:**
- Admin dashboard (`/admin`)
- Event create/edit form (`/admin/events/new`, `/admin/events/:id/edit`)
- Bookings table per event with Export button
- User moderation interface

### 3. Event Discovery (Student)
- **GET** `/api/events` - List published events (filter: upcoming, category, search)
- **GET** `/api/events/:id` - Event detail
- **GET** `/api/events/:id/related` - Related events

**Frontend:**
- Home page with featured events slider (`/`)
- Event detail page (`/events/:id`)
- Search & filter sidebar

### 4. Ticket Booking & Seat Holds
- **POST** `/api/events/:id/hold` - Select seat and create `Seat_Hold` (locks for 10 mins)
- **POST** `/api/events/:id/book` - Confirm booking (consumes hold, generates Registration & QR)
- **GET** `/api/bookings` - My bookings
- **DELETE** `/api/bookings/:id` - Cancel booking (increment seat back)
- **GET** `/api/bookings/:id/ticket` - Get ticket QR/code

**Background Worker:**
- **Seat Sweeper Job**: Runs every minute to release `Seat_Hold` locks older than 10 minutes.

**Frontend:**
- Visual seat layout selector
- 10-minute countdown timer on booking page
- My bookings page (`/dashboard/bookings`)
- Ticket display with QR

---

## Phase 3: Telegram Notifications (Day 6-7)

### Features
- Student links Telegram account via bot `/start` command
- Bot stores `chat_id` in User table
- Notification triggers:
  1. **Event reminder** - 24 hours AND 30 minutes before subscribed event (Scheduled via BullMQ)
  2. **Seat alert** - When favorite event has few seats left
  3. **New event** - Alert for subscribed categories
  4. **Booking confirmation** - Instant after booking
  5. **Event update** - When event schedule/location changes (Broadcast)

### API Endpoints
- **POST** `/api/telegram/webhook` - Receive bot updates
- **POST** `/api/admin/notify` - Admin broadcast to event subscribers
- **GET** `/api/telegram/link` - Get link token for Telegram auth

### Frontend
- Telegram connect button in profile/settings
- Subscription preferences (which alerts to receive)

---

## Phase 4: Polish (Day 8-10)

- QR code generation for tickets
- Event categories/tags
- Pagination on all list endpoints
- Image upload for events (Cloudinary or local)
- Admin analytics dashboard (historical data, engagement rates)
- Responsive mobile design
- Dark mode toggle
- Error boundaries & loading states

---

## Database Schema

See: [../architecture/database.md](../architecture/database.md)

## API Specification

See: [../api/api-spec.md](../api/api-spec.md)

## Frontend Architecture

See: [../architecture/frontend.md](../architecture/frontend.md)

## Telegram Bot Plan

See: [../features/telegram-bot.md](../features/telegram-bot.md)

## Project Structure

See: [../architecture/project-structure.md](../architecture/project-structure.md)

---

## Quick Start Commands

```bash
# Backend
cd backend
npm install
npx prisma migrate dev
npm run dev          # http://localhost:4000

# Worker (Background Jobs)
# Start Redis locally (e.g., via Docker)
docker run -d -p 6379:6379 redis
npm run worker       # Assuming a separate script for BullMQ worker

# Frontend
cd frontend
npm install
npm run dev          # http://localhost:3000

# Generate Prisma Client
npx prisma generate
```

## Environment Variables

### Backend `.env`
```
DATABASE_URL="postgresql://user:pass@localhost:5432/cadt_events"
DIRECT_URL="postgresql://user:pass@localhost:5432/cadt_events"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-refresh-secret"
TELEGRAM_BOT_TOKEN="your-bot-token"
PORT=4000
NODE_ENV=development
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```
