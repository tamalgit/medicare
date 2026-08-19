import { Router } from 'express';
import { createOrder, getCustomerOrders, getPharmacyOrders, updateOrderStatus, getOrderById } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

// Customer
router.post('/', requireRole(['CUSTOMER']), createOrder);
router.get('/my-orders', requireRole(['CUSTOMER']), getCustomerOrders);

// Pharmacy
router.get('/pharmacy', requireRole(['PHARMACY_ADMIN', 'PHARMACIST', 'SUPER_ADMIN']), getPharmacyOrders);

// Dynamic routes must come last
router.get('/:id', requireRole(['CUSTOMER', 'PHARMACY_ADMIN', 'PHARMACIST', 'SUPER_ADMIN']), getOrderById);
router.patch('/:id/status', requireRole(['PHARMACY_ADMIN', 'PHARMACIST', 'SUPER_ADMIN']), updateOrderStatus);

export default router;
