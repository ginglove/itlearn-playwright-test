import { test, expect } from "@playwright/test";

test("TC_EXAM_003", async ({ page }) => {
	await page.goto("https://itlearn-training-test-website.vercel.app/login");
	await page.locator("//input[@id='username']").fill("student6");
	await page.locator("//input[@id='password']").fill("Abc@1234");
	await page.locator("//button[@type='submit']").click();
	await expect(page).toHaveURL("https://itlearn-training-test-website.vercel.app/student/exams");
	await page.getByRole("button", { name: "Active Exams" }).click();
	await expect(page.locator("//h1")).toHaveText("My Assessments");
	const examName = "Bài Kiểm Tra Playwright 15 Phút- GẤM";

	const examCard = page
		.locator("div.glass-card")
		.filter({
			has: page.getByRole("heading", { name: examName }),
		})
		.nth(0);

	await expect(examCard).toBeVisible();
	await examCard.locator(".premium-btn-primary.w-full.text-sm").click();
	await expect(page.getByRole("heading", { name: "Câu hỏi 1" })).toBeVisible();

	// chọn ddaps án a
	const answerA = page.locator("button", {
		hasText: "Đáp án A",
	});

	await answerA.click();
	await page.locator("//button[contains(.,'Save')]").click();
	await expect(page).toHaveURL("https://itlearn-training-test-website.vercel.app/student/exams");
	await expect(examCard).toContainText("Pending");
	await examCard.locator(".premium-btn-primary.w-full.text-sm").click();
	await expect(page.getByRole("button", { name: /Submit/i })).toBeVisible();
	await page
		.getByRole("button", {
			name: "Submit Exam",
			exact: true,
		})
		.click();
	// page.once("dialog", async (dialog) => {
	// 	await dialog.accept(); // Bấm accept
	// });
	await expect(page.getByRole("heading", { name: "Submit Exam?" })).toBeVisible();

	await page
		.getByRole("button", {
			name: "Yes, Submit Exam",
			exact: true,
		})
		.click();
	// Verify submit thành công
	await expect(page.locator("//p[contains(.,'Exam submitted successfully')]")).toBeVisible();

	await page
		.getByRole("button", {
			name: "Active Exams",
			exact: true,
		})
		.click();

	await expect(page).toHaveURL("https://itlearn-training-test-website.vercel.app/student/exams");
});
