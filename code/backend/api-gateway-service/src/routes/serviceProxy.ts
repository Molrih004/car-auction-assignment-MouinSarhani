import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware';
import type { ServerResponse } from 'http';

/**
 * One proxy per service. Every service gets the same behaviour:
 * the body is forwarded and a service that is down gives the same 502 answer (NFR-10).
 */
export const serviceProxy = (serviceName: string, target: string, paths: string[]) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathFilter: (path) => paths.some((prefix) => path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`)),
    on: {
      // server.ts runs express.json() before this proxy, which drains the request
      // stream; re-serialize the parsed body onto the proxied request, or else
      // writes reach the service with an empty body.
      proxyReq: fixRequestBody,
      error: (err, _req, res) => {
        console.error(`${serviceName} is unavailable: ${err.message}`);
        const response = res as ServerResponse;
        response.writeHead(502, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({
          error: { code: 'SERVICE_UNAVAILABLE', message: 'We can\'t do this right now. Please try again in a moment.' },
        }));
      },
    },
  });
