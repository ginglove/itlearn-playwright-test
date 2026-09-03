import {test, expect} from '@playwright/test';
import {LogIn} from '../pages/LoginPage';
import {HomePage} from '../pages/HomePage';
import {CarDetailPage} from '../pages/CarDetailPage';
import {OrderReviewPage} from '../pages/OrderReviewPage';
import {PaymentResultPage} from '../pages/PaymentResultPage';
import {URL} from '../test-data/url';
import {PAYMENT_DATA} from '../test-data/payment.data';

test.describe('Verify customer filter', () => {
    test.beforeEach(async({page}) => {
        await page.goto(URL.logIn, {
            waitUntil: 'domcontentloaded'
        });

        const logIn = new LogIn(page);
        await logIn.logIn();
        await expect(page).toHaveURL(
            'https://training-car.netlify.app/login',
            {timeout: 10000}
        );
        await logIn.customerLogIn();
        await logIn.clickLogIn();

        await page.waitForURL('**/catalog', {
            waitUntil: 'domcontentloaded',
            timeout: 20000
        });
    });
    // test('Case 1: Verify car count on UI and API', async ({page, request}) => {
    //     const homePage = new HomePage(page);

    //     const response = await request.get(
    //         'https://training-car.netlify.app/api/v1/catalog/models?sort=price-asc'
    //     );

    //     expect(response.status()).toBe(200);

    //     const body = await response.json();

    //     const apiCarCount = await body.data.length;
    //     const carCount = homePage.carCards;

    //     await expect(carCount).toBeVisible();

    //     await expect.poll(async () => {
    //     const text = await carCount.textContent();
    //     return Number(text?.replace(/\D/g, ''));
    //     }).toBeGreaterThan(0);

    //     const uiCarCountText = await carCount.textContent();
    //     const uiCarCount = Number(uiCarCountText?.replace(/\D/g, ''));

    //     expect(uiCarCount).toBe(apiCarCount);

    // });

    for (const payment of PAYMENT_DATA) {
        test(`Case 2: Verify customer filter and deposit with ${payment.status}`, async({page}) => {
        const homePage = new HomePage(page);
        const carDetailPage = new CarDetailPage(page);
        const orderReviewPage = new OrderReviewPage(page);
        const paymentResultPage = new PaymentResultPage(page);

        // Filter price and car type
        const firstCarBeforeFilter = await homePage.firstCar.textContent();

        await homePage.filterPrice('1600000000');
        await expect(homePage.priceRange).toContainText('1.6B');

        await homePage.selectCarType();

        await expect.poll(async () => {
            return await homePage.firstCar.textContent();
        }, {
            timeout: 15000
        }).not.toBe(firstCarBeforeFilter);

        await homePage.selectFirstCar();

        // Select and Observe 3D Car
        await carDetailPage.click3DOption();
        await expect(carDetailPage.car3D).toBeVisible({
            timeout: 15000
        });
        await carDetailPage.zoomIn();
        await carDetailPage.zoomOut();

        await carDetailPage.rotateCar(200, 0);
        await carDetailPage.rotateCar(-200, 0);
        await carDetailPage.rotateCar(0, 100);
        await carDetailPage.rotateCar(0, -100);

        // Select Car's Appreance and Interior
        await carDetailPage.selectCarColor();
        const selectedInterior = await carDetailPage.selectCarInterior();

        // Select loan type and term
        await carDetailPage.selectLoanType('60');
        await expect(carDetailPage.loanSlider).toHaveValue('60');

        await carDetailPage.selectLoanTerm('8 năm (96 tháng)');

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