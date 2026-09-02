import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { LoginLocators } from "../locators/login.locators";
import { createObjectCsvWriter } from "csv-writer";

import { readFileSync } from "fs";

import { parse } from "csv-parse/sync";

export interface LoginTestCase {
	testcaseId: string;
	Testcase: string;
	email: string;
	SDT: string;
	pass: string;
	OTP: string;
	code: string;
	status?: string;
}

/**
 * Utility to load and parse test data from test-data/login.csv
 */
export function loadLoginCsv(): LoginTestCase[] {
	const filePath = path.resolve(__dirname, "../test-data/login1.csv");
	const fileContent = fs.readFileSync(filePath, "utf-8");
	const delimiter = fileContent.split("\n")[0].includes(";") ? ";" : ",";

	return parse(fileContent, {
		columns: true,
		skip_empty_lines: true,
		trim: true,
		relax_column_count: true,
		delimiter: delimiter,
	}) as LoginTestCase[];
}

const loginTestCases = loadLoginCsv();

test.describe("Login Tests from test-data/login1.csv", () => {
	for (const data of loginTestCases) {
		test(`[${data.testcaseId}] - ${data.Testcase}`, async ({ page }) => {
			const locators = new LoginLocators(page);

			const isOtpMode = data.Testcase.toLowerCase().includes("otp") || data.OTP !== "";

			// 1. Mock API authentication endpoints
			await page.route("**/api/v1/auth/otp/send", async (route) => {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({
						success: true,
						message: "OTP sent",
					}),
				});
			});

			await page.route("**/api/auth/callback/credentials**", async (route) => {
				if (data.code === "201") {
					await route.fulfill({
						status: 200,
						contentType: "application/json",
						body: JSON.stringify({
							url: "https://training-car.netlify.app/catalog",
							status: 200,
							ok: true,
						}),
					});
				} else {
					await route.fulfill({
						status: 401,
						contentType: "application/json",
						body: JSON.stringify({
							error: "CredentialsSignin",
							status: 401,
							ok: false,
						}),
					});
				}
			});

			// 2. Navigate to Login page
			console.log("BASE URL:", test.info().project.use.baseURL);
			await page.goto("/login");

			if (isOtpMode) {
				// --- OTP Login Mode ---
				await locators.otpTab.click();

				if (data.SDT) {
					await locators.otpPhoneInput.fill(data.SDT);
					await locators.sendOtpButton.click();
				}

				if (data.OTP) {
					await locators.otpCodeInput.fill(data.OTP);
					await locators.submitOtpLoginButton.click();
				}
			} else {
				// --- Email / Phone Number and Password Mode ---
				const identity = data.email || data.SDT;

				if (identity) {
					await locators.identityInput.fill(identity);
				}

				if (data.pass) {
					await locators.passwordInput.fill(data.pass);
				}

				await locators.submitPasswordLoginButton.click();
			}

			// 3. Smart assertions based on expected result
			if (data.code === "400") {
				await expect(page).toHaveURL(/.*\/login/);
			} else if (data.code === "201") {
				await expect(page).toHaveURL(/.*\/catalog/);
			}
		});
	}
});

const csvFilePath = path.join(__dirname, "../test-data/login1.csv");

// Read raw file to detect existing headers dynamically
const rawCsv = fs.readFileSync(csvFilePath, "utf-8");
const delimiter = rawCsv.split("\n")[0].includes(";") ? ";" : ",";

// Parse without trimming or mutating empty fields
const records: LoginTestCase[] = parse(rawCsv, {
	columns: true,
	skip_empty_lines: true,
	trim: false,
	relax_column_count: true,
	delimiter: delimiter,
});

test.afterEach(async ({}, testInfo) => {
	const currentRecord: LoginTestCase | undefined = records.find(
		(r: LoginTestCase) =>
			`[${r.testcaseId}] - ${r.Testcase}` === testInfo.title ||
			r.testcaseId === testInfo.title,
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
		"email",
		"SDT",
		"pass",
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
		fieldDelimiter: ";",
	});

	// Preserve exact original values, safely defaulting missing keys to empty string
	const recordsToWrite = records.map((record: LoginTestCase) => {
		const row: Record<string, string> = {};

		for (const key of headers) {
			const value = record[key as keyof LoginTestCase];

			row[key] = value !== undefined && value !== null ? String(value) : "";
		}

		return row;
	});

	await csvWriter.writeRecords(recordsToWrite);
});

