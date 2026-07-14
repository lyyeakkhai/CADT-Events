# UML Specifications and Design Diagrams

This document outlines the Unified Modeling Language (UML) structural and behavioral design specifications for the CADT Events platform. These models detail how components interface, how state transitions happen, and how data structures map out.

---

## 1. Domain Class Diagram

The class diagram maps the data models defined in our Prisma configuration and details their properties, datatypes, and multiplicities.

```mermaid
classDiagram
    class User {
        +String id
        +String email
        +String password
        +String name
        +String studentId
        +Role role
        +DateTime createdAt
        +DateTime updatedAt
    }

    class Event {
        +String id
        +String title
        +String description
        +String imageUrl
        +String location
        +DateTime startDate
        +DateTime endDate
        +Int totalSeats
        +Int availableSeats
        +EventStatus status
        +DateTime createdAt
        +DateTime updatedAt
    }

    class Category {
        +String id
        +String name
        +String description
    }

    class EventCategory {
        +String eventId
        +String categoryId
    }

    class Booking {
        +String id
        +String userId
        +String eventId
        +BookingStatus status
        +String ticketCode
        +Boolean checkedIn
        +DateTime createdAt
        +DateTime updatedAt
    }

    class Favorite {
        +String id
        +String userId
        +String eventId
        +DateTime createdAt
    }

    class TelegramLink {
        +String id
        +String userId
        +String chatId
        +String username
        +DateTime createdAt
    }

    class NotificationPreference {
        +String id
        +String userId
        +Boolean eventReminders
        +Boolean seatAlerts
        +Boolean newEvents
        +Boolean eventUpdates
    }

    class Role {
        <<enumeration>>
        STUDENT
        ADMIN
    }

    class EventStatus {
        <<enumeration>>
        DRAFT
        PUBLISHED
        CANCELLED
        COMPLETED
    }

    class BookingStatus {
        <<enumeration>>
        CONFIRMED
        CANCELLED
        ATTENDED
    }

    %% Associations
    User "1" --> "*" Booking : makes
    Event "1" --> "*" Booking : has
    User "1" --> "*" Favorite : sets_favorite
    Event "1" --> "*" Favorite : favorited_in
    User "1" --> "0..1" TelegramLink : connects
    User "1" --> "0..1" NotificationPreference : configures
    Event "1" --> "*" EventCategory : has_categories
    Category "1" --> "*" EventCategory : categorizes_events
```

---

## 2. Sequence Diagrams

These behavioral models trace exact network transactions across physical server and network bounds.

### 2.1. Concurrency-Safe 1-Click Ticket Booking
This trace demonstrates database locking protocols during ticket booking execution, protecting the system from race conditions when seats are limited.

```mermaid
sequenceDiagram
    autonumber
    actor Student as 👤 Student
    participant FE as 🖥️ Next.js Frontend
    participant BE as ⚙️ Express.js API
    participant DB as 🗄️ PostgreSQL Database
    participant TG as 🤖 Telegram Bot API

    Student->>FE: Click "Book Ticket"
    FE->>BE: POST /api/events/:id/book (Auth Token)
    Note over BE: Authenticate & Authorize Request
    BE->>DB: Begin Transaction (Serializable Isolation)
    BE->>DB: Query existing booking for user & event
    DB-->>BE: [No existing booking]
    BE->>DB: Query availableSeats for event
    DB-->>BE: availableSeats: 5 (seats > 0)
    
    Note over BE: Decrement seat count & create booking atomically
    BE->>DB: Update Event (set availableSeats = 4)
    BE->>DB: Insert Booking (status: CONFIRMED, checkedIn: false)
    BE->>DB: Commit Transaction
    DB-->>BE: Transaction Committed Successfully
    BE-->>FE: 201 Created (Booking Details & TicketCode)
    FE-->>Student: Display Ticket Card & QR Code

    %% Async notification
    opt Telegram Profile Linked
        BE->>DB: Query TelegramLink for userId
        DB-->>BE: Returns chatId: "123456"
        BE->>TG: sendMessage(chatId, markdownMessage)
        TG-->>Student: 💬 Receive Booking Confirmation DM
    end
```

### 2.2. Telegram Account Linkage Flow
Demonstrates the secure handoff of verification tokens from web sessions to direct bot messages.

```mermaid
sequenceDiagram
    autonumber
    actor Student as 👤 Student
    participant FE as 🖥️ Next.js Frontend
    participant BE as ⚙️ Express.js API
    participant DB as 🗄️ PostgreSQL Database
    participant Bot as 🤖 Telegram Bot

    Student->>FE: Click "Link Telegram" in Settings
    FE->>BE: POST /api/telegram/link (Auth Token)
    Note over BE: Validate User Context
    Note over BE: Generate Temporary Link Token (UUID Hash)
    BE->>DB: Store linkToken in cache/database (TTL 5 mins)
    DB-->>BE: Success
    BE-->>FE: 201 Created (linkToken: "xyz123")
    FE-->>Student: Display Bot Connection link (t.me/Bot?start=xyz123)

    Student->>Bot: Click Start / Send "/start xyz123"
    Bot->>BE: Webhook payload update (chatId, text: "/start xyz123")
    Note over BE: Parse token "xyz123"
    BE->>DB: Match and validate linkToken
    DB-->>BE: Return active user (userId: "user-id-abc")
    
    Note over BE: Associate Account Link
    BE->>DB: Create TelegramLink record (userId, chatId, username)
    BE->>DB: Invalidate linkToken
    DB-->>BE: Done
    BE-->>Bot: HTTP 200 OK (Acknowledge)
    Bot-->>Student: 💬 Send DM: "Your Telegram is now linked!"
    Note over FE: SWR/Polling detects update
    FE-->>Student: Settings UI updates to "Linked (username)"
```

---

## 3. State Diagrams

These diagrams detail the state lifecycles for the central entities of the system.

### 3.1. Event Lifecycle
```mermaid
stateDiagram-v2
    [*] --> DRAFT : Create Event (Draft status default)
    DRAFT --> PUBLISHED : Publish Event (Admin Action)
    DRAFT --> [*] : Delete Event
    
    PUBLISHED --> COMPLETED : Event End Time Reached
    PUBLISHED --> CANCELLED : Cancel Event (Admin Action)
    
    CANCELLED --> [*] : Archive
    COMPLETED --> [*] : Archive
```

### 3.2. Booking Ticket Lifecycle
```mermaid
stateDiagram-v2
    [*] --> CONFIRMED : Student Books Ticket (Seats available)
    CONFIRMED --> ATTENDED : Check-In at Door (Admin Action)
    CONFIRMED --> CANCELLED : Cancel Booking (Student Action)
    
    ATTENDED --> CONFIRMED : Reset Check-in (Admin Override)
    
    CANCELLED --> [*] : Free Seat capacity
    ATTENDED --> [*] : Archive
```

---

## 4. Component / Deployment Diagram

This deployment representation demonstrates the physical tiers and communication protocols binding them together.

```mermaid
flowchart TB
    subgraph ClientSide ["Client Tier"]
        Browser["🖥️ Web Browser (Next.js SPA / React Client)"]
        TelegClient["📱 Telegram Mobile / Desktop Application"]
    end

    subgraph ServiceSide ["Application Tier"]
        NextServer["🌐 Next.js SSR / Routing Web Server"]
        ExpressServer["⚙️ Express.js REST API Engine Server"]
        CronRunner["⏰ Cron Job Scheduler Process (node-cron)"]
    end

    subgraph DatabaseSide ["Data Tier"]
        Postgres["🗄️ PostgreSQL Database Instance (Supabase)"]
    end

    subgraph ExternalServices ["External Systems API"]
        TelegramBotAPI["🤖 Telegram Bot API Server Gateway"]
    end

    %% Connections
    Browser -->|HTTPS / REST API calls| ExpressServer
    Browser -->|HTTP Server-Side Pages| NextServer
    NextServer -->|Internal API Requests| ExpressServer
    
    ExpressServer -->|Prisma Client ORM| Postgres
    CronRunner -->|Prisma Client ORM| Postgres
    
    ExpressServer -->|HTTPS Requests| TelegramBotAPI
    TelegramBotAPI -->|Webhooks Payload Delivery| ExpressServer
    
    TelegClient -->|Chat Updates| TelegramBotAPI
    TelegramBotAPI -->|Push alerts DMs| TelegClient
```
