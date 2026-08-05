import { test, expect } from "@playwright/test";

test("TC_EXAM_005", async ({ page }) => {

    const tab1 = page;  
    const tab2 = await (await page.context().browser()!.newContext()).newPage();

    //Đăng nhập vào tab 1 với tài khoản giáo viên
    await tab1.goto("https://itlearn-training-test-website.vercel.app/login");
    await tab1.getByPlaceholder("Ví dụ: 20261102").fill("demo_teacher");
    await tab1.getByPlaceholder("••••••••").fill("Demo@1234");
    await tab1.getByRole("button", { name: "Đăng nhập" }).click();

    await tab1.waitForLoadState("domcontentloaded");
    
    //Đăng nhập vào tab 2 với tài khoản học sinh
    await tab2.bringToFront();
    await tab2.goto("https://itlearn-training-test-website.vercel.app/login");
    await tab2.getByPlaceholder("Ví dụ: 20261102").fill("student3");
    await tab2.getByPlaceholder("••••••••").fill("Abc@1234");
    await tab2.getByRole("button", { name: "Đăng Nhập" }).click();

    await tab2.waitForLoadState("domcontentloaded");

    //await tab2.getByRole("button", { name: "Active Exams" }).click();

    const examCard = tab2
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

    //.text-white.font-semibold 
    await tab2.waitForLoadState("domcontentloaded");

    await expect(tab2.locator('.text-white.font-semibold')).toContainText("QUYNHDTA Bài Kiểm Tra Playwright 15 Phút");

    //Chuyển sang tab 1 và nhấn nút Force Submit
    await tab1.bringToFront();
    
    await tab1.getByRole("button", { name: "Manage Exams" }).click();

    const examCardTeacher = tab1
    .locator('.glass-card')
    .filter({ hasText: "QUYNHDTA Bài Kiểm Tra Playwright 15 Phút" })
    .first();

    await expect(examCardTeacher).toBeVisible();

    await examCardTeacher.getByRole("button", { name: "Monitor" }).click();

    await tab1.waitForLoadState("domcontentloaded");

    await tab1.getByRole("heading", { name: "Live Exam Monitor" }).isVisible();

 
    const lineStudent = tab1.locator('table tbody tr')
    .filter({ hasText: 'QuỳnhDTA' })
    .filter({ hasText: 'In Progress' });


    page.once('dialog', async (dialog) => {
        expect(dialog.message()).toBe('Force-submit this student\'s exam? This will grade and finalize their current answers.');
        await dialog.accept(); 
    });
    await lineStudent.getByRole('button', { name: 'Force Submit' }).click();


    //Chuyển sang tab 2 và kiểm tra xem học sinh có bị out ra khỏi bài thi
    await tab2.bringToFront();
    await expect(tab2.locator('.text-white.font-semibold')).not.toContainText("QUYNHDTA Bài Kiểm Tra Playwright 15 Phút"); 
    //lỗi do studen chưa bị out ra khỏi bài thi, vẫn còn hiển thị tên bài thi 
});