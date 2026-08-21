"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/addresses', user_controller_1.getAddresses);
router.post('/addresses', user_controller_1.addAddress);
exports.default = router;
//# sourceMappingURL=user.routes.js.map