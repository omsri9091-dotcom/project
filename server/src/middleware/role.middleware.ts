import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Administrator privileges required for this action.',
    });
    return;
  }
  next();
};

export const requireStudent = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'STUDENT') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Student account required for this action.',
    });
    return;
  }
  next();
};

export const requireAnyRole = (roles: Array<'ADMIN' | 'STUDENT'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Access denied. Unauthorized role.',
      });
      return;
    }
    next();
  };
};
