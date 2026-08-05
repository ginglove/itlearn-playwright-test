import { test, expect } from '@playwright/test';

test('TestCase3', async ({ page }) => {
  await page.goto('http://itlearn-training-test-website.vercel.app');
  await page.locator('#username').fill('student8');
  await page.locator('#password').fill('Abc@1234');
  await page.locator("//button[@type = 'submit']").click();
  await page.waitForURL('https://itlearn-training-test-website.vercel.app/student/exams');
  //span[text() = 'Active Exams']
  await page.locator("//span[text() = 'Active Exams']").click();
  //h3[text()= 'Bài Kiểm Tra_Trà test']
  const exam = page.getByRole('heading', {name: 'Test teacher create exam Tra'}).first();
  await expect(exam).toBeVisible();
  const card = page.locator('div.glass-card').filter({has: exam});
  await card.getByRole('button', { name: 'Start Exam' }).click();
  await Promise.all([page.waitForURL('**/student/exams/**/workspace'),card.getByRole('button', { name: 'Start Exam' }).click(),]);
  await page.locator('input[type="radio"]').first().check();
  await page.getByRole('button', { name: 'Save & Exit' }).click();
  await expect(card.getByText('PENDING')).toBeVisible();
  await card.getByRole('button', { name: 'Continue Exam' }).click();
  await page.getByRole('button', { name: 'Submit Exam' }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(card.getByText('SUBMITTED')).toBeVisible();

});