import { test, expect } from "@playwright/test";
import { LoginProductLocators } from "../locators/product.locators";

export interface CarModelApi {
	id: string;
	variantName: string;
	listedPrice: string;
	modelName: string;
	brandName: string;
	bodyType: string;
	thumbnailUrl: string;
	availableQuota: string;
}

test.describe("Product Catalog & End-to-End Vehicle Purchase Flow", () => {
	let apiModels: CarModelApi[] = [];
	let totalApiModelsCount = 0;
	let totalAvailableQuota = 0;

	test.beforeAll(async ({ request }) => {
		// 1. Fetch data from API endpoint https://training-car.netlify.app/api/v1/catalog/models
		const apiResponse = await request.get("/api/v1/catalog/models");
		expect(apiResponse.ok()).toBeTruthy();

		const responseBody = await apiResponse.json();
		expect(responseBody.success).toBe(true);

		apiModels = responseBody.data || [];
		totalApiModelsCount = apiModels.length;
		totalAvailableQuota = apiModels.reduce((sum, item) => sum + (parseInt(item.availableQuota, 10) || 0), 0);

		console.log(`[API Summary] Total models in API: ${totalApiModelsCount}`);
		console.log(`[API Summary] Total available stock quota: ${totalAvailableQuota}`);
	});

	test("TC_PROD_01: Login with customer account and verify interactive DOM elements on Product Catalog page", async ({
		page,
	}) => {
		const locators = new LoginProductLocators(page);

		// 1. Navigate to login page
		await page.goto("/login");

		// 2. Log in using customer credentials
		await locators.identityInput.fill("phamgam03.ptit@gmail.com");
		await locators.passwordInput.fill("Gampt@1234573");
		await locators.submitPasswordLoginButton.click();

		// 3. Smart wait for navigation to /catalog
		await expect(page).toHaveURL(/.*\/catalog/);

		// 4. Verify Header Elements
		await expect(locators.logoLink).toBeVisible();
		await expect(locators.catalogNavLink).toBeVisible();
		await expect(locators.userProfileButton).toBeVisible();
		await expect(locators.logoutButton).toBeVisible();

		// 5. Verify Filter Sidebar Elements (BỘ LỌC)
		await expect(locators.filterHeading).toBeVisible();
		await expect(locators.resetFilterButton).toBeVisible();
		await expect(locators.allBrandCheckboxes.first()).toBeVisible();
		await expect(locators.toyotaCheckbox).toBeVisible();
		await expect(locators.hondaCheckbox).toBeVisible();
		await expect(locators.hyundaiCheckbox).toBeVisible();
		await expect(locators.kiaCheckbox).toBeVisible();
		await expect(locators.fordCheckbox).toBeVisible();
		await expect(locators.mazdaCheckbox).toBeVisible();

		// 6. Verify Body Type Radio Buttons
		await expect(locators.allBodyTypesRadio).toBeVisible();
		await expect(locators.sedanRadio).toBeVisible();
		await expect(locators.suvRadio).toBeVisible();
		await expect(locators.pickupRadio).toBeVisible();
		await expect(locators.cuvRadio).toBeVisible();
		await expect(locators.hatchbackRadio).toBeVisible();

		// 7. Verify Price Slider & Showroom Select
		await expect(locators.priceRangeSlider).toBeVisible();
		await expect(locators.showroomSelect).toBeVisible();

		// 8. Verify Search, Sort, and Quick Scenario Buttons
		await expect(locators.searchCarInput).toBeVisible();
		await expect(locators.sortCombobox).toBeVisible();
		await expect(locators.familyScenarioButton).toBeVisible();
		await expect(locators.sportScenarioButton).toBeVisible();
		await expect(locators.businessScenarioButton).toBeVisible();
		await expect(locators.ecoScenarioButton).toBeVisible();
	});

	test("TC_PROD_02: Compare number of cars displayed on UI with actual available cars and verify against API data", async ({
		page,
	}) => {
		const locators = new LoginProductLocators(page);

		// 1. Navigate to login and authenticate
		await page.goto("/login");
		await locators.identityInput.fill("phamgam03.ptit@gmail.com");
		await locators.passwordInput.fill("Gampt@1234573");
		await locators.submitPasswordLoginButton.click();

		await expect(page).toHaveURL(/.*\/catalog/);

		// 2. Smart wait for skeleton loaders to finish rendering
		await expect(locators.skeletonLoaders).toHaveCount(0);

		// 3. Verify Results Count Text is visible and extract displayed vehicle count
		await expect(locators.resultsCountText).toBeVisible();
		const resultText = await locators.resultsCountText.textContent();
		console.log(`[UI] Current filter results count text: ${resultText}`);
		expect(resultText).toMatch(/Kết quả:\s*\d+\s*xe/i);

		const uiCountMatch = resultText?.match(/\d+/);
		const expectedUiCount = uiCountMatch ? parseInt(uiCountMatch[0], 10) : 0;
		expect(expectedUiCount).toBeGreaterThan(0);

		// 4. Collect all vehicles currently displayed across catalog pages on UI
		interface DisplayedVehicle {
			title: string;
			stockBadgeText: string;
			stockQuantity: number;
			priceText: string;
		}

		const displayedCars: DisplayedVehicle[] = [];

		while (true) {
			await expect(locators.carCards.first()).toBeVisible();
			const cardCount = await locators.carCards.count();

			for (let i = 0; i < cardCount; i++) {
				const card = locators.carCards.nth(i);
				const title = (await card.locator("h3").textContent())?.trim() || "";
				const stockBadgeText = (await card.locator(".rounded-full").textContent())?.trim() || "";
				const priceText = (await card.locator(".text-primary.font-mono").textContent())?.trim() || "";

				const stockNumberMatch = stockBadgeText.match(/\d+/);
				const stockQuantity = stockNumberMatch ? parseInt(stockNumberMatch[0], 10) : 0;

				displayedCars.push({
					title,
					stockBadgeText,
					stockQuantity,
					priceText,
				});
			}

			// Check if next page button is available and active
			const isNextDisabled = await locators.nextPageButton.isDisabled();
			if (isNextDisabled) {
				break;
			}
			await locators.nextPageButton.click();
			await expect(locators.skeletonLoaders).toHaveCount(0);
		}

		console.log(`[UI] Total vehicles collected across catalog pages: ${displayedCars.length}`);

		// 5. Compare number of displayed vehicles on UI with UI counter and corresponding API data
		expect(displayedCars.length).toBe(expectedUiCount);

		// Filter API models corresponding to default catalog filter (0.5B <= listedPrice <= 2.0B)
		const matchingApiModels = apiModels.filter(
			(m) => parseFloat(m.listedPrice) >= 500000000 && parseFloat(m.listedPrice) <= 2000000000,
		);
		expect(displayedCars.length).toBe(matchingApiModels.length);
		console.log(`[Verification] UI displayed cars count (${displayedCars.length}) matches corresponding API models count (${matchingApiModels.length}).`);

		// 6. Match each vehicle on UI with API data using variantName & verify availableQuota
		for (const car of displayedCars) {
			const matchedApiModel = apiModels.find(
				(m) =>
					car.title.toLowerCase().includes(m.variantName.toLowerCase()) ||
					m.variantName.toLowerCase().includes(car.title.toLowerCase()),
			);

			// Assert vehicle exists in API data
			expect(matchedApiModel, `Vehicle "${car.title}" must match an API model by variantName`).toBeDefined();

			if (matchedApiModel) {
				const apiQuota = parseInt(matchedApiModel.availableQuota, 10);
				console.log(
					`[Matched Vehicle] UI: "${car.title}" | UI Stock: ${car.stockQuantity} (${car.stockBadgeText}) <==> API Variant: "${matchedApiModel.variantName}" | API Quota: ${apiQuota}`,
				);

				// Verify available vehicle quantity displayed on UI matches API's availableQuota
				expect(car.stockQuantity).toBe(apiQuota);
			}
		}

		// 7. Verify overall API catalog statistics
		expect(totalApiModelsCount).toBe(40);
		expect(totalAvailableQuota).toBeGreaterThan(0);
		console.log(
			`[Verification Passed] UI vehicles successfully cross-checked against API data (${totalApiModelsCount} total API models, ${displayedCars.length} displayed models verified).`,
		);
	});

	test("TC_PROD_03: Filter Sedan (0.5B - 1.6B), interact with 3D WebGL, customize color/interior, configure 60% 8-year loan financing, and complete deposit", async ({
		page,
	}) => {
		test.setTimeout(120000);
		const locators = new LoginProductLocators(page);

		// 1. Authenticate and go to Product Catalog
		await page.goto("/login");
		await locators.identityInput.fill("phamgam03.ptit@gmail.com");
		await locators.passwordInput.fill("Gampt@1234573");
		await locators.submitPasswordLoginButton.click();
		await expect(page).toHaveURL(/.*\/catalog/);

		// Smart wait for catalog models to load
		await expect(locators.skeletonLoaders).toHaveCount(0);

		// 2. Apply Filters:
		// - Vehicle type: Sedan
		console.log("[Step 2] Applying Body Type filter: Sedan...");
		await locators.sedanRadio.check({ force: true });
		await expect(locators.sedanRadio).toBeChecked();

		// - Vehicle price: 0.5B to 1.6B
		console.log("[Step 2] Applying Price filter: from 0.5B to 1.6B...");
		await locators.setPriceRange("1600000000");

		// 3. Verify matching vehicle count and select the first vehicle in the list
		console.log("[Step 3] Verifying matching vehicles and selecting first vehicle...");
		await expect(locators.resultsCountText).toBeVisible();
		const matchingCountText = await locators.resultsCountText.textContent();
		console.log(`[UI Results] Matching vehicles: ${matchingCountText}`);
		expect(matchingCountText).toMatch(/Kết quả:\s*\d+\s*xe/i);

		// Select first vehicle
		await expect(locators.carCards.first()).toBeVisible();
		const selectedCarName = await locators.carCardTitles.first().textContent();
		const selectedCarPrice = await locators.carCardPrices.first().textContent();
		console.log(`[UI Selection] First vehicle selected: "${selectedCarName}" with price ${selectedCarPrice}`);

		await locators.carDetailButtons.first().click();
		await expect(page).toHaveURL(/.*\/catalog\/[a-zA-Z0-9-]+/);

		// 4. 3D WebGL Interaction (Zoom in, Zoom out, Rotate/Move)
		console.log("[Step 4] Interacting with 3D WebGL canvas...");
		await locators.interactWith3DModel();
		console.log("[Step 4 Passed] 3D WebGL zoom in, zoom out, auto-rotate, and drag rotation completed.");

		// 5. Select Vehicle Color and Interior
		console.log("[Step 5] Selecting Vehicle Color and Interior...");
		if (await locators.blackColorButton.isVisible()) {
			await locators.blackColorButton.dispatchEvent("click");
			console.log("[UI Customization] Selected Color option: Đen Huyền Bí");
		} else {
			const colorCount = await locators.colorButtons.count();
			if (colorCount > 1) {
				await locators.colorButtons.nth(1).dispatchEvent("click");
			}
		}

		// Smart wait for color selection update
		await expect(page.getByText(/Màu Đen Huyền Bí/i).first()).toBeVisible();

		// Select Interior / Accessory package
		await expect(locators.accessoriesSection).toBeVisible();
		const accCount = await locators.accessoryItems.count();
		if (accCount > 0) {
			await locators.accessoryItems.first().dispatchEvent("click");
			console.log("[UI Customization] Selected Interior Option");
		}

		// Smart wait for accessories total update
		await expect(locators.accessoriesSection.getByText(/Tổng tiền phụ kiện:/i)).toBeVisible();

		// 6. Configure Financing Option: 60% of vehicle price & 8 years loan term
		console.log("[Step 6] Configuring Bank Financing Estimator...");
		await expect(locators.financingSection).toBeVisible();

		// Set Loan ratio: 60%
		await locators.setLoanRatio("60");
		console.log("[UI Financing] Loan financing percentage set to 60%");

		// Set Loan term: 8 years (96 months)
		await locators.selectLoanTerm("8 năm");
		console.log("[UI Financing] Loan term selected: 8 năm (96 tháng)");

		// 7. Proceed to Place Deposit
		console.log("[Step 7] Proceeding to Place Deposit...");
		await expect(locators.detailDepositButton).toBeVisible();
		await locators.detailDepositButton.click({ force: true, noWaitAfter: true });

		// Smart wait for navigation to /checkout
		await expect(page).toHaveURL(/.*\/checkout\?.*/);
		console.log(`[Checkout Page] Navigated to: ${page.url()}`);

		// Verify checkout details and summary
		await expect(locators.confirmDepositButton).toBeVisible();
		console.log('[Checkout Page] Reviewing breakdown and clicking "Xác nhận giữ xe & Đặt cọc"...');
		await locators.confirmDepositButton.click({ force: true, noWaitAfter: true });

		// 8. Verify Deposit Functionality via Mock Payment Sandbox
		console.log("[Step 8] Verifying Deposit functionality via Real-time Sandbox...");
		await expect(locators.mockSuccessPaymentButton).toBeVisible();
		console.log("[Sandbox Payment] Triggering Mock Success payment...");
		await locators.mockSuccessPaymentButton.click({ force: true, noWaitAfter: true });

		// Smart wait for redirect to /checkout/result success screen
		await expect(page).toHaveURL(/.*\/checkout\/result\?orderId=.*&status=SUCCESS/);
		await expect(locators.depositSuccessHeading).toBeVisible();
		console.log('[Deposit Verified] "Đặt cọc xe thành công!" screen displayed with valid Order ID.');

		// Verify post-deposit action buttons are available
		await expect(locators.trackOrderButton).toBeVisible();
		await expect(locators.continueExploringButton).toBeVisible();
		console.log("[Test Completed] TC_PROD_03 executed and verified successfully.");
	});
});
