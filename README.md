# CADT-Events

## Phase 3: Global Architecture & Standards

### Shared Validation (Zod)
The project shares Zod validation schemas between the backend, frontend, and frontend-admin.
Currently, shared schemas are located in `backend/src/common/schemas/`.
Frontends should access these by either:
1. Importing them relatively: `import { CreateEventSchema } from '../../../backend/src/common/schemas'`
2. (Future) Once transitioned to a full monorepo setup (e.g., using pnpm workspaces), these can be extracted into a standalone `@cadt-events/shared` package.

### Global API Client
Both `frontend` and `frontend-admin` utilize a centralized Axios client located at `src/lib/apiClient.ts`. This client is pre-configured to:
- Attach the user's Clerk Bearer token to all outgoing requests.
- Handle global error responses, such as 401 Unauthorized errors.