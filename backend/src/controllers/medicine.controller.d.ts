import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getCategories: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getManufacturers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const addMedicine: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const searchMedicines: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getMedicineDetails: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=medicine.controller.d.ts.map