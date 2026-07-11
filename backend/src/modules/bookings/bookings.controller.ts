import { prisma } from '@/lib/prisma';
import { getAuth, clerkClient } from '@clerk/express';
import type { Request, Response, NextFunction } from 'express';
import { NotFoundError, ConflictError, BadRequestError } from '@/common/errors/app-error';
import type { CreateBookingInput } from '@/common/schemas';
import { notifyUserViaTelegram } from '../telegram/telegram.service';

// ── POST /api/bookings ───────────────────────────────────────────────────────
export async function createBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).customAuth?.userId || getAuth(req).userId;
    if (!userId) throw new BadRequestError('User not authenticated');
    
    const { eventId, seatLabel, answers } = req.body as CreateBookingInput;

    let user = await prisma.userAccount.findUnique({ where: { user_id: userId } });
    if (!user) {
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        const email = clerkUser.emailAddresses?.[0]?.emailAddress || `user-${userId}@cadt.edu.kh`;
        const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ').trim() || (email.split('@')[0] || 'CADT User');
        user = await prisma.userAccount.create({
          data: { 
            user_id: userId, 
            email, 
            full_name: name, 
            role: 'student',
            password_hash: 'managed-by-clerk'
          },
        });
      } catch {
        throw new NotFoundError('User not found — please sign out and back in');
      }
    }

    const booking = await prisma.$transaction(async (tx) => {
      const event = await tx.event.findFirst({
        where: { event_id: eventId, deleted_at: null, status: 'published' },
        include: { questions: true }
      });
      if (!event) throw new NotFoundError('Event not found or not available for booking');

      // Check required questions
      if (event.questions && event.questions.length > 0) {
        for (const q of event.questions) {
          if (q.is_required && (!answers || !answers[q.question_id])) {
            throw new BadRequestError(`Question "${q.question_text}" is required`);
          }
        }
      }

      // count registrations
      const confirmedCount = await tx.registration.count({
        where: { event_id: eventId, deleted_at: null },
      });

      if (event.capacity != null && confirmedCount >= event.capacity) {
        throw new ConflictError('No seats available');
      }
      
      const existing = await tx.registration.findFirst({
        where: { user_id: user!.user_id, event_id: eventId, deleted_at: null },
      });
      if (existing) throw new ConflictError('You have already booked this event');

      // Check if seat is available
      if (seatLabel) {
        const existingSeat = await tx.registration.findFirst({
          where: { event_id: eventId, deleted_at: null, seat_label: seatLabel }
        });
        if (existingSeat) throw new ConflictError(`Seat ${seatLabel} is already taken`);
      }

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
      const bookingReferenceId = `CADT-${dateStr}-${rand}`;
      
      const uuid = require('crypto').randomUUID();

      const created = await tx.registration.create({
        data: {
          registration_id: uuid,
          booking_reference: bookingReferenceId,
          user_id: user!.user_id,
          event_id: eventId,
          seat_label: seatLabel || null,
        },
        include: {
          event: {
            select: {
              event_id: true,
              event_title: true,
              start_time: true,
              end_time: true,
              cover_image_url: true,
              event_type: true,
              status: true,
              credit_value: true,
              venue: { select: { venue_name: true } },
            },
          },
        },
      });

      // Save dynamic form answers
      if (answers && Object.keys(answers).length > 0) {
        const answerData = Object.entries(answers).map(([question_id, answer_value]) => ({
          answer_id: require('crypto').randomUUID(),
          registration_id: uuid,
          question_id,
          answer_value: String(answer_value)
        }));
        await tx.registrationAnswer.createMany({ data: answerData });
      }

      // map to frontend shape
      return {
        id: created.registration_id,
        bookingReferenceId: created.booking_reference,
        userId: created.user_id,
        eventId: created.event_id,
        status: 'CONFIRMED',
        qrCodeToken: created.qr_code || created.booking_reference,
        createdAt: created.created_at,
        checkedInAt: created.checked_in_at,
        event: {
          id: created.event.event_id,
          title: created.event.event_title,
          startTimestamp: created.event.start_time,
          endTimestamp: created.event.end_time,
          coverImageUrl: created.event.cover_image_url,
          eventType: created.event.event_type,
          status: (created.event.status || 'draft').toUpperCase(),
          creditValue: created.event.credit_value ?? 0,
          venue: created.event.venue ? { name: created.event.venue.venue_name } : null
        }
      };
    });

    // Send Telegram notification (non-blocking)
    const eventDate = booking.event.startTimestamp.toLocaleString();
    const message = `🎉 <b>Booking Confirmed!</b>\n\n<b>Event:</b> ${booking.event.title}\n<b>Date:</b> ${eventDate}\n<b>Ticket Code:</b> <code>${booking.bookingReferenceId}</code>\n\nSee you there!`;
    const notificationOptions = {
      imageUrl: booking.event.coverImageUrl,
      buttonText: 'View My Bookings',
      buttonUrl: 'https://cadt-events.app/my-bookings'
    };
    notifyUserViaTelegram(user!.user_id, message, notificationOptions).catch(err => {
      console.error('Failed to send Telegram notification:', err);
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/bookings/me ─────────────────────────────────────────────────────
export async function getMyBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).customAuth?.userId || getAuth(req).userId;
    if (!userId) throw new BadRequestError('User not authenticated');

    const user = await prisma.userAccount.findUnique({
      where: { user_id: userId },
    });
    if (!user) throw new NotFoundError('User not found');

    const bookings = await prisma.registration.findMany({
      where: { user_id: user.user_id, deleted_at: null },
      include: {
        event: {
          select: {
            event_id: true,
            event_title: true,
            start_time: true,
            end_time: true,
            cover_image_url: true,
            event_type: true,
            status: true,
            badge: true,
            credit_value: true,
            venue: { select: { venue_name: true } },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    const normalized = bookings.map((b) => ({
      id: b.registration_id,
      bookingReferenceId: b.booking_reference,
      userId: b.user_id,
      eventId: b.event_id,
      status: 'CONFIRMED',
      qrCodeToken: b.qr_code || b.booking_reference,
      createdAt: b.created_at,
      checkedInAt: b.checked_in_at,
      event: {
        id: b.event.event_id,
        title: b.event.event_title,
        startTimestamp: b.event.start_time,
        endTimestamp: b.event.end_time,
        coverImageUrl: b.event.cover_image_url,
        eventType: b.event.event_type,
        status: (b.event.status || 'draft').toUpperCase(),
        creditValue: b.event.credit_value ?? 0,
        venue: b.event.venue ? { name: b.event.venue.venue_name } : null
      }
    }));

    res.json({ success: true, data: normalized });
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/bookings/:id — cancel booking ─────────────────────────────────
export async function cancelBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).customAuth?.userId || getAuth(req).userId;
    if (!userId) throw new BadRequestError('User not authenticated');

    const id = (req.params as any).id as string;

    const user = await prisma.userAccount.findUnique({ where: { user_id: userId } });
    if (!user) throw new NotFoundError('User not found');

    const booking = await prisma.registration.findFirst({
      where: { registration_id: id, user_id: user.user_id, deleted_at: null },
      include: { event: { select: { start_time: true, event_title: true } } },
    });
    if (!booking) throw new NotFoundError('Booking not found');

    if (booking.event.start_time < new Date()) {
      throw new BadRequestError('Cannot cancel a booking for a past event');
    }

    await prisma.registration.update({
      where: { registration_id: id },
      data: { deleted_at: new Date() },
    });

    // Send Telegram notification (non-blocking)
    const message = `❌ <b>Booking Cancelled</b>\n\nYour booking for <b>${booking.event.event_title}</b> has been cancelled.`;
    notifyUserViaTelegram(user.user_id, message).catch(err => {
      console.error('Failed to send Telegram notification:', err);
    });

    res.json({ success: true, message: 'Booking cancelled successfully' });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/bookings/event/:eventId — get event bookings (Admin) ──────────────
export async function getEventBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const eventId = req.params.eventId as string;
    
    const bookings = await prisma.registration.findMany({
      where: { event_id: eventId, deleted_at: null },
      include: {
        user: { select: { user_id: true, full_name: true, email: true } },
        event: { select: { event_id: true, event_title: true } }
      },
      orderBy: { created_at: 'asc' }
    });
    
    const normalized = bookings.map(b => ({
      id: b.registration_id,
      bookingReferenceId: b.booking_reference,
      userId: b.user_id,
      eventId: b.event_id,
      status: 'CONFIRMED',
      qrCodeToken: b.qr_code || b.booking_reference,
      createdAt: b.created_at,
      checkedInAt: b.checked_in_at,
      user: {
        id: b.user.user_id,
        name: b.user.full_name,
        email: b.user.email
      },
      event: {
        id: b.event.event_id,
        title: b.event.event_title
      }
    }));
    
    res.json({ success: true, data: normalized });
  } catch (err) {
    next(err);
  }
}

// ── PATCH /api/bookings/:id/checkin — toggle check-in (Admin) ─────────────────
export async function checkInBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    
    const booking = await prisma.registration.findUnique({
      where: { registration_id: id }
    });
    
    if (!booking) throw new NotFoundError('Booking not found');
    
    const checkedInAt = booking.checked_in_at ? null : new Date();
    
    const updated = await prisma.registration.update({
      where: { registration_id: id },
      data: { checked_in_at: checkedInAt }
    });
    
    res.json({ success: true, data: {
      id: updated.registration_id,
      checkedInAt: updated.checked_in_at
    }});
  } catch (err) {
    next(err);
  }
}
