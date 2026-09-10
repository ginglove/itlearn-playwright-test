import { test, expect } from '@playwright/test';
import { LoginPage } from '../page/login.page';
import { CatalogPage } from '../page/catalog.page';
import { CarDetailPage } from '../page/car-detail.page';

test.describe('Kịch bản E2E: Lọc xe Sedan -> Trải nghiệm 3D WebGL -> Cấu hình Vay 60% 8 năm -> Đặt cọc', () => {

  test('Toàn bộ quy trình đặt cọc xe Sedan trả góp', async ({ page }) => {
    test.setTimeout(0);

    const loginPage = new LoginPage(page);
    const catalogPage = new CatalogPage(page);
    const carDetailPage = new CarDetailPage(page);

    console.log('\nĐăng nhập Customer');
    await loginPage.goto();
    await loginPage.clickDemoAccount('customer');
    await loginPage.loginButton.click();
    await page.waitForURL('**/catalog').catch(() => {});

    console.log('\nBộ lọc Giá và Kiểu xe Sedan');
    await catalogPage.goto();
    await catalogPage.filterBySedan();
    await catalogPage.filterByPriceRange();

    const filteredCarCount = await catalogPage.getFilteredCount();
    console.log(`Số lượng xe Sedan tìm thấy: ${filteredCarCount} xe`);
    expect(filteredCarCount).toBeGreaterThan(0);

    console.log('\nLựa chọn xe đầu tiên');
    await catalogPage.selectFirstCar();

    console.log('\nThao tác 3D WebGL (Zoom & Xoay 360)');
    await carDetailPage.interactWith3DModel();

    console.log('\nChọn Màu sắc & Nội thất');
    await carDetailPage.selectColorAndInterior();

    console.log('\nCấu hình Gói vay 60% (8 năm)');
    await carDetailPage.configureLoan('60', '8');

    console.log('\n Đặt cọc & Xác nhận');
    await carDetailPage.placeDeposit();

    const isSuccess = await carDetailPage.isDepositSuccess();
    expect(isSuccess).toBeTruthy();
    console.log('\nHoàn thành đặt cọc xe Sedan');
  });
});
