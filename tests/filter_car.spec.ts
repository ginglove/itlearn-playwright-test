import { test, expect } from '@playwright/test';
import { LoginPage } from '../page/login_user';
import { ApiPage } from '../page/api';

test.describe('Login user and API tests', async () => {

    const email = `admin@autodealer.vn`;
    const password = 'Admin@123';

    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(email, password);
        await page.waitForTimeout(10_000); 
        await expect(page).toHaveURL(/catalog/);
    });

    test('filter cars by website and buy car successfully', async ({ page }) => {

        await page.getByRole('radio', { name: 'Sedan' }).click();
        //const tongSoXe = await page.locator('span[class="text-primary font-bold"]').textContent();
        
        const apiPage = new ApiPage(page.request);
        const { response, list } = await apiPage.getModels({ bodyType: 'Sedan', sort: 'price-asc' });
        expect(response.status()).toBe(200);
        expect(Array.isArray(list)).toBe(true);
        expect(list.length).toBeGreaterThan(0);

        await expect(page.locator('span.text-primary.font-bold').first()).not.toContainText(list.length.toString());

        await page.getByRole('button', {name: "Xem chi tiết"}).first().click();
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });

        await page.getByRole('button', {name: "Phóng to"}).click();
        await page.getByRole('button', {name: "Thu nhỏ"}).click();

        await page.getByText('Phim cách nhiệt V-Kool Premium').click();

        const loanTermSelect = page.locator('label:text-is("Thời hạn vay") + button[role="combobox"]');

        await loanTermSelect.click();
        await expect(loanTermSelect).toHaveAttribute('aria-expanded', 'true');

        await page.getByRole('option', { name: '8 năm (96 tháng)' }).click();

        await expect(loanTermSelect).toContainText('8 năm (96 tháng)');

        const loanRatio = page.getByRole('slider');

        await loanRatio.focus();
        await loanRatio.press('ArrowRight');

        await loanRatio.fill('60');
        await expect(page.getByText(/Tỷ lệ vay \(60%\)/)).toBeVisible();

        const totalPrice = await page.locator('span[class="font-semibold"]').first().textContent();

        await page.getByRole('button', { name: /Đặt cọc giữ xe/ }).click();

        await expect(page).toHaveURL(/checkout/);

        const totalPriceCheckout = await page.locator('p[class="font-bold text-base"]').textContent();

        expect(totalPriceCheckout).toBe(totalPrice);

        await page.getByRole('button', { name: "Xác nhận giữ xe & Đặt cọc 20.000.000 ₫"}).click();

        await page.getByRole('button', { name: " Mock Thanh Cong (SUCCESS)" }).click();

        await expect(page).toHaveURL(/checkout\/result/);

        await expect(page.getByRole('heading')).toHaveText('Đặt cọc xe thành công!');

    });

    test('filter cars by website and buy car failed', async ({ page }) => {

        await page.getByRole('radio', { name: 'Sedan' }).click();
        //const tongSoXe = await page.locator('span[class="text-primary font-bold"]').textContent();
        
        const apiPage = new ApiPage(page.request);
        const { response, list } = await apiPage.getModels({ bodyType: 'Sedan', sort: 'price-asc' });
        expect(response.status()).toBe(200);
        expect(Array.isArray(list)).toBe(true);
        expect(list.length).toBeGreaterThan(0);

        await expect(page.locator('span.text-primary.font-bold').first()).not.toContainText(list.length.toString());

        await page.getByRole('button', {name: "Xem chi tiết"}).first().click();
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });

        await page.getByRole('button', {name: "Phóng to"}).click();
        await page.getByRole('button', {name: "Thu nhỏ"}).click();

        await page.getByText('Phim cách nhiệt V-Kool Premium').click();

        const loanTermSelect = page.locator('label:text-is("Thời hạn vay") + button[role="combobox"]');

        await loanTermSelect.click();
        await expect(loanTermSelect).toHaveAttribute('aria-expanded', 'true');

        await page.getByRole('option', { name: '8 năm (96 tháng)' }).click();

        await expect(loanTermSelect).toContainText('8 năm (96 tháng)');

        const loanRatio = page.getByRole('slider');

        await loanRatio.focus();
        await loanRatio.press('ArrowRight');

        await loanRatio.fill('60');
        await expect(page.getByText(/Tỷ lệ vay \(60%\)/)).toBeVisible();

        const totalPrice = await page.locator('span[class="font-semibold"]').first().textContent();

        await page.getByRole('button', { name: /Đặt cọc giữ xe/ }).click();

        await expect(page).toHaveURL(/checkout/);

        const totalPriceCheckout = await page.locator('p[class="font-bold text-base"]').textContent();

        expect(totalPriceCheckout).toBe(totalPrice);

        await page.getByRole('button', { name: "Xác nhận giữ xe & Đặt cọc 20.000.000 ₫"}).click();

        await page.getByRole('button', { name: "Mock That Bai (FAILED)" }).click();

        await expect(page).toHaveURL(/checkout\/result/);

        await expect(page.getByRole('heading')).toHaveText('Thanh toán thất bại!');

    });

     test('filter cars by website and buy car expired', async ({ page }) => {

        await page.getByRole('radio', { name: 'Sedan' }).click();
        //const tongSoXe = await page.locator('span[class="text-primary font-bold"]').textContent();
        
        const apiPage = new ApiPage(page.request);
        const { response, list } = await apiPage.getModels({ bodyType: 'Sedan', sort: 'price-asc' });
        expect(response.status()).toBe(200);
        expect(Array.isArray(list)).toBe(true);
        expect(list.length).toBeGreaterThan(0);

        await expect(page.locator('span.text-primary.font-bold').first()).not.toContainText(list.length.toString());

        await page.getByRole('button', {name: "Xem chi tiết"}).first().click();
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });

        await page.getByRole('button', {name: "Phóng to"}).click();
        await page.getByRole('button', {name: "Thu nhỏ"}).click();

        await page.getByText('Phim cách nhiệt V-Kool Premium').click();

        const loanTermSelect = page.locator('label:text-is("Thời hạn vay") + button[role="combobox"]');

        await loanTermSelect.click();
        await expect(loanTermSelect).toHaveAttribute('aria-expanded', 'true');

        await page.getByRole('option', { name: '8 năm (96 tháng)' }).click();

        await expect(loanTermSelect).toContainText('8 năm (96 tháng)');

        const loanRatio = page.getByRole('slider');

        await loanRatio.focus();
        await loanRatio.press('ArrowRight');

        await loanRatio.fill('60');
        await expect(page.getByText(/Tỷ lệ vay \(60%\)/)).toBeVisible();

        const totalPrice = await page.locator('span[class="font-semibold"]').first().textContent();

        await page.getByRole('button', { name: /Đặt cọc giữ xe/ }).click();

        await expect(page).toHaveURL(/checkout/);

        const totalPriceCheckout = await page.locator('p[class="font-bold text-base"]').textContent();

        expect(totalPriceCheckout).toBe(totalPrice);

        await page.getByRole('button', { name: "Xác nhận giữ xe & Đặt cọc 20.000.000 ₫"}).click();

        await page.getByRole('button', { name: " Mock Het Han 15p (EXPIRED)" }).click();

        await expect(page).toHaveURL(/checkout\/result/);

        await expect(page.getByRole('heading')).toHaveText('Đã hết thời gian giữ chỗ 15 phút!');

    });

    test('filter cars by website and buy car cancel', async ({ page }) => {

        await page.getByRole('radio', { name: 'Sedan' }).click();
        //const tongSoXe = await page.locator('span[class="text-primary font-bold"]').textContent();
        
        const apiPage = new ApiPage(page.request);
        const { response, list } = await apiPage.getModels({ bodyType: 'Sedan', sort: 'price-asc' });
        expect(response.status()).toBe(200);
        expect(Array.isArray(list)).toBe(true);
        expect(list.length).toBeGreaterThan(0);

        await expect(page.locator('span.text-primary.font-bold').first()).not.toContainText(list.length.toString());

        await page.getByRole('button', {name: "Xem chi tiết"}).first().click();
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 15_000 });

        await page.getByRole('button', {name: "Phóng to"}).click();
        await page.getByRole('button', {name: "Thu nhỏ"}).click();

        await page.getByText('Phim cách nhiệt V-Kool Premium').click();

        const loanTermSelect = page.locator('label:text-is("Thời hạn vay") + button[role="combobox"]');

        await loanTermSelect.click();
        await expect(loanTermSelect).toHaveAttribute('aria-expanded', 'true');

        await page.getByRole('option', { name: '8 năm (96 tháng)' }).click();

        await expect(loanTermSelect).toContainText('8 năm (96 tháng)');

        const loanRatio = page.getByRole('slider');

        await loanRatio.focus();
        await loanRatio.press('ArrowRight');

        await loanRatio.fill('60');
        await expect(page.getByText(/Tỷ lệ vay \(60%\)/)).toBeVisible();

        const totalPrice = await page.locator('span[class="font-semibold"]').first().textContent();

        await page.getByRole('button', { name: /Đặt cọc giữ xe/ }).click();

        await expect(page).toHaveURL(/checkout/);

        const totalPriceCheckout = await page.locator('p[class="font-bold text-base"]').textContent();

        expect(totalPriceCheckout).toBe(totalPrice);

        await page.getByRole('button', { name: "Xác nhận giữ xe & Đặt cọc 20.000.000 ₫"}).click();

        await page.getByRole('button', { name: "Quay lại" }).click();

        await expect(page).toHaveURL(/catalog/);

    });

});
      