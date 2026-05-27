# CADT Events App - Implementation Plan

## Overview
Fullstack event management platform for CADT (school events/seminars). Students browse events, book tickets, and receive Telegram alerts. Admins manage events, seats, and send notifications.

**Tech Stack:**
- **Frontend:** Next.js 16 + React 19 + Tailwind CSS 4 + TypeScript
- **Backend:** Express + TypeScript + Prisma ORM + PostgreSQL
- **Notifications:** Telegram Bot API (node-telegram-bot-api)
- **Validation:** Zod (shared schemas where possible)

---

## Phase 1: Foundation (Day 1-2)

### Backend Setup
| Task | Status | Notes |
|------|--------|-------|
| Prisma schema complete | PENDING | All models defined |
| Database migration | PENDING | `npx prisma migrate dev` |
| Prisma Client singleton | PENDING | `src/lib/prisma.ts` |
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
- **POST** `/api/admin/events` - Create event
- **PUT** `/api/admin/events/:id` - Update event
- **DELETE** `/api/admin/events/:id` - Delete event
- **GET** `/api/admin/events` - List all events (admin view)
- **GET** `/api/admin/events/:id/bookings` - View bookings for event
- **PUT** `/api/admin/events/:id/seats` - Update available seats

**Frontend:**
- Admin dashboard (`/admin`)
- Event create/edit form (`/admin/events/new`, `/admin/events/:id/edit`)
- Bookings table per event

### 3. Event Discovery (Student)
- **GET** `/api/events` - List published events (filter: upcoming, category, search)
- **GET** `/api/events/:id` - Event detail
- **GET** `/api/events/:id/related` - Related events

**Frontend:**
- Home page with event cards (`/`)
- Event detail page (`/events/:id`)
- Search & filter sidebar

### 4. Ticket Booking
- **POST** `/api/events/:id/book` - Book a ticket (decrement seat atomically)
- **GET** `/api/bookings` - My bookings
- **DELETE** `/api/bookings/:id` - Cancel booking (increment seat back)
- **GET** `/api/bookings/:id/ticket` - Get ticket QR/code

**Frontend:**
- Book button on event detail
- My bookings page (`/dashboard/bookings`)
- Ticket display with QR

---

## Phase 3: Telegram Notifications (Day 6-7)

### Features
- Student links Telegram account via bot `/start` command
- Bot stores `chat_id` in User table
- Notification triggers:
  1. **Event reminder** - 24h before subscribed event
  2. **Seat alert** - When favorite event has few seats left
  3. **New event** - Alert for subscribed categories
  4. **Booking confirmation** - Instant after booking
  5. **Event update** - When event details change

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
- Admin analytics dashboard (booking stats)
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
