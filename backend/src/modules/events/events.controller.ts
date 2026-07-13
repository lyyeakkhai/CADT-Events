import { prisma } from '@/lib/prisma';
import { clerkClient, getAuth } from '@clerk/express';
import type { Request, Response, NextFunction } from 'express';
import { NotFoundError, ConflictError, BadRequestError } from '@/common/errors/app-error';
import type { CreateEventInput } from '@/common/schemas';
import { randomUUID } from 'crypto';
import { notifyUsersOfPublishedEvent } from '@/modules/telegram/telegram.service';

/** Fire Telegram broadcast when an event becomes published (non-blocking). */
function triggerPublishTelegramNotify(
  event: {
    event_id: string;
    event_title: string;
    description?: string | null;
    start_time: Date;
    location?: string | null;
    cover_image_url?: string | null;
    event_type?: string | null;
    capacity?: number | null;
  },
  trigger: 'create' | 'publish'
) {
  console.log(
    `[Backend] Triggering Telegram notify on ${trigger} for event ${event.event_id}`
  );
  notifyUsersOfPublishedEvent(event, trigger).catch((err) => {
    console.error(
      `[Backend] Telegram publish notify failed (${trigger}) event=${event.event_id}:`,
      err
    );
  });
}

/** Map admin UI labels → Prisma EventType enum */
function mapEventType(raw?: string | null):
  | 'workshop'
  | 'seminar'
  | 'competition'
  | 'conference'
  | 'career_fair'
  | 'networking'
  | 'other' {
  const key = (raw || 'seminar')
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, '_');

  const aliases: Record<string, ReturnType<typeof mapEventType>> = {
    workshop: 'workshop',
    seminar: 'seminar',
    competition: 'competition',
    conference: 'conference',
    career_fair: 'career_fair',
    careerfair: 'career_fair',
    networking: 'networking',
    hands_on: 'workshop',
    handson: 'workshop',
    exhibition: 'other',
    other: 'other',
    tech_talk: 'seminar',
    techtalk: 'seminar',
  };

  return aliases[key] || 'other';
}

async function ensureAdminRecord(userId: string) {
  const existing = await prisma.admin.findUnique({ where: { admin_id: userId } });
  if (existing) return existing;

  try {
    const clerkUser = await clerkClient.users.getUser(userId);
    const email =
      clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
        ?.emailAddress ||
      clerkUser.emailAddresses[0]?.emailAddress ||
      `${userId}@admin.local`;
    const name =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ').trim() ||
      email.split('@')[0] ||
      'Admin';

    // Prefer match by email if admin row already exists (do not rewrite PK)
    const byEmail = await prisma.admin.findUnique({ where: { email } });
    if (byEmail) {
      if (byEmail.full_name !== name && name) {
        return prisma.admin.update({
          where: { email },
          data: { full_name: name },
        });
      }
      return byEmail;
    }

    return prisma.admin.create({
      data: {
        admin_id: userId,
        email,
        full_name: name,
        password_hash: 'managed-by-clerk',
      },
    });
  } catch (e) {
    console.error('[ensureAdminRecord]', e);
    return null;
  }
}

const mapEvent = (e: any) => ({
  id: e.event_id,
  title: e.event_title,
  description: e.description,
  startTimestamp: e.start_time,
  endTimestamp: e.end_time,
  coverImageUrl: e.cover_image_url,
  eventType: e.event_type,
  status: (e.status || 'draft').toUpperCase(),
  isFeatured: e.is_featured ?? false,
  creditValue: e.credit_value ?? 0,
  capacity: e.capacity ?? null,
  location: e.location || (e.venue ? e.venue.venue_name : null),
  venue: e.venue ? { name: e.venue.venue_name, address: e.venue.venue_name } : null,
  availableSeats: e.capacity != null ? Math.max(0, e.capacity - (e._count?.registrations || 0)) : null,
  _count: { bookings: e._count?.registrations || 0 },
  adminId: e.admin_id ?? null,
  questions: e.questions ? e.questions.map((q: any) => ({
    id: q.question_id,
    questionText: q.question_text,
    questionType: q.question_type,
    options: q.options ? JSON.parse(q.options) : [],
    isRequired: q.is_required,
    orderIndex: q.order_index
  })) : [],
});

// ── GET /api/events ─────────────────────────────────────────────────────────
export async function listEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, search, featured } = req.query;

    // Public list: published + ongoing + completed so students can see historical events on calendar
    const allowedPublic = ['published', 'ongoing', 'completed'];
    const statusFilter = status
      ? { status: status as any }
      : { status: { in: allowedPublic } };

    const events = await prisma.event.findMany({
      where: {
        deleted_at: null,
        ...statusFilter,
        ...(featured === 'true' ? { is_featured: true } : {}),
        ...(search
          ? {
              OR: [
                { event_title: { contains: String(search), mode: 'insensitive' } },
                { description: { contains: String(search), mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        venue: { select: { venue_name: true } },
        _count: { select: { registrations: true } },
        questions: { orderBy: { order_index: 'asc' } }
      },
      orderBy: { start_time: 'asc' },
    });

    res.json({ success: true, data: events.map(mapEvent) });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/events/all (admin — includes DRAFT) ────────────────────────────
export async function listAllEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const { search } = req.query;
    const events = await prisma.event.findMany({
      where: {
        deleted_at: null,
        ...(search
          ? {
              OR: [
                { event_title: { contains: String(search), mode: 'insensitive' } },
                { description: { contains: String(search), mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        venue: { select: { venue_name: true } },
        _count: { select: { registrations: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({ success: true, data: events.map(mapEvent) });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/events/:id ──────────────────────────────────────────────────────
export async function getEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const id = (req.params as any).id as string;
    const event = await prisma.event.findFirst({
      where: { event_id: id, deleted_at: null },
      include: {
        venue: true,
        _count: { select: { registrations: true } },
        questions: { orderBy: { order_index: 'asc' } }
      },
    });

    if (!event) throw new NotFoundError('Event not found');

    res.json({ success: true, data: mapEvent(event) });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/events (admin only) ───────────────────────────────────────────
export async function createEvent(req: Request, res: Response, next: NextFunction) {
  try {
    console.log('[Backend createEvent] Request received');
    const userId =
      (req as any).customAuth?.userId || getAuth(req).userId || null;
    console.log('[Backend createEvent] Auth user ID:', userId);
    const body = req.body as CreateEventInput;
    console.log('[Backend createEvent] Request body:', JSON.stringify(body, null, 2));

    if (!userId) throw new BadRequestError('Not authenticated');

    const adminUser = await ensureAdminRecord(userId);

    const startTs = new Date(body.startTimestamp);
    const endTs = new Date(body.endTimestamp);

    if (Number.isNaN(startTs.getTime()) || Number.isNaN(endTs.getTime())) {
      throw new BadRequestError('Invalid start or end date/time');
    }
    if (endTs <= startTs) {
      console.warn('[Backend createEvent] Validation failed: End time before start time');
      throw new BadRequestError('End time must be after start time');
    }

    const uuid = randomUUID();
    const eventType = mapEventType(body.eventType);
    const status = (body.status?.toLowerCase() as 'draft' | 'published') ?? 'draft';

    console.log('[Backend createEvent] Inserting into database...', { eventType, status, admin_id: adminUser?.admin_id });
    const event = await prisma.event.create({
      data: {
        event_id: uuid,
        admin_id: adminUser?.admin_id ?? null,
        event_title: body.title,
        description: body.description,
        start_time: startTs,
        end_time: endTs,
        event_type: eventType,
        cover_image_url: body.coverImageUrl || null,
        is_featured: body.isFeatured ?? false,
        capacity: body.capacity ?? null,
        credit_value: body.creditValue ?? 0,
        location: body.location || null,
        status,
      },
    });

    if (body.reminderSchedules && body.reminderSchedules.length > 0) {
      console.log(`[Backend createEvent] Creating ${body.reminderSchedules.length} reminder schedules...`);
      await prisma.eventReminder.createMany({
        data: body.reminderSchedules.map((minutes) => ({
          reminder_id: randomUUID(),
          event_id: uuid,
          minutes_before: minutes,
          scheduled_time: new Date(startTs.getTime() - minutes * 60000),
        })),
      });
    }

    if (body.questions && body.questions.length > 0) {
      console.log(`[Backend createEvent] Creating ${body.questions.length} questions...`);
      await prisma.eventQuestion.createMany({
        data: body.questions.map((q) => ({
          question_id: randomUUID(),
          event_id: uuid,
          question_text: q.questionText,
          question_type: q.questionType as any,
          options: q.options && q.options.length > 0 ? JSON.stringify(q.options) : null,
          is_required: q.isRequired,
          order_index: q.orderIndex,
        })),
      });

      const eventWithQuestions = await prisma.event.findUnique({
        where: { event_id: uuid },
        include: {
          questions: { orderBy: { order_index: 'asc' } },
          _count: { select: { registrations: true } },
        },
      });

      // Admin created as PUBLISHED → notify all linked Telegram users
      if (status === 'published' && eventWithQuestions) {
        triggerPublishTelegramNotify(eventWithQuestions, 'create');
      }

      return res.status(201).json({ success: true, data: mapEvent(eventWithQuestions) });
    }

    console.log('[Backend createEvent] Successfully created event ID:', event.event_id);

    // Admin created as PUBLISHED → notify all linked Telegram users
    if (status === 'published') {
      triggerPublishTelegramNotify(event, 'create');
    }

    res.status(201).json({
      success: true,
      data: mapEvent({ ...event, _count: { registrations: 0 } }),
    });
  } catch (err) {
    console.error('[Backend createEvent] Error during event creation:', err);
    next(err);
  }
}

// ── PATCH /api/events/:id (admin only) ──────────────────────────────────────
export async function updateEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const id = (req.params as any).id as string;
    const body = req.body;

    const existing = await prisma.event.findFirst({ where: { event_id: id, deleted_at: null } });
    if (!existing) throw new NotFoundError('Event not found');

    if (body.startTimestamp && body.endTimestamp) {
      const s = new Date(body.startTimestamp);
      const e = new Date(body.endTimestamp);
      if (!Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime()) && e <= s) {
        throw new BadRequestError('End time must be after start time');
      }
    }

    const nextStatus =
      body.status !== undefined
        ? (String(body.status).toLowerCase() as 'draft' | 'published')
        : undefined;

    const updated = await prisma.event.update({
      where: { event_id: id },
      data: {
        ...(body.title !== undefined ? { event_title: body.title } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.startTimestamp ? { start_time: new Date(body.startTimestamp) } : {}),
        ...(body.endTimestamp ? { end_time: new Date(body.endTimestamp) } : {}),
        ...(body.coverImageUrl !== undefined ? { cover_image_url: body.coverImageUrl } : {}),
        ...(body.isFeatured !== undefined ? { is_featured: body.isFeatured } : {}),
        ...(body.capacity !== undefined ? { capacity: body.capacity } : {}),
        ...(body.creditValue !== undefined ? { credit_value: body.creditValue } : {}),
        ...(body.location !== undefined ? { location: body.location } : {}),
        ...(body.eventType !== undefined ? { event_type: mapEventType(body.eventType) } : {}),
        ...(nextStatus !== undefined ? { status: nextStatus as any } : {}),
      },
      include: { _count: { select: { registrations: true } } },
    });

    // Draft → published (admin Publish button): notify all linked Telegram users once
    const wasPublished = String(existing.status || '').toLowerCase() === 'published';
    if (nextStatus === 'published' && !wasPublished) {
      console.log(
        `[Backend updateEvent] Status change ${existing.status} → published for ${id}`
      );
      triggerPublishTelegramNotify(updated, 'publish');
    }

    res.json({ success: true, data: mapEvent(updated) });
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/events/:id — soft delete (admin only) ────────────────────────
export async function deleteEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const id = (req.params as any).id as string;
    const existing = await prisma.event.findFirst({ where: { event_id: id, deleted_at: null } });
    if (!existing) throw new NotFoundError('Event not found');

    await prisma.event.update({ where: { event_id: id }, data: { deleted_at: new Date() } });
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/events/:id/seats ───────────────────────────────────────────────
// Live seat map data: occupied labels from registrations + capacity snapshot.
export async function getEventSeats(req: Request, res: Response, next: NextFunction) {
  try {
    const id = (req.params as any).id as string;

    const event = await prisma.event.findFirst({
      where: { event_id: id, deleted_at: null },
      include: { venue: { select: { venue_name: true } } },
    });
    if (!event) throw new NotFoundError('Event not found');

    const registrations = await prisma.registration.findMany({
      where: { event_id: id, deleted_at: null },
      select: { seat_label: true },
    });

    const occupiedSeats = registrations
      .map((r) => r.seat_label)
      .filter((label): label is string => !!label && label.trim().length > 0);

    const totalBookings = registrations.length;
    const capacity = event.capacity;
    const availableSeats =
      capacity != null ? Math.max(0, capacity - totalBookings) : null;

    res.json({
      success: true,
      data: {
        occupiedSeats,
        totalBookings,
        capacity,
        availableSeats,
        venueName: event.venue?.venue_name ?? event.location ?? null,
      },
    });
  } catch (err) {
    next(err);
  }
}

