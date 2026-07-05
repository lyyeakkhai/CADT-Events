import { Router } from 'express';
import { requireAuth } from '@/common/middleware/auth.middleware';
import { validate } from '@/common/middleware/validate.middleware';
import { CreateBookingSchema } from '@/common/schemas';
import { createBooking, getMyBookings, cancelBooking } from './bookings.controller';

const router = Router();

// All booking routes require auth
// POST /api/bookings          — book an event
router.post('/', requireAuth, validate(CreateBookingSchema), createBooking);

// GET /api/bookings/me        — my bookings list
router.get('/me', requireAuth, getMyBookings);

// DELETE /api/bookings/:id    — cancel a booking
router.delete('/:id', requireAuth, cancelBooking);

export const bookingRouter = router;
