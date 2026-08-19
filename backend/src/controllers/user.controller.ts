import { Response, NextFunction } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth.middleware';

// Get all addresses for the logged-in customer
export const getAddresses = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;
        const result = await query(
            'SELECT * FROM customer_addresses WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.status(200).json({ success: true, data: result.rows });
    } catch (error) {
        next(error);
    }
};

// Add a new address for the logged-in customer
export const addAddress = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.id;
        const { type, streetAddress, city, state, pincode, isDefault } = req.body;

        // If isDefault is true, unset other default addresses for this user
        if (isDefault) {
            await query('UPDATE customer_addresses SET is_default = false WHERE user_id = $1', [userId]);
        }

        const result = await query(
            `INSERT INTO customer_addresses 
            (user_id, type, street_address, city, state, pincode, is_default)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [userId, type || 'HOME', streetAddress, city, state, pincode, isDefault || false]
        );

        res.status(201).json({ success: true, data: result.rows[0], message: 'Address added successfully' });
    } catch (error) {
        next(error);
    }
};
