import type { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { bot, botUsername } from './telegram.service';
import { NotFoundError } from '@/common/errors/app-error';

export async function getConnectLink(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).customAuth?.userId || getAuth(req).userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    // Optional: verify user exists in our DB (created on first booking or webhook)
    // We don't block if not present yet; the bot will validate on /start.

    if (!bot) {
      return res.json({
        success: true,
        data: {
          botUsername,
          deepLink: null,
          message: 'Telegram bot is not configured on the server.',
        },
      });
    }

    // Deep link using start parameter with the Clerk user id (the bot listens for /start <userId>)
    const deepLink = `https://t.me/${botUsername}?start=${encodeURIComponent(userId)}`;

    res.json({
      success: true,
      data: {
        botUsername,
        deepLink,
        instructions: `Open the link or search for @${botUsername} in Telegram and send the command it provides.`,
      },
    });
  } catch (err) {
    next(err);
  }
}

// Future: could add status endpoint or unsubscribe here.
export async function getTelegramStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).customAuth?.userId || getAuth(req).userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    // We could query here, but to avoid duplication the /me endpoint (when added) is preferred.
    // For now this route exists for extensibility.
    res.json({ success: true, data: { configured: !!bot } });
  } catch (err) {
    next(err);
  }
}
