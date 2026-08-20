"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_controller_1 = require("../controllers/inventory.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// Protect all inventory routes
router.use(auth_middleware_1.authenticate);
router.use((0, role_middleware_1.requireRole)(['PHARMACY_ADMIN', 'PHARMACIST', 'SUPER_ADMIN']));
router.get('/', inventory_controller_1.getInventory);
router.post('/update', inventory_controller_1.updateStock);
exports.default = router;
//# sourceMappingURL=inventory.routes.js.map