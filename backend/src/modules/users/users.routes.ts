import { Router } from 'express';
import { requireAuth, requireRole } from '@/common/middleware/auth.middleware';
import { listAllUsers } from './users.controller';

const router = Router();

// GET /api/users — list all users and admins (Admin only)
router.get('/', requireAuth, requireRole('ADMIN'), listAllUsers);

export const userRouter = router;
