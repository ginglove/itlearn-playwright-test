import { test, expect } from '@playwright/test';
import { RegisterPage } from '../page/register_user';

test.describe('Register user', () => {

    const unique = Date.now().toString().slice(-9);
    const email = `john.doe+${unique}@example.com`;
    const phone = `09${unique.slice(-8)}`;
    const password = 'Password@123';

    test('Register user when invalid data is name', async ({ page }) => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();
        //await registerPage.fullNameInput.fill('John Doe');
        await registerPage.emailInput.fill(email);
        await registerPage.phoneInput.fill(phone);
        await registerPage.passwordInput.fill(password);
        await registerPage.confirmPasswordInput.fill(password);
        await registerPage.otpInput.fill('888888');
        await registerPage.termsCheckbox.check();
        await registerPage.submitButton.click();

        await expect(page).toHaveURL(/\/register$/);
        await expect(page.locator('input#fullName:invalid')).toBeVisible();
    });

    test('Register user when invalid data is email', async ({ page }) => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();
        await registerPage.fullNameInput.fill('John Doe');
        //await registerPage.emailInput.fill(email);
        await registerPage.phoneInput.fill(phone);
        await registerPage.passwordInput.fill(password);
        await registerPage.confirmPasswordInput.fill(password);
        await registerPage.otpInput.fill('888888');
        await registerPage.termsCheckbox.check();
        await registerPage.submitButton.click();

        await expect(page).toHaveURL(/\/register$/);
        await expect(page.locator('input#email:invalid')).toBeVisible();
    });

    test('Register user when invalid data is phone', async ({ page }) => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();
        await registerPage.fullNameInput.fill('John Doe');
        await registerPage.emailInput.fill(email);
        //await registerPage.phoneInput.fill(phone);
        await registerPage.passwordInput.fill(password);
        await registerPage.confirmPasswordInput.fill(password);
        await registerPage.otpInput.fill('888888');
        await registerPage.termsCheckbox.check();
        await registerPage.submitButton.click();

        await expect(page).toHaveURL(/\/register$/);
        await expect(page.locator('input#phone:invalid')).toBeVisible();
    });

    test('Register user when invalid data is password', async ({ page }) => {
        const registerPage = new RegisterPage(page);
        await registerPage.goto();
        await registerPage.fullNameInput.fill('John Doe');
        await registerPage.emailInput.fill(email);
        await registerPage.phoneInput.fill(phone);
        //await registerPage.passwordInput.fill(password);
        await registerPage.confirmPasswordInput.fill(password);
        await registerPage.otpInput.fill('888888');
        await registerPage.termsCheckbox.check();
        await registerPage.submitButton.click();

        await expect(page).toHaveURL(/\/register$/);
        await expect(page.locator('input#password:invalid')).toBeVisible();
    }); 

    test('Register user successfully', async ({ page }) => {
        const registerPage = new RegisterPage(page);

        await test.step('Đăng ký tài khoản', async () => {

            await registerPage.goto();
            await registerPage.fullNameInput.fill('John Doe');
            await registerPage.emailInput.fill(email);
            await registerPage.phoneInput.fill(phone);
            await registerPage.passwordInput.fill(password);
            await registerPage.confirmPasswordInput.fill(password);
            await registerPage.otpInput.fill('888888');
            await registerPage.termsCheckbox.check();
            await registerPage.submitButton.click();

            await expect(page).toHaveURL(/\/login$/, { timeout: 15_000 });
        });

        await test.step('Đăng nhập bằng tài khoản vừa tạo', async () => {
            await page.getByPlaceholder('admin@autodealer.vn').fill(email);
            await page.getByRole('textbox', { name: 'Mật khẩu', exact: true }).fill(password);
            await page.getByRole('button', { name: 'ĐĂNG NHẬP' }).click();

            await expect(page).toHaveURL(/\/(catalog)?$/, { timeout: 15_000 });
        });
    });

});
