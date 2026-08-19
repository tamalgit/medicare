import express, { Express } from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import medicineRoutes from './routes/medicine.routes';
import inventoryRoutes from './routes/inventory.routes';
import prescriptionRoutes from './routes/prescription.routes';
import orderRoutes from './routes/order.routes';
import deliveryRoutes from './routes/delivery.routes';
import adminRoutes from './routes/admin.routes';
import userRoutes from './routes/user.routes';
import pharmacyRoutes from './routes/pharmacy.routes';

dotenv.config();

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pharmacy', pharmacyRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API is running' });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        errors: err.errors || []
    });
});

export default app;
