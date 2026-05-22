import { env } from "@/config/env";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pino from "pino";
import { errorHandler } from "@/middleware/errorHandler";

const logger = pino({ level: env.NODE_ENV === "production" ? "info" : "debug" });
const app = express();

// Security & parsing
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));

// Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", env: env.NODE_ENV });
});

// Error handler (must be last)
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`Server running on http://localhost:${env.PORT}`);
});
