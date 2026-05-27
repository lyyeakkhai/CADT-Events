# Features

Per-feature design specs. One file per feature, named after the backend module it corresponds to.

## Documents

| Feature | Spec | Backend module |
|---|---|---|
| Telegram bot integration | [telegram-bot.md](./telegram-bot.md) | `backend/src/modules/telegram/` *(planned)* |

## What a feature spec contains

A feature spec is the design contract for one cohesive area of functionality. It should answer:

1. **User-facing behavior** — what the user sees and does
2. **Data model** — Prisma models or fields owned by this feature
3. **API surface** — endpoints + auth requirements (link to `../api/api-spec.md`)
4. **Business rules** — invariants the service must enforce (e.g., capacity limits)
5. **Edge cases** — race conditions, error states, retry semantics
6. **Dependencies** — other features or external services this feature relies on

## Naming

`<feature>.md` matches `backend/src/modules/<feature>/`. Examples: `auth.md`, `events.md`, `registrations.md`, `gamification.md`, `admin.md`.

## What does NOT go here

- Cross-feature architecture (auth strategy used everywhere) → `../architecture/`
- API endpoint reference → `../api/`
- Product motivation → `../product/prd.md`
