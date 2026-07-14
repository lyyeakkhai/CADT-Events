# Architecture

How the system is structured. The single source of truth for system-wide design.

## Documents

| Doc | Purpose |
|---|---|
| [backend.md](./backend.md) | Express.js + TypeScript backend conventions and module structure |
| [frontend.md](./frontend.md) | Next.js + Tailwind frontend architecture |
| [database.md](./database.md) | PostgreSQL schema, relationships, indexes |
| [erd-schema.md](./erd-schema.md) | ERD & Relational Schema — Minimal entity relationships, tables, normal forms, and index configs |
| [project-structure.md](./project-structure.md) | Monorepo layout and naming conventions |
| [uml.md](./uml.md) | UML Diagrams — Class diagrams, sequence flows, state machines, and system boundary configurations |
| [decisions/](./decisions/) | Architecture Decision Records (ADRs) |

## What goes here

- High-level system overviews (C4-style context, container, component diagrams)
- Per-tier architecture docs (backend, frontend, data)
- Cross-cutting concerns (auth strategy, observability, security model)
- ADRs in [`decisions/`](./decisions/) — see the ADR README for the template

## What does NOT go here

- Single-feature designs → `../features/`
- API endpoint contracts → `../api/`
- Setup or how-to instructions → `../guides/`

## When to write an ADR vs update an architecture doc

- **ADR** — a decision being made *now* between alternatives. Captures context and tradeoffs at a point in time. Immutable once accepted.
- **Architecture doc** — describes the *current* state of the system. Updated as the system evolves.

When you accept an ADR, also update the relevant architecture doc to reflect the new state.
