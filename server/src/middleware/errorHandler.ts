import { Request, Response, NextFunction } from 'express';

export interface ErrorResponse {
  error: string;
  statusCode: number;
  timestamp: string;
  path?: string;
}

export class AppError extends Error {
  constructor(
    public statusCode: number = 500,
    message: string = 'Internal Server Error',
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  const errorResponse: ErrorResponse = {
    error: message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  // Log errors (except validation errors in development)
  if (statusCode === 500 || !(err instanceof AppError)) {
    console.error('[ERROR]', {
      statusCode,
      message,
      path: req.path,
      method: req.method,
      timestamp: errorResponse.timestamp,
    });
  }

  res.status(statusCode).json(errorResponse);
};

// Wrapper for async route handlers
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
