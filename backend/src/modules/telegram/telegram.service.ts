import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '../../common/prisma/client';

const token = process.env.TELEGRAM_BOT_TOKEN;

// Initialize bot if token exists
export const bot = token ? new TelegramBot(token, { polling: true }) : null;

export const initTelegramBot = () => {
  if (!bot) {
    console.warn('⚠️ TELEGRAM_BOT_TOKEN is not set. Telegram bot will not start.');
    return;
  }

  console.log('🤖 Telegram bot is running...');

  // Listen for the deep link start command, e.g. /start user_12345
  bot.onText(/\/start (.+)/, async (msg, match) => {
    const chatId = msg.chat.id.toString();
    const userId = match ? match[1] : null;

    if (!userId) {
      bot.sendMessage(chatId, "⚠️ Invalid link. Please register through the website first.");
      return;
    }

    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        bot.sendMessage(chatId, "❌ We couldn't find your account. Please try registering again.");
        return;
      }

      // Upsert the TelegramLink
      await prisma.telegramLink.upsert({
        where: { userId: user.id },
        update: {
          chatId: chatId,
          username: msg.chat.username,
        },
        create: {
          userId: user.id,
          chatId: chatId,
          username: msg.chat.username,
        }
      });

      bot.sendMessage(chatId, `✅ Welcome ${user.name}! Your Telegram is now connected. You will receive event alerts here.`);
      
    } catch (error) {
      console.error("Error linking Telegram:", error);
      bot.sendMessage(chatId, "❌ An error occurred while linking your account. Please try again later.");
    }
  });

  // Handle generic /start (without payload)
  bot.onText(/\/start$/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome! To receive event alerts, please click the 'Connect Telegram' button on our website.");
  });
};

/**
 * Utility function to send alerts to all users who have connected their Telegram
 */
export const sendEventAlertToAll = async (message: string) => {
  if (!bot) return;

  try {
    const links = await prisma.telegramLink.findMany();
    
    for (const link of links) {
      try {
        await bot.sendMessage(link.chatId, message, { parse_mode: 'HTML' });
      } catch (error) {
        console.error(`Failed to send message to chatId ${link.chatId}:`, error);
      }
    }
  } catch (error) {
    console.error("Error fetching telegram links for broadcast:", error);
  }
};
