"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prescription_controller_1 = require("../controllers/prescription.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
// Protect all routes
router.use(auth_middleware_1.authenticate);
// Customer & Pharmacist routes
router.get('/', prescription_controller_1.getPrescriptions);
router.get('/:id/download', prescription_controller_1.downloadPrescription);
// Customer only
router.post('/upload', (0, role_middleware_1.requireRole)(['CUSTOMER']), upload_middleware_1.uploadPrescription.single('prescription'), prescription_controller_1.uploadPrescriptionHandler);
router.post('/:id/link', (0, role_middleware_1.requireRole)(['CUSTOMER']), prescription_controller_1.linkPrescriptionHandler);
// Pharmacist only
router.post('/:id/verify', (0, role_middleware_1.requireRole)(['PHARMACIST', 'SUPER_ADMIN']), prescription_controller_1.verifyPrescription);
exports.default = router;
//# sourceMappingURL=prescription.routes.js.map