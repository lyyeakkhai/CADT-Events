import type { Request, Response, NextFunction } from "express";
import { env } from "@/config/env";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  const status = "status" in err ? (err as { status: number }).status : 500;

  res.status(status).json({
    error: err.message || "Internal Server Error",
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
