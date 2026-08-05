import { test, expect } from '@playwright/test';

test('TestCase4', async ({ page }) => {
  await page.goto('http://itlearn-training-test-website.vercel.app');
  await page.locator('#username').fill('student8');
  await page.locator('#password').fill('Abc@1234');
  await page.locator("//button[@type = 'submit']").click();
  await page.waitForURL('https://itlearn-training-test-website.vercel.app/student/exams');
  //span[text() = 'Active Exams']
  await page.locator("//span[text() = 'Active Exams']").click();
  //h3[text()= 'Bài Kiểm Tra_Trà test']
  const exam = page.getByRole('heading', {name: 'Bài Kiểm Tra Playwright 15 Phút Trà test'}).first();
  await expect(exam).toBeVisible();
  const card = page.locator('div.glass-card').filter({has: exam});
  await Promise.all([page.waitForURL('**/workspace'),card.getByRole('button', { name: 'Start Exam' }).click(), ]);
  await page.evaluate(() => {window.dispatchEvent(new Event('blur'));});
  await expect(page.getByRole('dialog', { name: /Focus Loss Warning/i })).toBeVisible();

});