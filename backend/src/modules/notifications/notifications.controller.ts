import { prisma } from '@/lib/prisma';
import { getAuth } from '@clerk/express';
import type { Request, Response, NextFunction } from 'express';
import { NotFoundError, BadRequestError } from '@/common/errors/app-error';

// ── GET /api/notifications/me ───────────────────────────────────────────────
export async function getMyNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).customAuth?.userId || getAuth(req).userId;
    if (!userId) throw new BadRequestError('User not authenticated');

    const user = await prisma.userAccount.findUnique({
      where: { user_id: userId },
    });
    if (!user) throw new NotFoundError('User not found');

    const notifications = await prisma.notification.findMany({
      where: { user_id: user.user_id },
      include: {
        event: {
          select: {
            event_id: true,
            event_title: true,
          }
        }
      },
      orderBy: { created_at: 'desc' },
    });

    const normalized = notifications.map(n => ({
      id: n.notification_id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.is_read,
      createdAt: n.created_at,
      event: n.event ? {
        id: n.event.event_id,
        title: n.event.event_title
      } : null
    }));

    res.json({ success: true, data: normalized });
  } catch (err) {
    next(err);
  }
}

// ── PATCH /api/notifications/:id/read ─────────────────────────────────────────
export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).customAuth?.userId || getAuth(req).userId;
    if (!userId) throw new BadRequestError('User not authenticated');

    const id = req.params.id as string;

    const notification = await prisma.notification.findUnique({
      where: { notification_id: id }
    });

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    if (notification.user_id !== userId) {
      throw new BadRequestError('Not authorized');
    }

    const updated = await prisma.notification.update({
      where: { notification_id: id },
      data: { is_read: true }
    });

    res.json({ success: true, data: { id: updated.notification_id, isRead: updated.is_read }});
  } catch (err) {
    next(err);
  }
}
