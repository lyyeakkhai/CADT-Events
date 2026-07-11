import { Router } from 'express';
import { requireAuth, requireRole } from '@/common/middleware/auth.middleware';
import { validate } from '@/common/middleware/validate.middleware';
import { CreateEventSchema, UpdateEventSchema } from '@/common/schemas';
import {
  listEvents,
  listAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventSeats,
} from './events.controller';

const router = Router();

// ── Public ──────────────────────────────────────────────────────────────────
// GET /api/events           — list published events (with optional search/featured filter)
router.get('/', listEvents);

// GET /api/events/all       — list ALL events including drafts (admin only)
router.get('/all', requireAuth, requireRole('ADMIN'), listAllEvents);

// GET /api/events/:id       — get single event
router.get('/:id', getEvent);

// GET /api/events/:id/seats — get occupied seats for an event
router.get('/:id/seats', requireAuth, getEventSeats);

// ── Admin ────────────────────────────────────────────────────────────────────
// POST /api/events          — create event
router.post('/', requireAuth, requireRole('ADMIN'), validate(CreateEventSchema), createEvent);

// PATCH /api/events/:id     — update event
router.patch('/:id', requireAuth, requireRole('ADMIN'), validate(UpdateEventSchema), updateEvent);

// DELETE /api/events/:id    — soft delete
router.delete('/:id', requireAuth, requireRole('ADMIN'), deleteEvent);

export const eventRouter = router;
