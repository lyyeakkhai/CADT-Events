# Backend Architecture

> Express.js + TypeScript + Prisma backend for CADT Events.
> Optimized for a small team: predictable layout, low ceremony, no DI container.

---

## 1. Guiding Principles

1. **Predictability over cleverness.** Every feature module has the same file layout. If you can navigate one module, you can navigate all of them.
2. **Thin controllers, fat services.** HTTP concerns stay in controllers; business logic lives in services.
3. **Validate at the boundary, trust inside.** Zod schemas validate at the route layer; services receive already-typed data.
4. **Throw typed errors, catch once.** Services throw `AppError` subclasses; one middleware translates them to HTTP responses.

---

## 2. Folder Layout

```
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── config/
│   │   └── env.ts                       # Zod-validated process.env
│   ├── common/                          # Cross-cutting infrastructure
│   │   ├── errors/
│   │   │   └── app-error.ts             # AppError + typed subclasses
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts       # authenticate, requireRole, optionalAuth
│   │   │   ├── error-handler.middleware.ts
│   │   │   └── validate.middleware.ts   # Zod body/query/params validator
│   │   └── prisma/
│   │       └── client.ts                # Singleton PrismaClient
│   ├── modules/                         # Feature modules
│   │   └── auth/
│   │       ├── auth.controller.ts
│   │       ├── auth.routes.ts
│   │       ├── auth.schema.ts
│   │       └── auth.service.ts
│   ├── app.ts                           # createApp(): builds the Express app
│   └── server.ts                        # Entry point: app.listen(...)
├── package.json
└── tsconfig.json
```

Future modules (`events`, `registrations`, `telegram`, `gamification`, `admin`) follow the exact same shape as `auth/`.

---

## 3. Module Anatomy

Every feature module contains four files. Their responsibilities are strictly separated.

### `<feature>.schema.ts` — validation + types

Source of truth for input shapes. Define Zod schemas, then derive TypeScript types from them with `z.infer`. Never hand-write types that mirror schemas.

```ts
// modules/auth/auth.schema.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

### `<feature>.service.ts` — business logic

Plain object (or class) containing all domain logic and Prisma calls. Throws typed `AppError` subclasses on failure. Does not know about `req`/`res`.

```ts
// modules/auth/auth.service.ts
export const authService = {
  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new UnauthorizedError("Invalid email or password");
    // ...
    return { user, accessToken, refreshToken };
  },
};
```

### `<feature>.controller.ts` — HTTP handlers

Thin handlers: read `req.body` (already validated by middleware), call the service, send the response. Catch errors and pass to `next()` so the central error handler can format them.

```ts
// modules/auth/auth.controller.ts
export const authController = {
  async login(req: Request<unknown, unknown, LoginInput>, res, next) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
```

### `<feature>.routes.ts` — wiring

Maps URL paths to middleware + controller. Validation is applied here, not in the controller.

```ts
// modules/auth/auth.routes.ts
const router = Router();
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authenticate, authController.me);
export const authRoutes = router;
```

---

## 4. Request Lifecycle

Every request flows through the same pipeline:

```
client request
    │
    ▼
helmet ──► cors ──► express.json ──► rateLimit          (app-level middleware)
    │
    ▼
router ──► validate(schema) ──► authenticate / requireRole   (route-level)
    │
    ▼
controller ──► service ──► Prisma                       (per module)
    │
    ▼
response  OR  thrown AppError ──► error-handler ──► JSON error
```

Two important properties:

- The **controller never validates input directly** — `validate(schema)` middleware does it before the controller runs, and it replaces `req.body` with the parsed (typed) value.
- The **service never sends a response** — it returns data or throws. This is what makes services trivially unit-testable.

---

## 5. Error Handling

### Typed errors live in `common/errors/app-error.ts`

```ts
class AppError extends Error {
  constructor(public status: number, message: string, public code?: string) { ... }
}
class BadRequestError   extends AppError { /* 400 */ }
class UnauthorizedError extends AppError { /* 401 */ }
class ForbiddenError    extends AppError { /* 403 */ }
class NotFoundError     extends AppError { /* 404 */ }
class ConflictError     extends AppError { /* 409 */ }
```

### Services throw, controllers forward

```ts
// service
if (!user) throw new NotFoundError("User not found");

// controller
catch (err) { next(err); }
```

### One middleware translates errors to JSON

`common/middleware/error-handler.middleware.ts` knows how to format three classes of errors:

| Error type   | HTTP | Response shape                                       |
|--------------|------|------------------------------------------------------|
| `AppError`   | as set | `{ error, code? }`                                  |
| `ZodError`   | 400  | `{ error: "Validation failed", code, issues: [...] }`|
| anything else| 500  | `{ error }` (with stack in dev)                      |

Never `res.status(...).json(...)` from a service. Always throw.

---

## 6. Adding a New Feature Module

A repeatable, mechanical process:

1. **Copy `modules/auth/` → `modules/<feature>/`.** Rename the four files.
2. **Define schemas** in `<feature>.schema.ts` (one Zod schema per endpoint input).
3. **Implement the service** — all Prisma queries and business rules go here. Throw typed errors.
4. **Wire the controller** — one method per endpoint. Each method is ~5 lines: try, call service, respond, next(err).
5. **Wire the routes** — `validate(schema)`, then auth middleware (if needed), then controller.
6. **Register the router** in `app.ts`:
   ```ts
   app.use("/api/<feature>", <feature>Routes);
   ```

That's it. No DI registration, no module decorators, no barrel files.

---

## 7. Testing Strategy (forward-looking)

The split between `app.ts` (builds the app) and `server.ts` (calls `listen`) exists so that integration tests can:

```ts
import request from "supertest";
import { createApp } from "@/app";

const app = createApp();
await request(app).post("/api/auth/login").send({ ... });
```

No port binding, no real HTTP, no flakiness.

Services are plain objects with a `prisma` import — for unit tests, swap the Prisma client via the standard `jest.mock("@/common/prisma/client")` pattern (or your test runner's equivalent).

---

## 8. What We Deliberately Skip

To keep the architecture lightweight, we **do not** use:

- **Dependency injection containers** (tsyringe, inversify). Services are imported directly. If a module ever needs to swap implementations, we'll introduce DI then — not before.
- **Class-based controllers with decorators**. Plain object literals are simpler and more JS-native.
- **Per-module barrel `index.ts` files**. They obscure imports and trip up tree-shaking. Import the specific file.
- **Repository pattern abstractions over Prisma**. Prisma is already the data-access layer. A `UserRepository` that just wraps `prisma.user.findUnique` is pure ceremony.
- **Global type augmentation for `req.user`**. Use the explicit `AuthRequest` interface so the dependency on auth is visible at the type level.

If the project grows and we need any of these, we'll add them — not preemptively.

---

## 9. Conventions Quick Reference

| Concern              | Where it lives                                  |
|----------------------|-------------------------------------------------|
| Env config           | `config/env.ts` (Zod-validated)                 |
| Prisma client        | `common/prisma/client.ts` (singleton)           |
| Auth/role middleware | `common/middleware/auth.middleware.ts`          |
| Input validation     | `common/middleware/validate.middleware.ts`      |
| Typed errors         | `common/errors/app-error.ts`                    |
| Error → JSON         | `common/middleware/error-handler.middleware.ts` |
| Feature logic        | `modules/<feature>/<feature>.service.ts`        |
| HTTP handlers        | `modules/<feature>/<feature>.controller.ts`     |
| Route wiring         | `modules/<feature>/<feature>.routes.ts`         |
| Schemas + types      | `modules/<feature>/<feature>.schema.ts`         |
| App assembly         | `app.ts` (`createApp`)                          |
| Process entry point  | `server.ts`                                     |
