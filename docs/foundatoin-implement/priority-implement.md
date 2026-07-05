# Priority Implementation Plan (Foundation Phase)

This document outlines the critical "Priority 0" and "Priority 1" tasks that must be completed before the team begins building individual product features. Executing this plan establishes the core infrastructure, ensuring high velocity and consistency when feature development begins.

---

## Phase 1: Database & Data Layer (P0) (DONE)

**Goal:** Establish the single source of truth for the application.

1. **Initialize PostgreSQL Database**
   - Provision development database using a Supabase project.
   - Define connection strings in `.env`.
2. **Prisma Schema Definition**
   - Define all models (`Users`, `Event`, `Venue`, `Registration`, `Seat_Hold`, etc.) in `schema.prisma`.
   - Run initial migrations (`npx prisma migrate dev`).
3. **Prisma Client Singleton**
   - Create `src/lib/prisma.ts` in the backend.
   - Export a globally instantiated Prisma client to prevent database connection exhaustion.

## Phase 2: Authentication & Identity (P0) (DONE)

**Goal:** Secure the application and provide user context to all future features.

1. **Clerk Configuration**
   - Set up the Clerk application dashboard for the development environment.
2. **Backend Auth Middleware**
   - Install `@clerk/express`.
   - Create middleware to protect routes and inject user identity (`req.auth`) into the request object.
3. **Frontend Auth Providers**
   - Install `@clerk/clerk-react`.
   - Wrap both the `frontend` and `frontend-admin` React roots with `<ClerkProvider>`.
4. **Protected Routes & Guards**
   - Create a `ProtectedRoute` component for React to redirect unauthenticated users to the `/login` route.

## Phase 3: Global Architecture & Standards (P1) (DONE)

**Goal:** Standardize how the frontend communicates with the backend and how data is validated.

1. **Global API Client (Frontend)**
   - Create a standardized fetch wrapper (or Axios instance).
   - Automatically intercept requests to attach the Clerk Bearer token.
   - Handle global errors centrally (e.g., redirect to login on 401 Unauthorized).
2. **Shared Validation (Zod)**
   - Define core Zod schemas for API payloads (e.g., `CreateEventSchema`, `RegisterUserSchema`).
   - Use these schemas on the frontend for form validation and on the backend for request body validation.
3. **Linting & Formatting**
   - Ensure `eslint.config.js/mjs` and Prettier are strictly enforced across all workspaces to prevent merge conflicts.

## Phase 4: UI/UX Foundation (P1) (DONE)

**Goal:** Provide developers with ready-to-use building blocks so they don't have to write custom CSS for every feature.

1. **Tailwind CSS 4 Configuration**
   - Setup global color variables, typography, and theme settings in both React apps.
2. **Component Library (Shadcn/UI)**
   - Initialize Shadcn/UI in the frontend projects.
   - Generate and configure foundational components: `Button`, `Input`, `Dialog/Modal`, `Table`, `Toast/Sonner` (for alerts).

## Phase 5: Infrastructure & Webhooks (P1 / P2) (DONE)

**Goal:** Set up asynchronous task handling and synchronize third-party state.

1. **Redis & BullMQ Setup (P1)**
   - Deploy a local Redis instance.
   - Configure BullMQ worker queues in the backend.
   - *Why now?* Needed early to build and test the 10-minute `Seat_Hold` sweeper logic and background notifications.
2. **Svix Webhook Integration (P2)**
   - Expose a `/api/webhooks/clerk` endpoint on the backend.
   - Verify signatures using `svix` and sync Clerk user creations/updates directly to the local PostgreSQL `Users` table.
3. **Cloudinary Setup (P2)**
   - Configure backend upload utilities using `multer` and Cloudinary SDK.
   - *Why now?* Unblocks UI features that require event banners or user avatars.

---

### Definition of Done for the Foundation Phase
Before moving to feature development, the following must be true:
- [ ] A developer can start the stack (`backend`, `frontend`) and log in successfully.
- [ ] An authenticated request from the frontend reaches the backend, is validated by Clerk middleware, queries the database via Prisma, and returns a successful response.
- [ ] The frontend displays the response using a standardized Shadcn UI component.
