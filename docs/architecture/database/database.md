# Database Schema Design

## Entity Relationship Overview

```
User (1) ───────< (N) Booking >────── (1) Event
  │                                        │
  │ (1)                                    │ (N)
  └──────< (N) Favorite                    │
  │                                        │
  │ (1)                                    │
  └──────< (N) NotificationPreference      │
  │                                        │
  │ (1)                                    │
  └──────< (N) TelegramLink                │
                                            │
Category (1) ───< (N) EventCategory >───(N) Event
```

---

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // hashed with bcrypt
  name      String
  studentId String?  @unique @map("student_id")
  role      Role     @default(STUDENT)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  bookings      Booking[]
  favorites     Favorite[]
  notifications NotificationPreference?
  telegramLink  TelegramLink?

  @@map("users")
}

enum Role {
  STUDENT
  ADMIN
}

// ─────────────────────────────────────────────
// EVENTS
// ─────────────────────────────────────────────
model Event {
  id          String     @id @default(uuid())
  title       String
  description String     @db.Text
  imageUrl    String?    @map("image_url")
  location    String
  startDate   DateTime   @map("start_date")
  endDate     DateTime?  @map("end_date")
  totalSeats  Int        @map("total_seats")
  availableSeats Int     @map("available_seats")
  status      EventStatus @default(DRAFT)
  createdAt   DateTime   @default(now()) @map("created_at")
  updatedAt   DateTime   @updatedAt @map("updated_at")

  // Relations
  categories   EventCategory[]
  bookings     Booking[]
  favorites    Favorite[]

  @@map("events")
}

enum EventStatus {
  DRAFT
  PUBLISHED
  CANCELLED
  COMPLETED
}

// ─────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────
model Category {
  id          String @id @default(uuid())
  name        String @unique
  description String?

  events EventCategory[]

  @@map("categories")
}

model EventCategory {
  eventId    String @map("event_id")
  categoryId String @map("category_id")

  event    Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  category Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@id([eventId, categoryId])
  @@map("event_categories")
}

// ─────────────────────────────────────────────
// BOOKINGS
// ─────────────────────────────────────────────
model Booking {
  id          String        @id @default(uuid())
  userId      String        @map("user_id")
  eventId     String        @map("event_id")
  status      BookingStatus @default(CONFIRMED)
  ticketCode  String        @unique @default(uuid()) @map("ticket_code")
  checkedIn   Boolean       @default(false) @map("checked_in")
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@unique([userId, eventId])
  @@map("bookings")
}

enum BookingStatus {
  CONFIRMED
  CANCELLED
  ATTENDED
}

// ─────────────────────────────────────────────
// FAVORITES (for alerts)
// ─────────────────────────────────────────────
model Favorite {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  eventId   String   @map("event_id")
  createdAt DateTime @default(now()) @map("created_at")

  user  User  @relation(fields: [userId], references: [id], onDelete: Cascade)
  event Event @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@unique([userId, eventId])
  @@map("favorites")
}

// ─────────────────────────────────────────────
// TELEGRAM INTEGRATION
// ─────────────────────────────────────────────
model TelegramLink {
  id        String   @id @default(uuid())
  userId    String   @unique @map("user_id")
  chatId    String   @unique @map("chat_id")
  username  String?
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("telegram_links")
}

// ─────────────────────────────────────────────
// NOTIFICATION PREFERENCES
// ─────────────────────────────────────────────
model NotificationPreference {
  id              String  @id @default(uuid())
  userId          String  @unique @map("user_id")
  eventReminders  Boolean @default(true) @map("event_reminders")
  seatAlerts      Boolean @default(true) @map("seat_alerts")
  newEvents       Boolean @default(true) @map("new_events")
  eventUpdates    Boolean @default(true) @map("event_updates")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notification_preferences")
}
```

---

## Indexes Needed

```sql
-- Fast event lookups by status and date
CREATE INDEX idx_events_status_start ON events(status, start_date);

-- Fast booking lookups by user
CREATE INDEX idx_bookings_user ON bookings(user_id);

-- Fast booking lookups by event
CREATE INDEX idx_bookings_event ON bookings(event_id);

-- Fast favorite lookups
CREATE INDEX idx_favorites_user ON favorites(user_id);
```

## Data Integrity Rules

1. `availableSeats` cannot be negative (enforced in application logic)
2. Booking creation must be atomic: decrement `availableSeats` + create `Booking` row
3. One booking per user per event (`@@unique([userId, eventId])`)
4. Cancelled bookings free up seats immediately
5. Events in `DRAFT` status are not visible to students
