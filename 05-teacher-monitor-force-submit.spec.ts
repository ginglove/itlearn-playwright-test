import {test, expect} from '@playwright/test';
test('TC_EXAM_005: Force submit student exam', async ({browser}) => {

    //TEACHER CONTEXT
    const teacherContext = await browser.newContext();
    const teacherPage = await teacherContext.newPage();

    await teacherPage.goto("https://itlearn-training-test-website.vercel.app/login");
    
    //Login teacher account
    await teacherPage.getByPlaceholder("Ví dụ: 20261102").fill("demo_teacher");
    await teacherPage.getByPlaceholder("••••••••").fill("Demo@1234");
    await teacherPage.getByRole("button", {name: "Đăng nhập"}).click();

     // STUDENT CONTEXT
    const studentContext = await browser.newContext();
    const studentPage = await studentContext.newPage();

    await studentPage.goto("https://itlearn-training-test-website.vercel.app/login");

    // Login student account
    await studentPage.getByPlaceholder("Ví dụ: 20261102").fill("student1");
    await studentPage.getByPlaceholder("••••••••").fill("Vmh@240902");
    await studentPage.getByRole("button", {name: "Đăng nhập"}).click();

    // Student start the exam
    await studentPage.locator('nav[class="flex flex-col gap-1.5 flex-grow"] button').nth(0).click();

    const examCard = studentPage
    .locator('div[class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"] div')
    .filter({
        has: studentPage.getByText('[VMH] Bài Kiểm Tra Playwright 15 Phút', { exact: true }),
    })
    .filter({
        has: studentPage.getByText('Active', { exact: true }),
    });
    await expect(examCard).toHaveCount(1);
    await expect(examCard).toBeVisible();

    const startButton = examCard.getByRole('button', {name: /^Start (Exam|Attempt \d+)$/});
    await startButton.click();

    const correctAnswer = studentPage
    .locator('div[class="space-y-3"] button')
    .filter({hasText: 'Browser automation'});
    await correctAnswer.click();

    // Trigger browser blur event
    await studentPage.evaluate(() => {
        window.dispatchEvent(new Event('blur'));
    });

    const warningModal = studentPage.locator('div[class="bg-bg-surface border border-rose-500/40 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6"]');
    await expect(warningModal).toBeVisible();

    const closeWarningModal = warningModal.getByRole('button', 
        {name: 'I understand — return to exam'}); 
    await closeWarningModal.click(); 
    await expect(studentPage.getByText(/Focus loss detected/)).toBeVisible();

    // TEACHER CONTEXT - FORCE SUBMIT
    // Check student's exam status
    await teacherPage.locator('nav[class="flex flex-col gap-1.5 flex-grow"] button').nth(4).click();

    const examForced = teacherPage
    .locator('div[class="space-y-4"] div[class="glass-card overflow-hidden"]')
    .filter({
        has: teacherPage.getByText('[VMH] Bài Kiểm Tra Playwright 15 Phút', {exact: true}),
    })
    .filter({
        has: teacherPage.getByText('Active', {exact: true}),
    })
    await expect(examForced).toBeVisible();
    
    const liveMonitor = examForced
    .locator('button div button');
    await liveMonitor.click();

    const inProgressRow = teacherPage
    .locator('table tbody tr')
    .filter({
        has: teacherPage.getByText('In Progress', {exact: true}),
    });
    await expect(inProgressRow).toHaveCount(1);
    await expect(inProgressRow).toBeVisible();

    teacherPage.once('dialog', async (dialog) => {
            expect(dialog.message()).toBe("Force-submit this student's exam? This will grade and finalize their current answers.");
            await dialog.accept();
        });
    await inProgressRow.getByRole('button', {name: 'Force Submit'}).click();
    //await expect(inProgressRow.getByText('Submitted', { exact: true })).toBeVisible({timeout: 10000});

    // STUDENT CONTEXT - FORCED SUBMIT BY TEACHER
    await expect(studentPage).toHaveURL('https://itlearn-training-test-website.vercel.app/student/completed')
    await expect(studentPage.getByText('My Exam Results')).toBeVisible();
    const examListTable = studentPage.locator('div[class="max-w-6xl mx-auto p-6 md:p-8 space-y-6"] td div');
    await expect(examListTable).toHaveText('[VMH] Bài Kiểm Tra Playwright 15 Phút');
})
