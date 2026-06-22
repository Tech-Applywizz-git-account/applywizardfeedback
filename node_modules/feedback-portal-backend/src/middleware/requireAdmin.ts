import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== Role.ADMIN) {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
    return;
  }
  next();
};
