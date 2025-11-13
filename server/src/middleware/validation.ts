import { Request, Response, NextFunction } from 'express';

export class ValidationError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Validation utilities
export const validators = {
  isString: (value: unknown, fieldName: string): string => {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new ValidationError(400, `${fieldName} must be a non-empty string`);
    }
    return value.trim();
  },

  isValidSide: (value: unknown): 'A' | 'B' => {
    if (value !== 'A' && value !== 'B') {
      throw new ValidationError(400, 'Side must be either "A" or "B"');
    }
    return value;
  },

  isValidUUID: (value: unknown, fieldName: string = 'ID'): string => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (typeof value !== 'string' || !uuidRegex.test(value)) {
      throw new ValidationError(400, `${fieldName} must be a valid UUID`);
    }
    return value;
  },

  isObject: (value: unknown, fieldName: string = 'Body'): Record<string, unknown> => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new ValidationError(400, `${fieldName} must be a valid JSON object`);
    }
    return value as Record<string, unknown>;
  },

  hasProperty: (obj: Record<string, unknown>, prop: string, fieldName?: string): unknown => {
    if (!(prop in obj)) {
      throw new ValidationError(400, `${fieldName || prop} is required`);
    }
    return obj[prop];
  },
};

// Async validation wrapper
export const validateRequest = (validationFn: (req: Request) => void) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      validationFn(req);
      next();
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(400).json({ error: 'Invalid request' });
      }
    }
  };
};
