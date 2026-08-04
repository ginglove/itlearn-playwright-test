import { test, expect } from "@playwright/test";

test("TC_EXAM_005", async ({ browser }) => {
	// Context 1 - Teacher
	const teacherContext = await browser.newContext();
	const teacherPage = await teacherContext.newPage();

	await teacherPage.goto("https://itlearn-training-test-website.vercel.app/login");

	await teacherPage.locator("#username").fill("demo_teacher");
	await teacherPage.locator("#password").fill("Demo@1234");
	await teacherPage.locator("button[type='submit']").click();

	await expect(teacherPage).toHaveURL("https://itlearn-training-test-website.vercel.app/teacher");
	await teacherPage.getByRole("button", { name: "Manage Exams" }).click();
	await expect(teacherPage.locator("button:has-text('+ Create New Exam')")).toBeVisible();
	const examName1 = "Bài Kiểm Tra Playwright 15 Phút- GẤM";

	const examCard1 = teacherPage
		.locator("div.glass-card")
		.filter({
			has: teacherPage.getByRole("heading", { name: examName1 }),
		})
		.nth(0);

	await expect(examCard1).toBeVisible();
	// Mở Live Monitor
	await examCard1
		.getByRole("button", {
			name: "Monitor",
			exact: true,
		})
		.click();
	await expect(teacherPage.locator("//h1")).toHaveText("Live Exam Monitor");
	// Context 2 - Student

	const studentContext = await browser.newContext();
	const studentPage = await studentContext.newPage();

	await studentPage.goto("https://itlearn-training-test-website.vercel.app/login");

	await studentPage.locator("#username").fill("student6");
	await studentPage.locator("#password").fill("Abc@1234");
	await studentPage.locator("button[type='submit']").click();

	await expect(studentPage).toHaveURL("https://itlearn-training-test-website.vercel.app/student/exams");

	// Start Exam
	await studentPage.getByRole("button", { name: "Active Exams" }).click();
	await expect(studentPage.locator("//h1")).toHaveText("My Assessments");
	const examName = "Bài Kiểm Tra Playwright 15 Phút- GẤM";

	const examCard = studentPage
		.locator("div.glass-card")
		.filter({
			has: studentPage.getByRole("heading", { name: examName }),
		})
		.nth(0);

	await expect(examCard).toBeVisible();
	await examCard.locator(".premium-btn-primary.w-full.text-sm").click();

	// Teacher kiểm tra Student Online
	const row = teacherPage
		.locator("tr")
		.filter({
			hasText: "student6",
		})
		.filter({
			hasText: "In Progress",
		});

	await row
		.getByRole("button", {
			name: "Force Submit",
			exact: true,
		})
		.click();

	// Confirm
	teacherPage.once("dialog", async (dialog) => {
		expect(dialog.type()).toBe("confirm");
		console.log(dialog.message());

		await dialog.accept();
	});

	// Student verify không làm bài tiếp được=> đoạn này em k thấy disable đâu anh
	await expect(studentPage.locator("textarea,input,button")).toBeDisabled();
});
