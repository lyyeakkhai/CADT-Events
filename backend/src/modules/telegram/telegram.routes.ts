import { Router } from 'express';
import { requireAuth } from '@/common/middleware/auth.middleware';
import { getConnectLink, getTelegramStatus } from './telegram.controller';

const router = Router();

// All telegram user-facing routes require auth
router.get('/connect', requireAuth, getConnectLink);
router.get('/status', requireAuth, getTelegramStatus);

// Future admin broadcast could live under /admin/notify using the service helpers.

export const telegramRouter = router;
