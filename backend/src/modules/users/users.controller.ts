import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/express';
import { prisma } from '@/lib/prisma';
import { BadRequestError } from '@/common/errors/app-error';
import { isAdminEmail } from '@/config/admins';

type MappedUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  eventsJoined: number;
  totalCredits: number;
  role: 'admin' | 'user';
  joinDate: string;
};

export async function listAllUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const [users, admins] = await Promise.all([
      prisma.userAccount.findMany({
        include: {
          registrations: {
            where: { checked_in_at: { not: null } },
            include: { event: true },
          },
        },
      }),
      prisma.admin.findMany(),
    ]);

    // Merge by email so the same person is not listed twice (admin table + user_account).
    // Prefer admin role when both exist; keep registration stats from the student row.
    const byEmail = new Map<string, MappedUser>();

    for (const u of users) {
      const emailKey = u.email.trim().toLowerCase();
      const eventsJoined = u.registrations.length;
      const totalCredits = u.registrations.reduce(
        (sum, r) => sum + (r.event?.credit_value || 0),
        0
      );

      byEmail.set(emailKey, {
        id: u.user_id,
        name: u.full_name,
        email: u.email,
        avatarUrl: u.avatar_url ?? undefined,
        eventsJoined,
        totalCredits,
        // user_account roles are student/staff/guest — display as "user" (student) in admin UI
        role: 'user',
        joinDate: u.created_at ? u.created_at.toISOString() : new Date().toISOString(),
      });
    }

    for (const a of admins) {
      const emailKey = a.email.trim().toLowerCase();
      const existing = byEmail.get(emailKey);
      if (existing) {
        byEmail.set(emailKey, {
          ...existing,
          role: 'admin',
          // Prefer admin display name if present
          name: a.full_name || existing.name,
          // Stable unique key for React while preserving student stats
          id: existing.id.startsWith('admin:') ? existing.id : existing.id,
        });
      } else {
        byEmail.set(emailKey, {
          id: `admin:${a.admin_id}`,
          name: a.full_name,
          email: a.email,
          avatarUrl: undefined,
          eventsJoined: 0,
          totalCredits: 0,
          role: 'admin',
          joinDate: a.created_at ? a.created_at.toISOString() : new Date().toISOString(),
        });
      }
    }

    const combined = Array.from(byEmail.values()).sort(
      (a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
    );

    res.json({ success: true, data: combined });
  } catch (err) {
    next(err);
  }
}

/**
 * Invite a user via Clerk (real invitation email).
 * Body: { email: string, role?: 'admin' | 'user' }
 */
export async function inviteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    const roleRaw = String(req.body?.role || 'user').toLowerCase();
    const role = roleRaw === 'admin' ? 'admin' : 'user';

    if (!email || !email.includes('@')) {
      throw new BadRequestError('Valid email is required');
    }

    // Never invite someone as admin unless they are on ADMIN_EMAILS
    if (role === 'admin' && !isAdminEmail(email)) {
      throw new BadRequestError(
        'This email is not in ADMIN_EMAILS. Add it to the server env before inviting as admin.'
      );
    }

    const publicMetadata =
      role === 'admin' ? { role: 'ADMIN' } : { role: 'STUDENT' };

    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      publicMetadata,
      redirectUrl:
        process.env.ADMIN_INVITE_REDIRECT_URL ||
        process.env.FRONTEND_URL ||
        undefined,
      notify: true,
    });

    res.status(201).json({
      success: true,
      data: {
        id: invitation.id,
        email: invitation.emailAddress,
        status: invitation.status,
        role,
      },
      message: `Invitation sent to ${email}`,
    });
  } catch (err: any) {
    // Clerk errors often have errors[].message
    const clerkMsg =
      err?.errors?.[0]?.longMessage ||
      err?.errors?.[0]?.message ||
      err?.message;
    if (clerkMsg) {
      return next(new BadRequestError(clerkMsg));
    }
    next(err);
  }
}

/** GET /api/users/settings — load admin Settings UI values */
export async function getSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await prisma.systemSetting.findMany();
    const data: Record<string, unknown> = {};
    for (const row of rows) {
      try {
        data[row.key] = JSON.parse(row.value);
      } catch {
        data[row.key] = row.value;
      }
    }
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/users/settings — save a settings section (real DB) */
export async function putSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const section = String(req.body?.section || '').trim();
    const values = req.body?.values;
    if (!section || values === undefined) {
      throw new BadRequestError('section and values are required');
    }

    const userId = (req as any).customAuth?.userId as string | undefined;
    const key = `settings.${section}`;
    const value = JSON.stringify(values);

    await prisma.systemSetting.upsert({
      where: { key },
      create: { key, value, updated_by: userId ?? null },
      update: { value, updated_by: userId ?? null },
    });

    res.json({ success: true, data: { section, values } });
  } catch (err) {
    next(err);
  }
}
