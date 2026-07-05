# Role-Based Access Control (RBAC) — CADT Events

> **Database:** PostgreSQL 16+ via Prisma ORM  
> **Implementation:** Enum-based roles stored in `users.role`, enforced at the API middleware layer and optionally via PostgreSQL Row-Level Security (RLS).

---

## 1. Role Hierarchy

```
SUPER_ADMIN  ──── full system + DB-level grants
     │
  ADMIN  ──────── full event CRUD, user management, analytics export
     │
 ORGANIZER  ─────  create/manage own events, view attendees
     │
  STAFF  ──────── create events for own department only
     │
 STUDENT  ────────  read events, book, manage own profile
```

### 1.1 Role Definitions

| Role | Description | Who Gets It |
|------|-------------|-------------|
| `STUDENT` | Default role for all university students and external participants | Auto-assigned on signup |
| `STAFF` | University staff — can create and manage events for their department | Promoted by ADMIN |
| `ORGANIZER` | Event organiser — not affiliated with a department but runs events | Promoted by ADMIN |
| `ADMIN` | Full administrative access to events, users, reports | Manually granted by SUPER_ADMIN |
| `SUPER_ADMIN` | Database-level access, can grant/revoke ADMIN roles, seed data | System bootstrapped only |

---

## 2. Permission Matrix

The table below defines which CRUD operations each role can perform on each resource.

### Legend
- ✅ Full access  
- 🔒 Own records only  
- 👁 Read only  
- 🏢 Own department only  
- ❌ No access

| Resource | STUDENT | STAFF | ORGANIZER | ADMIN | SUPER_ADMIN |
|----------|---------|-------|-----------|-------|-------------|
| **Events — Read (PUBLISHED)** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Events — Read (DRAFT)** | ❌ | 🏢 | 🔒 | ✅ | ✅ |
| **Events — Create** | ❌ | 🏢 | ✅ | ✅ | ✅ |
| **Events — Update** | ❌ | 🏢 | 🔒 | ✅ | ✅ |
| **Events — Delete (soft)** | ❌ | ❌ | 🔒 | ✅ | ✅ |
| **Events — Publish/Cancel** | ❌ | ❌ | 🔒 | ✅ | ✅ |
| **Bookings — View own** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Bookings — Create** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Bookings — Cancel own** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Bookings — View all (event)** | ❌ | 🏢 | 🔒 | ✅ | ✅ |
| **Bookings — Check-in (QR scan)** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Bookings — Export CSV** | ❌ | 🏢 | 🔒 | ✅ | ✅ |
| **Users — View profile (own)** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Users — Update profile (own)** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Users — View all** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Users — Block / Soft-delete** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Users — Promote role** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Users — Grant ADMIN** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Speakers — Read** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Speakers — Create/Update** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Categories — Read** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Categories — Create/Update** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Venues — Read** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Venues — Create/Update** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Analytics Dashboard** | ❌ | 🏢 | 🔒 | ✅ | ✅ |
| **Analytics — Export** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Notifications — View own** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Notifications — Broadcast** | ❌ | ❌ | 🔒 | ✅ | ✅ |
| **Credits — View own** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Credits — Adjust** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **DB — Raw migrations** | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 3. API Middleware Enforcement

All role checks are enforced at the API gateway layer using middleware guards. The pattern is:

```typescript
// middleware/rbac.ts

import { Role } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

/**
 * requireRole(minRole) — rejects requests below the minimum required role.
 * Role hierarchy is encoded in ROLE_LEVEL; higher = more privileged.
 */
const ROLE_LEVEL: Record<Role, number> = {
  STUDENT:     0,
  STAFF:       1,
  ORGANIZER:   2,
  ADMIN:       3,
  SUPER_ADMIN: 4,
};

export const requireRole = (minRole: Role) =>
  (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role as Role;
    if (!userRole || ROLE_LEVEL[userRole] < ROLE_LEVEL[minRole]) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };

/**
 * requireOwnerOrRole — passes if user owns the resource OR has minRole.
 * Used for "update own profile" or "cancel own booking" scenarios.
 */
export const requireOwnerOrRole = (minRole: Role, getOwnerId: (req: Request) => string) =>
  (req: Request, res: Response, next: NextFunction) => {
    const userId   = req.user?.id;
    const ownerId  = getOwnerId(req);
    const userRole = req.user?.role as Role;
    if (userId === ownerId || ROLE_LEVEL[userRole] >= ROLE_LEVEL[minRole]) {
      return next();
    }
    return res.status(403).json({ error: 'Forbidden' });
  };

/**
 * requireDepartmentOrRole — for STAFF who can only see their own department.
 */
export const requireDepartmentOrRole = (minRole: Role) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role as Role;
    if (ROLE_LEVEL[userRole] >= ROLE_LEVEL[minRole]) return next();

    if (userRole === 'STAFF') {
      // Attach department filter to request so the handler auto-scopes queries
      req.scopedDepartmentId = req.user?.departmentId ?? null;
      return next();
    }
    return res.status(403).json({ error: 'Forbidden' });
  };
```

### Route Guard Examples

```typescript
// Events router
router.get('/events',            requireRole('STUDENT'),    listPublishedEvents);
router.post('/events',           requireRole('STAFF'),      createEvent);
router.patch('/events/:id',      requireRole('STAFF'),      updateEvent);
router.delete('/events/:id',     requireRole('ADMIN'),      softDeleteEvent);
router.patch('/events/:id/publish', requireRole('ORGANIZER'), publishEvent);

// Bookings router
router.post('/bookings',              requireRole('STUDENT'),   createBooking);
router.post('/bookings/check-in',     requireRole('STAFF'),     checkInQR);
router.get('/admin/bookings/export',  requireRole('ADMIN'),     exportBookingsCSV);

// Users router
router.get('/profile',         requireRole('STUDENT'),    getOwnProfile);
router.get('/admin/users',     requireRole('ADMIN'),      listAllUsers);
router.patch('/admin/users/:id/role', requireRole('ADMIN'), promoteUser);
```

---

## 4. PostgreSQL Row-Level Security (RLS) — Optional Layer

For maximum database-level enforcement (defense in depth), PostgreSQL RLS policies can be layered below the application:

```sql
-- Enable RLS on sensitive tables
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users    ENABLE ROW LEVEL SECURITY;

-- Students can only read their own bookings
CREATE POLICY bookings_student_select
  ON bookings FOR SELECT
  USING (user_id = current_setting('app.current_user_id')::uuid);

-- Admins bypass RLS
CREATE POLICY bookings_admin_all
  ON bookings FOR ALL
  USING (current_setting('app.current_user_role') IN ('ADMIN', 'SUPER_ADMIN'));

-- Apply via connection parameter at query time:
-- SET app.current_user_id  = '<uuid>';
-- SET app.current_user_role = 'STUDENT';
```

> **Note:** RLS is an optional defence-in-depth measure. For university scale, enforcing at the API middleware layer (§3) is sufficient. Enable RLS only if the database is accessed by multiple applications or ad-hoc query tools.

---

## 5. Role Assignment Flows

### 5.1 Default Assignment
```
User signs up → role = STUDENT (default in DB schema)
```

### 5.2 Promotion Flow (Admin Dashboard)
```
ADMIN opens User Management → selects user → changes role dropdown
→ PATCH /admin/users/:id/role { role: "STAFF" }
→ API guard: requireRole("ADMIN")
→ DB: UPDATE users SET role = 'STAFF' WHERE id = :id
```

### 5.3 SUPER_ADMIN Bootstrap (seed only)
```sql
-- Run once during initial deployment
UPDATE users SET role = 'SUPER_ADMIN' WHERE email = 'admin@cadt.edu.kh';
```

---

## 6. Credits System Integration

Credits are awarded when a booking is checked in. The operation must be **atomic**:

```typescript
// POST /api/check-in  { qr_code_token: "..." }
async function checkIn(qrToken: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Find booking by QR token
    const booking = await tx.booking.findUniqueOrThrow({
      where: { qrCodeToken: qrToken },
      include: { event: true },
    });

    if (booking.checkedInAt) throw new Error('Already checked in');

    // 2. Mark as attended
    await tx.booking.update({
      where: { id: booking.id },
      data: { checkedInAt: new Date(), status: 'ATTENDED' },
    });

    // 3. Award credits atomically (no race condition possible)
    await tx.user.update({
      where: { id: booking.userId },
      data: { totalCredits: { increment: booking.event.creditValue } },
    });

    return { success: true, creditsAwarded: booking.event.creditValue };
  });
}
```
