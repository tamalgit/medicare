import { Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';
import path from 'path';
import fs from 'fs';

export const uploadPrescriptionHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;
        const file = req.file;
        const { orderId } = req.body;

        if (!file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const fileUrl = file.filename; // Store only filename for secure lookup later

        await query('BEGIN');

        const result = await query(
            'INSERT INTO prescriptions (customer_id, file_url) VALUES ($1, $2) RETURNING id, status, created_at',
            [userId, fileUrl]
        );
        
        const prescriptionId = result.rows[0].id;

        // Link to order if provided
        if (orderId) {
            // Verify order belongs to user
            const orderRes = await query('SELECT id FROM orders WHERE id = $1 AND customer_id = $2', [orderId, userId]);
            if (orderRes.rows.length > 0) {
                await query(
                    'INSERT INTO order_prescriptions (order_id, prescription_id) VALUES ($1, $2)',
                    [orderId, prescriptionId]
                );
                
                // Update order status if it was waiting for a prescription
                await query(
                    "UPDATE orders SET status = 'PENDING', updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND status = 'PRESCRIPTION_PENDING'",
                    [orderId]
                );
                
                // Add history log
                await query(
                    "INSERT INTO order_status_history (order_id, status, remarks, created_by) VALUES ($1, 'PENDING', 'Prescription uploaded by customer', $2)",
                    [orderId, userId]
                );
            }
        }

        await query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Prescription uploaded successfully',
            data: result.rows[0]
        });
    } catch (error) {
        await query('ROLLBACK');
        next(error);
    }
};

export const linkPrescriptionHandler = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;
        const { id: prescriptionId } = req.params;
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ success: false, message: 'orderId is required' });
        }

        await query('BEGIN');

        // Verify prescription belongs to user
        const pRes = await query('SELECT id FROM prescriptions WHERE id = $1 AND customer_id = $2', [prescriptionId, userId]);
        if (pRes.rows.length === 0) {
            throw new Error('Prescription not found or unauthorized');
        }

        // Verify order belongs to user and is in PRESCRIPTION_PENDING state
        const oRes = await query("SELECT id FROM orders WHERE id = $1 AND customer_id = $2 AND status = 'PRESCRIPTION_PENDING'", [orderId, userId]);
        if (oRes.rows.length === 0) {
            throw new Error('Order not found or not waiting for a prescription');
        }

        // Link prescription
        await query(
            'INSERT INTO order_prescriptions (order_id, prescription_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [orderId, prescriptionId]
        );

        // Update order status
        await query(
            "UPDATE orders SET status = 'PENDING', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
            [orderId]
        );

        // Add history log
        await query(
            "INSERT INTO order_status_history (order_id, status, remarks, created_by) VALUES ($1, 'PENDING', 'Existing prescription attached by customer', $2)",
            [orderId, userId]
        );

        await query('COMMIT');

        res.status(200).json({
            success: true,
            message: 'Prescription linked to order successfully'
        });
    } catch (error) {
        await query('ROLLBACK');
        next(error);
    }
};

export const getPrescriptions = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        let result;
        if (role === 'CUSTOMER') {
            result = await query('SELECT * FROM prescriptions WHERE customer_id = $1 ORDER BY created_at DESC', [userId]);
        } else if (role === 'PHARMACIST' || role === 'SUPER_ADMIN') {
            result = await query(`
                SELECT 
                    p.*, 
                    u.first_name, u.last_name, u.mobile,
                    (
                        SELECT json_agg(
                            json_build_object(
                                'order_id', o.id,
                                'order_number', o.order_number,
                                'items', (
                                    SELECT json_agg(
                                        json_build_object(
                                            'medicine_name', m.name,
                                            'quantity', oi.quantity
                                        )
                                    )
                                    FROM order_items oi
                                    JOIN medicines m ON oi.medicine_id = m.id
                                    WHERE oi.order_id = o.id
                                )
                            )
                        )
                        FROM order_prescriptions op
                        JOIN orders o ON op.order_id = o.id
                        WHERE op.prescription_id = p.id
                    ) as linked_orders
                FROM prescriptions p 
                JOIN users u ON p.customer_id = u.id 
                ORDER BY p.created_at DESC
            `);
        } else {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
};

export const verifyPrescription = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const pharmacistId = req.user.id;
        const { id } = req.params;
        const { action, remarks, items } = req.body; 
        // action: APPROVED, REJECTED, CLARIFICATION_REQUIRED

        await query('BEGIN');

        // Update prescription status
        let newStatus = 'UNDER_REVIEW';
        if (action === 'APPROVED') newStatus = 'APPROVED';
        else if (action === 'REJECTED') newStatus = 'REJECTED';
        else if (action === 'CLARIFICATION_REQUIRED') newStatus = 'CLARIFICATION_REQUIRED';
        else if (action === 'HOLD') newStatus = 'ON_HOLD';

        await query('UPDATE prescriptions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newStatus, id]);

        // Insert verification log
        await query(
            'INSERT INTO prescription_verifications (prescription_id, pharmacist_id, action, remarks) VALUES ($1, $2, $3, $4)',
            [id, pharmacistId, action, remarks]
        );

        // If approved and items provided, insert approved items
        if (action === 'APPROVED' && items && items.length > 0) {
            for (const item of items) {
                await query(
                    'INSERT INTO prescription_items (prescription_id, medicine_id, medicine_name, quantity, dosage, duration) VALUES ($1, $2, $3, $4, $5, $6)',
                    [id, item.medicine_id, item.medicine_name, item.quantity, item.dosage, item.duration]
                );
            }
        }

        // STRICT WORKFLOW LOGIC: Check inventory and transition order
        const orderRes = await query('SELECT order_id FROM order_prescriptions WHERE prescription_id = $1', [id]);
        
        if (action === 'APPROVED') {
            for (const row of orderRes.rows) {
                const orderId = row.order_id;
                
                // Get all items in this order
                const itemsRes = await query('SELECT medicine_id, quantity FROM order_items WHERE order_id = $1', [orderId]);
                
                // Inventory check and deduct
                for (const item of itemsRes.rows) {
                    const invRes = await query('SELECT id, quantity FROM inventory WHERE medicine_id = $1 ORDER BY updated_at ASC FOR UPDATE', [item.medicine_id]);
                    
                    let totalStock = 0;
                    invRes.rows.forEach(inv => totalStock += inv.quantity);
                    
                    if (totalStock < item.quantity) {
                        throw new Error(`Insufficient stock for medicine ID: ${item.medicine_id}. Required: ${item.quantity}, Available: ${totalStock}`);
                    }
                    
                    // Deduct stock (FIFO)
                    let remainingToDeduct = item.quantity;
                    for (const inv of invRes.rows) {
                        if (remainingToDeduct <= 0) break;
                        const deductQty = Math.min(inv.quantity, remainingToDeduct);
                        await query('UPDATE inventory SET quantity = quantity - $1 WHERE id = $2', [deductQty, inv.id]);
                        remainingToDeduct -= deductQty;
                    }
                }
                
                // Set order to READY_TO_SHIP
                await query("UPDATE orders SET status = 'READY_TO_SHIP', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [orderId]);
                await query(
                    "INSERT INTO order_status_history (order_id, status, remarks, created_by) VALUES ($1, 'READY_TO_SHIP', 'Prescription Approved & Inventory Reserved', $2)",
                    [orderId, pharmacistId]
                );
            }
        } else if (action === 'REJECTED') {
            // Find linked orders and cancel them
            for (const row of orderRes.rows) {
                const orderId = row.order_id;
                await query("UPDATE orders SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [orderId]);
                await query(
                    "INSERT INTO order_status_history (order_id, status, remarks, created_by) VALUES ($1, 'CANCELLED', $2, $3)",
                    [orderId, `Prescription Rejected. Reason: ${remarks}`, pharmacistId]
                );
            }
        } else if (action === 'HOLD' || action === 'CLARIFICATION_REQUIRED') {
            for (const row of orderRes.rows) {
                const orderId = row.order_id;
                await query("UPDATE orders SET status = 'ON_HOLD', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [orderId]);
                await query(
                    "INSERT INTO order_status_history (order_id, status, remarks, created_by) VALUES ($1, 'ON_HOLD', $2, $3)",
                    [orderId, `Prescription ${action === 'HOLD' ? 'put on hold' : 'requires clarification'}. Notes: ${remarks}`, pharmacistId]
                );
            }
        }

        await query('COMMIT');

        res.status(200).json({ success: true, message: `Prescription ${action.toLowerCase()} successfully` });
    } catch (error) {
        await query('ROLLBACK');
        next(error);
    }
};

export const downloadPrescription = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        const { id } = req.params;

        const result = await query('SELECT file_url, customer_id FROM prescriptions WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Prescription not found' });
        }

        const prescription = result.rows[0];

        // Security check: only owner or pharmacist/admin can view
        if (role === 'CUSTOMER' && prescription.customer_id !== userId) {
            return res.status(403).json({ success: false, message: 'Forbidden access to prescription' });
        }

        const filePath = path.join(__dirname, '../../uploads/prescriptions', prescription.file_url);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'File not found on server' });
        }

        res.sendFile(filePath);
    } catch (error) {
        next(error);
    }
};
