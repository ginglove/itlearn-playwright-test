import {test, expect} from '@playwright/test';
test("TC_EXAM_02: Teacher can add an exam to workspace demo", async ({page}) => {
    await page.goto("https://itlearn-training-test-website.vercel.app/teacher");

    //Login
    await page.getByPlaceholder("Ví dụ: 20261102").fill("demo_teacher");
    await page.getByPlaceholder("••••••••").fill("Demo@1234");
    await page.getByRole("button", {name: "Đăng nhập"}).click();

    // Add exam to workspace
    await page.getByRole("button", {name: "Workspaces"}).click();
    await page.getByRole("button", {name: "Demo"}).click();
    await page.locator('div[class="flex gap-2 flex-wrap mb-6"] button').nth(3).click();
    await page.getByRole("button", {name: "+ Assign Activity"}).click();
    
    const activityType = page
    .locator('select[class="w-full bg-bg-base border border-border-strong rounded-xl px-3 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"]')
    .nth(0);
    await activityType.selectOption('Assessment');

    const exam = page
    .locator('div[class="max-h-40 overflow-y-auto border border-border-strong rounded-xl divide-y divide-border-strong bg-bg-base"] label')
    .nth(0);
    await exam.locator('input[type="checkbox"]').check();

    const assignButton = page.locator('div[class="flex justify-end gap-3 mt-6"] button').nth(1);
    await expect(assignButton).toBeEnabled();
    await assignButton.click();

    await expect(page.locator('div[class="space-y-6"]')).toContainText("[VMH] Bài Kiểm Tra Playwright 15 Phút");
})