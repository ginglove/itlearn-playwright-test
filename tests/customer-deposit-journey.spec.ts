import { expect, test } from '@playwright/test';

import { fetchCatalog, filterCatalog } from '../src/api/catalog-api';
import { CatalogPage } from '../src/pages/catalog-page';
import { CheckoutPage } from '../src/pages/checkout-page';
import { LoginPage } from '../src/pages/login-page';
import { ProfilePage } from '../src/pages/profile-page';
import { RegisterPage } from '../src/pages/register-page';
import { VehicleDetailPage } from '../src/pages/vehicle-detail-page';
import {
  SANDBOX_BASE_URL,
  assertDepositTargetIsApproved,
  createUniqueCustomerAccount,
  isDepositSubmissionConfirmed,
} from '../src/support/test-data';

const DEFAULT_MIN_PRICE = 500_000_000;
const DEFAULT_MAX_PRICE = 2_000_000_000;
const FILTERED_MAX_PRICE = 1_600_000_000;
const LOAN_PERCENTAGE = 60;
const LOAN_TERM = '8 năm (96 tháng)';
const submitDeposit = isDepositSubmissionConfirmed();

test.describe('Car Training customer purchase journey', () => {
  test(`register, compare catalog, configure vehicle and ${
    submitDeposit ? 'submit VietQR deposit' : 'validate checkout [dry-run]'
  }`, async ({ page }, testInfo) => {
    test.setTimeout(90_000);
    const account = createUniqueCustomerAccount();
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];
    let depositMutationCount = 0;

    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });
    page.on('request', (outgoingRequest) => {
      const url = new URL(outgoingRequest.url());
      if (
        outgoingRequest.method() === 'POST'
        && url.pathname === '/api/v1/orders/deposit'
      ) {
        depositMutationCount += 1;
      }
    });

    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);
    const profilePage = new ProfilePage(page);
    const catalogPage = new CatalogPage(page);
    const vehicleDetailPage = new VehicleDetailPage(page);
    const checkoutPage = new CheckoutPage(page);

    await test.step('Register one unique customer account', async () => {
      await registerPage.goto();
      await registerPage.register(account);
    });

    await test.step('Log in explicitly with the newly registered account', async () => {
      await loginPage.logoutIfAuthenticated();
      await loginPage.goto();
      await loginPage.login(account);
      await profilePage.assertCustomer(account);
    });

    const allVehicles = await test.step(
      'Compare the initial UI result count with equivalently filtered API data',
      async () => {
        const vehicles = await fetchCatalog(page);
        const expectedVehicles = filterCatalog(vehicles, {
          minPrice: DEFAULT_MIN_PRICE,
          maxPrice: DEFAULT_MAX_PRICE,
        });

        await catalogPage.goto();
        await catalogPage.assertDefaultPriceRange();
        await catalogPage.expectResultCount(expectedVehicles.length);
        return vehicles;
      },
    );

    const selectedVehicle = await test.step(
      'Filter Sedan from 0.5B to 1.6B and open the first API-matched vehicle',
      async () => {
        const sedanVehicles = await fetchCatalog(page, { bodyType: 'Sedan' });
        const expectedVehicles = filterCatalog(sedanVehicles, {
          minPrice: DEFAULT_MIN_PRICE,
          maxPrice: FILTERED_MAX_PRICE,
          bodyType: 'Sedan',
        });
        expect(expectedVehicles.length).toBeGreaterThan(0);

        const independentlyDerived = filterCatalog(allVehicles, {
          minPrice: DEFAULT_MIN_PRICE,
          maxPrice: FILTERED_MAX_PRICE,
          bodyType: 'Sedan',
        });
        expect(expectedVehicles.map((vehicle) => vehicle.id)).toEqual(
          independentlyDerived.map((vehicle) => vehicle.id),
        );

        await catalogPage.filterBySedanAndMaximumPrice(FILTERED_MAX_PRICE);
        await catalogPage.expectResultCount(expectedVehicles.length);
        await catalogPage.assertAndOpenFirstVehicle(expectedVehicles[0]);
        return expectedVehicles[0];
      },
    );

    await test.step('Exercise WebGL zoom in, zoom out and drag rotation', async () => {
      await vehicleDetailPage.assertVehicle(selectedVehicle);
      await vehicleDetailPage.exerciseWebGl();
    });

    const selectedColor = await test.step(
      'Select an available exterior color and configure the 60% / 8-year loan',
      async () => {
        const color = await vehicleDetailPage.selectFirstAvailableColor();
        await vehicleDetailPage.configureLoan(LOAN_PERCENTAGE, LOAN_TERM);
        await vehicleDetailPage.openCheckout();
        return color;
      },
    );

    await test.step('Verify checkout and VietQR sandbox payment option', async () => {
      await checkoutPage.assertReady({
        vehicle: selectedVehicle,
        color: selectedColor,
      });
    });

    if (submitDeposit) {
      await test.step('Submit exactly one deposit and verify the created order', async () => {
        const baseURL = process.env.BASE_URL?.trim() || SANDBOX_BASE_URL;
        assertDepositTargetIsApproved(baseURL);

        const result = await checkoutPage.submitAndConfirmSuccess({
          vehicle: selectedVehicle,
          color: selectedColor,
        });
        await testInfo.attach('deposit-result.json', {
          body: Buffer.from(
            JSON.stringify(
              {
                orderId: result.orderId,
                orderResponseStatus: result.orderResponseStatus,
                webhookResponseStatus: result.webhookResponseStatus,
                selectedVehicleId: selectedVehicle.id,
                selectedVariant: selectedVehicle.variantName,
                selectedColor,
              },
              null,
              2,
            ),
          ),
          contentType: 'application/json',
        });
      });
      expect(depositMutationCount).toBe(1);
    } else {
      testInfo.annotations.push({
        type: 'mode',
        description: 'Dry run: checkout verified; no deposit mutation submitted.',
      });
      expect(depositMutationCount).toBe(0);
    }

    await test.step('Assert the browser completed without runtime errors', async () => {
      expect(pageErrors, 'Unexpected page errors').toEqual([]);
      expect(consoleErrors, 'Unexpected console errors').toEqual([]);
    });
  });
});
