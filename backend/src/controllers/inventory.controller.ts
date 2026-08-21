import { Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const getInventory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;
        
        let inventoryQuery = `
            SELECT i.*, m.name as medicine_name, m.sku, b.batch_number, b.expiry_date 
            FROM inventory i
            JOIN medicines m ON i.medicine_id = m.id
            LEFT JOIN medicine_batches b ON i.batch_id = b.id
        `;
        let params: any[] = [];

        // Find pharmacy associated with this user
        const pharmacyResult = await query('SELECT id FROM pharmacies WHERE user_id = $1', [userId]);
        
        if (pharmacyResult.rows.length === 0) {
            if (['SUPER_ADMIN', 'PHARMACY_ADMIN', 'ADMIN'].includes(req.user.role)) {
                inventoryQuery += ` ORDER BY m.name ASC`;
            } else {
                return res.status(200).json({ success: true, data: [] });
            }
        } else {
            const pharmacyId = pharmacyResult.rows[0].id;
            inventoryQuery += ` WHERE i.pharmacy_id = $1 ORDER BY m.name ASC`;
            params.push(pharmacyId);
        }

        const inventoryResult = await query(inventoryQuery, params);

        res.status(200).json({ success: true, data: inventoryResult.rows });
    } catch (error) {
        next(error);
    }
};

export const updateStock = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;
        const { medicineId, batchId: inputBatchId, quantity, transactionType, remarks, batchNumber, expiryDate, inventoryId: inputInventoryId, sku } = req.body;

        // Get pharmacy ID
        const pharmacyResult = await query('SELECT id FROM pharmacies WHERE user_id = $1', [userId]);
        let pharmacyId = pharmacyResult.rows.length > 0 ? pharmacyResult.rows[0].id : null;

        if (!pharmacyId && !['SUPER_ADMIN', 'PHARMACY_ADMIN', 'ADMIN'].includes(req.user.role)) {
            return res.status(404).json({ success: false, message: 'Pharmacy not found' });
        }

        await query('BEGIN');

        if (sku) {
            await query('UPDATE medicines SET sku = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [sku, medicineId]);
        }

        let finalBatchId = inputBatchId || null;

        if (batchNumber || expiryDate) {
            // Check if batch exists
            const batchRes = await query('SELECT id FROM medicine_batches WHERE medicine_id = $1 AND batch_number = $2', [medicineId, batchNumber]);
            if (batchRes.rows.length > 0) {
                finalBatchId = batchRes.rows[0].id;
                // Update expiry date if needed
                if (expiryDate) {
                     await query('UPDATE medicine_batches SET expiry_date = $1 WHERE id = $2', [expiryDate, finalBatchId]);
                }
            } else {
                if (!batchNumber) {
                    return res.status(400).json({ success: false, message: 'Batch number is required when adding a new batch' });
                }
                if (!expiryDate) {
                    return res.status(400).json({ success: false, message: 'Expiry date is required when adding a new batch' });
                }
                const newBatch = await query(
                    'INSERT INTO medicine_batches (medicine_id, batch_number, expiry_date) VALUES ($1, $2, $3) RETURNING id',
                    [medicineId, batchNumber, expiryDate]
                );
                finalBatchId = newBatch.rows[0].id;
            }
        }

        let inventoryId = inputInventoryId;

        if (inventoryId) {
            // Updating a specific row
            let invResult;
            if (pharmacyId) {
                invResult = await query('SELECT id, quantity FROM inventory WHERE id = $1 AND pharmacy_id = $2', [inventoryId, pharmacyId]);
            } else {
                invResult = await query('SELECT id, quantity FROM inventory WHERE id = $1', [inventoryId]);
            }
            if (invResult.rows.length > 0) {
                const currentQty = invResult.rows[0].quantity;
                let newQty = currentQty;
                
                if (transactionType === 'IN') newQty += quantity;
                else if (transactionType === 'OUT') newQty -= quantity;
                else if (transactionType === 'ADJUSTMENT') newQty = quantity;

                // Update quantity and also update batch_id if it changed
                await query('UPDATE inventory SET quantity = $1, batch_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3', [newQty, finalBatchId, inventoryId]);
            } else {
                throw new Error('Inventory record not found');
            }
        } else {
            if (!pharmacyId) {
                // Try to find the first pharmacy
                const anyPharmacy = await query('SELECT id FROM pharmacies LIMIT 1');
                if (anyPharmacy.rows.length > 0) {
                    pharmacyId = anyPharmacy.rows[0].id;
                } else {
                    throw new Error('No pharmacy exists to add stock to');
                }
            }
            // Fallback for when no inventoryId is provided (e.g. from a different flow)
            let invResult = await query('SELECT id, quantity FROM inventory WHERE pharmacy_id = $1 AND medicine_id = $2 AND batch_id IS NOT DISTINCT FROM $3', 
                [pharmacyId, medicineId, finalBatchId]);

            if (invResult.rows.length === 0) {
                // Create new inventory record
                const newInv = await query('INSERT INTO inventory (pharmacy_id, medicine_id, batch_id, quantity) VALUES ($1, $2, $3, $4) RETURNING id', 
                    [pharmacyId, medicineId, finalBatchId, quantity]);
                inventoryId = newInv.rows[0].id;
            } else {
                inventoryId = invResult.rows[0].id;
                const currentQty = invResult.rows[0].quantity;
                let newQty = currentQty;
                
                if (transactionType === 'IN') newQty += quantity;
                else if (transactionType === 'OUT') newQty -= quantity;
                else if (transactionType === 'ADJUSTMENT') newQty = quantity;

                await query('UPDATE inventory SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newQty, inventoryId]);
            }
        }

        // Record transaction
        await query('INSERT INTO inventory_transactions (inventory_id, transaction_type, quantity_changed, remarks, created_by) VALUES ($1, $2, $3, $4, $5)', 
            [inventoryId, transactionType, quantity, remarks, userId]);

        await query('COMMIT');

        res.status(200).json({ success: true, message: 'Stock updated successfully' });
    } catch (error) {
        await query('ROLLBACK');
        next(error);
    }
};
