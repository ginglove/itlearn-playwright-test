import { test, expect } from "@playwright/test";

test("TC_EXAM_003", async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto("https://itlearn-training-test-website.vercel.app/login");

    await page.getByPlaceholder("Ví dụ: 20261102").fill("student3");
    await page.getByPlaceholder("••••••••").fill("Abc@1234");
    await page.getByRole("button", { name: "Đăng Nhập" }).click();

    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("button", { name: "My Workspaces"}).click();
    await page.getByRole("heading", { name: "Demo" }).click();

    await page.getByRole("button", { name: "Active Exams" }).click();

    const EXAM_NAME = "QUYNHDTA Bài Kiểm Tra Playwright 15 Phút";

    const examCard = page
    .locator('.glass-card')
    .filter({ hasText: "QUYNHDTA Bài Kiểm Tra Playwright 15 Phút" })
    .first();

    await expect(examCard).toBeVisible();

    if(await examCard.getByRole("button", { name: "Start Exam" }).isVisible()) {
        await examCard.getByRole("button", { name: "Start Exam" }).click();
    } 
    else if(await examCard.getByRole("button", { name: "Continue Exam" }).isVisible()) 
        { 
        await examCard.getByRole("button", { name: "Continue Exam" }).click();
    }
    else{
        await examCard.getByRole("button", { name: /Start Attempt/i }).click();
    }
    await page.waitForLoadState("domcontentloaded");
    await page.selectOption('select', { index: 2 });
    await page.getByRole("button", { name: "Next" }).click();
    await page.selectOption('select', { index: 2 });
    await page.getByRole("button", { name: "Submit Exam" }).click();

    const modal = page.locator('.fixed.inset-0'); // Thẻ div phủ modal (fixed inset-0 z-50)
    await modal.getByRole("button", { name: "Yes, Submit Exam" }).click();

    const modal2 = page.locator('.fixed.inset-0'); 
    await expect(modal2.getByRole("heading", { name: "QUYNHDTA Bài Kiểm Tra Playwright 15 Phút" })).toBeVisible();

});
