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

// The API gateway normally adds these headers after checking the token. Here the test plays the gateway.
const seller = { 'X-User-Id': '3', 'X-User-Role': 'SELLER' };
const otherSeller = { 'X-User-Id': '99', 'X-User-Role': 'SELLER' };
const buyer = { 'X-User-Id': '1', 'X-User-Role': 'BUYER' };
const staff = { 'X-User-Id': '4', 'X-User-Role': 'STAFF' };

const newCar = {
  make: 'Lancia', model: 'Fulvia Coupé', year: 1969, color: 'Blu Lancia',
  mileage: 76000, condition: 'GOOD', description: 'Test car from the smoke test', price: 18000,
};
let carId;

async function request(method, path, { body, user } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(user ?? {}) },
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
  {
    name: 'Filter on make, year and condition', expect: 200,
    fn: () => request('GET', `/cars?make=${encodeURIComponent('Citroën')},Peugeot&yearTo=1979&condition=EXCELLENT,GOOD`),
    check: (res) => res.data.data.length > 0 && res.data.data.every((car) => ['Citroën', 'Peugeot'].includes(car.make) && car.year <= 1979 && car.condition !== 'FAIR'),
  },
  { name: 'Filter with a wrong condition', expect: 400, fn: () => request('GET', '/cars?condition=SHINY') },
  { name: 'Add car without login', expect: 401, fn: () => request('POST', '/cars', { body: newCar }) },
  { name: 'Add car as buyer', expect: 403, fn: () => request('POST', '/cars', { body: newCar, user: buyer }) },
  { name: 'Add car with a year in the future', expect: 400, fn: () => request('POST', '/cars', { body: { ...newCar, year: 2999 }, user: seller }) },
  {
    name: 'Add car as seller', expect: 201,
    fn: () => request('POST', '/cars', { body: newCar, user: seller }),
    check: (res) => { carId = res.data?.data?.id; return res.data.data.sellerId === 3; },
  },
  { name: 'Get the new car', expect: 200, fn: () => request('GET', `/cars/${carId}`) },
  { name: 'Get a car that does not exist', expect: 404, fn: () => request('GET', '/cars/does-not-exist') },
  { name: 'Change car as another seller', expect: 403, fn: () => request('PUT', `/cars/${carId}`, { body: newCar, user: otherSeller }) },
  {
    name: 'Change own car', expect: 200,
    fn: () => request('PUT', `/cars/${carId}`, { body: { ...newCar, mileage: 76500 }, user: seller }),
    check: (res) => res.data.data.mileage === 76500,
  },
  {
    name: 'Delete car (503 when the auction service is down, 204 when it runs)',
    expect: Number(process.env.EXPECT_DELETE || 503),
    fn: () => request('DELETE', `/cars/${carId}`, { user: staff }),
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
