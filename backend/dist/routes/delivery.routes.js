"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const delivery_controller_1 = require("../controllers/delivery.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Delivery Agent routes
router.get('/dashboard-stats', (0, role_middleware_1.requireRole)(['DELIVERY_AGENT']), delivery_controller_1.getDashboardStats);
router.get('/deliveries', (0, role_middleware_1.requireRole)(['DELIVERY_AGENT']), delivery_controller_1.getMyDeliveries);
router.patch('/deliveries/:id/status', (0, role_middleware_1.requireRole)(['DELIVERY_AGENT']), delivery_controller_1.updateDeliveryStatus);
// Management routes
router.post('/assign', (0, role_middleware_1.requireRole)(['SUPER_ADMIN', 'PHARMACY_ADMIN']), delivery_controller_1.assignDelivery);
exports.default = router;
//# sourceMappingURL=delivery.routes.js.map