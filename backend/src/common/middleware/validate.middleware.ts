import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodType } from "zod";
import { BadRequestError } from "@/common/errors/app-error";

type Source = "body" | "query" | "params";

export function validate<T>(schema: ZodType<T>, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[source]);
      // Replace the source with the parsed (and possibly coerced) data
      (req as unknown as Record<Source, unknown>)[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.issues
          .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
          .join("; ");
        next(new BadRequestError(message, "VALIDATION_ERROR"));
        return;
      }
      next(err);
    }
  };
}
