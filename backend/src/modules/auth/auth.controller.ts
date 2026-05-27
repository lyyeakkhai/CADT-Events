import type { Request, Response, NextFunction } from "express";
import { authService } from "@/modules/auth/auth.service";
import type {
  LoginInput,
  RefreshInput,
  RegisterInput,
} from "@/modules/auth/auth.schema";
import type { AuthRequest } from "@/common/middleware/auth.middleware";
import { UnauthorizedError } from "@/common/errors/app-error";

export const authController = {
  async register(
    req: Request<unknown, unknown, RegisterInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  },

  async login(
    req: Request<unknown, unknown, LoginInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await authService.login(req.body);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async refresh(
    req: Request<unknown, unknown, RefreshInput>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await authService.refresh(req.body.refreshToken);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new UnauthorizedError();
      const user = await authService.me(req.user.id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  },
};
