"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
// Only SUPER_ADMIN can access these routes
router.use(auth_middleware_1.authenticate);
router.use((0, role_middleware_1.requireRole)(['SUPER_ADMIN']));
router.get('/dashboard-stats', admin_controller_1.getDashboardStats);
router.get('/users', admin_controller_1.getUsersList);
router.patch('/users/:id', admin_controller_1.updateUserRole);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map