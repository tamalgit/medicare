"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPharmacyDashboardStats = void 0;
const database_1 = require("../config/database");
const getPharmacyDashboardStats = async (req, res, next) => {
    try {
        const role = req.user.role;
        let data = {};
        if (role === 'PHARMACIST' || role === 'SUPER_ADMIN') {
            const [pendingRes, approvedTodayRes, clarifyRes, urgentPrescriptionsRes] = await Promise.all([
                (0, database_1.query)("SELECT COUNT(*) as count FROM prescriptions WHERE status IN ('UPLOADED', 'UNDER_REVIEW')"),
                (0, database_1.query)("SELECT COUNT(*) as count FROM prescriptions WHERE status = 'APPROVED' AND DATE(updated_at) = CURRENT_DATE"),
                (0, database_1.query)("SELECT COUNT(*) as count FROM prescriptions WHERE status = 'CLARIFICATION_REQUIRED'"),
                (0, database_1.query)(`
                    SELECT p.id, p.status, p.created_at, u.first_name, u.last_name
                    FROM prescriptions p
                    JOIN users u ON p.customer_id = u.id
                    WHERE p.status IN ('UPLOADED', 'UNDER_REVIEW', 'CLARIFICATION_REQUIRED')
                    ORDER BY p.created_at ASC
                    LIMIT 5
                `)
            ]);
            data = {
                ...data,
                clinicalStats: {
                    pendingApproval: parseInt(pendingRes.rows[0].count),
                    approvedToday: parseInt(approvedTodayRes.rows[0].count),
                    clarificationNeeded: parseInt(clarifyRes.rows[0].count),
                    urgentPrescriptions: urgentPrescriptionsRes.rows
                }
            };
        }
        if (role === 'PHARMACY_ADMIN' || role === 'SUPER_ADMIN') {
            const [newOrdersRes, processingRes, completedRes, cancelledRes, revenueRes, recentOrdersRes] = await Promise.all([
                (0, database_1.query)("SELECT COUNT(*) as count FROM orders WHERE status IN ('PENDING', 'PRESCRIPTION_PENDING')"),
                (0, database_1.query)("SELECT COUNT(*) as count FROM orders WHERE status IN ('READY_TO_SHIP', 'SHIPPED')"),
                (0, database_1.query)("SELECT COUNT(*) as count FROM orders WHERE status = 'DELIVERED'"),
                (0, database_1.query)("SELECT COUNT(*) as count FROM orders WHERE status IN ('CANCELLED', 'REJECTED')"),
                (0, database_1.query)("SELECT SUM(total_amount) as total FROM orders WHERE status = 'DELIVERED'"),
                (0, database_1.query)(`
                    SELECT o.id, o.order_number, o.status, o.total_amount, o.created_at, u.first_name, u.last_name, u.mobile 
                    FROM orders o 
                    JOIN users u ON o.customer_id = u.id 
                    ORDER BY o.created_at DESC 
                    LIMIT 5
                `)
            ]);
            data = {
                ...data,
                adminStats: {
                    newOrders: parseInt(newOrdersRes.rows[0].count),
                    processingOrders: parseInt(processingRes.rows[0].count),
                    completedOrders: parseInt(completedRes.rows[0].count),
                    cancelledOrders: parseInt(cancelledRes.rows[0].count),
                    totalRevenue: parseInt(revenueRes.rows[0].total || '0'),
                    recentOrders: recentOrdersRes.rows
                }
            };
        }
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
};
exports.getPharmacyDashboardStats = getPharmacyDashboardStats;
//# sourceMappingURL=pharmacy.controller.js.map