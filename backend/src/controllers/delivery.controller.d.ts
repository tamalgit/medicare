import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const assignDelivery: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getDashboardStats: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMyDeliveries: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateDeliveryStatus: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=delivery.controller.d.ts.map