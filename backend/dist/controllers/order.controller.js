"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getPharmacyOrders = exports.getOrderById = exports.getCustomerOrders = exports.createOrder = void 0;
const database_1 = require("../config/database");
const createOrder = async (req, res, next) => {
    try {
        const customerId = req.user.id;
        const { addressId, cartItems, prescriptionIds, couponCode, deliveryType, paymentMethod } = req.body;
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }
        await (0, database_1.query)('BEGIN');
        // 1. Calculate totals & Validate Prescription Requirements
        let subtotal = 0;
        let requiresPrescription = false;
        for (const item of cartItems) {
            const medRes = await (0, database_1.query)('SELECT selling_price, prescription_required FROM medicines WHERE id = $1', [item.medicine_id]);
            if (medRes.rows.length === 0)
                throw new Error(`Medicine ${item.medicine_id} not found`);
            const med = medRes.rows[0];
            subtotal += parseFloat(med.selling_price) * item.quantity;
            if (med.prescription_required)
                requiresPrescription = true;
            // Note: Inventory validation could be inserted here.
        }
        if (requiresPrescription && (!prescriptionIds || prescriptionIds.length === 0)) {
            throw new Error('Prescription is required for one or more medicines in the cart');
        }
        // 2. Validate Prescriptions if required
        if (requiresPrescription) {
            for (const pid of prescriptionIds) {
                const pRes = await (0, database_1.query)('SELECT status FROM prescriptions WHERE id = $1 AND customer_id = $2', [pid, customerId]);
                if (pRes.rows.length === 0)
                    throw new Error(`Prescription ${pid} not found or unauthorized`);
                // Assume VERIFIED/APPROVED is required in a strict system, but prompt says it can be PRESCRIPTION_PENDING status.
            }
        }
        // 3. Apply Coupon (mock basic logic)
        let discountAmount = 0;
        let couponId = null;
        if (couponCode) {
            const couponRes = await (0, database_1.query)('SELECT id, discount_type, discount_value, max_discount, min_order_amount FROM coupons WHERE code = $1 AND is_active = true', [couponCode]);
            if (couponRes.rows.length > 0) {
                const c = couponRes.rows[0];
                if (subtotal >= parseFloat(c.min_order_amount)) {
                    couponId = c.id;
                    if (c.discount_type === 'PERCENTAGE') {
                        discountAmount = subtotal * (parseFloat(c.discount_value) / 100);
                        if (c.max_discount && discountAmount > parseFloat(c.max_discount)) {
                            discountAmount = parseFloat(c.max_discount);
                        }
                    }
                    else {
                        discountAmount = parseFloat(c.discount_value);
                    }
                }
            }
        }
        const deliveryCharge = subtotal > 500 ? 0 : 50;
        const totalAmount = subtotal - discountAmount + deliveryCharge;
        // 4. Create Order
        const orderNumber = 'ORD-' + Date.now();
        const hasPrescriptions = prescriptionIds && prescriptionIds.length > 0;
        const initialStatus = (requiresPrescription && !hasPrescriptions) ? 'PRESCRIPTION_PENDING' : 'PENDING';
        const orderRes = await (0, database_1.query)(`
            INSERT INTO orders (order_number, customer_id, address_id, coupon_id, status, subtotal, discount_amount, delivery_charge, total_amount, prescription_required, delivery_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id
        `, [orderNumber, customerId, addressId, couponId, initialStatus, subtotal, discountAmount, deliveryCharge, totalAmount, requiresPrescription, deliveryType]);
        const orderId = orderRes.rows[0].id;
        // 5. Create Order Items
        for (const item of cartItems) {
            const medRes = await (0, database_1.query)('SELECT selling_price FROM medicines WHERE id = $1', [item.medicine_id]);
            const price = medRes.rows[0].selling_price;
            await (0, database_1.query)(`
                INSERT INTO order_items (order_id, medicine_id, quantity, price)
                VALUES ($1, $2, $3, $4)
            `, [orderId, item.medicine_id, item.quantity, price]);
            // 6. Reserve Stock logic would go here
        }
        // 7. Create Payment (INITIATED)
        await (0, database_1.query)(`
            INSERT INTO payments (order_id, payment_method, amount, status)
            VALUES ($1, $2, $3, $4)
        `, [orderId, paymentMethod, totalAmount, paymentMethod === 'COD' ? 'PENDING' : 'INITIATED']);
        // 8. Create Order History
        await (0, database_1.query)(`
            INSERT INTO order_status_history (order_id, status, remarks, created_by)
            VALUES ($1, $2, $3, $4)
        `, [orderId, initialStatus, 'Order created successfully', customerId]);
        // 9. Link Prescriptions to Order
        if (requiresPrescription && prescriptionIds && prescriptionIds.length > 0) {
            for (const pid of prescriptionIds) {
                await (0, database_1.query)(`
                    INSERT INTO order_prescriptions (order_id, prescription_id)
                    VALUES ($1, $2)
                `, [orderId, pid]);
            }
        }
        await (0, database_1.query)('COMMIT');
        try {
            const { getIO } = require('../sockets');
            getIO().emit('new_order', { orderId });
        }
        catch (socketErr) {
            console.error('Socket emit failed:', socketErr);
        }
        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: { orderId, orderNumber, totalAmount, status: initialStatus }
        });
    }
    catch (error) {
        await (0, database_1.query)('ROLLBACK');
        res.status(400).json({ success: false, message: error.message || 'Unable to create order' });
    }
};
exports.createOrder = createOrder;
const getCustomerOrders = async (req, res, next) => {
    try {
        const customerId = req.user.id;
        const result = await (0, database_1.query)('SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC', [customerId]);
        res.status(200).json({ success: true, data: result.rows });
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomerOrders = getCustomerOrders;
const getOrderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;
        // Fetch Order
        let orderQuery = 'SELECT * FROM orders WHERE id = $1';
        let queryParams = [id];
        if (user.role === 'CUSTOMER') {
            orderQuery += ' AND customer_id = $2';
            queryParams.push(user.id);
        }
        const orderRes = await (0, database_1.query)(orderQuery, queryParams);
        if (orderRes.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        const order = orderRes.rows[0];
        // Fetch Order Items with Medicine details
        const itemsRes = await (0, database_1.query)(`
            SELECT oi.*, m.name as medicine_name, m.sku 
            FROM order_items oi
            JOIN medicines m ON oi.medicine_id = m.id
            WHERE oi.order_id = $1
        `, [id]);
        // Fetch Address
        let address = null;
        if (order.address_id) {
            const addrRes = await (0, database_1.query)('SELECT * FROM customer_addresses WHERE id = $1', [order.address_id]);
            if (addrRes.rows.length > 0)
                address = addrRes.rows[0];
        }
        // Fetch Payment
        let payment = null;
        const payRes = await (0, database_1.query)('SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1', [id]);
        if (payRes.rows.length > 0)
            payment = payRes.rows[0];
        // Fetch Customer Details
        let customer = null;
        if (order.customer_id) {
            const userRes = await (0, database_1.query)('SELECT id, first_name, last_name, mobile, email FROM users WHERE id = $1', [order.customer_id]);
            if (userRes.rows.length > 0)
                customer = userRes.rows[0];
        }
        res.status(200).json({
            success: true,
            data: {
                ...order,
                customer,
                items: itemsRes.rows,
                address,
                payment
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOrderById = getOrderById;
const getPharmacyOrders = async (req, res, next) => {
    try {
        // In a real app, you'd map the user.id to a pharmacy_id.
        // For now, we'll fetch all orders not strictly tied to a pharmacy or mock it.
        const result = await (0, database_1.query)(`
            SELECT o.*, u.first_name, u.last_name, u.mobile 
            FROM orders o 
            JOIN users u ON o.customer_id = u.id 
            ORDER BY o.created_at DESC
        `);
        res.status(200).json({ success: true, data: result.rows });
    }
    catch (error) {
        next(error);
    }
};
exports.getPharmacyOrders = getPharmacyOrders;
const updateOrderStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, remarks } = req.body;
        const userId = req.user.id;
        await (0, database_1.query)('BEGIN');
        await (0, database_1.query)('UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [status, id]);
        await (0, database_1.query)('INSERT INTO order_status_history (order_id, status, remarks, created_by) VALUES ($1, $2, $3, $4)', [id, status, remarks || `Status updated to ${status}`, userId]);
        // Auto-Assign Delivery Agent when pharmacy prepares the medicine
        if (status === 'READY_TO_SHIP') {
            const agentRes = await (0, database_1.query)("SELECT id FROM delivery_agents WHERE is_active = true LIMIT 1");
            if (agentRes.rows.length > 0) {
                const agentId = agentRes.rows[0].id;
                // Ensure not already assigned
                const existingAssigned = await (0, database_1.query)('SELECT id FROM deliveries WHERE order_id = $1', [id]);
                if (existingAssigned.rows.length === 0) {
                    await (0, database_1.query)('INSERT INTO deliveries (order_id, agent_id, status) VALUES ($1, $2, $3)', [id, agentId, 'ASSIGNED']);
                    await (0, database_1.query)('INSERT INTO order_status_history (order_id, status, remarks, created_by) VALUES ($1, $2, $3, $4)', [id, 'READY_TO_SHIP', `Assigned to Delivery Agent ID: ${agentId}`, userId]);
                }
            }
        }
        await (0, database_1.query)('COMMIT');
        res.status(200).json({ success: true, message: 'Order status updated successfully' });
    }
    catch (error) {
        await (0, database_1.query)('ROLLBACK');
        next(error);
    }
};
exports.updateOrderStatus = updateOrderStatus;
//# sourceMappingURL=order.controller.js.map