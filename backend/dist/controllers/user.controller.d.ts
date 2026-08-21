import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getAddresses: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const addAddress: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=user.controller.d.ts.map