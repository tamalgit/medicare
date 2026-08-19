import { Router } from 'express';
import { getAddresses, addAddress } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/addresses', getAddresses);
router.post('/addresses', addAddress);

export default router;
