import { test, expect } from '@playwright/test';

test('TestCase2', async ({ page }) => {
  await page.goto('http://itlearn-training-test-website.vercel.app');
  await page.locator('#username').fill('demo_teacher');
  await page.locator('#password').fill('Demo@1234');
  await page.locator("//button[@type = 'submit']").click();
  await page.waitForURL('https://itlearn-training-test-website.vercel.app/teacher');
  await page.getByRole('combobox').selectOption({ label: 'Demo' });
  //span[@class = 'text-[9px] font-mono px-1.5 py-0.5 rounded-full border bg-emerald-500/10 border-emerald-500/25 text-emerald-400']
  await expect(page.locator("//span[@class = 'text-[9px] font-mono px-1.5 py-0.5 rounded-full border bg-emerald-500/10 border-emerald-500/25 text-emerald-400']")).toHaveText('ACTIVE');
  //button[text()= 'Open workspace ']
  await page.locator("//button[text()= 'Open workspace ']").click();
  await page.waitForURL('https://itlearn-training-test-website.vercel.app/teacher/workspaces/1732334b-e1e8-4b7f-8c74-135f250b5973');
  //button[text()= 'Activities (3)']
  const activitiesBtn = page.getByRole('button', { name: /Activities/ });
  await expect(activitiesBtn).toBeVisible();
  await activitiesBtn.click();
  //button[text()= '+ Assign Activity']
  await page.locator("//button[text()= '+ Assign Activity']").click();
  await expect(page.getByRole('heading', { name: 'Assign Activity' })).toBeVisible();
  await page.locator("//label[normalize-space()='Type *']/following-sibling::select").selectOption("QUIZ");
  //await page.getByText('Test teacher create exam Tra', { exact: false }).click();
  await page.getByRole('checkbox', { name: 'Bài Kiểm Tra Playwright 15 Phút Trà test' }).first().check();
  await expect(page.locator("//button[text()= 'Assign']")).toBeEnabled();
  await page.locator("//button[text()= 'Assign']").click();
  await expect(page.locator("//p[text()= 'Exam: Bài Kiểm Tra Playwright 15 Phút Trà test']")).toBeVisible();
});