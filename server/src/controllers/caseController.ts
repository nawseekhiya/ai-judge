import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { Case, Argument, Verdict, Side } from '../types/index';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { validators } from '../middleware/validation';

// In-memory storage (replace with DB later)
const casesDB: Map<string, Case> = new Map();
const argumentsDB: Map<string, Argument> = new Map();
const verdictsDB: Map<string, Verdict> = new Map();

export const createCase = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const body = validators.isObject(req.body, 'Request body');
  const title = validators.isString(body.title, 'Title');
  const description = body.description ? validators.isString(body.description, 'Description') : undefined;
  // Duplicate detection: normalized title + description hash
  const normalize = (s?: string) => (s || '').trim().toLowerCase();
  const key = `${normalize(title)}||${normalize(description)}`;

  // naive in-memory duplicate check: look for same normalized title+description
  for (const existing of casesDB.values()) {
    const existingKey = `${normalize(existing.title)}||${normalize(existing.description)}`;
    if (existingKey === key) {
      // Conflict: case already exists
      throw new AppError(409, 'A case with the same title and description already exists');
    }
  }

  const newCase: Case = {
    id: uuidv4(),
    title,
    description,
    context: '',
    arguments: [],
    verdicts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  casesDB.set(newCase.id, newCase);
  res.status(201).json(newCase);
});

export const getCase = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = validators.isValidUUID(req.params.id, 'Case ID');
  const caseItem = casesDB.get(id);

  if (!caseItem) {
    throw new AppError(404, `Case with ID "${id}" not found`);
  }

  res.json(caseItem);
});

export const uploadFile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = validators.isValidUUID(req.params.id, 'Case ID');
  const caseItem = casesDB.get(id);

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

  caseItem.context = content;
  caseItem.updatedAt = new Date();
  casesDB.set(id, caseItem);

  res.json(caseItem);
});

export const addArgument = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id = validators.isValidUUID(req.params.id, 'Case ID');
  const body = validators.isObject(req.body, 'Request body');
  
  const side = validators.isValidSide(validators.hasProperty(body, 'side', 'side'));
  const text = validators.isString(body.text, 'Argument text');

  const caseItem = casesDB.get(id);
  if (!caseItem) {
    throw new AppError(404, `Case with ID "${id}" not found`);
  }

  const newArgument: Argument = {
    id: uuidv4(),
    caseId: id,
    side: side as Side,
    text,
    createdAt: new Date(),
  };

  argumentsDB.set(newArgument.id, newArgument);
  caseItem.arguments.push(newArgument);
  caseItem.updatedAt = new Date();
  casesDB.set(id, caseItem);

  res.status(201).json(newArgument);
});
