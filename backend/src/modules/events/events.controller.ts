import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/express';
import type { Request, Response, NextFunction } from 'express';
import { NotFoundError, ConflictError, BadRequestError } from '@/common/errors/app-error';
import type { CreateEventInput } from '@/common/schemas';

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
    const auth = getAuth(req);
    console.log('[Backend createEvent] Auth user ID:', auth?.userId);
    const body = req.body as CreateEventInput;
    console.log('[Backend createEvent] Request body:', JSON.stringify(body, null, 2));

    const adminUser = await prisma.admin.findFirst(); // stub

    const startTs = new Date(body.startTimestamp);
    const endTs = new Date(body.endTimestamp);

    if (endTs <= startTs) {
      console.warn('[Backend createEvent] Validation failed: End time before start time');
      throw new BadRequestError('End time must be after start time');
    }
    
    const uuid = require('crypto').randomUUID();

    console.log('[Backend createEvent] Inserting into database...');
    const event = await prisma.event.create({
      data: {
        event_id: uuid,
        event_title: body.title,
        description: body.description,
        start_time: startTs,
        end_time: endTs,
        event_type: (body.eventType?.toLowerCase() as any) || 'seminar',
        cover_image_url: body.coverImageUrl || null,
        is_featured: body.isFeatured ?? false,
        capacity: body.capacity ?? null,
        credit_value: body.creditValue ?? 0,
        location: body.location || null,
        status: (body.status?.toLowerCase() as any) ?? 'draft',
      },
    });

    if (body.reminderSchedules && body.reminderSchedules.length > 0) {
      console.log(`[Backend createEvent] Creating ${body.reminderSchedules.length} reminder schedules...`);
      await prisma.eventReminder.createMany({
        data: body.reminderSchedules.map(minutes => ({
          reminder_id: require('crypto').randomUUID(),
          event_id: uuid,
          minutes_before: minutes,
          scheduled_time: new Date(startTs.getTime() - minutes * 60000)
        }))
      });
    }

    if (body.questions && body.questions.length > 0) {
      console.log(`[Backend createEvent] Creating ${body.questions.length} questions...`);
      await prisma.eventQuestion.createMany({
        data: body.questions.map(q => ({
          question_id: require('crypto').randomUUID(),
          event_id: uuid,
          question_text: q.questionText,
          question_type: q.questionType,
          options: q.options && q.options.length > 0 ? JSON.stringify(q.options) : null,
          is_required: q.isRequired,
          order_index: q.orderIndex
        }))
      });
      
      // Re-fetch event with questions to return
      const eventWithQuestions = await prisma.event.findUnique({
        where: { event_id: uuid },
        include: { questions: { orderBy: { order_index: 'asc' } } }
      });
      return res.status(201).json({ success: true, data: mapEvent(eventWithQuestions) });
    }

    console.log('[Backend createEvent] Successfully created event ID:', event.event_id);
    res.status(201).json({ success: true, data: mapEvent(event) });
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
        ...(body.status !== undefined ? { status: body.status?.toLowerCase() } : {}),
      },
    });

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
export async function getEventSeats(req: Request, res: Response, next: NextFunction) {
  try {
    const id = (req.params as any).id as string;
    
    // Check if event exists
    const event = await prisma.event.findFirst({ where: { event_id: id, deleted_at: null } });
    if (!event) throw new NotFoundError('Event not found');

    const registrations = await prisma.registration.findMany({
      where: { event_id: id, deleted_at: null, seat_label: { not: null } },
      select: { seat_label: true }
    });

    const occupiedSeats = registrations.map(r => r.seat_label);

    res.json({ success: true, data: { occupiedSeats } });
  } catch (err) {
    next(err);
  }
}

