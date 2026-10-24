// Load .env before the route modules are evaluated: they read the *_SERVICE_URL variables at import time
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { carsProxy, CARS_PATHS } from './routes/cars.js';
import { authProxy, AUTH_PATHS } from './routes/auth.js';
import { auctionsProxy, AUCTIONS_PATHS } from './routes/auctions.js';
import { errorHandler } from './middleware/errorHandling.js';
import { authenticate } from './middleware/authenticate.js';
import { requestLogger } from './middleware/requestLogger.js';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();

// Middleware runs in this order for every request
app.use(requestLogger);
app.use(express.json());
app.use(cors());
app.use(authenticate);

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'api-gateway-service',
    environment: NODE_ENV,
    upstreams: {
      carService: process.env.CAR_SERVICE_URL || 'http://localhost:4000',
      authService: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
      auctionService: process.env.AUCTION_SERVICE_URL || 'http://localhost:4002',
    },
  });
});

app.use(authProxy);
app.use(carsProxy);
app.use(auctionsProxy);

app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'This page or API route does not exist.' } });
});

app.use(errorHandler);

app.listen(PORT, () => {
  const carServiceUrl = process.env.CAR_SERVICE_URL || 'http://localhost:4000';
  const authUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
  const auctionUrl = process.env.AUCTION_SERVICE_URL || 'http://localhost:4002';
  console.log(`API gateway running at http://localhost:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  AUTH_PATHS.forEach((path) => console.log(`→ ${path.padEnd(14)} → ${authUrl} (public)`));
  CARS_PATHS.forEach((path) => console.log(`→ ${path.padEnd(14)} → ${carServiceUrl}`));
  AUCTIONS_PATHS.forEach((path) => console.log(`→ ${path.padEnd(14)} → ${auctionUrl}`));
});
