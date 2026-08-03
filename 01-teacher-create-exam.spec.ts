import {test, expect} from '@playwright/test';
test("TC_EXAM_001: Automate Exam Creation", async ({page}) => {
    await page.goto("https://itlearn-training-test-website.vercel.app/login");

    //Login
    await page.getByPlaceholder("Ví dụ: 20261102").fill("demo_teacher");
    await page.getByPlaceholder("••••••••").fill("Demo@1234");
    await page.getByRole("button", {name: "Đăng nhập"}).click();

    // Create Exam
    await page.getByRole("button", {name: "+ Create New Exam"}).click();
    const examTitle = page.locator('input[class="premium-input"]').nth(0)
    const startTimeInput = page.getByRole("button", {name: "Select date and time..."}).nth(0);
    const startDate = page.locator('div.grid.grid-cols-7.gap-1.justify-items-center.mb-4 button').nth(2);
    const endTimeInput = page.getByRole("button", {name: "Select date and time..."}).nth(0);
    const endDate = page.locator('div.grid.grid-cols-7.gap-1.justify-items-center.mb-4 button').nth(4);
    const examDuration = page.locator('input[class="premium-input"]').nth(1);
    const examPolicy = page.locator('select[class="premium-input bg-bg-surface-elevated text-white w-full"]').nth(1);
    
    await examTitle.fill("[VMH] Bài Kiểm Tra Playwright 15 Phút");

    await startTimeInput.click();
    await startDate.click();
    await page.getByRole("button", {name: "Apply"}).click();

    await endTimeInput.click();
    await endDate.click();
    await page.getByRole("button", {name: "Apply"}).click();

    await examDuration.fill("15");
    await examPolicy.selectOption({label: "Warn & Lock — Warn twice, auto-submit on 3rd tab switch"});

    const createExamButton = page.getByRole("button", {name: "Create Exam"});
    await createExamButton.click();

    // Create questions list
    const questions = [
    {
        title: 'Playwright Basics',
        description: 'What is Playwright mainly used for?',
        options: ['Browser automation', 'Database management', 'UI design', 'Backend development'],
        correctAnswer: 'Browser automation'
    },
    {
        title: 'Locator',
        description: 'Which method is used to click an element?',
        options: ['fill()', 'click()', 'press()', 'check()'],
        correctAnswer: 'click()'
    },
    {
        title: 'Assertion',
        description: 'Which assertion verifies element text?',
        options: ['toHaveText()', 'toBeVisible()', 'toBeChecked()', 'toHaveValue()'],
        correctAnswer: 'toHaveText()'
    }];

    for (const question of questions) {
        await page.getByRole("button", {name: "+ Add Question"}).click();
        const questionTitle = page.getByPlaceholder("e.g. Variable Scope");
        const questionDescription = page.getByPlaceholder("Describe the question details...");
        await questionTitle.fill(question.title);
        await questionDescription.fill(question.description);

        for (let i = 1; i < 3; i++) {
            const addOptionButton = page.getByRole("button", {name: "+ Add Option"});
            await addOptionButton.click();
        };

        const optionInputs = page.locator('input[placeholder^="Option"]');
        const totalOptions = await optionInputs.count();
        for (let i = 0; i < question.options.length; i++) {
            const optionInput = optionInputs.nth(totalOptions - question.options.length + i);
            await optionInput.fill(question.options[i]);
        }

        const optionContainer = page.locator('div[class="space-y-3"]').last();

        const correctAnswerIndex = question.options.indexOf(question.correctAnswer);

        await optionContainer
        .locator('div')
        .nth(correctAnswerIndex)
        .locator('input[type="checkbox"]')
        .check();

        await page.getByRole("button", {name: "Create Question"}).click();
    };

    await page.getByRole("button", {name: "Back"}).click();

    // Verify that the exam is created successfully
    const examCard = page.locator('div[class="glass-card p-6 flex flex-col h-full relative group"] h3').nth(0);
    await expect(examCard).toHaveText("[VMH] Bài Kiểm Tra Playwright 15 Phút");
    await expect(examCard).toBeVisible();
});