import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('💥 [ADEXA Server Error]:', err.message || err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val: any) => val.message);
    res.status(400).json({
      success: false,
      message: 'Validation failed.',
      errors: messages,
    });
    return;
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'Field';
    res.status(400).json({
      success: false,
      message: `An entry with this ${field} already exists in the system.`,
    });
    return;
  }

  // CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid resource identifier format.',
    });
    return;
  }

  // Standard generic safe error (never exposes raw server stack trace)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An internal server error occurred. Please try again later.',
  });
};
