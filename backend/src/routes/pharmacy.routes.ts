import { Router } from 'express';
import { getPharmacyDashboardStats } from '../controllers/pharmacy.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Protect all routes
router.use(authenticate);

// Allowed roles for pharmacy dashboard
router.use(requireRole(['PHARMACY_ADMIN', 'PHARMACIST', 'SUPER_ADMIN']));

router.get('/dashboard-stats', getPharmacyDashboardStats);

export default router;
