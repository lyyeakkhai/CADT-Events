import { Router } from 'express';
import { requireAuth, requireRole } from '@/common/middleware/auth.middleware';
import {
  listAllUsers,
  inviteUser,
  getSettings,
  putSettings,
} from './users.controller';

const router = Router();

// GET /api/users — list all users and admins (Admin only)
router.get('/', requireAuth, requireRole('ADMIN'), listAllUsers);

// POST /api/users/invite — Clerk invitation email
router.post('/invite', requireAuth, requireRole('ADMIN'), inviteUser);

// Settings (admin UI) — persisted in system_setting
router.get('/settings', requireAuth, requireRole('ADMIN'), getSettings);
router.put('/settings', requireAuth, requireRole('ADMIN'), putSettings);

export const userRouter = router;
