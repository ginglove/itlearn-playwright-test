import {test, expect} from "@playwright/test";
test("TC_EXAM_004: Verify focus loss warning", async ({page}) => {
    await page.goto("https://itlearn-training-test-website.vercel.app/login");

    //Login
    await page.getByPlaceholder("Ví dụ: 20261102").fill("student1");
    await page.getByPlaceholder("••••••••").fill("Vmh@240902");
    await page.getByRole("button", {name: "Đăng nhập"}).click();

    // Start the exam
    await page.locator('nav[class="flex flex-col gap-1.5 flex-grow"] button').nth(0).click();
    const exam = page
    .locator('div[class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"] div')
    .filter({hasText: '[VMH] Bài Kiểm Tra Playwright 15 Phút'});
    const startExamButton = exam.getByRole("button", {name: "Start Exam"});
    await startExamButton.click();

    const correctAnswer = page
    .locator('div[class="space-y-3"] button')
    .filter({hasText: 'Browser automation'});
    await correctAnswer.click();

    // Deactive blur event
    await page.evaluate(() => {
        window.dispatchEvent(new Event('blur'));
    });

    //Verify Focus Loss modal
    const warningModal = page.locator('div[class="bg-bg-surface border border-rose-500/40 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6"]');
    await expect(warningModal).toBeVisible();

    const closeWarningModal = warningModal.getByRole('button', {name: 'I understand — return to exam'});
    await closeWarningModal.click();

    await expect(page.getByText(/Focus loss detected/)).toBeVisible();


    // Submit exam
    const action = page.locator('div[class="flex items-center gap-2 sm:gap-4 shrink-0"] button');
    const submitButton = action.nth(1);
    const verifySubmitAction = page.locator('div[class="flex gap-3"] button').nth(1);
    await submitButton.click();
    await verifySubmitAction.click();
    await page.getByRole('button', {name: 'Active Exams'}).click();
})