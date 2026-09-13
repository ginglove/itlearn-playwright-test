import { test, expect } from '@playwright/test';

const url = 'https://training-car-sell-system.vercel.app/api/v1/catalog/models';

test('GET /catalog/models — lấy danh sách dòng xe', async ({ request }) => {
  const response = await request.get(
    `${url}`); //&sort=price-asc
//?bodyType=Sedan
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(Array.isArray(body.data ?? body)).toBe(true);
  const list = body.data ?? body;
  expect(list.length).toBeGreaterThan(0);
  console.log('Response body:', list.length);
});