"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAddress = exports.getAddresses = void 0;
const database_1 = require("../config/database");
// Get all addresses for the logged-in customer
const getAddresses = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const result = await (0, database_1.query)('SELECT * FROM customer_addresses WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
        res.status(200).json({ success: true, data: result.rows });
    }
    catch (error) {
        next(error);
    }
};
exports.getAddresses = getAddresses;
// Add a new address for the logged-in customer
const addAddress = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { type, streetAddress, city, state, pincode, isDefault } = req.body;
        // If isDefault is true, unset other default addresses for this user
        if (isDefault) {
            await (0, database_1.query)('UPDATE customer_addresses SET is_default = false WHERE user_id = $1', [userId]);
        }
        const result = await (0, database_1.query)(`INSERT INTO customer_addresses 
            (user_id, type, street_address, city, state, pincode, is_default)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`, [userId, type || 'HOME', streetAddress, city, state, pincode, isDefault || false]);
        res.status(201).json({ success: true, data: result.rows[0], message: 'Address added successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.addAddress = addAddress;
//# sourceMappingURL=user.controller.js.map