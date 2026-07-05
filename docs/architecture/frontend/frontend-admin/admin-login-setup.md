# Admin Authentication Setup

This document explains how the **1-Way Admin Authentication** is structured in the CADT-Events platform.

## Architecture Overview
The platform uses a highly secure Subdomain Pattern (Separate Folders) to completely isolate the admin dashboard from the public application:
* **Public App:** `frontend/`
* **Admin Dashboard:** `frontend-admin/`

To prevent standard students from logging into the `frontend-admin` dashboard, we use **Role-Based Access Control (RBAC)** powered by Clerk.

## 1. Defining an Admin (The Webhook)
When a user signs up or logs into the application for the first time via Clerk, Clerk triggers a `user.created` webhook event that is caught by our backend.

**File:** `backend/src/modules/webhooks/clerk.routes.ts`

The webhook analyzes the user's email address against a hardcoded whitelist. If there is a match, they are granted the `ADMIN` role. 

Currently, the sole registered admin email is:
`admin123@stuff.cadt.edu.kh`

```typescript
// Explicitly define the admin email whitelist
let role = 'STUDENT';
const adminEmails = ['admin123@stuff.cadt.edu.kh'];

if (email && adminEmails.includes(email.toLowerCase())) {
  role = 'ADMIN';
}
```

The webhook then performs two actions:
1. **Saves to Postgres:** Upserts the user into the database with the `ADMIN` role.
2. **Updates Clerk:** Pushes the role into Clerk's `publicMetadata`. This is critical because it allows the frontend to instantly verify the role without making a separate database query.

## 2. Guarding the Dashboard (AdminGuard)
When a user visits the `frontend-admin` application, they are intercepted by the `ProtectedRoute` component before they see any pages.

**File:** `frontend-admin/src/components/ProtectedRoute.tsx`

This React component acts as the **Admin Guard**. It reads the `publicMetadata` assigned by the webhook.

```tsx
const role = user?.publicMetadata?.role as string;
const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

if (!isAdmin) {
  // Kicks unauthorized students back to the public homepage
  window.location.href = 'http://localhost:5173'; 
}
```

## Adding New Admins
To grant a new staff member admin access:
1. Open `backend/src/modules/webhooks/clerk.routes.ts`.
2. Add their email to the `adminEmails` array (e.g., `['admin123@stuff.cadt.edu.kh', 'new.admin@cadt.edu.kh']`).
3. Deploy the backend.
4. Have the new admin log in via Clerk. The webhook will automatically promote them.
