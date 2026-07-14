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
  // crossOriginResourcePolicy: allow browser apps on Vercel to call this API
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  // CORS: localhost (dev) + FRONTEND_URL / ADMIN_URL (production Vercel origins)
  // Origins must match exactly (scheme + host, no trailing slash).
  const corsOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5174",
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,
    process.env.PUBLIC_WEB_URL,
  ]
    .filter(Boolean)
    .map((o) => String(o).replace(/\/$/, ""));

  app.use(
    cors({
      origin: (origin, callback) => {
        // Non-browser clients (curl, server-to-server) have no Origin
        if (!origin) return callback(null, true);
        const normalized = origin.replace(/\/$/, "");
        if (corsOrigins.includes(normalized)) return callback(null, true);
        callback(null, false);
      },
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
