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
      console.log(`[Telegram Bot] Received /start with payload: "${userId}"`);
      // Check if user exists by clerk user_id
      let user = await prisma.userAccount.findFirst({
        where: { user_id: userId }
      });

      console.log(`[Telegram Bot] User found in DB initially? ${!!user}`);

      // If user isn't in DB yet (e.g. local dev without webhooks), try fetching from Clerk and creating
      if (!user) {
        try {
          console.log(`[Telegram Bot] Fetching from Clerk for user: ${userId}`);
          const clerkUser = await clerkClient.users.getUser(userId);
          const email = clerkUser.emailAddresses?.[0]?.emailAddress || `user-${userId}@cadt.edu.kh`;
          const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ').trim() || (email.split('@')[0] || 'CADT User');
          console.log(`[Telegram Bot] Creating user in DB for ${email}...`);
          user = await prisma.userAccount.create({
            data: { 
              user_id: userId, 
              email, 
              full_name: name, 
              role: 'student',
              password_hash: 'managed-by-clerk'
            },
          });
          console.log(`[Telegram Bot] Successfully created user in DB.`);
        } catch (err) {
          console.error('[Telegram Bot] Failed to create user during telegram link. Error:', err);
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
 * Public student-web origin for Telegram URL buttons.
 * Telegram rejects localhost / http:// for inline buttons — only https:// works.
 */
export function getPublicWebBase(): string {
  const candidates = [
    process.env.PUBLIC_WEB_URL,
    process.env.FRONTEND_URL,
    'https://cadt-events-web.onrender.com',
  ];
  for (const raw of candidates) {
    const base = (raw || '').trim().replace(/\/$/, '');
    if (/^https:\/\//i.test(base)) return base;
  }
  return 'https://cadt-events-web.onrender.com';
}

/**
 * Utility: broadcast to ALL users who have linked Telegram.
 * Used when admin publishes a new event (and for global announcements).
 * Returns how many DMs were successfully sent.
 */
export const sendEventAlertToAll = async (
  message: string,
  options?: TelegramMessageOptions
): Promise<number> => {
  if (!bot) {
    console.warn('[Telegram] Bot not configured — skip broadcast');
    return 0;
  }

  let sent = 0;
  try {
    const linkedUsers = await prisma.userAccount.findMany({
      where: { telegram_chat_id: { not: null } },
      select: { telegram_chat_id: true },
    });

    console.log(`[Telegram] Broadcasting to ${linkedUsers.length} linked user(s)...`);

    for (const u of linkedUsers) {
      if (!u.telegram_chat_id) continue;
      try {
        const botOptions: any = { parse_mode: 'HTML' };
        if (options?.buttonText && options?.buttonUrl) {
          botOptions.reply_markup = {
            inline_keyboard: [[{ text: options.buttonText, url: options.buttonUrl }]],
          };
        }

        if (options?.imageUrl) {
          try {
            await bot.sendPhoto(u.telegram_chat_id, options.imageUrl, {
              caption: message,
              parse_mode: 'HTML',
              reply_markup: botOptions.reply_markup,
            });
          } catch (photoErr) {
            // If image fails (bad URL etc.), still deliver text + button
            console.warn(
              `[Telegram] sendPhoto failed for ${u.telegram_chat_id}, falling back to text:`,
              photoErr
            );
            await bot.sendMessage(u.telegram_chat_id, message, botOptions);
          }
        } else {
          await bot.sendMessage(u.telegram_chat_id, message, botOptions);
        }
        sent += 1;
      } catch (error) {
        console.error(`Failed to send message to chatId ${u.telegram_chat_id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error fetching users for Telegram broadcast:', error);
  }
  console.log(`[Telegram] Broadcast complete: ${sent} sent`);
  return sent;
};

export type PublishedEventNotifyInput = {
  event_id: string;
  event_title: string;
  description?: string | null;
  start_time: Date;
  location?: string | null;
  cover_image_url?: string | null;
  event_type?: string | null;
  capacity?: number | null;
};

/**
 * Called when admin publishes an event (create as published, or draft → published).
 * Sends cover image + caption + Register button to every linked Telegram user.
 */
export async function notifyUsersOfPublishedEvent(
  event: PublishedEventNotifyInput,
  trigger: 'create' | 'publish'
): Promise<number> {
  console.log(
    `[Telegram] PUBLISH_NOTIFY trigger=${trigger} event_id=${event.event_id} title="${event.event_title}" cover=${event.cover_image_url ? 'yes' : 'no'}`
  );

  const webBase = getPublicWebBase();
  const bookUrl = `${webBase}/events/${event.event_id}/seats`;

  const when = event.start_time.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const typeLabel = event.event_type
    ? String(event.event_type).replace(/_/g, ' ')
    : null;
  const typeLine = typeLabel
    ? typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)
    : null;
  const blurb = event.description
    ? event.description.replace(/\s+/g, ' ').trim().slice(0, 180) +
      (event.description.length > 180 ? '…' : '')
    : null;

  const message = [
    `<b>CADT Events</b> · New publication`,
    ``,
    `<b>${event.event_title}</b>`,
    typeLine ? `Type: ${typeLine}` : null,
    `Date: ${when}`,
    event.location ? `Location: ${event.location}` : null,
    event.capacity != null ? `Capacity: ${event.capacity}` : null,
    blurb ? `\n${blurb}` : null,
    ``,
    `Use the button below to register.`,
  ]
    .filter((line) => line !== null)
    .join('\n');

  const sent = await sendEventAlertToAll(message, {
    imageUrl: event.cover_image_url || undefined,
    buttonText: 'Register',
    buttonUrl: bookUrl,
  });

  console.log(
    `[Telegram] PUBLISH_NOTIFY done trigger=${trigger} event_id=${event.event_id} sent=${sent}`
  );
  return sent;
}

/**
 * Helper for booking confirmations etc. Pass the userId (clerk) + formatted message.
 */
export const notifyUserViaTelegram = sendTelegramToUser;

export { botUsername };
