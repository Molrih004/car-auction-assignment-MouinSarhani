import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { carsRouter } from './routes/cars.js';
import { errorHandler } from './middleware/errorHandling.js';
import { requestLogger } from './middleware/requestLogger.js';

dotenv.config();

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();

app.use(express.json());
app.use(cors());
app.use(requestLogger);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'car-service', environment: NODE_ENV });
});

app.use('/cars', carsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
});
