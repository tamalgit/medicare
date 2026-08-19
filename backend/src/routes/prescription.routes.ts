import { Router } from 'express';
import { 
    uploadPrescriptionHandler, 
    linkPrescriptionHandler,
    getPrescriptions, 
    verifyPrescription, 
    downloadPrescription 
} from '../controllers/prescription.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { uploadPrescription } from '../middleware/upload.middleware';

const router = Router();

// Protect all routes
router.use(authenticate);

// Customer & Pharmacist routes
router.get('/', getPrescriptions);
router.get('/:id/download', downloadPrescription);

// Customer only
router.post('/upload', requireRole(['CUSTOMER']), uploadPrescription.single('prescription'), uploadPrescriptionHandler);
router.post('/:id/link', requireRole(['CUSTOMER']), linkPrescriptionHandler);

// Pharmacist only
router.post('/:id/verify', requireRole(['PHARMACIST', 'SUPER_ADMIN']), verifyPrescription);

export default router;
