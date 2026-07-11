import { Router } from "express";
import { getMyNotifications, markAsRead } from "./notifications.controller";
import { requireAuth } from "@/common/middleware/auth.middleware";

export const notificationRouter = Router();

// GET /api/notifications/me
notificationRouter.get("/me", requireAuth, getMyNotifications);

// PATCH /api/notifications/:id/read
notificationRouter.patch("/:id/read", requireAuth, markAsRead);
