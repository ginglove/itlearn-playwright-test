import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { RegisterLocators } from "../locators/register.locators";
import { createObjectCsvWriter } from "csv-writer";
import { parse } from "csv-parse/sync";

export interface RegisTestCase {
	testcaseId: string;
	Testcase: string;
	fullName: string;
	email: string;
	SDT: string;
	pass: string;
	confirm_pass: string;
	OTP: string;
	code: string;
	status: string;
}

/**
 * Utility to load and parse test data from test-data/regis.csv
 */
export function loadRegisCsv(): RegisTestCase[] {
	const filePath = path.resolve(__dirname, "../test-data/regis.csv");
	const fileContent = fs.readFileSync(filePath, "utf-8");
	const delimiter = fileContent.split("\n")[0].includes(";") ? ";" : ",";

	return parse(fileContent, {
		columns: true,
		skip_empty_lines: true,
		trim: true,
		relax_column_count: true,
		delimiter: delimiter,
	}) as RegisTestCase[];
}

const regisTestCases = loadRegisCsv();

test.describe("Registration Tests from test-data/regis.csv", () => {
	test.describe.configure({ mode: "serial" });

	for (const data of regisTestCases) {
		test(`[${data.testcaseId}] - ${data.Testcase}`, async ({ page }) => {
			const locators = new RegisterLocators(page);

			// 1. Navigate to Register page
			await page.goto("/register");

			// 2. Mock registration API
			let registrationApiCalled = false;

			await page.route("**/api/v1/auth/register", async (route) => {
				registrationApiCalled = true;

				await route.fulfill({
					status: parseInt(data.code, 10) || 200,
					contentType: "application/json",
					body: JSON.stringify({
						success: data.code === "201",
						message: data.code === "201" ? "Đăng ký tài khoản thành công!" : "Registration error",
					}),
				});
			});

			// 3. Fill form fields based on CSV test data
			if (data.fullName) await locators.fullNameInput.fill(data.fullName);
			if (data.email) await locators.emailInput.fill(data.email);
			if (data.SDT) await locators.phoneInput.fill(data.SDT);
			if (data.pass) await locators.passwordInput.fill(data.pass);
			if (data.confirm_pass) await locators.confirmPasswordInput.fill(data.confirm_pass);
			if (data.OTP) await locators.otpInput.fill(data.OTP);

			// 4. Agree to terms & conditions
			await locators.termsCheckbox.check({ force: true });

			// 5. Submit registration form
			await locators.submitRegisterButton.click();

			// 6. Verify result using smart assertions
			if (data.code === "400") {
				// Form submission blocked due to missing required field
				expect(registrationApiCalled).toBe(false);
				await expect(page).toHaveURL(/.*\/register/);
			} else if (data.code === "201") {
				// Successful registration and redirection to login
				await expect(locators.successMessageBanner).toBeVisible();
				await expect(page).toHaveURL(/.*\/login/);
			}
		});
	}
});

const csvFilePath = path.join(__dirname, "../test-data/regis.csv");

// Read raw file to detect existing headers dynamically
const rawCsv = fs.readFileSync(csvFilePath, "utf-8");
const delimiter = rawCsv.split("\n")[0].includes(";") ? ";" : ",";

// Parse without trimming or mutating empty fields
const records: RegisTestCase[] = parse(rawCsv, {
	columns: true,
	skip_empty_lines: true,
	trim: false,
	relax_column_count: true,
	delimiter: delimiter,
});

test.afterEach(async ({}, testInfo) => {
	const currentRecord: RegisTestCase | undefined = records.find(
		(r: RegisTestCase) =>
			`[${r.testcaseId}] - ${r.Testcase}` === testInfo.title ||
			r.testcaseId === testInfo.title ||
			`[${r.testcaseId}]` === testInfo.title,
	);

	if (currentRecord) {
		currentRecord.status = testInfo.status;
	}

	console.log(testInfo.status);
	console.log(testInfo.title);
});

test.afterAll(async () => {
	// Define exact column list from original file + status
	const headers = [
		"testcaseId",
		"Testcase",
		"fullName",
		"email",
		"SDT",
		"pass",
		"confirm_pass",
		"OTP",
		"code",
		"status",
	];

	const csvWriter = createObjectCsvWriter({
		path: csvFilePath,
		header: headers.map((h) => ({
			id: h,
			title: h,
		})),
		fieldDelimiter: delimiter,
	});

	// Preserve exact original values, safely defaulting missing keys to empty string
	const recordsToWrite = records.map((record: RegisTestCase) => {
		const row: Record<string, string> = {};

		for (const key of headers) {
			const value = record[key as keyof RegisTestCase];
			row[key] = value !== undefined && value !== null ? String(value) : "";
		}

		return row;
	});

	await csvWriter.writeRecords(recordsToWrite);
});
