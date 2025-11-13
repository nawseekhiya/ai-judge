// Server entry - start express app
import 'dotenv/config';
import express, { Request, Response } from 'express';
import aiRouter from './routes/ai';
import casesRouter from './routes/cases';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json());

// Mount routers
app.use('/api/ai', aiRouter);
app.use('/api/cases', casesRouter);

// Healthcheck
app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Error handler (must be last)
app.use(errorHandler);

const port = process.env.PORT ? Number(process.env.PORT) : 5000;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});

export default app;
