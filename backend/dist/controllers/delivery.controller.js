"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDeliveryStatus = exports.getMyDeliveries = exports.getDashboardStats = exports.assignDelivery = void 0;
const database_1 = require("../config/database");
const assignDelivery = async (req, res, next) => {
    try {
        const { orderId, agentId } = req.body;
        // This endpoint could be used by PHARMACY_ADMIN or automatically via a cron job
        await (0, database_1.query)('BEGIN');
        // Check order status
        const oRes = await (0, database_1.query)('SELECT status FROM orders WHERE id = $1', [orderId]);
        if (oRes.rows.length === 0)
            throw new Error('Order not found');
        if (oRes.rows[0].status !== 'PACKED')
            throw new Error('Order must be PACKED before assignment');
        // Check agent availability
        const aRes = await (0, database_1.query)('SELECT current_status FROM delivery_agents WHERE id = $1 AND is_active = true', [agentId]);
        if (aRes.rows.length === 0)
            throw new Error('Agent not found or inactive');
        if (aRes.rows[0].current_status !== 'AVAILABLE')
            throw new Error('Agent is not currently available');
        // Create Delivery record
        await (0, database_1.query)('INSERT INTO deliveries (order_id, agent_id, status) VALUES ($1, $2, $3)', [orderId, agentId, 'ASSIGNED']);
        // Update Agent status
        await (0, database_1.query)('UPDATE delivery_agents SET current_status = $1 WHERE id = $2', ['BUSY', agentId]);
        // Log Order history
        await (0, database_1.query)('INSERT INTO order_status_history (order_id, status, remarks, created_by) VALUES ($1, $2, $3, $4)', [orderId, 'PACKED', `Assigned to Delivery Agent: ${agentId}`, req.user.id]);
        await (0, database_1.query)('COMMIT');
        res.status(200).json({ success: true, message: 'Delivery successfully assigned' });
    }
    catch (error) {
        await (0, database_1.query)('ROLLBACK');
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.assignDelivery = assignDelivery;
const getDashboardStats = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const agentRes = await (0, database_1.query)('SELECT id FROM delivery_agents WHERE user_id = $1', [userId]);
        if (agentRes.rows.length === 0)
            return res.status(404).json({ success: false, message: 'Delivery agent profile not found' });
        const agentId = agentRes.rows[0].id;
        const result = await (0, database_1.query)(`
            SELECT 
                COUNT(CASE WHEN status = 'ASSIGNED' THEN 1 END) as assigned_count,
                COUNT(CASE WHEN status = 'PICKED_UP' THEN 1 END) as pickup_count,
                COUNT(CASE WHEN status = 'IN_TRANSIT' THEN 1 END) as transit_count,
                COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) as delivered_count
            FROM deliveries
            WHERE agent_id = $1
        `, [agentId]);
        res.status(200).json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardStats = getDashboardStats;
const getMyDeliveries = async (req, res, next) => {
    try {
        const userId = req.user.id;
        // Find agent ID for this user
        const agentRes = await (0, database_1.query)('SELECT id FROM delivery_agents WHERE user_id = $1', [userId]);
        if (agentRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Delivery agent profile not found' });
        }
        const agentId = agentRes.rows[0].id;
        const result = await (0, database_1.query)(`
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
    }
    catch (error) {
        next(error);
    }
};
exports.getMyDeliveries = getMyDeliveries;
const updateDeliveryStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params; // Delivery ID
        const { status, notes, otp } = req.body;
        // status: PICKED_UP, IN_TRANSIT, DELIVERED, FAILED
        const agentRes = await (0, database_1.query)('SELECT id FROM delivery_agents WHERE user_id = $1', [userId]);
        if (agentRes.rows.length === 0)
            throw new Error('Agent profile not found');
        const agentId = agentRes.rows[0].id;
        await (0, database_1.query)('BEGIN');
        // Get delivery to ensure ownership and fetch order_id
        const dRes = await (0, database_1.query)('SELECT order_id, otp FROM deliveries WHERE id = $1 AND agent_id = $2', [id, agentId]);
        if (dRes.rows.length === 0)
            throw new Error('Delivery not found or not assigned to you');
        const orderId = dRes.rows[0].order_id;
        const storedOtp = dRes.rows[0].otp;
        if (status === 'DELIVERED') {
            if (!otp)
                throw new Error('OTP is required for successful delivery');
            if (otp !== storedOtp)
                throw new Error('Invalid OTP. Delivery verification failed.');
        }
        // Update delivery
        let timeUpdateQuery = '';
        let otpQuery = '';
        const updateParams = [status, notes || '', id];
        let paramCount = 4;
        if (status === 'PICKED_UP') {
            timeUpdateQuery = ', pickup_time = CURRENT_TIMESTAMP';
            // Generate OTP
            const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
            otpQuery = `, otp = $${paramCount}`;
            updateParams.push(generatedOtp);
            paramCount++;
            // Mock sending email and SMS
            const userRes = await (0, database_1.query)(`
                SELECT u.email, u.mobile, o.order_number 
                FROM orders o JOIN users u ON o.customer_id = u.id 
                WHERE o.id = $1
            `, [orderId]);
            if (userRes.rows.length > 0) {
                const user = userRes.rows[0];
                console.log(`\n========================================`);
                console.log(`[MOCK EMAIL] To: ${user.email}`);
                console.log(`Subject: Your order ${user.order_number} has been picked up`);
                console.log(`Body: Your delivery code (OTP) is ${generatedOtp}. Please share this with the delivery agent to receive your order.`);
                console.log(`----------------------------------------`);
                console.log(`[MOCK SMS] To: ${user.mobile}`);
                console.log(`Body: Your delivery code for order ${user.order_number} is ${generatedOtp}. Share with agent to receive your order.`);
                console.log(`========================================\n`);
            }
        }
        if (status === 'DELIVERED')
            timeUpdateQuery = ', delivery_time = CURRENT_TIMESTAMP';
        await (0, database_1.query)(`UPDATE deliveries SET status = $1, delivery_notes = $2, updated_at = CURRENT_TIMESTAMP ${timeUpdateQuery} ${otpQuery} WHERE id = $3`, updateParams);
        // Update order status if DELIVERED, FAILED, or PICKED_UP
        let orderStatus = '';
        if (status === 'PICKED_UP')
            orderStatus = 'SHIPPED';
        if (status === 'DELIVERED')
            orderStatus = 'DELIVERED';
        if (status === 'FAILED')
            orderStatus = 'DELIVERY_FAILED';
        if (orderStatus) {
            await (0, database_1.query)('UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [orderStatus, orderId]);
            await (0, database_1.query)('INSERT INTO order_status_history (order_id, status, remarks, created_by) VALUES ($1, $2, $3, $4)', [orderId, orderStatus, notes || `Delivery ${status}`, userId]);
        }
        // If delivered or failed, free up the agent
        if (status === 'DELIVERED' || status === 'FAILED') {
            await (0, database_1.query)('UPDATE delivery_agents SET current_status = $1 WHERE id = $2', ['AVAILABLE', agentId]);
        }
        await (0, database_1.query)('COMMIT');
        res.status(200).json({ success: true, message: 'Delivery status updated' });
    }
    catch (error) {
        await (0, database_1.query)('ROLLBACK');
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.updateDeliveryStatus = updateDeliveryStatus;
//# sourceMappingURL=delivery.controller.js.map