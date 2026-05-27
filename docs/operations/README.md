# Operations

Running the system in production: deployment, monitoring, incident response.

## Suggested docs

Add files as the team needs them.

| Topic | Filename | Status |
|---|---|---|
| Docker + VPS deployment | `deployment.md` | not yet written |
| Environments (dev / staging / prod) | `environments.md` | not yet written |
| Monitoring, logs, alerts | `monitoring.md` | not yet written |
| Backup & restore | `backup-restore.md` | not yet written |
| Incident runbooks | [`runbooks/`](./runbooks/) | folder created |

## What goes in a runbook

Runbooks are step-by-step procedures for handling a known operational scenario — both routine ones (cutting a release, rotating a secret) and incident-response ones (database is down, Telegram bot is offline).

Each runbook should answer:

1. **When to use this** — the trigger
2. **Who to notify** — escalation path
3. **Step-by-step actions** — concrete commands, in order
4. **How to verify recovery** — what "fixed" looks like
5. **Postmortem link** — once an incident is resolved

## What does NOT go here

- Local development setup → `../guides/getting-started.md`
- Architecture context (why we deploy this way) → `../architecture/decisions/`
