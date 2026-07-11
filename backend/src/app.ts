import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { clerkMiddleware, getAuth, clerkClient } from "@clerk/express";
import { env } from "@/config/env";
import { errorHandler } from "@/common/middleware/error-handler.middleware";
import { clerkWebhookRouter } from "@/modules/webhooks/clerk.routes";
import { eventRouter } from "@/modules/events/events.routes";
import { bookingRouter } from "@/modules/bookings/bookings.routes";
import { telegramRouter } from "@/modules/telegram/telegram.routes";

export function createApp() {
  const app = express();

  // Security & parsing
  app.use(helmet());
  app.use(
    cors({
      origin: [
        "http://localhost:5173",  // user frontend
        "http://localhost:3000",  // admin frontend
        "http://localhost:3001",  // admin frontend (fallback port)
        "http://localhost:5174",
        process.env.FRONTEND_URL,
        process.env.ADMIN_URL,
      ].filter(Boolean) as string[],
      credentials: true,
    })
  );

  // Webhooks (must be before express.json so body-parser raw works)
  app.use("/api/webhooks", clerkWebhookRouter);

  app.use(express.json());
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 200 }));

  // Initialize Clerk Middleware
  app.use(clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", env: env.NODE_ENV, timestamp: new Date().toISOString() });
  });

  // ── API Routes ──────────────────────────────────────────────────────────────
  app.use("/api/events", eventRouter);
  app.use("/api/bookings", bookingRouter);
  app.use("/api/telegram", telegramRouter);
  
  const { notificationRouter } = require("@/modules/notifications/notifications.routes");
  app.use("/api/notifications", notificationRouter);

  const { favoriteRouter } = require("@/modules/favorites/favorites.routes");
  app.use("/api/favorites", favoriteRouter);

  const { userRouter } = require("@/modules/users/users.routes");
  app.use("/api/users", userRouter);

  // Upload routes (admin only) - use the same requireAuth + requireRole as other admin routes
  const { uploadRoutes } = require("@/modules/upload/upload.routes");
  const { requireAuth, requireRole } = require("@/common/middleware/auth.middleware");

  app.use("/api/upload", requireAuth, requireRole('ADMIN'), uploadRoutes);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
