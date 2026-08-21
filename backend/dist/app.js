"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const medicine_routes_1 = __importDefault(require("./routes/medicine.routes"));
const inventory_routes_1 = __importDefault(require("./routes/inventory.routes"));
const prescription_routes_1 = __importDefault(require("./routes/prescription.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const delivery_routes_1 = __importDefault(require("./routes/delivery.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const pharmacy_routes_1 = __importDefault(require("./routes/pharmacy.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve uploads folder statically
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/medicines', medicine_routes_1.default);
app.use('/api/inventory', inventory_routes_1.default);
app.use('/api/prescriptions', prescription_routes_1.default);
app.use('/api/orders', order_routes_1.default);
app.use('/api/deliveries', delivery_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
app.use('/api/pharmacy', pharmacy_routes_1.default);
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API is running' });
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        errors: err.errors || []
    });
});
exports.default = app;
//# sourceMappingURL=app.js.map