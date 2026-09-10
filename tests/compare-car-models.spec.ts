import { test, expect } from '@playwright/test';
import { LoginPage } from '../page/login.page';
import { CatalogPage } from '../page/catalog.page';

test.describe('Kiểm thử đối soát số lượng xe: API vs Giao diện Catalog', () => {
  test('So sánh số lượng xe giữa API và Giao diện (Không dùng toBe)', async ({ page }) => {
    test.setTimeout(0);
    const loginPage = new LoginPage(page);
    const catalogPage = new CatalogPage(page);
    await loginPage.goto();
    await loginPage.clickDemoAccount('customer');
    await loginPage.loginButton.click();

    const apiPromise = page.waitForResponse(response => {
      const url = response.url().toLowerCase();
      const isCarApi = (url.includes('models') || url.includes('catalog') || url.includes('cars')) && !url.includes('showrooms');
      const isJson = (response.headers()['content-type'] || '').includes('application/json');
      return response.status() === 200 && isCarApi && isJson;
    });
    await catalogPage.goto();

    const response = await apiPromise;
    const apiData = await response.json();
    const apiCarCount = Array.isArray(apiData) 
      ? apiData.length 
      : (apiData.data?.length || apiData.models?.length || apiData.total || 0);
    console.log(`[API] Tổng số lượng xe hệ thống = ${apiCarCount}`);

    const uiCarCount = await catalogPage.getCarCountOnUI();
    console.log(`[Giao diện UI] Số lượng xe hiển thị = ${uiCarCount}`);
    expect(uiCarCount).toBeGreaterThan(0);
    expect(uiCarCount).toBeLessThanOrEqual(apiCarCount);

    console.log(`\n🎉 KẾT QUẢ ĐỐI SOÁT THÀNH CÔNG: Giao diện (${uiCarCount} xe) nằm trong danh sách API (${apiCarCount} xe)!`);
  });
});
