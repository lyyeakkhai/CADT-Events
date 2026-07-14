import { Router } from "express";
import { getMyNotifications, markAsRead, getAdminNotifications } from "./notifications.controller";
import { requireAuth, requireRole } from "@/common/middleware/auth.middleware";

export const notificationRouter = Router();

// GET /api/notifications/admin
notificationRouter.get("/admin", requireAuth, requireRole('ADMIN'), getAdminNotifications);

// GET /api/notifications/me
notificationRouter.get("/me", requireAuth, getMyNotifications);

// PATCH /api/notifications/:id/read
notificationRouter.patch("/:id/read", requireAuth, markAsRead);
