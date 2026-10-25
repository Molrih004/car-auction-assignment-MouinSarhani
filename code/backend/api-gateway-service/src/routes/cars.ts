import { serviceProxy } from './serviceProxy.js';

export const CARS_PATHS = ['/cars'];

export const carsProxy = serviceProxy('car-service', process.env.CAR_SERVICE_URL || 'http://localhost:4000', CARS_PATHS);
