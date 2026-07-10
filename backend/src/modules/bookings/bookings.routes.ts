import { Router } from 'express';
import { requireAuth, requireRole } from '@/common/middleware/auth.middleware';
import { validate } from '@/common/middleware/validate.middleware';
import { CreateBookingSchema } from '@/common/schemas';
import { createBooking, getMyBookings, cancelBooking, getEventBookings, checkInBooking } from './bookings.controller';

const router = Router();

// All booking routes require auth
// POST /api/bookings          — book an event
router.post('/', requireAuth, validate(CreateBookingSchema), createBooking);

// GET /api/bookings/me        — my bookings list
router.get('/me', requireAuth, getMyBookings);

// GET /api/bookings/event/:eventId — event bookings list (Admin)
router.get('/event/:eventId', requireAuth, requireRole('ADMIN'), getEventBookings);

// PATCH /api/bookings/:id/checkin — toggle check-in (Admin)
router.patch('/:id/checkin', requireAuth, requireRole('ADMIN'), checkInBooking);

// DELETE /api/bookings/:id    — cancel a booking
router.delete('/:id', requireAuth, cancelBooking);

export const bookingRouter = router;
