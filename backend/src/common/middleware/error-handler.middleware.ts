import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { env } from "@/config/env";
import { AppError } from "@/common/errors/app-error";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.status).json({
      error: err.message,
      ...(err.code && { code: err.code }),
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      code: "VALIDATION_ERROR",
      issues: err.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
    return;
  }

  res.status(500).json({
    error: env.NODE_ENV === "development" ? err.message : "Internal Server Error",
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
