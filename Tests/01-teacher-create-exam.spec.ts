import {test, expect} from "@playwright/test";

test("TC_EXAM_001", async ({ page }) => {

    await page.goto("https://itlearn-training-test-website.vercel.app/login");

    await page.getByPlaceholder("Ví dụ: 20261102").fill("demo_teacher");
    await page.getByPlaceholder("••••••••").fill("Demo@1234");
    await page.getByRole("button", { name: "Đăng Nhập" }).click();

    await page.waitForLoadState("domcontentloaded");
    const text  = await page.locator('//p[@class="text-text-tertiary text-xs mb-4"]').first().textContent();
    const countTestPre = parseInt(text?.match(/\d+/)?.[0] || "0");
    console.log("Số lượng bài kiểm tra trước khi tạo: " + countTestPre);

    await page.getByRole("button", { name: "+ Create New Exam" }).click();

    await page.locator('//input[@class = "premium-input"]').first().fill("QUYNHDT Bài Kiểm Tra Playwright 15 Phút");
    await page.locator('//input[@class = "premium-input"]').nth(1).fill("15");

    //await page.locator("select").nth(2).click();
    await page.locator('select').nth(2).selectOption('WARN_AND_LOCK');

    await page.locator('//span[@class="text-text-tertiary"]').first().click();
    await page.locator('.grid').getByText('3', { exact: true }).click();
    await page.getByRole("button", { name: "Apply" }).click();

    await page.locator('//span[@class="text-text-tertiary"]').click();
    await page.getByRole("button", { name: "28", exact: true }).first().click();
    await page.getByRole("button", { name: "Apply" }).click();

    await page.getByRole("button", { name: "Create Exam" }).click();

    await page.waitForLoadState("domcontentloaded");

    await expect(page.getByRole("heading", { name: "QUYNHDT Bài Kiểm Tra Playwright 15 Phút" })).toBeVisible();

    await page.getByRole("button", { name: "Manage Exams" }).click();
    
    const textAf  = await page.locator('//p[@class="text-text-tertiary text-xs mb-4"]').first().textContent();
    const countTestAf = parseInt(textAf?.match(/\d+/)?.[0] || "0");
    console.log("Số lượng bài kiểm tra sau khi tạo: " + countTestAf);

    await expect(countTestAf).toBe(countTestPre + 1);
});

// test("TC Xoá Bài Kiểm Tra", async ({ page }) => {

//     await page.goto("https://itlearn-training-test-website.vercel.app/login");

//     await page.getByPlaceholder("Ví dụ: 20261102").fill("demo_teacher");
//     await page.getByPlaceholder("••••••••").fill("Demo@1234");
//     await page.getByRole("button", { name: "Đăng nhập" }).click();

//     await page.locator('//button[@title = "Edit Settings"]').first().click();
//     await page.getByRole("button", { name: "Delete Exam" }).click();

//     const modal = page.locator('.fixed.inset-0'); // Thẻ div phủ modal (fixed inset-0 z-50)
//     await modal.getByRole("button", { name: "Delete Exam" }).click();

// });
