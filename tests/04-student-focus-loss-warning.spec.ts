import { test, expect } from "@playwright/test";

test("TC_EXAM_004", async ({ page }) => {
	await page.goto("https://itlearn-training-test-website.vercel.app/login");

	await page.locator("//input[@id='username']").fill("student6");
	await page.locator("//input[@id='password']").fill("Abc@1234");
	await page.locator("//button[@type='submit']").click();
	await expect(page).toHaveURL("https://itlearn-training-test-website.vercel.app/student/exams");
	await page.getByRole("button", { name: "Active Exams" }).click();
	await expect(page.locator("//h1")).toHaveText("My Assessments");
	const examName = "Bài Kiểm Tra Playwright 15 Phút- GẤM";

	const examCard = page.locator("div.glass-card").filter({
		has: page.getByRole("heading", { name: examName }),
	});

	await expect(examCard).toBeVisible();

	await examCard.locator(".premium-btn-primary.w-full.text-sm").click();
	await expect(page.getByRole("button", { name: /Submit/i })).toBeVisible();

	await page.evaluate(() => {
		window.dispatchEvent(new Event("blur"));
	});

	// Assertion - verify Focus Loss modal
	await expect(page.getByRole("heading", { name: "Tab Switch Detected" })).toBeVisible();

	await expect(
		page.getByText("You left the exam window. This event has been logged and reported to your instructor."),
	).toBeVisible();

	await expect(
		page.getByRole("button", {
			name: /return to exam/i,
		}),
	).toBeVisible();

	//Đóng popup
	await page
		.getByRole("button", {
			name: /return to exam/i,
		})
		.click();

	// Verify popup đã đóng
	await expect(page.getByRole("heading", { name: "Tab Switch Detected" })).toBeHidden();
});
