import { Router } from 'express';
import { assignDelivery, getMyDeliveries, updateDeliveryStatus, getDashboardStats } from '../controllers/delivery.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

// Delivery Agent routes
router.get('/dashboard-stats', requireRole(['DELIVERY_AGENT']), getDashboardStats);
router.get('/deliveries', requireRole(['DELIVERY_AGENT']), getMyDeliveries);
router.patch('/deliveries/:id/status', requireRole(['DELIVERY_AGENT']), updateDeliveryStatus);

// Management routes
router.post('/assign', requireRole(['SUPER_ADMIN', 'PHARMACY_ADMIN']), assignDelivery);

export default router;
