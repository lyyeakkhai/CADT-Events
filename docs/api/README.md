# API

API contracts and conventions for the CADT Events backend.

## Documents

| Doc | Purpose |
|---|---|
| [api-spec.md](./api-spec.md) | REST endpoint reference: paths, methods, payloads, auth |

## Conventions

- Base URL: `/api`
- Auth: `Authorization: Bearer <accessToken>` for protected routes
- Errors: `{ error: string, code?: string, issues?: [...] }` — see [`../architecture/backend.md`](../architecture/backend.md) §5 for the error model
- Validation: every endpoint validates input with a Zod schema before reaching the controller
- Versioning: not yet — when needed, prefix with `/api/v2/...` and document the deprecation timeline here

## What does NOT go here

- How to consume the API from the frontend → `../guides/`
- Internal service-to-service contracts → `../architecture/`
