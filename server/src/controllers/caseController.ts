import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { Case, Argument, Verdict, Side } from '../types/index';

// In-memory storage (replace with DB later)
const casesDB: Map<string, Case> = new Map();
const argumentsDB: Map<string, Argument> = new Map();
const verdictsDB: Map<string, Verdict> = new Map();

export const createCase = (req: Request, res: Response): void => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      res.status(400).json({ error: 'Title is required' });
      return;
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
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getCase = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const caseItem = casesDB.get(id);

    if (!caseItem) {
      res.status(404).json({ error: 'Case not found' });
      return;
    }

    res.json(caseItem);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const uploadFile = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const caseItem = casesDB.get(id);

    if (!caseItem) {
      res.status(404).json({ error: 'Case not found' });
      return;
    }

    const content = req.body?.text || (req.file ? req.file.buffer.toString('utf-8') : '');

    if (!content) {
      res.status(400).json({ error: 'No content provided' });
      return;
    }

    caseItem.context = content;
    caseItem.updatedAt = new Date();
    casesDB.set(id, caseItem);

    res.json(caseItem);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const addArgument = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { side, text } = req.body;

    const caseItem = casesDB.get(id);
    if (!caseItem) {
      res.status(404).json({ error: 'Case not found' });
      return;
    }

    if (!side || !text) {
      res.status(400).json({ error: 'Side and text are required' });
      return;
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
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
