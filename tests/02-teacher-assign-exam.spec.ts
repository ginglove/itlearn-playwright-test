import { test, expect } from "@playwright/test";

test("TC_EXAM_002", async ({ page }) => {
	await page.goto("https://itlearn-training-test-website.vercel.app/login");

	await page.locator("//input[@id='username']").fill("demo_teacher");
	await page.locator("//input[@id='password']").fill("Demo@1234");
	await page.locator("//button[@type='submit']").click();
	await expect(page).toHaveURL("https://itlearn-training-test-website.vercel.app/teacher");
	await page.getByRole("button", { name: "Workspaces" }).click();
	await expect(page.locator("button:has-text('Demo')")).toBeVisible();
	const demoButton = page.locator("button:has-text('Demo')");
	await demoButton.click();
	await expect(page.locator("//button[contains(text(),'Activities')]")).toBeVisible();
	const activitiesButton = page.locator("//button[contains(text(),'Activities')]");
	await activitiesButton.click();
	await expect(page.locator("//button[contains(text(),'+ Assign Activity')]")).toBeVisible();
	const assignActivityButton = page.locator("//button[contains(text(),'+ Assign Activity')]");
	await assignActivityButton.click();
	const selectType = page
		.locator(
			'//select[@class="w-full bg-bg-base border border-border-strong rounded-xl px-3 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none"]',
		)
		.nth(0);
	await selectType.selectOption("EXERCISE");
	const checkbox = page
		.locator("label", { hasText: "Bài Kiểm Tra Playwright 15 Phút- GẤM" })
		.locator('input[type="checkbox"]');

	await checkbox.check();
	await expect(checkbox).toBeChecked();
	await page.getByRole("button", { name: "Assign", exact: true }).click();
	await expect(
		page.locator("p.text-white.text-sm").filter({
			hasText: "Bài Kiểm Tra Playwright 15 Phút- GẤM",
		}),
	).toBeVisible();
});
