// Load .env before the route modules are evaluated: they read CAR_SERVICE_URL/AUTH_SERVICE_URL at import time
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { carsProxy, CARS_PATHS } from './routes/cars.js';
import { authProxy, AUTH_PATHS } from './routes/auth.js';
import { errorHandler } from './middleware/errorHandling.js';

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'api-gateway-service',
    environment: NODE_ENV,
    upstreams: {
      carService: process.env.CAR_SERVICE_URL || 'http://localhost:4000',
      authService: process.env.AUTH_SERVICE_URL || 'http://localhost:4001',
    },
  });
});

app.use(authProxy);
app.use(carsProxy);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  const carServiceUrl = process.env.CAR_SERVICE_URL || 'http://localhost:4000';
  const authUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
  console.log(`API gateway running at http://localhost:${PORT}`);
  console.log(`Environment: ${NODE_ENV}`);
  AUTH_PATHS.forEach((path) => console.log(`→ ${path.padEnd(14)} → ${authUrl} (public)`));
  CARS_PATHS.forEach((path) => console.log(`→ ${path.padEnd(14)} → ${carServiceUrl} (public)`));
});
