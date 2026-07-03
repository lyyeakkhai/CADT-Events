import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { clerkMiddleware } from "@clerk/express";
import { env } from "@/config/env";
import { errorHandler } from "@/common/middleware/error-handler.middleware";
import { clerkWebhookRouter } from "@/modules/webhooks/clerk.routes";

export function createApp() {
  const app = express();

  // Security & parsing
  app.use(helmet());
  app.use(cors());
  
  // Webhooks (must be before express.json so body-parser raw works)
  app.use("/api/webhooks", clerkWebhookRouter);

  app.use(express.json());
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }));

  // Initialize Clerk Middleware
  // This exposes the `req.auth` property for downstream middleware/handlers
  app.use(clerkMiddleware());

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", env: env.NODE_ENV });
  });

  // NOTE: Old JWT auth routes removed, Clerk handles signin/signup flows

  // Example of how a protected route would look using our new auth middleware:
  // import { requireAuth } from "@/common/middleware/auth.middleware";
  // app.use("/api/events", requireAuth, eventRoutes);
  
  // Upload routes
  const { uploadRoutes } = require("@/modules/upload/upload.routes");
  const { requireAuth, requireRole } = require("@/common/middleware/auth.middleware");
  
  app.use("/api/upload", requireAuth, requireRole("ADMIN"), uploadRoutes);

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
