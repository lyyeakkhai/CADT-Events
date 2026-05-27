import { Router } from "express";
import { authController } from "@/modules/auth/auth.controller";
import {
  loginSchema,
  refreshSchema,
  registerSchema,
} from "@/modules/auth/auth.schema";
import { authenticate } from "@/common/middleware/auth.middleware";
import { validate } from "@/common/middleware/validate.middleware";

const router = Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.get("/me", authenticate, authController.me);

export const authRoutes = router;
