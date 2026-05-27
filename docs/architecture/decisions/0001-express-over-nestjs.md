# 0001 — Use Express.js (not NestJS) for the backend

- **Status:** Accepted
- **Date:** 2026-05-27
- **Deciders:** CADT Events team
- **Tags:** backend

## Context

The original PRD listed NestJS as the backend framework. As we kicked off implementation we revisited the choice in light of two project realities:

- The team is small (a few contributors) and most are not yet deep in the Nest ecosystem (modules, providers, DI, decorators).
- V1 scope is moderate: auth, events, registrations, telegram bot, gamification, admin. No multi-tenant, no microservices, no message bus.

We need a backend that the team can navigate quickly, debug without framework knowledge gaps, and extend module by module.

## Decision

We will use **Express.js with TypeScript** for the backend, not NestJS.

We will adopt a NestJS-*style* feature-module folder layout (see [0002](./0002-feature-module-layout.md)) without the NestJS framework itself — no DI container, no decorators, no `@Module`.

## Alternatives Considered

| Option | Pros | Cons | Why rejected |
|---|---|---|---|
| **NestJS** | Strong conventions, batteries-included, scales to large teams | DI container + decorators + module system add cognitive load for a small team; harder onboarding for non-Nest contributors | Overhead outweighs benefits at our scale |
| **Fastify** | Faster than Express, schema-first | Smaller community, fewer middleware on hand | No performance bottleneck justified the switch |
| **Express + JS** | Lowest setup cost | Loses type safety across boundaries | Type safety is non-negotiable with Prisma + Zod |

## Consequences

### Positive

- Lower onboarding cost — Express is widely known.
- Easy to debug — no framework magic between request and handler.
- Direct control over middleware composition.

### Negative

- We hand-roll things NestJS gives for free: validation pipes, guards, exception filters, module wiring.
- If the project grows past ~15 modules with complex inter-module dependencies, we may regret skipping DI.

### Neutral / follow-ups

- Watch for signals that we've outgrown this choice: lots of hand-wired dependencies, repeated middleware boilerplate, lifecycle hooks needed.
- If we hit those signals, the migration target is real NestJS — the feature-module folder layout chosen in [0002](./0002-feature-module-layout.md) maps cleanly onto Nest modules.

## References

- [PRD §6.2](../../product/prd.md)
- [Backend architecture](../backend.md)
- [ADR 0002 — Feature-module layout](./0002-feature-module-layout.md)
