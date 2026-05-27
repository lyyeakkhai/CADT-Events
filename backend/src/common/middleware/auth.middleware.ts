import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { UnauthorizedError, ForbiddenError } from "@/common/errors/app-error";

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as {
    id: string;
    email: string;
    role: string;
  };
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    next(new UnauthorizedError());
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    next(new UnauthorizedError());
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
}

export function requireRole(role: "ADMIN" | "STUDENT") {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }
    if (req.user.role !== role) {
      next(new ForbiddenError());
      return;
    }
    next();
  };
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    next();
    return;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    next();
    return;
  }

  try {
    req.user = verifyToken(token);
  } catch {
    // silently ignore for optional auth
  }
  next();
}
