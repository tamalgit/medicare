"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pharmacy_controller_1 = require("../controllers/pharmacy.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// Protect all routes
router.use(auth_middleware_1.authenticate);
// Allowed roles for pharmacy dashboard
router.use((0, role_middleware_1.requireRole)(['PHARMACY_ADMIN', 'PHARMACIST', 'SUPER_ADMIN']));
router.get('/dashboard-stats', pharmacy_controller_1.getPharmacyDashboardStats);
exports.default = router;
//# sourceMappingURL=pharmacy.routes.js.map