// Server entry - start express app
import 'dotenv/config';
import express from 'express';
import aiRouter from './routes/ai';
import casesRouter from './routes/cases';

const app = express();

app.use(express.json());

// Mount routers
app.use('/api/ai', aiRouter);
app.use('/api/cases', casesRouter);

// Healthcheck
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT ? Number(process.env.PORT) : 5000;

app.listen(port, () => {
	// eslint-disable-next-line no-console
	console.log(`Server listening on http://localhost:${port}`);
});

export default app;
