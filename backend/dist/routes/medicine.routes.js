"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const medicine_controller_1 = require("../controllers/medicine.controller");
const upload_middleware_1 = require("../middleware/upload.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
router.get('/categories', medicine_controller_1.getCategories);
router.get('/manufacturers', medicine_controller_1.getManufacturers);
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.requireRole)(['PHARMACY_ADMIN', 'SUPER_ADMIN']), upload_middleware_1.uploadMedicineImage.single('image'), medicine_controller_1.addMedicine);
router.get('/search', medicine_controller_1.searchMedicines);
router.get('/:id', medicine_controller_1.getMedicineDetails);
router.get('/', medicine_controller_1.searchMedicines); // fallback
exports.default = router;
//# sourceMappingURL=medicine.routes.js.map