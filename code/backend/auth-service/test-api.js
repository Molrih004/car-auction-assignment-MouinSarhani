#!/usr/bin/env node

/**
 * AUTH-SERVICE API SMOKE TEST
 *
 * Run the server first: npm run dev
 * Then run: npm run test:api
 *
 * Targets http://localhost:$PORT (default 4001), or BASE_URL if set.
 */

import 'dotenv/config';

const BASE = process.env.BASE_URL || `http://localhost:${process.env.PORT || 4001}`;

// Unique per run so register doesn't collide with earlier runs
const email = `test-${Date.now()}@example.com`;
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
  {
    name: 'Register new user', expect: 201,
    fn: () => request('POST', '/auth/register', { body: { email, password } }),
    after: (res) => { token = res.data?.token; },
  },
  { name: 'Register duplicate email', expect: 409, fn: () => request('POST', '/auth/register', { body: { email, password } }) },
  { name: 'Register with short password', expect: 400, fn: () => request('POST', '/auth/register', { body: { email: `short-${email}`, password: 'short' } }) },
  { name: 'Login', expect: 200, fn: () => request('POST', '/auth/login', { body: { email, password } }) },
  { name: 'Login with wrong password', expect: 401, fn: () => request('POST', '/auth/login', { body: { email, password: 'wrongpassword' } }) },
  { name: 'Get /me with token', expect: 200, fn: () => request('GET', '/auth/me', { token }) },
  { name: 'Get /me without token', expect: 401, fn: () => request('GET', '/auth/me') },
  { name: 'Get /me with invalid token', expect: 401, fn: () => request('GET', '/auth/me', { token: 'not-a-jwt' }) },
];

async function runTests() {
  console.log('\nAUTH-SERVICE API SMOKE TEST\n');
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
      console.log(`Make sure the server is running at ${BASE} (npm run dev)\n`);
      process.exit(1);
    }
  }

  console.log(`\n${tests.length - failed}/${tests.length} passed\n`);
  process.exit(failed ? 1 : 0);
}

runTests();
