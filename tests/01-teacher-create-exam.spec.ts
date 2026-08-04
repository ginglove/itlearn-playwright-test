import { test, expect } from "@playwright/test";

test("TC_EXAM_001", async ({ page }) => {
	await page.goto("https://itlearn-training-test-website.vercel.app/login");

	await page.locator("//input[@id='username']").fill("demo_teacher");
	await page.locator("//input[@id='password']").fill("Demo@1234");
	await page.locator("//button[@type='submit']").click();
	await expect(page).toHaveURL("https://itlearn-training-test-website.vercel.app/teacher");
	await page.getByRole("button", { name: "Manage Exams" }).click();
	await expect(page.locator("button:has-text('+ Create New Exam')")).toBeVisible();
	const creatNewExamButton = page.locator("button:has-text('+ Create New Exam')");
	await creatNewExamButton.click();
	await expect(page.locator("//h1")).toHaveText("Create New Exam");
	await page
		.locator('//input[@class="premium-input"]')
		.nth(0)
		.pressSequentially("Bài Kiểm Tra Playwright 15 Phút- GẤM", { delay: 10 });

	// Click Start Date
	await page.locator("button.premium-input").first().click();

	const picker1 = page.locator("div.absolute.left-0.z-50").last();
	await picker1.getByRole("button", { name: "4", exact: true }).click();

	// Click End Date
	await page.locator("button.premium-input").nth(1).click();

	const picker2 = page.locator("div.absolute.left-0.z-50").last();
	await picker2.getByRole("button", { name: "7", exact: true }).click();
	await picker2.getByRole("button", { name: "Apply" }).click();
	// await page.locator('input[name="duration"]').nth(1).pressSequentially("15");
	await page.locator('//input[@class="premium-input"]').nth(1).fill("15");
	const selectPolicy = page
		.locator('//select[@class="premium-input bg-bg-surface-elevated text-white w-full"]')
		.nth(1);
	await selectPolicy.selectOption("WARN_AND_LOCK");
	const tabSwitch = page.locator('//input[@class="premium-input bg-bg-surface-elevated text-white w-24"]');
	await tabSwitch.fill("10");
	await expect(tabSwitch).toHaveValue("10");
	await page.locator('//button[@type="submit"]').click();
	await expect(page.getByText("Add, edit, or delete questions for this exam.", { exact: true })).toBeVisible();
	// tạo câu hỏi
	const addQuestionButton = page.locator("//button[contains(text(),'Add Question')]");
	await addQuestionButton.click();
	await expect(page.locator("//h3")).toHaveText("Create New Question");
	await page.locator('//input[@class="premium-input"]').nth(0).fill("Câu hỏi 1");
	await page.getByPlaceholder("Describe the question details...").pressSequentially("Gấm làm bài 1", { delay: 50 });
	const answerA = page.locator('//input[@class="premium-input py-1.5 flex-grow"]').nth(0);
	await answerA.fill("Đáp án A");
	const answerB = page.locator('//input[@class="premium-input py-1.5 flex-grow"]').nth(1);
	await answerB.fill("Đáp án B");
	const tickAnswerA = page.locator('//input[@type="checkbox"]').nth(0);

	await tickAnswerA.check();
	await expect(tickAnswerA).toBeChecked();
	await page.locator('//button[@type="submit"]').click();
	await expect(page.getByText("Câu hỏi 1")).toBeVisible();
});
