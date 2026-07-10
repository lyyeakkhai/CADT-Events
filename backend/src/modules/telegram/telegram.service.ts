import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '@/lib/prisma';
import { clerkClient } from '@clerk/express';

const token = process.env.TELEGRAM_BOT_TOKEN;
const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'CADTEventsBot';

// Initialize bot if token exists
export const bot = token ? new TelegramBot(token, { polling: true }) : null;

export const initTelegramBot = () => {
  if (!bot) {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN is not set. Telegram bot will not start.');
    return;
  }

  console.log('🤖 Telegram bot is running...');

  // Listen for the deep link start command, e.g. /start <clerkUserId>
  bot.onText(/\/start (.+)/, async (msg, match) => {
    const chatId = msg.chat.id.toString();
    const userId = match ? match[1] : null;

    if (!userId) {
      bot.sendMessage(chatId, "⚠️ Invalid link. Please register through the website first.");
      return;
    }

    try {
      // Check if user exists by clerk user_id
      let user = await prisma.userAccount.findFirst({
        where: { user_id: userId }
      });

      // If user isn't in DB yet (e.g. local dev without webhooks), try fetching from Clerk and creating
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
        } catch (err) {
          console.error('Failed to create user during telegram link:', err);
        }
      }

      if (!user) {
        bot.sendMessage(chatId, "❌ We couldn't find your account. Please try registering again via the CADT Events site.");
        return;
      }

      // Link directly using the column on UserAccount
      await prisma.userAccount.update({
        where: { user_id: userId },
        data: {
          telegram_chat_id: chatId,
        },
      });

      // Update Clerk metadata so it's globally available for the frontend
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          telegram_chat_id: chatId
        }
      });

      bot.sendMessage(
        chatId,
        `✅ Welcome ${user.full_name || 'CADT user'}! Your Telegram is now connected to CADT Events.\n\nYou will receive booking confirmations, reminders, and updates here.`
      );
    } catch (error) {
      console.error('Error linking Telegram:', error);
      bot.sendMessage(chatId, '❌ An error occurred while linking your account. Please try again later.');
    }
  });

  // Handle generic /start (without payload)
  bot.onText(/\/start$/, (msg) => {
    bot.sendMessage(
      msg.chat.id,
      "Welcome to CADT Events Bot!\n\nTo receive notifications, go to the website, sign in, and use the 'Connect Telegram' button to get your personal link."
    );
  });
};

export interface TelegramMessageOptions {
  imageUrl?: string | null;
  buttonUrl?: string;
  buttonText?: string;
}

/**
 * Send a message directly to a single linked Telegram user by their internal userId (clerk id).
 */
export const sendTelegramToUser = async (userId: string, message: string, options?: TelegramMessageOptions) => {
  if (!bot) return false;
  try {
    const user = await prisma.userAccount.findUnique({
      where: { user_id: userId },
      select: { telegram_chat_id: true, full_name: true },
    });
    if (!user?.telegram_chat_id) return false;

    const botOptions: any = { parse_mode: 'HTML' };
    if (options?.buttonText && options?.buttonUrl) {
      botOptions.reply_markup = {
        inline_keyboard: [[{ text: options.buttonText, url: options.buttonUrl }]]
      };
    }

    if (options?.imageUrl) {
      await bot.sendPhoto(user.telegram_chat_id, options.imageUrl, {
        caption: message,
        parse_mode: 'HTML',
        ...botOptions
      });
    } else {
      await bot.sendMessage(user.telegram_chat_id, message, botOptions);
    }
    return true;
  } catch (error) {
    console.error(`Failed to send Telegram to user ${userId}:`, error);
    return false;
  }
};

/**
 * Send a message to a specific chat id (when you already resolved it).
 */
export const sendTelegramToChat = async (chatId: string, message: string) => {
  if (!bot) return;
  try {
    await bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
  } catch (error) {
    console.error(`Failed to send to chatId ${chatId}:`, error);
  }
};

/**
 * Utility: broadcast to ALL users who have linked Telegram.
 * (Used for admin global announcements.)
 */
export const sendEventAlertToAll = async (message: string) => {
  if (!bot) return;

  try {
    const linkedUsers = await prisma.userAccount.findMany({
      where: { telegram_chat_id: { not: null } },
      select: { telegram_chat_id: true },
    });

    for (const u of linkedUsers) {
      if (u.telegram_chat_id) {
        try {
          await bot.sendMessage(u.telegram_chat_id, message, { parse_mode: 'HTML' });
        } catch (error) {
          console.error(`Failed to send message to chatId ${u.telegram_chat_id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching users for Telegram broadcast:', error);
  }
};

/**
 * Helper for booking confirmations etc. Pass the userId (clerk) + formatted message.
 */
export const notifyUserViaTelegram = sendTelegramToUser;

export { botUsername };
