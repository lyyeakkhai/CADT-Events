# CADT Events Backend Documentation 🚀

A robust, secure, and highly scalable REST API built with **Node.js**, **Express.js**, and **TypeScript** for managing CADT Events. This project leverages **Prisma** as the ORM, **PostgreSQL** as the database, and enforces strict type safety and request validation.

---

## 🌟 Project Highlights & Core Requirements Fulfilled

*   **REST API using Node.js and Express.js**: Fully configured Express server with middleware, CORS, and Rate Limiting.
*   **Strict Separation of Concerns**: Modular architecture separating Routes, Controllers, Services, Schemas, and common Middlewares.
*   **JWT Authentication**: Secure stateless authentication implementation with Access and Refresh tokens.
*   **Role/Permission-based Authorization**: Middlewares engineered to enforce strict `ADMIN` and `STUDENT` roles.
*   **Database connection with Full CRUD Readiness**: Powerful Prisma schema defining `User`, `Event`, `Category`, `Booking`, and `Favorite` resources.
*   **Standardized Error Handling**: Centralized error middleware ensuring consistent HTTP status codes and payloads.
*   **Environment Variable Management**: Configuration centralized in `env.ts` with strict types.
*   **Frontend Integration Readiness**: Pre-configured CORS and standardized JSON responses make it plug-and-play for frontends.

---

## 🔐 Security, Middleware & Architecture

The application implements advanced security and structural patterns:

1.  **Zod Schema Validation Middleware**: Generic reusable middleware that leverages Zod to parse, type-coerce, and strip unknown fields from incoming requests.
2.  **JWT Authentication (`authenticate`)**: Extracts Bearer tokens, verifies signatures, and injects the user's `id`, `email`, and `role` into the Express Request.
3.  **Role-Based Authorization (`requireRole`)**: Factory middleware that blocks access (403 Forbidden) if the user's role does not match the required parameter (e.g., `ADMIN`).
4.  **Application Security**: Integrates `helmet` for HTTP header security and `express-rate-limit` to mitigate brute-force attacks.
5.  **Centralized Custom Error Handling**: Uses a custom `AppError` class alongside Zod's `ZodError` to ensure the API never crashes and always returns a predictable JSON structure.

---

## 🗄️ Database Design (Entity Relationships)

The database is built on PostgreSQL using Prisma. Core entities include:
*   **User**: Supports dual roles (`STUDENT`, `ADMIN`) with unique emails and student IDs.
*   **Event**: Tracks title, location, timestamps, total/available seats, and status (`DRAFT`, `PUBLISHED`, `CANCELLED`, `COMPLETED`).
*   **Booking**: Junction tracking which User booked which Event, generating unique `ticket_code`s.
*   **Favorites & Categories**: Users can favorite events, and events can have multiple categories.
*   **NotificationPreferences & TelegramLink**: Advanced tables primed for user-specific notification channels and bot integrations.

---

## 🛠️ Setup & Execution Instructions

### 1. Environment Configuration
Create a `.env` file in the root of the `backend` directory based on the provided template.

```env
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://user:pass@localhost:5432/cadt_events"
DIRECT_URL="postgresql://user:pass@localhost:5432/cadt_events"
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-characters"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
Push the Prisma schema to your PostgreSQL database and generate the Prisma Client:
```bash
npx prisma db push
npx prisma generate
```

### 4. Run the Server
For local development with hot-reloading:
```bash
npm run dev
```
To build and run in production:
```bash
npm run build
npm run start
```

---

## 📡 Complete API Specification

**Base URL**
- Development: `http://localhost:4000/api`
- Production: `https://your-domain.com/api`

*Note: All protected endpoints require an `Authorization: Bearer <access_token>` header.*

### 1. Auth Routes (`/api/auth`)

*   **POST `/api/auth/register`**
    *   *Body:* `{"name": "John Doe", "email": "john@cadt.edu.kh", "password": "min8chars", "studentId": "CADT2024001"}`
    *   *Response (201):* `{ "user": {...}, "accessToken": "...", "refreshToken": "..." }`
*   **POST `/api/auth/login`**
    *   *Body:* `{"email": "john@cadt.edu.kh", "password": "..."}`
    *   *Response (200):* `{ "user": {...}, "accessToken": "...", "refreshToken": "..." }`
*   **POST `/api/auth/refresh`**
    *   *Body:* `{"refreshToken": "..."}`
    *   *Response (200):* `{ "accessToken": "..." }`
*   **GET `/api/auth/me`** (Protected)
    *   *Response (200):* `{ "id": "...", "name": "...", "email": "...", "role": "STUDENT" }`

### 2. Events Routes (`/api/events`)

*   **GET `/api/events`** (Public)
    *   *Query:* `?page=1&limit=12&search=seminar&category=tech&upcoming=true`
    *   *Response (200):* Paginated list of published events.
*   **GET `/api/events/:id`** (Public)
    *   *Response (200):* Event details (includes `isFavorited` if authenticated).

### 3. Booking Routes (`/api/bookings`) - Protected

*   **POST `/api/events/:id/book`**
    *   *Response (201):* `{ "booking": { "status": "CONFIRMED", "ticketCode": "TKT-abc123", ... } }`
*   **GET `/api/bookings`**
    *   *Query:* `?status=CONFIRMED`
    *   *Response (200):* Array of user's bookings.
*   **DELETE `/api/bookings/:id`**
    *   *Response (200):* `{ "message": "Booking cancelled" }`

### 4. Favorites Routes (`/api/favorites`) - Protected

*   **POST `/api/events/:id/favorite`** -> Add event to favorites.
*   **DELETE `/api/events/:id/favorite`** -> Remove from favorites.
*   **GET `/api/favorites`** -> List user's favorite events.

### 5. Admin Routes (`/api/admin`) - Admin Only

*   **POST / PUT / DELETE `/api/admin/events`** -> Manage events.
*   **GET `/api/admin/events/:id/bookings`** -> View all attendees for an event.
*   **POST `/api/admin/bookings/:id/checkin`** -> Mark a student as attended.
*   **POST `/api/admin/events/:id/notify`** -> Send Telegram push notifications to attendees.
*   **CRUD `/api/admin/categories`** -> Manage event categories.

### 6. Error Response Format
All API errors return a predictable JSON format defined by the centralized error handler:
```json
{
  "error": "Descriptive error message",
  "code": "VALIDATION_ERROR",
  "issues": [
    { "path": "email", "message": "Invalid email format" }
  ]
}
```
**HTTP Status Codes:** `200` OK, `201` Created, `400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found, `409` Conflict, `500` Server Error.
