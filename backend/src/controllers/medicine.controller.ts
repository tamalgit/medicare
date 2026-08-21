import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// Get Categories
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await query('SELECT * FROM medicine_categories WHERE is_active = true');
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
};

// Get Manufacturers
export const getManufacturers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await query('SELECT * FROM manufacturers ORDER BY name ASC');
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
};

// Add Medicine
export const addMedicine = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const {
            sku, name, brandName, genericName, manufacturerId, categoryId,
            strength, packSize, mrp, sellingPrice, prescriptionRequired,
            description, uses, directions, storageInfo, safetyAdvice
        } = req.body;

        let imageUrl = req.body.imageUrl || null;
        if (req.file) {
            imageUrl = `/uploads/medicines/${req.file.filename}`;
        }

        const finalSku = sku || null;

        await query('BEGIN');

        const result = await query(
            `INSERT INTO medicines 
            (sku, name, brand_name, generic_name, manufacturer_id, category_id, strength, pack_size, mrp, selling_price, prescription_required, image_url, description, uses, directions, storage_info, safety_advice)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING *`,
            [
                finalSku, name, brandName, genericName, manufacturerId, categoryId,
                strength, packSize, mrp, sellingPrice, prescriptionRequired,
                imageUrl, description, uses, directions, storageInfo, safetyAdvice
            ]
        );

        const newMedicine = result.rows[0];

        // Add the medicine to the user's pharmacy, or all pharmacies if they don't have one
        if (req.user && req.user.id) {
            const pharmacyRes = await query('SELECT id FROM pharmacies WHERE user_id = $1', [req.user.id]);
            let pharmaciesToAdd = [];
            
            if (pharmacyRes.rows.length > 0) {
                pharmaciesToAdd.push(pharmacyRes.rows[0].id);
            } else {
                const allPharmacies = await query('SELECT id FROM pharmacies');
                pharmaciesToAdd = allPharmacies.rows.map(row => row.id);
            }

            for (const pId of pharmaciesToAdd) {
                await query(
                    'INSERT INTO inventory (pharmacy_id, medicine_id, quantity) VALUES ($1, $2, $3)',
                    [pId, newMedicine.id, 0]
                );
            }
        }

        await query('COMMIT');

        res.status(201).json({ success: true, data: newMedicine, message: 'Medicine added successfully' });
    } catch (error) {
        await query('ROLLBACK');
        next(error);
    }
};

// Search Medicines
export const searchMedicines = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { q, categoryId } = req.query;
        let searchQuery = `
            SELECT m.*, c.name as category_name, man.name as manufacturer_name
            FROM medicines m
            LEFT JOIN medicine_categories c ON m.category_id = c.id
            LEFT JOIN manufacturers man ON m.manufacturer_id = man.id
            WHERE m.is_active = true
        `;
        const params: any[] = [];
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

        const result = await query(searchQuery, params);
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
};

// Get Medicine Details
export const getMedicineDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await query(`
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
    } catch (error) {
        next(error);
    }
};
