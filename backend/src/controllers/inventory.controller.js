"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStock = exports.getInventory = void 0;
const express_1 = require("express");
const database_1 = require("../config/database");
const auth_middleware_1 = require("../middleware/auth.middleware");
const getInventory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        // Find pharmacy associated with this user
        const pharmacyResult = await (0, database_1.query)('SELECT id FROM pharmacies WHERE user_id = $1', [userId]);
        if (pharmacyResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Pharmacy not found for this user' });
        }
        const pharmacyId = pharmacyResult.rows[0].id;
        const inventoryResult = await (0, database_1.query)(`
            SELECT i.*, m.name as medicine_name, m.sku, b.batch_number, b.expiry_date 
            FROM inventory i
            JOIN medicines m ON i.medicine_id = m.id
            LEFT JOIN medicine_batches b ON i.batch_id = b.id
            WHERE i.pharmacy_id = $1
            ORDER BY m.name ASC
        `, [pharmacyId]);
        res.status(200).json({ success: true, data: inventoryResult.rows });
    }
    catch (error) {
        next(error);
    }
};
exports.getInventory = getInventory;
const updateStock = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { medicineId, batchId: inputBatchId, quantity, transactionType, remarks, batchNumber, expiryDate, inventoryId: inputInventoryId, sku } = req.body;
        // Get pharmacy ID
        const pharmacyResult = await (0, database_1.query)('SELECT id FROM pharmacies WHERE user_id = $1', [userId]);
        if (pharmacyResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Pharmacy not found' });
        }
        const pharmacyId = pharmacyResult.rows[0].id;
        await (0, database_1.query)('BEGIN');
        if (sku) {
            await (0, database_1.query)('UPDATE medicines SET sku = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [sku, medicineId]);
        }
        let finalBatchId = inputBatchId || null;
        if (batchNumber || expiryDate) {
            // Check if batch exists
            const batchRes = await (0, database_1.query)('SELECT id FROM medicine_batches WHERE medicine_id = $1 AND batch_number = $2', [medicineId, batchNumber]);
            if (batchRes.rows.length > 0) {
                finalBatchId = batchRes.rows[0].id;
                // Update expiry date if needed
                if (expiryDate) {
                    await (0, database_1.query)('UPDATE medicine_batches SET expiry_date = $1 WHERE id = $2', [expiryDate, finalBatchId]);
                }
            }
            else {
                const newBatch = await (0, database_1.query)('INSERT INTO medicine_batches (medicine_id, batch_number, expiry_date) VALUES ($1, $2, $3) RETURNING id', [medicineId, batchNumber, expiryDate]);
                finalBatchId = newBatch.rows[0].id;
            }
        }
        let inventoryId = inputInventoryId;
        if (inventoryId) {
            // Updating a specific row
            const invResult = await (0, database_1.query)('SELECT id, quantity FROM inventory WHERE id = $1 AND pharmacy_id = $2', [inventoryId, pharmacyId]);
            if (invResult.rows.length > 0) {
                const currentQty = invResult.rows[0].quantity;
                let newQty = currentQty;
                if (transactionType === 'IN')
                    newQty += quantity;
                else if (transactionType === 'OUT')
                    newQty -= quantity;
                else if (transactionType === 'ADJUSTMENT')
                    newQty = quantity;
                // Update quantity and also update batch_id if it changed
                await (0, database_1.query)('UPDATE inventory SET quantity = $1, batch_id = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3', [newQty, finalBatchId, inventoryId]);
            }
            else {
                throw new Error('Inventory record not found');
            }
        }
        else {
            // Fallback for when no inventoryId is provided (e.g. from a different flow)
            let invResult = await (0, database_1.query)('SELECT id, quantity FROM inventory WHERE pharmacy_id = $1 AND medicine_id = $2 AND batch_id IS NOT DISTINCT FROM $3', [pharmacyId, medicineId, finalBatchId]);
            if (invResult.rows.length === 0) {
                // Create new inventory record
                const newInv = await (0, database_1.query)('INSERT INTO inventory (pharmacy_id, medicine_id, batch_id, quantity) VALUES ($1, $2, $3, $4) RETURNING id', [pharmacyId, medicineId, finalBatchId, quantity]);
                inventoryId = newInv.rows[0].id;
            }
            else {
                inventoryId = invResult.rows[0].id;
                const currentQty = invResult.rows[0].quantity;
                let newQty = currentQty;
                if (transactionType === 'IN')
                    newQty += quantity;
                else if (transactionType === 'OUT')
                    newQty -= quantity;
                else if (transactionType === 'ADJUSTMENT')
                    newQty = quantity;
                await (0, database_1.query)('UPDATE inventory SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newQty, inventoryId]);
            }
        }
        // Record transaction
        await (0, database_1.query)('INSERT INTO inventory_transactions (inventory_id, transaction_type, quantity_changed, remarks, created_by) VALUES ($1, $2, $3, $4, $5)', [inventoryId, transactionType, quantity, remarks, userId]);
        await (0, database_1.query)('COMMIT');
        res.status(200).json({ success: true, message: 'Stock updated successfully' });
    }
    catch (error) {
        await (0, database_1.query)('ROLLBACK');
        next(error);
    }
};
exports.updateStock = updateStock;
//# sourceMappingURL=inventory.controller.js.map