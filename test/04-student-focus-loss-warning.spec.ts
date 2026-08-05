import { test, expect } from "@playwright/test";

test("TC_EXAM_004", async ({ page }) => {
    test.setTimeout(120_000);

    await page.goto("https://itlearn-training-test-website.vercel.app/login");

    await page.getByPlaceholder("Ví dụ: 20261102").fill("student3");
    await page.getByPlaceholder("••••••••").fill("Abc@1234");
    await page.getByRole("button", { name: "Đăng Nhập" }).click();

    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("button", { name: "My Workspaces"}).click();
    await page.getByRole("heading", { name: "Demo" }).click();

    await page.getByRole("button", { name: "Active Exams" }).click();

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
    const alertVisible =  page.locator('.flex.items-center.gap-2.text-rose-400.text-xs.font-medium');

     await page.locator('body').evaluate((body) => {
        const event = new Event('focus');
        body.dispatchEvent(event);
    });

    await expect(alertVisible).toContainText(/Focus loss detected/i);
    const alertText = await alertVisible.textContent();
    console.log("Alert text: " + alertText);
});