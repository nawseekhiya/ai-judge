import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export const idempotencyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const idempotencyKey = req.header('Idempotency-Key');

  // Only apply to POST/PUT/PATCH
  if (!idempotencyKey || !['POST', 'PUT', 'PATCH'].includes(req.method)) {
    return next();
  }

  try {
    // Check if this request was already processed
    const existing = await prisma.idempotencyKey.findUnique({
      where: { key: idempotencyKey },
    });

    if (existing) {
      // Request already processed, return cached response
      res.status(existing.statusCode).json(existing.responseBody);
      return;
    }

    // Capture the response to store it
    const originalJson = res.json.bind(res);
    res.json = function (body: unknown) {
      // Store this response for future requests with same key
      const ttlMinutes = 24 * 60; // 24 hours
      prisma.idempotencyKey
        .create({
          data: {
            key: idempotencyKey,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode || 200,
            responseBody: body as any,
            expiresAt: new Date(Date.now() + ttlMinutes * 60000),
          },
        })
        .catch((err: unknown) => {
          // Log but don't fail the request if storing fails
          console.error('[Idempotency] Failed to store key:', (err as Error).message);
        });

      return originalJson(body);
    };

    next();
  } catch (error) {
    // On error, continue without idempotency protection
    console.error('[Idempotency] Error:', (error as Error).message);
    next();
  }
};
