"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMedicineDetails = exports.searchMedicines = exports.addMedicine = exports.getManufacturers = exports.getCategories = void 0;
const database_1 = require("../config/database");
// Get Categories
const getCategories = async (req, res, next) => {
    try {
        const result = await (0, database_1.query)('SELECT * FROM medicine_categories WHERE is_active = true');
        res.status(200).json({ success: true, data: result.rows });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategories = getCategories;
// Get Manufacturers
const getManufacturers = async (req, res, next) => {
    try {
        const result = await (0, database_1.query)('SELECT * FROM manufacturers ORDER BY name ASC');
        res.status(200).json({ success: true, data: result.rows });
    }
    catch (error) {
        next(error);
    }
};
exports.getManufacturers = getManufacturers;
// Add Medicine
const addMedicine = async (req, res, next) => {
    try {
        const { sku, name, brandName, genericName, manufacturerId, categoryId, strength, packSize, mrp, sellingPrice, prescriptionRequired, description, uses, directions, storageInfo, safetyAdvice } = req.body;
        let imageUrl = req.body.imageUrl || null;
        if (req.file) {
            imageUrl = `/uploads/medicines/${req.file.filename}`;
        }
        await (0, database_1.query)('BEGIN');
        const result = await (0, database_1.query)(`INSERT INTO medicines 
            (sku, name, brand_name, generic_name, manufacturer_id, category_id, strength, pack_size, mrp, selling_price, prescription_required, image_url, description, uses, directions, storage_info, safety_advice)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING *`, [
            sku, name, brandName, genericName, manufacturerId, categoryId,
            strength, packSize, mrp, sellingPrice, prescriptionRequired,
            imageUrl, description, uses, directions, storageInfo, safetyAdvice
        ]);
        const newMedicine = result.rows[0];
        // If the user has a pharmacy, add the medicine to their inventory with 0 quantity
        if (req.user && req.user.id) {
            const pharmacyRes = await (0, database_1.query)('SELECT id FROM pharmacies WHERE user_id = $1', [req.user.id]);
            if (pharmacyRes.rows.length > 0) {
                const pharmacyId = pharmacyRes.rows[0].id;
                await (0, database_1.query)('INSERT INTO inventory (pharmacy_id, medicine_id, quantity) VALUES ($1, $2, $3)', [pharmacyId, newMedicine.id, 0]);
            }
        }
        await (0, database_1.query)('COMMIT');
        res.status(201).json({ success: true, data: newMedicine, message: 'Medicine added successfully' });
    }
    catch (error) {
        await (0, database_1.query)('ROLLBACK');
        next(error);
    }
};
exports.addMedicine = addMedicine;
// Search Medicines
const searchMedicines = async (req, res, next) => {
    try {
        const { q, categoryId } = req.query;
        let searchQuery = `
            SELECT m.*, c.name as category_name, man.name as manufacturer_name
            FROM medicines m
            LEFT JOIN medicine_categories c ON m.category_id = c.id
            LEFT JOIN manufacturers man ON m.manufacturer_id = man.id
            WHERE m.is_active = true
        `;
        const params = [];
        let paramIndex = 1;
        if (q) {
            searchQuery += ` AND (m.name ILIKE $${paramIndex} OR m.generic_name ILIKE $${paramIndex} OR m.brand_name ILIKE $${paramIndex})`;
            params.push(`%${q}%`);
            paramIndex++;
        }
        if (categoryId) {
            searchQuery += ` AND m.category_id = $${paramIndex}`;
            params.push(categoryId);
            paramIndex++;
        }
        searchQuery += ` ORDER BY m.name ASC LIMIT 50`;
        const result = await (0, database_1.query)(searchQuery, params);
        res.status(200).json({ success: true, data: result.rows });
    }
    catch (error) {
        next(error);
    }
};
exports.searchMedicines = searchMedicines;
// Get Medicine Details
const getMedicineDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await (0, database_1.query)(`
            SELECT m.*, c.name as category_name, man.name as manufacturer_name
            FROM medicines m
            LEFT JOIN medicine_categories c ON m.category_id = c.id
            LEFT JOIN manufacturers man ON m.manufacturer_id = man.id
            WHERE m.id = $1 AND m.is_active = true
        `, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Medicine not found' });
        }
        res.status(200).json({ success: true, data: result.rows[0] });
    }
    catch (error) {
        next(error);
    }
};
exports.getMedicineDetails = getMedicineDetails;
//# sourceMappingURL=medicine.controller.js.map