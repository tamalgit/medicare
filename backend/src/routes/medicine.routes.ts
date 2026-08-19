import { Router } from 'express';
import { getCategories, getManufacturers, searchMedicines, getMedicineDetails, addMedicine } from '../controllers/medicine.controller';
import { uploadMedicineImage } from '../middleware/upload.middleware';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.get('/categories', getCategories);
router.get('/manufacturers', getManufacturers);
router.post('/', authenticate, requireRole(['PHARMACY_ADMIN', 'SUPER_ADMIN']), uploadMedicineImage.single('image'), addMedicine);
router.get('/search', searchMedicines);
router.get('/:id', getMedicineDetails);
router.get('/', searchMedicines); // fallback

export default router;
