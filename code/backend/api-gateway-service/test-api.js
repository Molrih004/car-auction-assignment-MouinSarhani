#!/usr/bin/env node

/**
 * API GATEWAY SMOKE TEST
 *
 * Run the gateway first: npm run dev
 * Make sure car-service (port 4000) and auth-service (port 4001) are also running.
 * Then run: npm run test:api
 *
 * Targets http://localhost:$PORT (default 3000), or BASE_URL if set.
 */

import 'dotenv/config';

const BASE = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

// Unique per run so register doesn't collide with earlier runs
const email = `gateway-${Date.now()}@example.com`;
const password = 'supersecret1';
let token;

async function request(method, path, { body, token } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : null };
}

const tests = [
  { name: 'Health check', expect: 200, fn: () => request('GET', '/health') },
  { name: 'GET /cars -> car-service', expect: 200, fn: () => request('GET', '/cars') },
  {
    name: 'POST /auth/register -> auth-service (body is forwarded)', expect: 201,
    fn: () => request('POST', '/auth/register', { body: { email, password } }),
    after: (res) => { token = res.data?.token; },
  },
  { name: 'POST /auth/login with the same credentials', expect: 200, fn: () => request('POST', '/auth/login', { body: { email, password } }) },
  { name: 'GET /auth/me with token', expect: 200, fn: () => request('GET', '/auth/me', { token }) },
  { name: 'Unknown route', expect: 404, fn: () => request('GET', '/does-not-exist') },
];

async function runTests() {
  console.log('\nAPI GATEWAY SMOKE TEST\n');
  console.log(`Target: ${BASE}\n`);

  let failed = 0;
  for (const test of tests) {
    try {
      const result = await test.fn();
      const ok = result.status === test.expect;
      if (!ok) failed++;
      console.log(`${ok ? 'OK  ' : 'FAIL'} ${test.name} (got ${result.status}, expected ${test.expect})`);
      if (!ok) console.log(`     ${JSON.stringify(result.data)}`);
      test.after?.(result);
    } catch (error) {
      console.log(`\nConnection error: ${error.cause?.code || error.message}`);
      console.log(`Make sure the gateway is running at ${BASE} (npm run dev)\n`);
      process.exit(1);
    }
  }

  console.log(`\n${tests.length - failed}/${tests.length} passed\n`);
  process.exit(failed ? 1 : 0);
}

runTests();
