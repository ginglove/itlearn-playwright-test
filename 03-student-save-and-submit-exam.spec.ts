import {test, expect} from '@playwright/test';
test('TC_EXAM_03: Student Save and Submit Exam', async ({page}) => {
    await page.goto('https://itlearn-training-test-website.vercel.app/login');

    //Login
    await page.getByPlaceholder("Ví dụ: 20261102").fill("student1");
    await page.getByPlaceholder("••••••••").fill("Vmh@240902");
    await page.getByRole("button", {name: "Đăng nhập"}).click();

    // Start the exam
    await page.locator('nav[class="flex flex-col gap-1.5 flex-grow"] button').nth(0).click();
    const exam = page
    .locator('div[class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"] div')
    .filter({hasText: '[VMH] Bài Kiểm Tra Playwright 15 Phút'});

    const examCard = page
    .locator('div[class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"] div')
    .filter({
        has: page.getByText('[VMH] Bài Kiểm Tra Playwright 15 Phút', { exact: true }),
    })
    .filter({
        has: page.getByText('Active', { exact: true }),
    });
    await expect(examCard).toHaveCount(1);
    await expect(examCard).toBeVisible();

    const startButton = examCard.getByRole('button', {name: /^Start (Exam|Attempt \d+)$/});
    await startButton.click();

    const correctAnswer = page
    .locator('div[class="space-y-3"] button')
    .filter({hasText: 'Browser automation'});
    await correctAnswer.click();

    const action = page.locator('div[class="flex items-center gap-2 sm:gap-4 shrink-0"] button');
    const saveButton = action.nth(0);
    await saveButton.click();

    const examStatus = exam.locator('span').filter({ hasText: 'Pending' });
    await expect(examStatus).toHaveText('Pending');

    const resumeButton = exam.getByRole("button", {name: "Resume Exam"});
    await resumeButton.click();

    const submitButton = action.nth(1);
    const verifySubmitAction = page.locator('div[class="flex gap-3"] button').nth(1);
    await submitButton.click();
    await verifySubmitAction.click();
    await page.getByRole('button', {name: 'Active Exams'}).click();

    // Verify exam status on My Workspace tab
    const workspaceTab = page.locator('nav[class="flex flex-col gap-1.5 flex-grow"] button').nth(1);
    const workspaceDemo = page.locator('div[class="grid grid-cols-1 md:grid-cols-2 gap-4"] button').nth(0);
    await workspaceTab.click();
    await workspaceDemo.click();

    const examResult = page
    .locator('div[class="divide-y divide-border-strong"] div')
    .filter({hasText: '[VMH] Bài Kiểm Tra Playwright 15 Phút'});
    const examResultStatus = examResult.locator('span').filter({hasText: 'SUBMITTED'}).last();
    const examScore = examResult.locator('span').filter({hasText: '33.3%'})
    await expect(examResultStatus).toBeVisible();
    await expect(examScore).toBeVisible();
})