import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/lib/prisma';

export async function listAllUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const [users, admins] = await Promise.all([
      prisma.userAccount.findMany({
        include: {
          registrations: {
            where: { checked_in_at: { not: null } },
            include: { event: true }
          }
        }
      }),
      prisma.admin.findMany()
    ]);

    const mappedUsers = users.map(u => {
      const eventsJoined = u.registrations.length;
      const totalCredits = u.registrations.reduce((sum, r) => sum + (r.event?.credit_value || 0), 0);
      
      return {
        id: u.user_id,
        name: u.full_name,
        email: u.email,
        avatarUrl: u.avatar_url,
        eventsJoined,
        totalCredits,
        role: 'user',
        joinDate: u.created_at ? u.created_at.toISOString() : new Date().toISOString()
      };
    });

    const mappedAdmins = admins.map(a => ({
      id: a.admin_id,
      name: a.full_name,
      email: a.email,
      avatarUrl: undefined,
      eventsJoined: 0,
      totalCredits: 0,
      role: 'admin',
      joinDate: a.created_at ? a.created_at.toISOString() : new Date().toISOString()
    }));

    // Combine and sort by join date (newest first)
    const combined = [...mappedUsers, ...mappedAdmins].sort((a, b) => 
      new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()
    );

    res.json({ success: true, data: combined });
  } catch (err) {
    next(err);
  }
}
