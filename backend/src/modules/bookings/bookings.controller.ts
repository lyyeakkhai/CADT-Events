import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/express';
import type { Request, Response, NextFunction } from 'express';
import { NotFoundError, ConflictError, BadRequestError } from '@/common/errors/app-error';
import type { CreateBookingInput } from '@/common/schemas';

// ── POST /api/bookings ───────────────────────────────────────────────────────
// Creates a booking for the authenticated user.
export async function createBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = getAuth(req);
    const { eventId } = req.body as CreateBookingInput;

    // Resolve user in DB
    const user = await prisma.user.findUnique({
      where: { clerkId: auth.userId! },
    });
    if (!user) throw new NotFoundError('User not found — please sign out and back in');

    // Verify event exists and is published
    const event = await prisma.event.findFirst({
      where: { id: eventId, deletedAt: null, status: 'PUBLISHED' },
      include: { _count: { select: { bookings: true } } },
    });
    if (!event) throw new NotFoundError('Event not found or not available for booking');

    // Check if user already booked this event
    const existing = await prisma.booking.findFirst({
      where: { userId: user.id, eventId, deletedAt: null },
    });
    if (existing) throw new ConflictError('You have already booked this event');

    // Generate a readable reference ID: CADT-YYYYMMDD-<random 4 hex>
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
    const bookingReferenceId = `CADT-${dateStr}-${rand}`;

    const booking = await prisma.booking.create({
      data: {
        bookingReferenceId,
        userId: user.id,
        eventId,
        status: 'CONFIRMED',
      },
      include: {
        event: {
          select: {
            title: true,
            startTimestamp: true,
            endTimestamp: true,
            coverImageUrl: true,
            venue: { select: { name: true, address: true } },
          },
        },
      },
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/bookings/me ─────────────────────────────────────────────────────
// Returns all bookings for the authenticated user.
export async function getMyBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = getAuth(req);

    const user = await prisma.user.findUnique({
      where: { clerkId: auth.userId! },
    });
    if (!user) throw new NotFoundError('User not found');

    const bookings = await prisma.booking.findMany({
      where: { userId: user.id, deletedAt: null },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startTimestamp: true,
            endTimestamp: true,
            coverImageUrl: true,
            eventType: true,
            status: true,
            venue: { select: { name: true, address: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/bookings/:id — cancel booking ─────────────────────────────────
export async function cancelBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = getAuth(req);
    const id = (req.params as any).id as string;

    const user = await prisma.user.findUnique({ where: { clerkId: auth.userId! } });
    if (!user) throw new NotFoundError('User not found');

    const booking = await prisma.booking.findFirst({
      where: { id, userId: user.id, deletedAt: null },
      include: { event: { select: { startTimestamp: true } } },
    });
    if (!booking) throw new NotFoundError('Booking not found');

    // Prevent cancellation if event already started
    if (booking.event.startTimestamp < new Date()) {
      throw new BadRequestError('Cannot cancel a booking for a past event');
    }

    await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED', deletedAt: new Date() },
    });

    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (err) {
    next(err);
  }
}
