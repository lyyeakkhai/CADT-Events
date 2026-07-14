# CADT Events — Documentation

Living documentation for the CADT Events platform. Organized by **what the doc is for**, not by who writes it.

## Structure

| Folder | Purpose | When to read |
|---|---|---|
| [`product/`](./product/) | What we're building and why — PRD, roadmap, success metrics, plans | Onboarding, scoping new work |
| [`architecture/`](./architecture/) | How the system is structured — backend, frontend, database, decisions | Designing changes that cross modules |
| [`architecture/decisions/`](./architecture/decisions/) | Architecture Decision Records (ADRs) | Before reversing a past decision |
| [`features/`](./features/) | Per-feature design specs and integrations | Building or extending a single feature |
| [`api/`](./api/) | API contracts and conventions | Integrating clients, writing handlers |
| [`guides/`](./guides/) | How-to guides for contributors | Setting up locally, contributing |
| [`operations/`](./operations/) | Deployment, monitoring, runbooks | Shipping, debugging incidents |
| [`operations/deploy.md`](./operations/deploy.md) | Free-tier Render deploy + CI | Student demo / testing deploys |

## Where do I put a new doc?

```
Is it about WHAT/WHY we're building?       → product/
Is it about HOW the system is structured?  → architecture/
Is it a decision that locks in a choice?   → architecture/decisions/  (use the ADR template)
Is it the design for one feature?          → features/<feature>.md
Is it an API contract?                     → api/
Is it "how do I do X"?                     → guides/
Is it about running the system in prod?    → operations/
```

## Conventions

- File names: `kebab-case.md`
- Each subfolder has a `README.md` index — keep it in sync when adding docs.
- ADR file names: `NNNN-short-title.md` (zero-padded, never reused).
- Cross-link with relative paths so links survive moves: `[backend](../architecture/backend.md)`.
- Prefer updating an existing doc over creating a near-duplicate.
