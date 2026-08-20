import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const createOrder: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getCustomerOrders: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getOrderById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPharmacyOrders: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateOrderStatus: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=order.controller.d.ts.map