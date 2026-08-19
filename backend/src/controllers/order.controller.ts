import { Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const customerId = req.user.id;
        const { addressId, cartItems, prescriptionIds, couponCode, deliveryType, paymentMethod } = req.body;

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        await query('BEGIN');

        // 1. Calculate totals & Validate Prescription Requirements
        let subtotal = 0;
        let requiresPrescription = false;
        
        for (const item of cartItems) {
            const medRes = await query('SELECT selling_price, prescription_required FROM medicines WHERE id = $1', [item.medicine_id]);
            if (medRes.rows.length === 0) throw new Error(`Medicine ${item.medicine_id} not found`);
            
            const med = medRes.rows[0];
            subtotal += parseFloat(med.selling_price) * item.quantity;
            if (med.prescription_required) requiresPrescription = true;
            
            // Note: Inventory validation could be inserted here.
        }

        if (requiresPrescription && (!prescriptionIds || prescriptionIds.length === 0)) {
            throw new Error('Prescription is required for one or more medicines in the cart');
        }

        // 2. Validate Prescriptions if required
        if (requiresPrescription) {
            for (const pid of prescriptionIds) {
                const pRes = await query('SELECT status FROM prescriptions WHERE id = $1 AND customer_id = $2', [pid, customerId]);
                if (pRes.rows.length === 0) throw new Error(`Prescription ${pid} not found or unauthorized`);
                // Assume VERIFIED/APPROVED is required in a strict system, but prompt says it can be PRESCRIPTION_PENDING status.
            }
        }

        // 3. Apply Coupon (mock basic logic)
        let discountAmount = 0;
        let couponId = null;
        if (couponCode) {
            const couponRes = await query('SELECT id, discount_type, discount_value, max_discount, min_order_amount FROM coupons WHERE code = $1 AND is_active = true', [couponCode]);
            if (couponRes.rows.length > 0) {
                const c = couponRes.rows[0];
                if (subtotal >= parseFloat(c.min_order_amount)) {
                    couponId = c.id;
                    if (c.discount_type === 'PERCENTAGE') {
                        discountAmount = subtotal * (parseFloat(c.discount_value) / 100);
                        if (c.max_discount && discountAmount > parseFloat(c.max_discount)) {
                            discountAmount = parseFloat(c.max_discount);
                        }
                    } else {
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

        const orderRes = await query(`
            INSERT INTO orders (order_number, customer_id, address_id, coupon_id, status, subtotal, discount_amount, delivery_charge, total_amount, prescription_required, delivery_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id
        `, [orderNumber, customerId, addressId, couponId, initialStatus, subtotal, discountAmount, deliveryCharge, totalAmount, requiresPrescription, deliveryType]);
        
        const orderId = orderRes.rows[0].id;

        // 5. Create Order Items
        for (const item of cartItems) {
            const medRes = await query('SELECT selling_price FROM medicines WHERE id = $1', [item.medicine_id]);
            const price = medRes.rows[0].selling_price;

            await query(`
                INSERT INTO order_items (order_id, medicine_id, quantity, price)
                VALUES ($1, $2, $3, $4)
            `, [orderId, item.medicine_id, item.quantity, price]);
            
            // 6. Reserve Stock logic would go here
        }

        // 7. Create Payment (INITIATED)
        await query(`
            INSERT INTO payments (order_id, payment_method, amount, status)
            VALUES ($1, $2, $3, $4)
        `, [orderId, paymentMethod, totalAmount, paymentMethod === 'COD' ? 'PENDING' : 'INITIATED']);

        // 8. Create Order History
        await query(`
            INSERT INTO order_status_history (order_id, status, remarks, created_by)
            VALUES ($1, $2, $3, $4)
        `, [orderId, initialStatus, 'Order created successfully', customerId]);

        // 9. Link Prescriptions to Order
        if (requiresPrescription && prescriptionIds && prescriptionIds.length > 0) {
            for (const pid of prescriptionIds) {
                await query(`
                    INSERT INTO order_prescriptions (order_id, prescription_id)
                    VALUES ($1, $2)
                `, [orderId, pid]);
            }
        }

        await query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: { orderId, orderNumber, totalAmount, status: initialStatus }
        });

    } catch (error: any) {
        await query('ROLLBACK');
        res.status(400).json({ success: false, message: error.message || 'Unable to create order' });
    }
};

export const getCustomerOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const customerId = req.user.id;
        const result = await query('SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC', [customerId]);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
};

export const getPharmacyOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // In a real app, you'd map the user.id to a pharmacy_id.
        // For now, we'll fetch all orders not strictly tied to a pharmacy or mock it.
        const result = await query(`
            SELECT o.*, u.first_name, u.last_name, u.mobile 
            FROM orders o 
            JOIN users u ON o.customer_id = u.id 
            ORDER BY o.created_at DESC
        `);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status, remarks } = req.body;
        const userId = req.user.id;

        await query('BEGIN');

        await query('UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [status, id]);
        
        await query(
            'INSERT INTO order_status_history (order_id, status, remarks, created_by) VALUES ($1, $2, $3, $4)',
            [id, status, remarks || `Status updated to ${status}`, userId]
        );

        // Auto-Assign Delivery Agent when pharmacy ships the medicine
        if (status === 'SHIPPED') {
            const agentRes = await query("SELECT id FROM delivery_agents WHERE current_status = 'AVAILABLE' AND is_active = true LIMIT 1");
            if (agentRes.rows.length > 0) {
                const agentId = agentRes.rows[0].id;
                
                await query('INSERT INTO deliveries (order_id, agent_id, status) VALUES ($1, $2, $3)', [id, agentId, 'ASSIGNED']);
                await query('UPDATE delivery_agents SET current_status = $1 WHERE id = $2', ['BUSY', agentId]);
                
                await query(
                    'INSERT INTO order_status_history (order_id, status, remarks, created_by) VALUES ($1, $2, $3, $4)',
                    [id, 'SHIPPED', `Assigned to Delivery Agent ID: ${agentId}`, userId]
                );
            }
        }

        await query('COMMIT');
        
        res.status(200).json({ success: true, message: 'Order status updated successfully' });
    } catch (error) {
        await query('ROLLBACK');
        next(error);
    }
};
