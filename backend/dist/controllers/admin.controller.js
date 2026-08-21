"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserRole = exports.getUsersList = exports.getDashboardStats = void 0;
const database_1 = require("../config/database");
const getDashboardStats = async (req, res, next) => {
    try {
        // Run concurrent queries for dashboard metrics
        const [usersRes, ordersRes, revenueRes, topMedicinesRes, recentOrdersRes] = await Promise.all([
            (0, database_1.query)('SELECT COUNT(*) as total FROM users'),
            (0, database_1.query)('SELECT COUNT(*) as total FROM orders'),
            (0, database_1.query)('SELECT SUM(total_amount) as total FROM orders WHERE status = $1', ['DELIVERED']),
            (0, database_1.query)(`
                SELECT m.name, SUM(oi.quantity) as sold
                FROM order_items oi
                JOIN medicines m ON oi.medicine_id = m.id
                JOIN orders o ON oi.order_id = o.id
                WHERE o.status = 'DELIVERED'
                GROUP BY m.name
                ORDER BY sold DESC
                LIMIT 5
            `),
            (0, database_1.query)(`
                SELECT o.order_number, o.total_amount, o.status, u.first_name, u.last_name, o.created_at
                FROM orders o
                JOIN users u ON o.customer_id = u.id
                ORDER BY o.created_at DESC
                LIMIT 10
            `)
        ]);
        // Simulated monthly revenue data for charts
        const monthlyRevenue = [
            { name: 'Jan', value: 4000 },
            { name: 'Feb', value: 3000 },
            { name: 'Mar', value: 5000 },
            { name: 'Apr', value: 8000 },
            { name: 'May', value: 6000 },
            { name: 'Jun', value: parseInt(revenueRes.rows[0].total || '0') }
        ];
        res.status(200).json({
            success: true,
            data: {
                totalUsers: parseInt(usersRes.rows[0].total),
                totalOrders: parseInt(ordersRes.rows[0].total),
                totalRevenue: parseInt(revenueRes.rows[0].total || '0'),
                monthlyRevenue,
                topMedicines: topMedicinesRes.rows,
                recentOrders: recentOrdersRes.rows
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardStats = getDashboardStats;
const getUsersList = async (req, res, next) => {
    try {
        const result = await (0, database_1.query)(`SELECT u.id, u.first_name, u.last_name, u.email, r.name as role, u.is_active, u.created_at 
             FROM users u
             LEFT JOIN user_roles ur ON u.id = ur.user_id 
             LEFT JOIN roles r ON ur.role_id = r.id
             ORDER BY u.created_at DESC`);
        res.status(200).json({ success: true, data: result.rows });
    }
    catch (error) {
        next(error);
    }
};
exports.getUsersList = getUsersList;
const updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role, is_active } = req.body;
        await (0, database_1.query)('BEGIN');
        if (is_active !== undefined) {
            await (0, database_1.query)('UPDATE users SET is_active = $1 WHERE id = $2', [is_active, id]);
        }
        if (role) {
            const roleResult = await (0, database_1.query)('SELECT id FROM roles WHERE name = $1', [role]);
            if (roleResult.rows.length > 0) {
                const roleId = roleResult.rows[0].id;
                await (0, database_1.query)('DELETE FROM user_roles WHERE user_id = $1', [id]);
                await (0, database_1.query)('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [id, roleId]);
            }
        }
        await (0, database_1.query)('COMMIT');
        res.status(200).json({ success: true, message: 'User updated successfully' });
    }
    catch (error) {
        await (0, database_1.query)('ROLLBACK');
        next(error);
    }
};
exports.updateUserRole = updateUserRole;
//# sourceMappingURL=admin.controller.js.map