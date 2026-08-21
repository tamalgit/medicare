"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
const register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, mobile, password, role = 'CUSTOMER' } = req.body;
        // Check if user exists
        const userExists = await (0, database_1.query)('SELECT * FROM users WHERE email = $1 OR mobile = $2', [email, mobile]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }
        // Hash password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        // Begin transaction
        await (0, database_1.query)('BEGIN');
        // Insert user
        const result = await (0, database_1.query)('INSERT INTO users (first_name, last_name, email, mobile, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, email, mobile', [firstName, lastName, email, mobile, hashedPassword]);
        const user = result.rows[0];
        // Get Role ID
        const roleResult = await (0, database_1.query)('SELECT id FROM roles WHERE name = $1', [role]);
        if (roleResult.rows.length > 0) {
            const roleId = roleResult.rows[0].id;
            // Insert User Role
            await (0, database_1.query)('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [user.id, roleId]);
        }
        await (0, database_1.query)('COMMIT');
        // Generate Token
        const token = jsonwebtoken_1.default.sign({ id: user.id, role }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: { user, token }
        });
    }
    catch (error) {
        await (0, database_1.query)('ROLLBACK');
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Get user
        const result = await (0, database_1.query)(`SELECT u.*, r.name as role 
             FROM users u 
             LEFT JOIN user_roles ur ON u.id = ur.user_id 
             LEFT JOIN roles r ON ur.role_id = r.id 
             WHERE u.email = $1`, [email]);
        const user = result.rows[0];
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }
        // Verify password
        const isMatch = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }
        // Generate Token
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        delete user.password_hash; // Do not send password back
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: { user, token }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
//# sourceMappingURL=auth.controller.js.map