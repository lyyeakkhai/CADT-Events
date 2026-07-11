import { prisma } from '@/lib/prisma';
import { getAuth, clerkClient } from '@clerk/express';
import type { Request, Response, NextFunction } from 'express';
import { NotFoundError, BadRequestError } from '@/common/errors/app-error';

// ── GET /api/favorites/me ───────────────────────────────────────────────────
export async function getMyFavorites(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).customAuth?.userId || getAuth(req).userId;
    if (!userId) throw new BadRequestError('User not authenticated');

    const user = await prisma.userAccount.findUnique({
      where: { user_id: userId },
    });
    
    if (!user) {
      // Return empty if user is not in DB yet (or create them)
      return res.json({ success: true, data: [] });
    }

    const favorites = await prisma.favorite.findMany({
      where: { user_id: user.user_id },
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

    // Map to frontend expected shape
    const normalized = favorites.map((f) => ({
      favoriteId: f.favorite_id,
      userId: f.user_id,
      eventId: f.event_id,
      createdAt: f.created_at,
      event: {
        id: f.event.event_id,
        title: f.event.event_title,
        startTimestamp: f.event.start_time,
        endTimestamp: f.event.end_time,
        coverImageUrl: f.event.cover_image_url,
        eventType: f.event.event_type,
        status: (f.event.status || 'draft').toUpperCase(),
        badge: f.event.badge,
        creditValue: f.event.credit_value ?? 0,
        venue: f.event.venue ? { name: f.event.venue.venue_name } : null
      }
    }));

    res.json({ success: true, data: normalized });
  } catch (err) {
    next(err);
  }
}

// ── POST /api/favorites/toggle ──────────────────────────────────────────────
export async function toggleFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).customAuth?.userId || getAuth(req).userId;
    if (!userId) throw new BadRequestError('User not authenticated');

    const { eventId } = req.body;
    if (!eventId) throw new BadRequestError('eventId is required');

    let user = await prisma.userAccount.findUnique({ where: { user_id: userId } });
    
    // Auto-create user if they don't exist yet in the DB
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

    const event = await prisma.event.findUnique({
      where: { event_id: eventId }
    });

    if (!event) throw new NotFoundError('Event not found');

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        user_id_event_id: {
          user_id: user.user_id,
          event_id: eventId
        }
      }
    });

    if (existingFavorite) {
      // Remove favorite
      await prisma.favorite.delete({
        where: { favorite_id: existingFavorite.favorite_id }
      });
      return res.json({ success: true, data: { action: 'removed' } });
    } else {
      // Add favorite
      const uuid = require('crypto').randomUUID();
      const newFavorite = await prisma.favorite.create({
        data: {
          favorite_id: uuid,
          user_id: user.user_id,
          event_id: eventId
        }
      });
      return res.json({ success: true, data: { action: 'added', favorite: newFavorite } });
    }
  } catch (err) {
    next(err);
  }
}
