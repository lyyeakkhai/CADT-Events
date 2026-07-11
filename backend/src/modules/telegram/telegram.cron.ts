import cron from 'node-cron';
import { prisma } from '@/lib/prisma';
import { sendTelegramToUser } from './telegram.service';

export const initTelegramCron = () => {
  console.log('⏰ Initializing Telegram Event Reminder Cron Job...');

  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      // Find all unsent reminders where the scheduled time has passed
      const dueReminders = await prisma.eventReminder.findMany({
        where: {
          is_sent: false,
          scheduled_time: { lte: now }
        },
        include: {
          event: true
        }
      });

      if (dueReminders.length === 0) return;

      console.log(`[Telegram Cron] Found ${dueReminders.length} due reminders.`);

      for (const reminder of dueReminders) {
        const event = reminder.event;
        
        // Find all users registered for this event who have a telegram account
        const registrations = await prisma.registration.findMany({
          where: {
            event_id: reminder.event_id,
            deleted_at: null,
            user: { telegram_chat_id: { not: null } }
          },
          include: {
            user: { select: { user_id: true, full_name: true } }
          }
        });

        if (registrations.length > 0) {
          const timeStr = event.start_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const dateStr = event.start_time.toLocaleDateString();
          
          const title = reminder.minutes_before >= 1440 
            ? `🗓️ Tomorrow: ${event.event_title}` 
            : `⏳ Starting Soon: ${event.event_title}`;

          console.log(`[Telegram Cron] Sending reminder to ${registrations.length} users for event ${event.event_id}`);

          for (const reg of registrations) {
            const message = `<b>${title}</b>\n\nHi ${reg.user.full_name},\n\nThis is a friendly reminder that your event is starting at <b>${timeStr}</b> on <b>${dateStr}</b>.\n\n📍 Location: ${event.location || 'CADT Campus'}\n🪑 Seat: ${reg.seat_label || 'Any available seat'}\n\nPlease arrive a bit early. See you there!`;
            
            await sendTelegramToUser(reg.user.user_id, message);
          }
        }

        // Mark reminder as sent
        await prisma.eventReminder.update({
          where: { reminder_id: reminder.reminder_id },
          data: { is_sent: true }
        });
      }
    } catch (err) {
      console.error('[Telegram Cron] Error processing event reminders:', err);
    }
  });
};
