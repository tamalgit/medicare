import { Router } from 'express';
import { getDashboardStats, getUsersList, updateUserRole } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Only SUPER_ADMIN can access these routes
router.use(authenticate);
router.use(requireRole(['SUPER_ADMIN']));

router.get('/dashboard-stats', getDashboardStats);
router.get('/users', getUsersList);
router.patch('/users/:id', updateUserRole);

export default router;
