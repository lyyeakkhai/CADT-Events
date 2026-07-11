import type { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import { bot, botUsername } from './telegram.service';
import { NotFoundError } from '@/common/errors/app-error';
import { prisma } from '@/lib/prisma';
import { clerkClient } from '@clerk/express';

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

// Check if the user has connected their Telegram account
export async function getTelegramStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).customAuth?.userId || getAuth(req).userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }
    
    let isConnected = false;
    
    // Check in database
    const user = await prisma.userAccount.findUnique({
      where: { user_id: userId },
      select: { telegram_chat_id: true }
    });
    
    if (user && user.telegram_chat_id) {
      isConnected = true;
    }

    res.json({ 
      success: true, 
      data: { 
        configured: !!bot,
        isConnected 
      } 
    });
  } catch (err) {
    next(err);
  }
}

// Disconnect Telegram from the user's account
export async function disconnectTelegram(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).customAuth?.userId || getAuth(req).userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    // Update Database
    await prisma.userAccount.updateMany({
      where: { user_id: userId },
      data: { telegram_chat_id: null }
    });

    // Update Clerk Metadata
    try {
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          telegram_chat_id: null
        }
      });
    } catch (clerkErr) {
      console.warn('Failed to update Clerk metadata during Telegram disconnect:', clerkErr);
    }

    res.json({ 
      success: true, 
      message: 'Telegram disconnected successfully' 
    });
  } catch (err) {
    next(err);
  }
}
