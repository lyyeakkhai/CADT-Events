# CADT Events - System Design & Specification

## 1. Feature Objectives
The primary objective is to build a centralized, robust, and scalable event management platform for CADT (university). The system caters to students, staff, external participants, and administrators.

### Core Goals:
- **Centralization:** A single source of truth for all academic, professional, and social events at the university.
- **Seamless User Experience (UX):** Intuitive browsing, discovering, booking, and check-in processes.
- **Engagement & Retention:** Implement a credit system to incentivize student participation.
- **Proactive Communication:** Automated Telegram reminders for upcoming events (1 day & 30 mins prior).
- **Administrative Control:** Comprehensive dashboard for CRUD operations, user management, schedule adjustments, and data exporting.

---

## 2. Detailed User Journeys

### 2.1 Student / Attendee Journey
1. **Onboarding & Authentication:**
   - User signs up/logs in using their university email.
   - User links their Telegram account to receive notifications.
2. **Discovery:**
   - User lands on the **Home Page**.
   - Browses a featured slider of high-priority events (`is_featured = true`).
   - Uses filters (by department, event type, date) or the search bar to find specific events.
3. **Event Engagement:**
   - User clicks an event to view the **Event Detail Page** (description, speaker bios, agenda, location, capacity).
   - User clicks the **"Book Now"** button.
4. **Booking & Seat Selection:**
   - User is redirected to the **Booking Page**.
   - User selects a specific seat from a visual layout (creates a `Seat_Hold` lock for 10 minutes to prevent double booking).
   - User fills in any required registration info and confirms.
5. **Ticketing & Cart:**
   - On confirmation, the system generates a `Registration` record and a unique `qr_code_token`.
   - User is redirected to their **Tickets/Cart Page** where they can see their confirmed pass.
6. **Pre-Event Notification:**
   - 1 day before, and 30 minutes before the event, the background worker sends a message to the user's Telegram.
7. **Check-In & Reward:**
   - User arrives at the venue and presents their QR code.
   - Staff/Admin scans the QR code (`checked_in_at` timestamp is recorded).
   - The system automatically adds the event's "credit value" to the user's profile.

### 2.2 Administrator Journey
1. **Event Creation & Management:**
   - Admin logs in and navigates to the **Event Dashboard**.
   - Admin creates a new event, assigning venues, allocating seat layouts, and attaching speakers.
2. **Monitoring & Moderation:**
   - Admin tracks real-time registrations and seat availability.
   - Admin can view the list of all registered users for an event and export this list to CSV/Excel.
   - Admin can manage user accounts, block or delete inactive/violating users.
3. **Adjustments:**
   - Admin updates the schedule or location of an event. The system immediately queues an update notification to all registered attendees.
4. **Analytics:**
   - Admin exports historical event data to analyze department engagement and student attendance rates.

---

## 3. Database Design Review & Best Practices

Your initial entity design provides a strong foundation. However, to ensure it is **fast, scalable, and follows enterprise best practices**, several optimizations and structural changes are required.

### 3.1 Feedback & Missing Columns
1. **Telegram Integration (Missing):** To send Telegram alerts, the `User` table needs a `telegram_chat_id` to store the connection to the bot.
2. **Credits System (Missing):** The objective states users get credits upon attendance. `User` needs a `total_credits` field, and `Event` needs a `credit_value` field.
3. **Many-to-Many Speakers (Optimization):** An event often has a panel of multiple speakers. Storing `speaker_id` inside `Event` restricts you to 1 speaker per event. We need an `Event_Speaker` pivot table.
4. **Seat Concurrency (Excellent):** Your `Seat_Hold` concept is an excellent enterprise pattern for preventing double bookings. (Note: In highly scalable systems, this is often moved to Redis for speed, but a DB table is perfectly fine for university scale).
5. **Soft Deletes (Best Practice):** If an admin "deletes" a user, deleting the row will break foreign keys in `Registration`. Use `deleted_at` timestamps for Soft Deletes on `User`, `Event`, and `Registration`.
6. **Cart Requirement:** Your objective mentions redirecting to a "Cart". If events are paid or multiple can be booked at once, a Cart model is needed. Assuming they are free university events, the "Cart" is essentially the user's "My Tickets" view powered by the `Registration` table.
7. **Indexes:** Add Database Indexes to foreign keys and lookup columns (like `start_timestamp`) so queries remain fast as data grows.

---

## 4. Optimized SQL Schema (Relational Design)

Here is the refined schema incorporating best practices (suitable for PostgreSQL or MySQL):

```sql
-- 1. Department
CREATE TABLE Department (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE
);

-- 2. User
CREATE TABLE Users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'student', 'staff', 'external', 'admin'
    department_id BIGINT REFERENCES Department(id),
    student_staff_id VARCHAR(100) UNIQUE,
    organization VARCHAR(255),
    avatar_url VARCHAR(500),
    telegram_chat_id VARCHAR(255), -- NEW: For Bot Notifications
    total_credits INT DEFAULT 0,   -- NEW: Accumulated credits
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP           -- NEW: Soft delete
);

-- 3. Speaker
CREATE TABLE Speaker (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title_role VARCHAR(255),
    organization VARCHAR(255),
    bio TEXT,
    profile_image_url VARCHAR(500)
);

-- 4. Venue
CREATE TABLE Venue (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_capacity INT NOT NULL
);

-- 5. Event
CREATE TABLE Event (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    venue_id BIGINT REFERENCES Venue(id),
    department_id BIGINT REFERENCES Department(id),
    event_type VARCHAR(50), 
    status VARCHAR(50) DEFAULT 'published', -- NEW: 'draft', 'published', 'cancelled'
    start_timestamp TIMESTAMP NOT NULL,
    end_timestamp TIMESTAMP NOT NULL,
    credit_value INT DEFAULT 0,             -- NEW: Credits earned by attending
    cover_image_url VARCHAR(500),
    badge_text VARCHAR(100),
    is_featured BOOLEAN DEFAULT FALSE,
    admin_id BIGINT REFERENCES Users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- NEW: Event_Speaker (Many-to-Many Pivot)
CREATE TABLE Event_Speaker (
    event_id BIGINT REFERENCES Event(id) ON DELETE CASCADE,
    speaker_id BIGINT REFERENCES Speaker(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, speaker_id)
);

-- 6. Venue_Seat
CREATE TABLE Venue_Seat (
    id BIGSERIAL PRIMARY KEY,
    venue_id BIGINT REFERENCES Venue(id) ON DELETE CASCADE,
    seat_label VARCHAR(50) NOT NULL,
    seating_zone VARCHAR(50)
);

-- 7. Event_Seat
CREATE TABLE Event_Seat (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT REFERENCES Event(id) ON DELETE CASCADE,
    venue_seat_id BIGINT REFERENCES Venue_Seat(id),
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'held', 'occupied'
    UNIQUE (event_id, venue_seat_id)
);

-- 8. Seat_Hold (Concurrency Lock)
CREATE TABLE Seat_Hold (
    id BIGSERIAL PRIMARY KEY,
    event_seat_id BIGINT REFERENCES Event_Seat(id) UNIQUE,
    user_id BIGINT REFERENCES Users(id),
    held_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- 9. Registration (Tickets / Cart)
CREATE TABLE Registration (
    id BIGSERIAL PRIMARY KEY,
    booking_reference_id VARCHAR(100) UNIQUE NOT NULL,
    user_id BIGINT REFERENCES Users(id),
    event_id BIGINT REFERENCES Event(id),
    event_seat_id BIGINT REFERENCES Event_Seat(id) UNIQUE,
    qr_code_token VARCHAR(255) UNIQUE NOT NULL,
    checked_in_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 10. Favorite
CREATE TABLE Favorite (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES Users(id) ON DELETE CASCADE,
    event_id BIGINT REFERENCES Event(id) ON DELETE CASCADE,
    UNIQUE (user_id, event_id)
);

-- 11. Notification
CREATE TABLE Notification (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES Users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes --
CREATE INDEX idx_event_start ON Event(start_timestamp);
CREATE INDEX idx_event_featured ON Event(is_featured);
CREATE INDEX idx_registration_user ON Registration(user_id);
CREATE INDEX idx_registration_token ON Registration(qr_code_token);
```

---

## 5. Architectural Services & Missing Parts

To make this robust and meet the user requirements, the system requires more than just a database. You need the following background services:

### 5.1 Background Job Worker (Cron / Message Queue)
- **Why?** To handle the "1 day or 30 mins before" Telegram notifications.
- **How?** Use a message broker like **Redis + BullMQ (Node.js)** or **Celery (Python/Django)**. 
- **Implementation:** When an event is created, schedule two jobs: `event_time - 24h` and `event_time - 30m`. The worker picks up these jobs, queries the `Registration` table for all users attending, and fires off messages to the Telegram Bot API.

### 5.2 Telegram Bot Webhook Service
- **Why?** To map CADT users to their Telegram accounts.
- **How?** Provide a button on the User Profile: *"Link Telegram"*. This generates a unique code (e.g., `/start token123`). The user messages this to your bot. Your backend Webhook receives the message, reads the token, and saves the user's `telegram_chat_id` to their row in the `Users` table.

### 5.3 Seat Hold Sweeper
- **Why?** Seats are locked in `Seat_Hold` for 10 minutes. If a user abandons the booking page, the seat must become available again.
- **How?** A background cron job running every 1 minute that deletes rows in `Seat_Hold` where `expires_at < NOW()` and updates the corresponding `Event_Seat.status` back to `'available'`. (Alternatively, use Redis TTL keys for holds).

### 5.4 Check-In Webhook / API
- **Why?** Scanning a QR code must instantly award credits.
- **How?** An endpoint `/api/check-in` that takes the `qr_code_token`. It updates `Registration.checked_in_at = NOW()`, finds the `credit_value` of the event, and performs an atomic increment: `UPDATE Users SET total_credits = total_credits + X WHERE id = Y`.
