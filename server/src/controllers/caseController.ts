import { Request, Response, NextFunction } from 'express';
import type { Side } from '../types/index';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { validators } from '../middleware/validation';
import prisma from '../lib/prisma';
import { computeCaseHash } from '../utils/hash';

export const createCase = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const body = validators.isObject(req.body, 'Request body');
  const title = validators.isString(body.title, 'Title');
  const description = body.description ? validators.isString(body.description, 'Description') : undefined;

  // Compute content hash for deduplication
  const contentHash = computeCaseHash(title, description, '');

  // Check for duplicate using contentHash (enforced by unique constraint)
  const existing = await prisma.case.findUnique({
    where: { contentHash },
  });

  if (existing) {
    throw new AppError(409, 'A case with the same title and description already exists');
  }

  // Create case with Prisma
  const newCase = await prisma.case.create({
    data: {
      title,
      description,
      context: '',
      contentHash,
    },
    include: {
      arguments: true,
      verdicts: true,
    },
  });

  res.status(201).json(newCase);
});

export const getCase = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;

  const caseItem = await prisma.case.findUnique({
    where: { id },
    include: {
      arguments: {
        orderBy: { createdAt: 'asc' },
      },
      verdicts: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!caseItem) {
    throw new AppError(404, `Case with ID "${id}" not found`);
  }

  res.json(caseItem);
});

export const uploadFile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;

  // Verify case exists
  const caseItem = await prisma.case.findUnique({
    where: { id },
  });

  if (!caseItem) {
    throw new AppError(404, `Case with ID "${id}" not found`);
  }

  let content = '';

  // Check for text in body or file upload
  if (req.body?.text) {
    content = validators.isString(req.body.text, 'Text content');
  } else if (req.file) {
    content = req.file.buffer.toString('utf-8');
    if (!content.trim()) {
      throw new AppError(400, 'Uploaded file is empty');
    }
  } else {
    throw new AppError(400, 'Either file or text content is required');
  }

  // Update case context and recompute content hash
  const newContentHash = computeCaseHash(caseItem.title, caseItem.description || undefined, content);

  const updatedCase = await prisma.case.update({
    where: { id },
    data: {
      context: content,
      contentHash: newContentHash,
    },
    include: {
      arguments: true,
      verdicts: true,
    },
  });

  res.json(updatedCase);
});

export const addArgument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id;
  const body = validators.isObject(req.body, 'Request body');
  
  const side = validators.isValidSide(validators.hasProperty(body, 'side', 'side'));
  const text = validators.isString(body.text, 'Argument text');

  // Verify case exists
  const caseItem = await prisma.case.findUnique({
    where: { id },
  });

  if (!caseItem) {
    throw new AppError(404, `Case with ID "${id}" not found`);
  }

  // Create argument with Prisma
  const newArgument = await prisma.argument.create({
    data: {
      caseId: id,
      side: side as Side,
      text,
    },
  });

  res.status(201).json(newArgument);
});
