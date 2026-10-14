import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import type { ServerResponse } from 'http';

const target = process.env.CAR_SERVICE_URL || 'http://localhost:4000';

export const CARS_PATHS = ['/cars'];

export const carsProxy = createProxyMiddleware({
  target,
  changeOrigin: true,
  pathFilter: (path) => CARS_PATHS.some((prefix) => path.startsWith(prefix)),
  on: {
    // server.ts runs express.json() before this proxy, which drains the request
    // stream; re-serialize the parsed body onto the proxied request, or else
    // writes reach car-service with an empty body.
    proxyReq: fixRequestBody,
    error: (_err, _req, res) => {
      const response = res as ServerResponse;
      response.writeHead(502, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'car-service is unavailable' }));
    },
  },
});
