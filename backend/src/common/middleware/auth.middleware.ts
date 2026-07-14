import type { Request, Response, NextFunction } from "express";
import { clerkClient, getAuth, verifyToken } from "@clerk/express";
import { ForbiddenError } from "@/common/errors/app-error";
import { isAdminEmail } from "@/config/admins";

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

function isAdminRoleValue(role: unknown): boolean {
  if (typeof role !== "string") return false;
  const r = role.toUpperCase();
  return r === "ADMIN" || r === "SUPER_ADMIN";
}

/**
 * Middleware to restrict access to certain roles.
 * Must be used AFTER requireAuth.
 * ADMIN: publicMetadata.role OR email in ADMIN_EMAILS (demo-safe if webhook lagged).
 */
export function requireRole(role: "ADMIN" | "STUDENT") {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const auth = (req as any).customAuth || getAuth(req);
      if (!auth || !auth.userId) {
        throw new ForbiddenError("Not authenticated");
      }

      const user = await clerkClient.users.getUser(auth.userId);
      const userRole = user.publicMetadata?.role;
      const primaryEmail =
        user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress ||
        user.emailAddresses[0]?.emailAddress;

      if (role === "ADMIN") {
        const allowed = isAdminRoleValue(userRole) || isAdminEmail(primaryEmail);
        if (!allowed) {
          throw new ForbiddenError("Insufficient permissions — admin role required");
        }

        // Heal Clerk metadata for demo teachers on allowlist but missing role
        if (!isAdminRoleValue(userRole) && isAdminEmail(primaryEmail)) {
          try {
            await clerkClient.users.updateUserMetadata(auth.userId, {
              publicMetadata: { ...user.publicMetadata, role: "ADMIN" },
            });
          } catch (e) {
            console.warn("[requireRole] Could not heal admin metadata:", e);
          }
        }

        next();
        return;
      }

      // STUDENT (or any authenticated user with student role)
      if (userRole && String(userRole).toUpperCase() !== role && !isAdminRoleValue(userRole)) {
        // Admins may also call student-facing endpoints when needed
        throw new ForbiddenError("Insufficient permissions");
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
