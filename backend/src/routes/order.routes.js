"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Customer
router.post('/', (0, role_middleware_1.requireRole)(['CUSTOMER']), order_controller_1.createOrder);
router.get('/my-orders', (0, role_middleware_1.requireRole)(['CUSTOMER']), order_controller_1.getCustomerOrders);
// Pharmacy
router.get('/pharmacy', (0, role_middleware_1.requireRole)(['PHARMACY_ADMIN', 'PHARMACIST', 'SUPER_ADMIN']), order_controller_1.getPharmacyOrders);
// Dynamic routes must come last
router.get('/:id', (0, role_middleware_1.requireRole)(['CUSTOMER', 'PHARMACY_ADMIN', 'PHARMACIST', 'SUPER_ADMIN']), order_controller_1.getOrderById);
router.patch('/:id/status', (0, role_middleware_1.requireRole)(['PHARMACY_ADMIN', 'PHARMACIST', 'SUPER_ADMIN']), order_controller_1.updateOrderStatus);
exports.default = router;
//# sourceMappingURL=order.routes.js.map