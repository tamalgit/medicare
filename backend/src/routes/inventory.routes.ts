import { Router } from 'express';
import { getInventory, updateStock } from '../controllers/inventory.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

// Protect all inventory routes
router.use(authenticate);
router.use(requireRole(['PHARMACY_ADMIN', 'PHARMACIST', 'SUPER_ADMIN']));

router.get('/', getInventory);
router.post('/update', updateStock);

export default router;
