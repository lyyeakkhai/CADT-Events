import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/express';
import type { Request, Response, NextFunction } from 'express';
import { NotFoundError, ConflictError, BadRequestError } from '@/common/errors/app-error';
import type { CreateEventInput } from '@/common/schemas';

// ── GET /api/events ─────────────────────────────────────────────────────────
export async function listEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, search, featured } = req.query;

    const events = await prisma.event.findMany({
      where: {
        deletedAt: null,
        ...(status ? { status: status as any } : { status: 'PUBLISHED' }),
        ...(featured === 'true' ? { isFeatured: true } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: String(search), mode: 'insensitive' } },
                { description: { contains: String(search), mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        venue: { select: { name: true, address: true } },
        _count: { select: { bookings: true } },
      },
      orderBy: { startTimestamp: 'asc' },
    });

    res.json({ success: true, data: events });
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
        deletedAt: null,
        ...(search
          ? {
              OR: [
                { title: { contains: String(search), mode: 'insensitive' } },
                { description: { contains: String(search), mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        venue: { select: { name: true } },
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: events });
  } catch (err) {
    next(err);
  }
}

// ── GET /api/events/:id ──────────────────────────────────────────────────────
export async function getEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const id = (req.params as any).id as string;
    const event = await prisma.event.findFirst({
      where: { id, deletedAt: null },
      include: {
        venue: true,
        _count: { select: { bookings: true } },
      },
    });

    if (!event) throw new NotFoundError('Event not found');
    res.json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/events (admin only) ───────────────────────────────────────────
export async function createEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = getAuth(req);
    const body = req.body as CreateEventInput;

    // Resolve admin user in DB via clerkId
    const adminUser = await prisma.user.findUnique({
      where: { clerkId: auth.userId! },
    });

    const startTs = new Date(body.startTimestamp);
    const endTs = new Date(body.endTimestamp);

    if (endTs <= startTs) {
      throw new BadRequestError('End time must be after start time');
    }

    const event = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        startTimestamp: startTs,
        endTimestamp: endTs,
        eventType: body.eventType || 'Seminar',
        location: body.location,
        coverImageUrl: body.coverImageUrl || null,
        creditValue: body.creditValue ?? 0,
        isFeatured: body.isFeatured ?? false,
        capacity: body.capacity ?? null,
        status: body.status ?? 'DRAFT',
        ...(adminUser ? { adminId: adminUser.id } : {}),
      },
    });

    res.status(201).json({ success: true, data: event });
  } catch (err) {
    next(err);
  }
}

// ── PATCH /api/events/:id (admin only) ──────────────────────────────────────
export async function updateEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const id = (req.params as any).id as string;
    const body = req.body;

    const existing = await prisma.event.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundError('Event not found');

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.startTimestamp ? { startTimestamp: new Date(body.startTimestamp) } : {}),
        ...(body.endTimestamp ? { endTimestamp: new Date(body.endTimestamp) } : {}),
        ...(body.eventType !== undefined ? { eventType: body.eventType } : {}),
        ...(body.location !== undefined ? { location: body.location } : {}),
        ...(body.coverImageUrl !== undefined ? { coverImageUrl: body.coverImageUrl } : {}),
        ...(body.creditValue !== undefined ? { creditValue: body.creditValue } : {}),
        ...(body.isFeatured !== undefined ? { isFeatured: body.isFeatured } : {}),
        ...(body.capacity !== undefined ? { capacity: body.capacity } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
      },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

// ── DELETE /api/events/:id — soft delete (admin only) ────────────────────────
export async function deleteEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const id = (req.params as any).id as string;
    const existing = await prisma.event.findFirst({ where: { id, deletedAt: null } });
    if (!existing) throw new NotFoundError('Event not found');

    await prisma.event.update({ where: { id }, data: { deletedAt: new Date() } });
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
}
