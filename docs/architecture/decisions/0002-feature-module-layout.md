# 0002 — Adopt feature-module folder layout in the backend

- **Status:** Accepted
- **Date:** 2026-05-27
- **Deciders:** CADT Events team
- **Tags:** backend, structure

## Context

Initial backend structure was **layer-first**: `controllers/`, `services/`, `routes/`, `middleware/`, `lib/`. As soon as we started planning the next modules (events, registrations, telegram, gamification, admin), two problems became visible:

1. **Cohesion drops as features grow.** A change to one feature touches files scattered across five folders.
2. **Onboarding is harder.** A contributor new to the project has to mentally join layer fragments to see what a feature actually does.

The team is small (see [0001](./0001-express-over-nestjs.md)) so we want a layout that is *predictable* — every feature looks the same, and "find the auth code" is one navigation step.

## Decision

We will organize the backend by **feature module**, not by layer.

Each feature lives in `src/modules/<feature>/` with the same four files:

```
src/modules/<feature>/
  <feature>.controller.ts
  <feature>.routes.ts
  <feature>.schema.ts
  <feature>.service.ts
```

Cross-cutting infrastructure (auth middleware, error handler, validation middleware, Prisma client, typed errors) lives in `src/common/`.

The four-file convention is rigid: every module has exactly these files, named exactly this way, with the same responsibilities. See [`backend.md`](../backend.md) for the full convention.

## Alternatives Considered

| Option | Pros | Cons | Why rejected |
|---|---|---|---|
| **Layer-first** (`controllers/`, `services/`, …) | Familiar from MVC tutorials | Low cohesion per feature; a change touches many folders | Doesn't scale past ~3 features |
| **Hybrid** (modules + shared layers) | Compromise | Two ways to organize creates ambiguity — "which folder does this go in?" | Predictability matters more than flexibility for us |
| **Full NestJS modules** | Battle-tested | Requires the NestJS framework, which we rejected in [0001](./0001-express-over-nestjs.md) | Framework cost not justified |

## Consequences

### Positive

- Adding a feature is mechanical: copy `modules/auth/`, rename four files, register in `app.ts`.
- Code reviews stay focused — feature changes show up in one folder.
- Migrating to real NestJS later (if we ever need DI) is straightforward — the module boundaries are already drawn.

### Negative

- Cross-cutting refactors (e.g. changing the error response shape) touch every module's controllers. Mitigated by the centralized error handler in `common/`.
- Slight duplication: every module has its own controller boilerplate. Acceptable cost for predictability.

### Neutral / follow-ups

- New module checklist documented in [`backend.md`](../backend.md) §6.
- The `auth/` module is the canonical template — keep it idiomatic.

## References

- [Backend architecture](../backend.md)
- [ADR 0001 — Express over NestJS](./0001-express-over-nestjs.md)
- Commit `8189b23` — refactor that landed this layout
