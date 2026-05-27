import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "@/config/env";
import { errorHandler } from "@/common/middleware/error-handler.middleware";
import { authRoutes } from "@/modules/auth/auth.routes";

export function createApp() {
  const app = express();

  // Security & parsing
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", env: env.NODE_ENV });
  });

  // Module routes
  app.use("/api/auth", authRoutes);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
