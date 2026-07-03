import type { Request, Response, NextFunction } from "express";
import { requireAuth as clerkRequireAuth, clerkClient, getAuth } from "@clerk/express";
import { ForbiddenError } from "@/common/errors/app-error";

/**
 * Middleware that strictly requires an authenticated user.
 * It uses Clerk's requireAuth under the hood.
 * If the user is unauthenticated, it returns a 401 response.
 */
export const requireAuth = clerkRequireAuth();

/**
 * Middleware to restrict access to certain roles.
 * Must be used AFTER requireAuth.
 * It fetches the user from Clerk and checks their publicMetadata.role.
 */
export function requireRole(role: "ADMIN" | "STUDENT") {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      if (!auth || !auth.userId) {
        throw new ForbiddenError("Not authenticated");
      }

      // Fetch the full user object from Clerk to check metadata
      const user = await clerkClient.users.getUser(auth.userId);
      const userRole = user.publicMetadata?.role as string;

      if (userRole !== role && (role === "ADMIN" && userRole !== "admin")) {
        throw new ForbiddenError("Insufficient permissions");
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
