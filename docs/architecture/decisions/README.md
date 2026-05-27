# Architecture Decision Records

Records of significant architectural decisions, the alternatives considered, and the reasoning behind each choice.

## Index

| # | Title | Status | Date |
|---|---|---|---|
| [0001](./0001-express-over-nestjs.md) | Use Express.js (not NestJS) for the backend | Accepted | 2026-05-27 |
| [0002](./0002-feature-module-layout.md) | Adopt feature-module folder layout in the backend | Accepted | 2026-05-27 |

## How to add an ADR

1. Copy [`0000-template.md`](./0000-template.md) to `NNNN-short-title.md` (next free number, zero-padded).
2. Fill in **Context**, **Decision**, **Alternatives**, **Consequences**.
3. Set **Status** to `Proposed`.
4. Open a PR. Once merged, change **Status** to `Accepted` and add the entry to the index above.
5. If a later ADR overturns this one, change the status to `Superseded by NNNN` and link it.

## Status values

- **Proposed** — under discussion
- **Accepted** — current decision, in effect
- **Deprecated** — no longer recommended, but not yet replaced
- **Superseded by NNNN** — replaced by a later ADR; link the successor

## Why ADRs?

- **Decisions outlive the people who made them.** A new contributor in 2027 needs to understand why we picked Express over NestJS without rerunning the debate.
- **Architecture docs describe the *current* state.** ADRs capture *why* the current state is what it is.
- **They're cheap.** A good ADR is half a page. Not writing them is more expensive in the long run.
