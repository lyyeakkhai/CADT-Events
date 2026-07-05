# Phase 1: Database & Data Layer - Implementation Plan

## Step 1: Initialize Database & Environment Variables
1. **Provision Database**: Create a new Supabase project to provision the PostgreSQL database.
2. **Retrieve Credentials**: From the Supabase dashboard, obtain the connection pooler URL and the direct connection URL.
3. **Configure Environment**: 
   - Create a `.env` file at the root of the backend directory (or monorepo root depending on setup).
   - Add the connection strings:
     ```env
     # Transactional connection for querying
     DATABASE_URL="postgres://[db-user]:[password]@[host]:[port]/[db-name]?pgbouncer=true"
     # Direct connection for migrations
     DIRECT_URL="postgres://[db-user]:[password]@[host]:[port]/[db-name]"
     ```
   - Ensure `.env` is added to `.gitignore`.

## Step 2: Install and Configure Prisma
1. Navigate to the backend directory.
2. Install the Prisma CLI and Prisma Client:
   ```bash
   npm install prisma --save-dev
   npm install @prisma/client
   ```
3. Initialize the Prisma configuration:
   ```bash
   npx prisma init
   ```
   This will generate a `prisma/schema.prisma` file and update the `.env`.

## Step 3: Define the Schema and Migrate
1. Open `prisma/schema.prisma` and configure it to use the `DIRECT_URL` for migrations:
   ```prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```
2. Define the initial models: `Users`, `Event`, `Venue`, `Registration`, and `Seat_Hold`.
3. Run the initial migration to create the tables in the Supabase database:
   ```bash
   npx prisma migrate dev --name init_core_models
   ```
4. Generate the Prisma Client typings:
   ```bash
   npx prisma generate
   ```

## Step 4: Create Prisma Client Singleton
1. Create a new file in the backend at `src/lib/prisma.ts`.
2. Implement the singleton pattern to instantiate the Prisma client securely:
   ```typescript
   import { PrismaClient } from '@prisma/client';

   // Attach Prisma to the global object in development to prevent connection exhaustion
   const globalForPrisma = global as unknown as { prisma: PrismaClient };

   export const prisma =
     globalForPrisma.prisma ||
     new PrismaClient({
       log: ['query', 'error', 'warn'],
     });

   if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
   ```
3. Update subsequent database logic to import this `prisma` instance rather than instantiating a `new PrismaClient()`.

## Definition of Done
- [ ] Database credentials are set up securely in `.env`.
- [ ] `schema.prisma` contains `Users`, `Event`, `Venue`, `Registration`, and `Seat_Hold` models.
- [ ] Initial database migration is successfully applied to the Supabase instance.
- [ ] `src/lib/prisma.ts` singleton is created and exported.
