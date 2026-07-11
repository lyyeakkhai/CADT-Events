import { prisma } from './src/lib/prisma';
import { sendTelegramToUser } from './src/modules/telegram/telegram.service';

async function main() {
  // Find a user who has a telegram chat id linked
  const user = await prisma.userAccount.findFirst({
    where: { telegram_chat_id: { not: null } }
  });

  if (!user) {
    console.log("No user found with a linked Telegram account.");
    return;
  }

  // Find an event they are registered for
  const registration = await prisma.registration.findFirst({
    where: { user_id: user.user_id },
    include: { event: true }
  });

  if (!registration) {
    console.log(`User ${user.email} is not registered for any events.`);
    return;
  }

  const event = registration.event;
  const time = event.start_time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const message = `⏳ <b>Event Reminder!</b>\n\nHi ${user.full_name},\n\nYour event <b>${event.event_title}</b> is starting soon at <b>${time}</b>!\n\nLocation: ${event.location || 'CADT Campus'}\nSeat: ${registration.seat_label || 'Any available seat'}\n\nPlease arrive 15 minutes early. See you there!`;

  console.log(`Sending reminder to ${user.email} (Telegram ID: ${user.telegram_chat_id})...`);
  
  await sendTelegramToUser(user.user_id, message);
  console.log("Done!");
}

main().catch(console.error).finally(() => process.exit(0));
