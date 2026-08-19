import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { firstName, lastName, email, mobile, password, role = 'CUSTOMER' } = req.body;

        // Check if user exists
        const userExists = await query('SELECT * FROM users WHERE email = $1 OR mobile = $2', [email, mobile]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Begin transaction
        await query('BEGIN');

        // Insert user
        const result = await query(
            'INSERT INTO users (first_name, last_name, email, mobile, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING id, first_name, last_name, email, mobile',
            [firstName, lastName, email, mobile, hashedPassword]
        );
        const user = result.rows[0];

        // Get Role ID
        const roleResult = await query('SELECT id FROM roles WHERE name = $1', [role]);
        if (roleResult.rows.length > 0) {
            const roleId = roleResult.rows[0].id;
            // Insert User Role
            await query('INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)', [user.id, roleId]);
        }

        await query('COMMIT');

        // Generate Token
        const token = jwt.sign({ id: user.id, role }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: { user, token }
        });
    } catch (error) {
        await query('ROLLBACK');
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        // Get user
        const result = await query(
            `SELECT u.*, r.name as role 
             FROM users u 
             LEFT JOIN user_roles ur ON u.id = ur.user_id 
             LEFT JOIN roles r ON ur.role_id = r.id 
             WHERE u.email = $1`,
            [email]
        );

        const user = result.rows[0];
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate Token
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        delete user.password_hash; // Do not send password back

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: { user, token }
        });
    } catch (error) {
        next(error);
    }
};
