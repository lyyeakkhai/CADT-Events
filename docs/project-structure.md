# Project Structure & Conventions

## Monorepo Layout

```
CADT-Events/
├── backend/                  # Express API
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/           # env, logger
│   │   ├── middleware/       # auth, errorHandler, adminGuard
│   │   ├── routes/           # route modules
│   │   ├── controllers/      # request handlers
│   │   ├── services/         # business logic
│   │   ├── lib/              # prisma client, utils
│   │   ├── types/            # shared TS types
│   │   └── index.ts          # app entry
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # Next.js app
│   ├── app/                  # App router pages
│   ├── components/           # React components
│   ├── lib/                  # utilities, api client
│   ├── hooks/                # custom hooks
│   ├── types/                # TS types
│   └── package.json
├── docs/                     # Documentation
└── README.md
```

---

## Backend Conventions

### Route Pattern
```
src/routes/
├── auth.ts          # /api/auth/*
├── events.ts        # /api/events/*
├── bookings.ts      # /api/bookings/*
├── favorites.ts     # /api/favorites/*
├── admin.ts         # /api/admin/*
├── telegram.ts      # /api/telegram/*
└── index.ts         # Route aggregator
```

### Controller Pattern
```typescript
// controllers/eventController.ts
import { Request, Response, NextFunction } from "express";
import { eventService } from "@/services/eventService";
import { CreateEventSchema } from "@/types/schemas";

export const eventController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const events = await eventService.list(req.query);
      res.json({ data: events });
    } catch (err) { next(err); }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CreateEventSchema.parse(req.body);
      const event = await eventService.create(data);
      res.status(201).json(event);
    } catch (err) { next(err); }
  },
};
```

### Service Pattern
```typescript
// services/eventService.ts
import { prisma } from "@/lib/prisma";

export const eventService = {
  async list(filters: EventFilters) {
    return prisma.event.findMany({
      where: { status: "PUBLISHED", ...buildWhere(filters) },
      include: { categories: { include: { category: true } } },
      orderBy: { startDate: "asc" },
    });
  },

  async create(data: CreateEventInput) {
    return prisma.event.create({
      data: { ...data, availableSeats: data.totalSeats },
    });
  },
};
```

### Middleware Stack (in order)
```
1. helmet()           # security headers
2. cors()             # cross-origin
3. express.json()     # body parser
4. rateLimit()        # rate limiting
5. Routes...
6. errorHandler()     # global error handler
```

---

## Frontend Conventions

### Naming
- Components: PascalCase (`EventCard.tsx`)
- Hooks: camelCase starting with `use` (`useAuth.ts`)
- Utilities: camelCase (`api.ts`)
- Routes: kebab-case folders (`/my-bookings`)

### File Organization
```
components/
├── ui/              # shadcn/ui (auto-generated)
├── layout/          # Navbar, Footer, Sidebar
├── events/          # Event-related components
├── bookings/        # Booking-related components
└── admin/           # Admin-only components
```

### API Call Pattern
```typescript
// Server Component
const events = await api("/events");

// Client Component
const { data, error, mutate } = useSWR("/events", fetcher);
```

---

## Git Workflow

```bash
# Feature branch workflow
git checkout -b feat/event-booking
# ... commits ...
git push -u origin feat/event-booking
# Open PR, merge to main
```

---

## Code Quality

```bash
# Backend
npm run lint          # ESLint
npx tsc --noEmit      # Type check

# Frontend
npm run lint          # ESLint + Next.js rules
```
