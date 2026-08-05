import { test, expect } from '@playwright/test';

test('TestCase1', async ({ page }) => {
  await page.goto('http://itlearn-training-test-website.vercel.app');
  await page.locator('#username').fill('demo_teacher');
  await page.locator('#password').fill('Demo@1234');
  await page.locator("//button[@type = 'submit']").click();
  await page.waitForURL('https://itlearn-training-test-website.vercel.app/teacher');
  //button[text() = '+ Create New Exam']
  await page.locator("//button[text() = '+ Create New Exam']").click();
  await page.waitForURL('https://itlearn-training-test-website.vercel.app/teacher/exams/create');
  //input[@type = 'text']
  await page.locator("//input[@type = 'text']").fill('Bài Kiểm Tra Playwright 15 Phút Trà test');
  await page.locator("button.premium-input").first().click();
  const day = '4';
  await page.getByRole('button', { name: day, exact: true }).click();
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.locator('button.premium-input').nth(1).click();
  await page.getByRole('button', { name: '15', exact: true }).last().click();
  await page.getByRole('button', { name: 'Apply' }).last().click();
  await page.locator("//label[normalize-space()='Focus Loss Policy']/following-sibling::select").selectOption("WARN_AND_LOCK");
  //input[@class = 'premium-input bg-bg-surface-elevated text-white w-24']
  await page.locator("//input[@class = 'premium-input bg-bg-surface-elevated text-white w-24']").fill('9');
  //button[@type = 'submit']
  await Promise.all([
  page.waitForURL(/\/teacher\/exams\/.*\/questions/),
  page.locator("//button[@type='submit']").click(),]);
  await expect(page.locator("//h1[text() = 'Bài Kiểm Tra Playwright 15 Phút Trà test']")).toBeVisible();
});