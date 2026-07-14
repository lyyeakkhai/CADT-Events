# API Specification

## Base URL
- Development: `http://localhost:4000/api`
- Production: `https://your-domain.com/api`

## Authentication
All protected endpoints require `Authorization: Bearer <access_token>` header.

---

## Auth Routes (`/api/auth`)

### POST `/api/auth/register`
Register a new student account.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@cadt.edu.kh",
  "password": "min8chars",
  "studentId": "CADT2024001"
}
```

**Response 201:**
```json
{
  "user": { "id": "...", "name": "...", "email": "...", "role": "STUDENT" },
  "accessToken": "jwt...",
  "refreshToken": "jwt..."
}
```

### POST `/api/auth/login`
**Body:**
```json
{ "email": "john@cadt.edu.kh", "password": "..." }
```

**Response 200:**
```json
{
  "user": { "id": "...", "name": "...", "email": "...", "role": "STUDENT" },
  "accessToken": "jwt...",
  "refreshToken": "jwt..."
}
```

### POST `/api/auth/refresh`
**Body:**
```json
{ "refreshToken": "jwt..." }
```

**Response 200:**
```json
{ "accessToken": "new-jwt..." }
```

### GET `/api/auth/me`
**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{ "id": "...", "name": "...", "email": "...", "role": "STUDENT" }
```

---

## Events Routes (`/api/events`) - Public

### GET `/api/events`
List published events.

**Query:**
- `?page=1&limit=12`
- `?search=seminar`
- `?category=tech`
- `?upcoming=true`

**Response 200:**
```json
{
  "data": [
    {
      "id": "...",
      "title": "AI Seminar",
      "description": "...",
      "imageUrl": "...",
      "location": "Hall A",
      "startDate": "2026-06-01T09:00:00Z",
      "availableSeats": 45,
      "totalSeats": 100,
      "categories": [{ "id": "...", "name": "Tech" }]
    }
  ],
  "pagination": { "page": 1, "limit": 12, "total": 50, "totalPages": 5 }
}
```

### GET `/api/events/:id`
Get single event detail.

**Response 200:** Same as event object above + `isFavorited` (if authenticated).

---

## Booking Routes (`/api/bookings`) - Protected

### POST `/api/bookings`
Book a ticket for an event (body: `{ "eventId": "..." }`). Capacity enforced server-side.

**Response 201:**
```json
{
  "booking": {
    "id": "...",
    "eventId": "...",
    "status": "CONFIRMED",
    "ticketCode": "TKT-abc123",
    "createdAt": "..."
  }
}
```

**Errors:**
- `409` - No seats available
- `409` - Already booked this event

### GET `/api/bookings`
Get my bookings.

**Query:** `?status=CONFIRMED`

**Response 200:**
```json
{
  "data": [
    {
      "id": "...",
      "event": { "id": "...", "title": "...", "startDate": "..." },
      "status": "CONFIRMED",
      "ticketCode": "TKT-abc123",
      "createdAt": "..."
    }
  ]
}
```

### DELETE `/api/bookings/:id`
Cancel a booking (frees up seat).

**Response 200:** `{ "message": "Booking cancelled" }`

---

## Favorites Routes (`/api/favorites`) - Protected

### POST `/api/events/:id/favorite`
Add event to favorites.

**Response 201:** `{ "message": "Added to favorites" }`

### DELETE `/api/events/:id/favorite`
Remove from favorites.

**Response 200:** `{ "message": "Removed from favorites" }`

### GET `/api/favorites`
List my favorite events.

**Response 200:** Array of event objects.

---

## Admin Routes (`/api/admin`) - Admin only

### Events

#### POST `/api/admin/events`
Create event.

**Body:**
```json
{
  "title": "AI Seminar",
  "description": "Learn about AI...",
  "location": "Hall A",
  "startDate": "2026-06-01T09:00:00Z",
  "endDate": "2026-06-01T12:00:00Z",
  "totalSeats": 100,
  "categoryIds": ["cat-id-1", "cat-id-2"],
  "status": "PUBLISHED"
}
```

#### PUT `/api/admin/events/:id`
Update event.

#### DELETE `/api/admin/events/:id`
Delete event.

#### GET `/api/admin/events`
List all events (including drafts).

### Bookings

#### GET `/api/admin/events/:id/bookings`
Get all bookings for an event.

**Response:**
```json
{
  "data": [
    {
      "id": "...",
      "user": { "id": "...", "name": "...", "studentId": "..." },
      "status": "CONFIRMED",
      "ticketCode": "...",
      "checkedIn": false,
      "createdAt": "..."
    }
  ]
}
```

#### POST `/api/admin/bookings/:id/checkin`
Mark booking as attended/checked in.

### Categories

#### GET `/api/admin/categories`
#### POST `/api/admin/categories`
#### PUT `/api/admin/categories/:id`
#### DELETE `/api/admin/categories/:id`

### Notifications

#### POST `/api/admin/events/:id/notify`
Send Telegram notification to all subscribers of an event.

**Body:**
```json
{
  "message": "The AI Seminar location has changed to Hall B."
}
```

---

## Telegram Routes (`/api/telegram`)

### POST `/api/telegram/webhook`
Receive updates from Telegram bot. (Or use polling in dev)

### POST `/api/telegram/link`
Generate a one-time token to link Telegram account.

**Response:** `{ "linkToken": "xyz123" }`

Student sends `/start xyz123` to bot to link.

---

## Error Response Format

```json
{
  "error": "Descriptive error message",
  "code": "SEATS_FULL",
  "details": {} // optional extra info
}
```

**HTTP Status Codes:**
- `200` OK
- `201` Created
- `400` Bad Request (validation error)
- `401` Unauthorized (missing/invalid token)
- `403` Forbidden (not admin)
- `404` Not Found
- `409` Conflict (already booked, no seats)
- `500` Server Error
