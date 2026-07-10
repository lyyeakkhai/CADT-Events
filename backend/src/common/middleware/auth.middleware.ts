import type { Request, Response, NextFunction } from "express";
import { clerkClient, getAuth, verifyToken } from "@clerk/express";
import { ForbiddenError } from "@/common/errors/app-error";

/**
 * Custom authentication middleware.
 * Manually verifies the JWT to avoid cross-origin "pending" session issues in local dev.
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Missing Authorization header" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Missing token in Authorization header" });
    }
    const verified = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY as string,
    });

    if (!verified.sub) {
      return res.status(401).json({ success: false, message: "Invalid token subject" });
    }

    // Attach to request so requireRole can use it
    (req as any).customAuth = { userId: verified.sub, sessionClaims: verified };
    next();
  } catch (error: any) {
    console.error('[requireAuth] Manual verification failed:', error.message);
    return res.status(401).json({ 
      success: false, 
      message: "Unauthenticated: Clerk token invalid.",
      error: error.message
    });
  }
};

/**
 * Middleware to restrict access to certain roles.
 * Must be used AFTER requireAuth.
 * It fetches the user from Clerk and checks their publicMetadata.role.
 */
export function requireRole(role: "ADMIN" | "STUDENT") {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const auth = (req as any).customAuth || getAuth(req);
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
