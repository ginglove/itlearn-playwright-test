import {test, expect} from "@playwright/test";

test("TC_EXAM_002", async ({ page }) => {

    await page.goto("https://itlearn-training-test-website.vercel.app/login");

    await page.getByPlaceholder("Ví dụ: 20261102").fill("demo_teacher");
    await page.getByPlaceholder("••••••••").fill("Demo@1234");
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    await page.waitForLoadState("domcontentloaded");

    await page.getByRole("button", { name: "Workspaces" }).click();
    await page.getByRole("button", { name: "Demo" }).click();

    await page.getByRole("button", { name: /Activities/i }).click();


    // if (!(await page.getByText("No quiz activities assigned yet.").isVisible())) {
    //     await page.getByRole("button", { name: "Remove" }).click();
    // }
    // await expect(page.getByText("No quiz activities assigned yet.")).toBeVisible();

    await page.getByRole("button", { name: "+ Assign Activity" }).click();
    await page.waitForSelector('div[class*="fixed"]', { state: 'visible' });

    const modal = page.locator('div[class*="fixed"]').filter({ hasText: "Assign" }); 

    await modal.getByRole('checkbox', { name: 'QUYNHDTA Bài Kiểm Tra Playwright 15 Phút' }).check();

    await modal.getByRole("button", { name: "Assign" }).click();
   
    await expect(page.getByRole("button", { name: "Assign", exact: true })).toBeHidden();
    
    //await expect(page.getByText("No quiz activities assigned yet.")).toBeHidden();
    await expect(page.getByText("QUYNHDTA Bài Kiểm Tra Playwright 15 Phút", { exact: true })).toBeVisible();
    
}); 

 
 