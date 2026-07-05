# Phase 1: Database & Data Layer - Design

## 1. Architecture Overview
The data layer will utilize a **PostgreSQL** database hosted on **Supabase**. The backend will interface with the database using **Prisma ORM**, which provides strong TypeScript typings, a declarative schema, and an automated migration system. 

## 2. Database Schema Design
The initial `schema.prisma` will outline the core entities and their relationships. 

### Core Entities
- **Users**: Identity details. (Note: Authentication will be handled by Clerk in Phase 2, so this table will eventually sync with Clerk webhooks).
- **Venue**: Details about the event location (Name, Address, Capacity).
- **Event**: Details about the event itself (Title, Description, Start/End Time, Venue ID).
- **Registration**: A join table mapping Users to Events, representing a confirmed booking or ticket.
- **Seat_Hold**: A table for temporary ticket holds. This handles concurrent registrations by reserving a spot for a set period (e.g., 10 minutes) while the user completes registration.

### ERD Overview (Conceptual)
```
User (1) <---> (M) Registration (M) <---> (1) Event
Venue (1) <---> (M) Event
User (1) <---> (M) Seat_Hold (M) <---> (1) Event
```

## 3. Client Instantiation Strategy
To avoid exhausting PostgreSQL connections, especially during Next.js/Node development where hot module replacement (HMR) repeatedly restarts the server, the Prisma Client will be instantiated as a **Singleton**. 

This singleton will be attached to the Node.js `global` object in development, ensuring that the same connection pool is reused across reloads.

## 4. Environment Configuration
The `.env` file will require the following variables for Prisma to communicate with Supabase:
- `DATABASE_URL`: The transactional connection string (typically a connection pooler URL, like PgBouncer).
- `DIRECT_URL`: A direct, non-pooled connection string required specifically for running Prisma migrations.
