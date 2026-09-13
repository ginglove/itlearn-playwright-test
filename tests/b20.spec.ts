import { test, expect } from '@playwright/test';
import { parse } from 'csv-parse/sync';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';
const csvFilePath = path.join(__dirname, '../data/users_data.csv');
// Read raw file to detect existing headers dynamically
const rawCsv = fs.readFileSync(csvFilePath, 'utf-8');
// Parse without trimming or mutating empty fields
const records = parse(rawCsv, { 
    columns: true, 
    skip_empty_lines: true,
    trim: false,
    relax_column_count: true
});

for (const record of records) {
    test(`${record.testCase}`, async ({ page }) => {
      await page.goto('https://the-internet.herokuapp.com/login');
      await page.fill('#username', record.username);
      await page.fill('#password', record.password);
      await page.click('button[type="submit"]');

      if (record.expected_status === 'success') {
            await expect(page).not.toHaveURL(/\/login/);
          } else {
            await expect(page).toHaveURL(/\/login/);
          }
  });
}
test.afterEach(async ({}, testInfo) => {
  const currentRecord = records.find(r => r.testCase === testInfo.title);
  if (currentRecord) {
    currentRecord.status = testInfo.status;
  }
});
test.afterAll(async () => {
  // Define exact column list from original file + status
  const headers = [
    'testCase',
    'username',
    'password',
    'expected_status',
    'status'
  ];
  const csvWriter = createObjectCsvWriter({
    path: csvFilePath,
    header: headers.map(h => ({ id: h, title: h }))
  });
  // Preserve exact original values, safely defaulting missing keys to empty string
  const recordsToWrite = records.map(record => {
    const row = {};
    for (const key of headers) {
      row[key] = record[key] !== undefined && record[key] !== null ? record[key] : '';
    }
    return row;
  });
  await csvWriter.writeRecords(recordsToWrite);
});
