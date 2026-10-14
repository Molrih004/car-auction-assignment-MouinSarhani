#!/usr/bin/env node

/**
 * CAR-SERVICE API SMOKE TEST
 *
 * Run the server first: npm run dev
 * Then run: npm run test:api
 *
 * Targets http://localhost:$PORT (default 4000), or BASE_URL if set.
 */

import 'dotenv/config';

const BASE = process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`;

async function request(method, path, { body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : null };
}

const tests = [
  { name: 'Health check', expect: 200, fn: () => request('GET', '/health') },
  {
    name: 'List cars', expect: 200,
    fn: () => request('GET', '/cars'),
    check: (res) => Array.isArray(res.data?.data) && res.data.meta?.count === res.data.data.length,
  },
];

async function runTests() {
  console.log('\nCAR-SERVICE API SMOKE TEST\n');
  console.log(`Target: ${BASE}\n`);

  let failed = 0;
  for (const test of tests) {
    try {
      const result = await test.fn();
      const ok = result.status === test.expect && (test.check?.(result) ?? true);
      if (!ok) failed++;
      console.log(`${ok ? 'OK  ' : 'FAIL'} ${test.name} (got ${result.status}, expected ${test.expect})`);
      if (!ok) console.log(`     ${JSON.stringify(result.data)}`);
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
