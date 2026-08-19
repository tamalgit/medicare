import { Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // Run concurrent queries for dashboard metrics
        const [usersRes, ordersRes, revenueRes, topMedicinesRes, recentOrdersRes] = await Promise.all([
            query('SELECT COUNT(*) as total FROM users'),
            query('SELECT COUNT(*) as total FROM orders'),
            query('SELECT SUM(total_amount) as total FROM orders WHERE status = $1', ['DELIVERED']),
            query(`
                SELECT m.name, SUM(oi.quantity) as sold
                FROM order_items oi
                JOIN medicines m ON oi.medicine_id = m.id
                JOIN orders o ON oi.order_id = o.id
                WHERE o.status = 'DELIVERED'
                GROUP BY m.name
                ORDER BY sold DESC
                LIMIT 5
            `),
            query(`
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
    } catch (error) {
        next(error);
    }
};

export const getUsersList = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const result = await query(
            'SELECT id, first_name, last_name, email, role, is_active, created_at FROM users ORDER BY created_at DESC'
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
};

export const updateUserRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { role, is_active } = req.body;

        await query(
            'UPDATE users SET role = COALESCE($1, role), is_active = COALESCE($2, is_active) WHERE id = $3',
            [role, is_active, id]
        );

        res.status(200).json({ success: true, message: 'User updated successfully' });
    } catch (error) {
        next(error);
    }
};
