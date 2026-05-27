import pino from "pino";
import { env } from "@/config/env";
import { createApp } from "@/app";

const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
});

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(`Server running on http://localhost:${env.PORT}`);
});
