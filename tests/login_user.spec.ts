import { test, expect } from '@playwright/test';
import { LoginPage } from '../page/login_user';
import { ApiPage } from '../page/api';

test.describe('Login user and API tests', () => {

    const email = `john.doe@example.com`;
    const password = 'Password@123';

    test('Login user with valid credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(email, password);
        await expect(page).toHaveURL(/\/(catalog)?$/, { timeout: 15_000 });


        const apiPage = new ApiPage(page.request);
        const { response, list } = await apiPage.getModels();
        expect(response.status()).toBe(200);
        expect(Array.isArray(list)).toBe(true);
        expect(list.length).toBeGreaterThan(0);

        expect(page.locator('span[class="text-primary font-bold"]')).not.toContainText(list.length.toString());
    });

    test('Attempt to login with invalid credentials', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login('invalid@example.com', 'Invalid@123');
        await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 });
    });

});
      