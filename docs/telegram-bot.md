# Telegram Bot Integration Plan

## Bot Setup

1. Create bot via [@BotFather](https://t.me/botfather)
2. Save bot token to backend `.env`: `TELEGRAM_BOT_TOKEN=...`
3. Choose mode:
   - **Development:** Polling (`bot.startPolling()`)
   - **Production:** Webhook (`/api/telegram/webhook`)

---

## User Flow: Linking Telegram Account

```
1. Student clicks "Connect Telegram" on profile page
2. Frontend calls GET /api/telegram/link → receives { linkToken: "abc123" }
3. Frontend shows message: "Send /start abc123 to @CADTEventsBot"
4. Student opens Telegram, sends command
5. Bot receives update, extracts chat_id + linkToken
6. Bot calls internal API to link chat_id to user
7. Student receives confirmation: "Your Telegram is now linked!"
```

---

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start [token]` | Link account or show welcome |
| `/events` | List upcoming events |
| `/bookings` | Show my bookings |
| `/unsubscribe` | Stop all notifications |
| `/help` | Show available commands |

---

## Notification Types

### 1. Booking Confirmation
```
Your ticket is confirmed!

Event: AI Seminar
Date: June 1, 2026 at 9:00 AM
Location: Hall A
Ticket Code: TKT-abc123

See you there!
```

### 2. Event Reminder (24h before)
```
Reminder: AI Seminar is tomorrow!

Date: June 1, 2026 at 9:00 AM
Location: Hall A

Don't forget your ticket!
```

### 3. Seat Alert (favorite event, seats < 20%)
```
Seat Alert for AI Seminar!

Only 8 seats left out of 100.
Book now: https://cadt-events.app/events/123
```

### 4. Event Update
```
Update: AI Seminar

The location has changed from Hall A to Hall B.
Date and time remain the same.

View details: https://cadt-events.app/events/123
```

### 5. New Event (subscribed category)
```
New Event: Cybersecurity Workshop

A new event in Tech category has been posted!
Date: June 15, 2026

View and book: https://cadt-events.app/events/456
```

---

## Backend Implementation

### File: `src/services/telegram.ts`

```typescript
import TelegramBot from "node-telegram-bot-api";
import { env } from "@/config/env";
import { prisma } from "@/lib/prisma";

const bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN, { polling: env.NODE_ENV === "development" });

export async function sendNotification(userId: string, message: string) {
  const link = await prisma.telegramLink.findUnique({ where: { userId } });
  if (!link) return;
  await bot.sendMessage(link.chatId, message, { parse_mode: "Markdown" });
}

export async function broadcastToEventSubscribers(eventId: string, message: string) {
  const favorites = await prisma.favorite.findMany({
    where: { eventId },
    include: { user: { include: { telegramLink: true } } },
  });

  for (const fav of favorites) {
    if (fav.user.telegramLink) {
      await bot.sendMessage(fav.user.telegramLink.chatId, message);
    }
  }
}

// Handle /start command
bot.onText(/\/start (.+)/, async (msg, match) => {
  const chatId = msg.chat.id.toString();
  const token = match?.[1];

  // Validate token and link to user
  // ... store in TelegramLink table
  bot.sendMessage(chatId, "Your Telegram is now linked to CADT Events!");
});

export { bot };
```

### Webhook Route (Production)

```typescript
// src/routes/telegram.ts
import { Router } from "express";
import { bot } from "@/services/telegram";

const router = Router();

router.post("/webhook", (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

export default router;
```

---

## Cron Jobs / Scheduled Notifications

Use `node-cron` or external scheduler for:

1. **Daily reminder check** - Query events starting in 24h, notify booked users
2. **Seat alert check** - Query favorite events with <20% seats, notify favoriters

```typescript
// src/jobs/reminders.ts
import cron from "node-cron";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/services/telegram";

// Run every hour
cron.schedule("0 * * * *", async () => {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const events = await prisma.event.findMany({
    where: {
      startDate: { gte: tomorrow, lt: new Date(tomorrow.getTime() + 60 * 60 * 1000) },
      status: "PUBLISHED",
    },
    include: { bookings: { include: { user: true } } },
  });

  for (const event of events) {
    for (const booking of event.bookings) {
      await sendNotification(
        booking.userId,
        `Reminder: ${event.title} is tomorrow at ${event.startDate.toLocaleString()}!`
      );
    }
  }
});
```

---

## Required Packages

```bash
cd backend
npm install node-telegram-bot-api
npm install -D @types/node-telegram-bot-api
npm install node-cron
npm install -D @types/node-cron
```
