import pino from "pino";
import { env } from "@/config/env";
import { createApp } from "@/app";
import { initTelegramBot } from "@/modules/telegram/telegram.service";
import { initTelegramCron } from "@/modules/telegram/telegram.cron";

const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
});

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`Server running on http://localhost:${env.PORT}`);
  
  // Start the Telegram bot
  initTelegramBot();
  
  // Start the Telegram Event Reminder Cron
  initTelegramCron();
});
