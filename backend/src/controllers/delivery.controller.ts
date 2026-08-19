import { Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const assignDelivery = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { orderId, agentId } = req.body;
        // This endpoint could be used by PHARMACY_ADMIN or automatically via a cron job

        await query('BEGIN');

        // Check order status
        const oRes = await query('SELECT status FROM orders WHERE id = $1', [orderId]);
        if (oRes.rows.length === 0) throw new Error('Order not found');
        if (oRes.rows[0].status !== 'PACKED') throw new Error('Order must be PACKED before assignment');

        // Check agent availability
        const aRes = await query('SELECT current_status FROM delivery_agents WHERE id = $1 AND is_active = true', [agentId]);
        if (aRes.rows.length === 0) throw new Error('Agent not found or inactive');
        if (aRes.rows[0].current_status !== 'AVAILABLE') throw new Error('Agent is not currently available');

        // Create Delivery record
        await query(
            'INSERT INTO deliveries (order_id, agent_id, status) VALUES ($1, $2, $3)',
            [orderId, agentId, 'ASSIGNED']
        );

        // Update Agent status
        await query('UPDATE delivery_agents SET current_status = $1 WHERE id = $2', ['BUSY', agentId]);

        // Update Order status
        await query('UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', ['SHIPPED', orderId]);

        // Log Order history
        await query(
            'INSERT INTO order_status_history (order_id, status, remarks, created_by) VALUES ($1, $2, $3, $4)',
            [orderId, 'SHIPPED', `Assigned to Delivery Agent: ${agentId}`, req.user.id]
        );

        await query('COMMIT');
        res.status(200).json({ success: true, message: 'Delivery successfully assigned' });
    } catch (error: any) {
        await query('ROLLBACK');
        res.status(400).json({ success: false, message: error.message });
    }
};

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;
        const agentRes = await query('SELECT id FROM delivery_agents WHERE user_id = $1', [userId]);
        if (agentRes.rows.length === 0) return res.status(404).json({ success: false, message: 'Delivery agent profile not found' });
        const agentId = agentRes.rows[0].id;

        const result = await query(`
            SELECT 
                COUNT(CASE WHEN status = 'ASSIGNED' THEN 1 END) as assigned_count,
                COUNT(CASE WHEN status = 'PICKED_UP' THEN 1 END) as pickup_count,
                COUNT(CASE WHEN status = 'IN_TRANSIT' THEN 1 END) as transit_count,
                COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) as delivered_count
            FROM deliveries
            WHERE agent_id = $1
        `, [agentId]);

        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (error) {
        next(error);
    }
};

export const getMyDeliveries = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;
        
        // Find agent ID for this user
        const agentRes = await query('SELECT id FROM delivery_agents WHERE user_id = $1', [userId]);
        if (agentRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Delivery agent profile not found' });
        }
        const agentId = agentRes.rows[0].id;

        const result = await query(`
            SELECT 
                d.*, 
                o.order_number, o.total_amount, o.delivery_type, 
                u.first_name, u.last_name, u.mobile,
                ca.street_address as customer_street, ca.city as customer_city, ca.pincode as customer_pincode,
                p.name as pharmacy_name, p.address as pharmacy_address, p.contact_phone as pharmacy_phone,
                (SELECT SUM(quantity) FROM order_items WHERE order_id = o.id) as package_count
            FROM deliveries d
            JOIN orders o ON d.order_id = o.id
            JOIN users u ON o.customer_id = u.id
            LEFT JOIN customer_addresses ca ON o.address_id = ca.id
            LEFT JOIN pharmacies p ON o.pharmacy_id = p.id
            WHERE d.agent_id = $1
            ORDER BY d.created_at DESC
        `, [agentId]);

        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
};

export const updateDeliveryStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;
        const { id } = req.params; // Delivery ID
        const { status, notes } = req.body; 
        // status: PICKED_UP, IN_TRANSIT, DELIVERED, FAILED

        const agentRes = await query('SELECT id FROM delivery_agents WHERE user_id = $1', [userId]);
        if (agentRes.rows.length === 0) throw new Error('Agent profile not found');
        const agentId = agentRes.rows[0].id;

        await query('BEGIN');

        // Get delivery to ensure ownership and fetch order_id
        const dRes = await query('SELECT order_id FROM deliveries WHERE id = $1 AND agent_id = $2', [id, agentId]);
        if (dRes.rows.length === 0) throw new Error('Delivery not found or not assigned to you');
        const orderId = dRes.rows[0].order_id;

        // Update delivery
        let timeUpdateQuery = '';
        if (status === 'PICKED_UP') timeUpdateQuery = ', pickup_time = CURRENT_TIMESTAMP';
        if (status === 'DELIVERED') timeUpdateQuery = ', delivery_time = CURRENT_TIMESTAMP';

        await query(
            `UPDATE deliveries SET status = $1, delivery_notes = $2, updated_at = CURRENT_TIMESTAMP ${timeUpdateQuery} WHERE id = $3`,
            [status, notes || '', id]
        );

        // Update order status if DELIVERED or FAILED
        let orderStatus = '';
        if (status === 'DELIVERED') orderStatus = 'DELIVERED';
        if (status === 'FAILED') orderStatus = 'DELIVERY_FAILED';

        if (orderStatus) {
            await query('UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [orderStatus, orderId]);
            await query(
                'INSERT INTO order_status_history (order_id, status, remarks, created_by) VALUES ($1, $2, $3, $4)',
                [orderId, orderStatus, notes || `Delivery ${status}`, userId]
            );
        }

        // If delivered or failed, free up the agent
        if (status === 'DELIVERED' || status === 'FAILED') {
            await query('UPDATE delivery_agents SET current_status = $1 WHERE id = $2', ['AVAILABLE', agentId]);
        }

        await query('COMMIT');
        res.status(200).json({ success: true, message: 'Delivery status updated' });
    } catch (error: any) {
        await query('ROLLBACK');
        res.status(400).json({ success: false, message: error.message });
    }
};
