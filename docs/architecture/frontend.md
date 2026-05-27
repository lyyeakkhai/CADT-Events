# Frontend Architecture

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + Tailwind CSS 4
- **Components:** Shadcn/ui
- **State:** React Context + Server Actions
- **HTTP:** Native fetch with custom wrapper
- **Icons:** Lucide React

---

## Route Structure

```
/                          → Home (event listing)
/events/[id]               → Event detail page
/login                     → Login
/register                  → Register
/dashboard                 → Student dashboard
/dashboard/bookings        → My bookings
/dashboard/favorites       → My favorite events
/dashboard/settings        → Profile & notification settings
/admin                     → Admin dashboard
/admin/events              → Event list (admin)
/admin/events/new          → Create event
/admin/events/[id]/edit    → Edit event
/admin/events/[id]/bookings→ View bookings
/admin/categories          → Category management
```

---

## Folder Structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   ├── bookings/
│   │   │   ├── favorites/
│   │   │   └── settings/
│   │   └── layout.tsx      # Dashboard sidebar layout
│   ├── (admin)/
│   │   ├── admin/
│   │   │   ├── events/
│   │   │   ├── categories/
│   │   │   └── layout.tsx  # Admin sidebar layout
│   │   └── layout.tsx      # Admin guard
│   ├── events/
│   │   └── [id]/
│   │       └── page.tsx
│   ├── page.tsx            # Home
│   ├── layout.tsx          # Root layout
│   └── globals.css
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── event-card.tsx
│   ├── event-list.tsx
│   ├── booking-button.tsx
│   ├── navbar.tsx
│   ├── footer.tsx
│   └── admin/
│       ├── event-form.tsx
│       ├── bookings-table.tsx
│       └── sidebar.tsx
├── lib/
│   ├── api.ts              # API client wrapper
│   ├── auth.ts             # Auth helpers
│   └── utils.ts
├── hooks/
│   ├── use-auth.ts
│   ├── use-events.ts
│   └── use-bookings.ts
├── types/
│   └── index.ts            # Shared TypeScript types
└── public/
    └── images/
```

---

## Key Components

### API Client (`lib/api.ts`)

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function api<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = getToken(); // from localStorage or cookie
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new ApiError(res.status, await res.json());
  return res.json();
}
```

### Auth Context

```typescript
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAdmin: boolean;
}
```

### Data Fetching Pattern

Use React Server Components where possible. Client components for interactive parts.

```tsx
// app/page.tsx - Server Component
import { EventList } from "@/components/event-list";
import { api } from "@/lib/api";

export default async function HomePage() {
  const { data: events } = await api("/events?upcoming=true");
  return <EventList events={events} />;
}
```

```tsx
// components/booking-button.tsx - Client Component
"use client";
import { useState } from "react";
import { api } from "@/lib/api";

export function BookingButton({ eventId, availableSeats }: Props) {
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    setLoading(true);
    await api(`/events/${eventId}/book`, { method: "POST" });
    setLoading(false);
  };

  return (
    <Button onClick={handleBook} disabled={loading || availableSeats === 0}>
      {availableSeats === 0 ? "Sold Out" : "Book Ticket"}
    </Button>
  );
}
```

---

## State Management Strategy

| State Type | Solution |
|-----------|----------|
| Auth (user, token) | React Context + localStorage |
| Server data (events, bookings) | Server Components + SWR/React Query (optional) |
| UI state (modals, forms) | useState / useReducer |
| Form data | React Hook Form |

---

## Styling Conventions

- Tailwind utility classes only
- Shadcn/ui base components
- Custom components extend shadcn variants
- Dark mode via `dark:` prefix
- Mobile-first responsive design

## Package Installation Checklist

```bash
cd frontend

# Shadcn/ui
npx shadcn@latest init

# Components
npx shadcn@latest add button card dialog input label badge avatar table
npx shadcn@latest add tabs dropdown-menu sheet toast

# Additional packages
npm install lucide-react
npm install react-hook-form @hookform/resolvers zod
npm install qrcode.react          # For ticket QR codes
```
