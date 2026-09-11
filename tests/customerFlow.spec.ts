import {test, expect} from '@playwright/test';
import {readCsv, getDataById} from '../utils/csv.helper';

import {LogIn} from '../pages/LoginPage';
import {HomePage} from '../pages/HomePage';
import {CarDetailPage} from '../pages/CarDetailPage';
import {OrderReviewPage} from '../pages/OrderReviewPage';
import {PaymentResultPage} from '../pages/PaymentResultPage';
import {URL} from '../test-data/url';
import {PAYMENT_DATA} from '../test-data/payment.data';

// ==================== CSV DATA ====================
interface CarCountData {
    id: string;
    title: string;
    expectedStatus: string;
}

interface CustomerFilterData {
    id: string;
    title: string;
    maxPrice?: string;
    expectedPriceText: string;
    loanPercent: string;
    loanTerm: string
}

// Read CSV file
const carCountData = readCsv<CarCountData>(
    './test-data/car-count.csv'
);

const filterData = readCsv<CustomerFilterData>(
    './test-data/customer-filter.csv'
);

// ==================== TEST CASE ====================

test.describe('Verify customer filter', () => {
    test.beforeEach(async({page}) => {
        await page.goto(URL.logIn);

        const logIn = new LogIn(page);
        await logIn.customerLogIn();
        await logIn.clickLogIn();
    });

    test('Case 1: Verify car count on UI and API', async ({page, request}) => {
        const homePage = new HomePage(page);
        const data01 = getDataById(carCountData, 'CASE_01');

        const response = await request.get(URL.catalogApi);

        expect(response.status()).toBe(
            Number(data01.expectedStatus)
        );

        const body = await response.json();

        const apiCarCount = await body.data.length;
        const carCount = homePage.carCards;

        await expect(carCount).toBeVisible();

        await expect.poll(async () => {
        const text = await carCount.textContent();
        return Number(text?.replace(/\D/g, ''));
        }).toBeGreaterThan(0);

        const uiCarCountText = await carCount.textContent();
        const uiCarCount = Number(uiCarCountText?.replace(/\D/g, ''));

        expect(uiCarCount).not.toBe(apiCarCount);

    });

    for (const payment of PAYMENT_DATA) {
        test(`Case 2: Verify customer filter and deposit with ${payment.status}`, async({page}) => {
        const homePage = new HomePage(page);
        const carDetailPage = new CarDetailPage(page);
        const orderReviewPage = new OrderReviewPage(page);
        const paymentResultPage = new PaymentResultPage(page);

        const data02 = getDataById(filterData, 'CASE_02');

        // Filter price and car type
        await homePage.filterPrice(data02.maxPrice!);
        await expect(homePage.priceRange).toContainText(data02.expectedPriceText);

        const [filterResponse] = await Promise.all ([
            page.waitForResponse(
                response => response.url().includes(URL.catalogApi) &&
                response.request().method() === 'GET'
            ),

            homePage.selectCarType()
        ]);

        expect(filterResponse.ok()).toBeTruthy();
        await homePage.selectFirstCar();

        // Select and Observe 3D Car
        await carDetailPage.click3DOption();

        await carDetailPage.zoomInteraction();

        await carDetailPage.rotateCar(200, 0);
        await carDetailPage.rotateCar(-200, 0);
        await carDetailPage.rotateCar(0, 100);
        await carDetailPage.rotateCar(0, -100);

        // Select Car's Appreance and Interior
        await carDetailPage.selectCarColor();
        const selectedInterior = await carDetailPage.selectCarInterior();

        // Select loan type and term
        await carDetailPage.selectLoanType(data02.loanPercent);
        await expect(carDetailPage.loanSlider).toHaveValue(data02.loanPercent);

        await carDetailPage.selectLoanTerm(data02.loanTerm);

        // Car Detail Page
        const selectedCar = await carDetailPage.getCarName();
        const selectedColor = await carDetailPage.getCarColor();

        // Click deposit button
        await carDetailPage.clickDepositBtn();

        // Verify order review page
        await expect(page).toHaveURL(/\/checkout/);
        // Order Review Page
        const reviewCarName = await orderReviewPage.getCarName();
        const reviewColor = await orderReviewPage.getCarColor();
        const reviewInteriorRow = orderReviewPage.getCarRow(selectedInterior!);

        // Compare name
        expect (reviewCarName).toBe(selectedCar);
        // Compare color
        expect(reviewColor).toBe(selectedColor);

        // Compare interior option
        await expect(reviewInteriorRow).toContainText(selectedInterior!);
        await expect(reviewInteriorRow.getByRole('checkbox')).toBeChecked();

        // Click deposit button
        await orderReviewPage.clickConfirmBtn();

        // Verify payment data status
        await expect(orderReviewPage.paymentStatusopt).toBeVisible();
        await orderReviewPage.clickPaymentBtn(payment.button);
        await expect(page).toHaveURL(/\/checkout\/result/, {
            timeout: 15000
        });
        await expect(paymentResultPage.resultTitle).toBeVisible({
            timeout: 15000
        });
        await expect(paymentResultPage.resultTitle).toHaveText(payment.expectedTitle);
        await expect(paymentResultPage.resultStatus).toHaveText(payment.expectedStatus);
        })
    }
})