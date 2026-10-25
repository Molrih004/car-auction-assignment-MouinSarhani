import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { auctionsRouter } from './routes/auctions.js';
import { errorHandler } from './middleware/errorHandling.js';
import { requestLogger } from './middleware/requestLogger.js';
import { currentUser } from './middleware/currentUser.js';
import { startScheduler } from './services/index.js';

dotenv.config();

const PORT = process.env.PORT || 4002;
const NODE_ENV = process.env.NODE_ENV || 'development';
const SCHEDULER_INTERVAL_MS = Number(process.env.SCHEDULER_INTERVAL_MS || 5000);

const app = express();

// Middleware runs in this order for every request
app.use(requestLogger);
app.use(express.json());
app.use(cors());
app.use(currentUser);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'auction-service', environment: NODE_ENV });
});

app.use('/auctions', auctionsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'This API route does not exist.' } });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  startScheduler(SCHEDULER_INTERVAL_MS);
  console.log(`Scheduler runs every ${SCHEDULER_INTERVAL_MS} ms`);
});
