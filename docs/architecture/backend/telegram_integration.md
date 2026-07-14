# Telegram Bot Integration for CADT Events

This document explains how the Telegram Bot integration works in the CADT Events platform to send event alerts to students.

## Architecture & Flow

To prevent spam, Telegram does not allow bots to initiate conversations with users. A user *must* message the bot first. To achieve a seamless experience where we can message students about their upcoming events, we use the **Deep Linking** strategy.

### Step-by-Step Flow:
1. **User Registration:** A student logs into the CADT Events web application. They are assigned a unique `userId` in the database.
2. **Deep Link Generation:** On the user profile or settings page, the frontend provides a button labeled **"Connect Telegram"**. This button links to:
   `https://t.me/<BOT_USERNAME>?start=<userId>`
3. **User Action:** The student clicks the link. Telegram opens on their device, and they press **Start**.
4. **Backend Reception:** Telegram sends a payload to the Node.js backend: `/start <userId>`.
5. **Database Linking:** The backend matches the `<userId>` with the student in the database, extracts the Telegram `chatId` from the incoming message, and saves it in the `telegram_links` table (using Prisma).
6. **Alerts Dispatch:** Whenever there is an upcoming event, the backend queries the `telegram_links` table and uses the `node-telegram-bot-api` to dispatch formatted HTML messages directly to the registered `chatId`s.

---

## Environment Variables

The following environment variables must be configured for the integration to work.

### Backend (`backend/.env`)
- `TELEGRAM_BOT_TOKEN`: The HTTP API token obtained from @BotFather on Telegram.
  ```env
  TELEGRAM_BOT_TOKEN="123456789:ABCDefGHIJKlmNoPQRsTUVwxyZ"
  ```

### Frontend (`frontend/.env.local`)
- `VITE_TELEGRAM_BOT_USERNAME`: The public username of your bot (without the `@`), used to generate the connection links.
  ```env
  VITE_TELEGRAM_BOT_USERNAME="CadtEventsBot"
  ```

---

## Backend Implementation Details

- **Entry Point:** The bot is initialized in `backend/src/server.ts` alongside the Express server.
- **Service Logic:** The bot listener and sender logic are housed in `backend/src/modules/telegram/telegram.service.ts`.
- **Database Model:** The `TelegramLink` Prisma model establishes a 1-to-1 relationship with the `User` model.

### Sending Broadcasts
To send an alert to all connected users, import and use the utility function:
```typescript
import { sendEventAlertToAll } from '@/modules/telegram/telegram.service';

await sendEventAlertToAll("🚨 <b>New Event!</b> Join us tomorrow.");
```

---

## Frontend Integration Guide

On your frontend (React/Vite), you need to dynamically construct the link for the currently logged-in user.

### Example Component:
```tsx
import React from 'react';

const ConnectTelegramButton = ({ userId }: { userId: string }) => {
  const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME;
  const telegramUrl = `https://t.me/${botUsername}?start=${userId}`;

  return (
    <a 
      href={telegramUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="bg-blue-500 text-white px-4 py-2 rounded-md"
    >
      Connect Telegram
    </a>
  );
};

export default ConnectTelegramButton;
```

## Checklist / Remaining TODOs:
1. [ ] Create the Bot on Telegram via BotFather and retrieve the Token.
2. [ ] Fill out the `TELEGRAM_BOT_TOKEN` in the backend `.env`.
3. [ ] Fill out the `VITE_TELEGRAM_BOT_USERNAME` in the frontend `.env.local`.
4. [ ] Implement the "Connect Telegram" button in the frontend UI (User Profile / Settings page).
5. [ ] Integrate the `sendEventAlertToAll` function into your Event creation or Cron job flows in the backend.
