import { Router } from "express";
import { getMyFavorites, toggleFavorite } from "./favorites.controller";
import { requireAuth } from "@/common/middleware/auth.middleware";

export const favoriteRouter = Router();

// GET /api/favorites/me
favoriteRouter.get("/me", requireAuth, getMyFavorites);

// POST /api/favorites/toggle
favoriteRouter.post("/toggle", requireAuth, toggleFavorite);
