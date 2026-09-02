import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Playwright Locators for Product Catalog, 3D WebGL Configurator, Financing & Checkout pages.
 * Strictly adheres to Playwright best practices:
 * 1. High-precedence locators: getByRole, getByLabel, getByPlaceholder, getByTestId, getByText
 * 2. 100% Smart Waits (auto-retrying assertions: toBeVisible, toContainText, toHaveURL)
 * 3. NO arbitrary waitForTimeout or sleep functions.
 */
export class LoginProductLocators {
  readonly page: Page;

  // --- 1. Login Page Interactive Elements ---
  readonly identityInput: Locator;
  readonly passwordInput: Locator;
  readonly submitPasswordLoginButton: Locator;
  readonly passwordTab: Locator;
  readonly otpTab: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly forgotPasswordButton: Locator;

  // --- 2. Header & Navigation Elements (Logged in state) ---
  readonly logoLink: Locator;
  readonly catalogNavLink: Locator;
  readonly testDriveNavLink: Locator;
  readonly ordersButton: Locator;
  readonly userProfileButton: Locator;
  readonly logoutButton: Locator;

  // --- 3. Filter Sidebar Elements (BỘ LỌC) ---
  readonly filterHeading: Locator;
  readonly resetFilterButton: Locator;
  
  // Brand Checkboxes
  readonly allBrandCheckboxes: Locator;
  readonly toyotaCheckbox: Locator;
  readonly hondaCheckbox: Locator;
  readonly hyundaiCheckbox: Locator;
  readonly kiaCheckbox: Locator;
  readonly fordCheckbox: Locator;
  readonly mazdaCheckbox: Locator;

  // Body Type Radios
  readonly allBodyTypesRadio: Locator;
  readonly sedanRadio: Locator;
  readonly suvRadio: Locator;
  readonly pickupRadio: Locator;
  readonly cuvRadio: Locator;
  readonly hatchbackRadio: Locator;

  // Price Range Slider & Showroom Select
  readonly priceRangeSlider: Locator;
  readonly priceRangeDisplay: Locator;
  readonly showroomSelect: Locator;

  // --- 4. Product Listing / Catalog Elements ---
  readonly searchCarInput: Locator;
  readonly sortCombobox: Locator;
  readonly resultsCountText: Locator;
  readonly skeletonLoaders: Locator;
  readonly carCards: Locator;
  readonly carCardTitles: Locator;
  readonly carCardPrices: Locator;
  readonly carCardStockBadges: Locator;
  readonly carDetailButtons: Locator;

  // --- 5. Pagination Controls ---
  readonly prevPageButton: Locator;
  readonly nextPageButton: Locator;
  readonly paginationInfo: Locator;

  // --- 6. Quick Scenario Quiz Filters ---
  readonly familyScenarioButton: Locator;
  readonly sportScenarioButton: Locator;
  readonly businessScenarioButton: Locator;
  readonly ecoScenarioButton: Locator;

  // --- 7. 3D WebGL Vehicle Detail Elements ---
  readonly webglCanvas: Locator;
  readonly zoomInButton: Locator;
  readonly zoomOutButton: Locator;
  readonly autoRotateButton: Locator;
  readonly resetCameraButton: Locator;
  readonly dayNightModeButton: Locator;
  readonly headlightsButton: Locator;
  readonly carDetailTitle: Locator;

  // --- 8. Vehicle Color & Interior Customization Elements ---
  readonly colorButtons: Locator;
  readonly whiteColorButton: Locator;
  readonly blackColorButton: Locator;
  readonly silverColorButton: Locator;
  readonly accessoriesSection: Locator;
  readonly accessoryItems: Locator;

  // --- 9. Bank Financing Estimator Elements ---
  readonly financingSection: Locator;
  readonly loanRatioSlider: Locator;
  readonly loanTermCombobox: Locator;
  readonly detailDepositButton: Locator;

  // --- 10. Checkout & Deposit Confirmation Elements ---
  readonly checkoutHeading: Locator;
  readonly confirmDepositButton: Locator;
  readonly mockSuccessPaymentButton: Locator;
  readonly mockFailedPaymentButton: Locator;
  readonly depositSuccessHeading: Locator;
  readonly trackOrderButton: Locator;
  readonly continueExploringButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Login Form Elements
    this.identityInput = page.locator('#identity');
    this.passwordInput = page.locator('#password');
    this.submitPasswordLoginButton = page.locator('form').filter({ has: page.locator('#password') }).getByRole('button', { name: /Đăng nhập/i });
    this.passwordTab = page.getByRole('tab', { name: /Mật khẩu/i });
    this.otpTab = page.getByRole('tab', { name: /Mã OTP SMS/i });
    this.rememberMeCheckbox = page.getByRole('checkbox', { name: /Ghi nhớ đăng nhập/i });
    this.forgotPasswordButton = page.getByRole('button', { name: /Quên mật khẩu/i });

    // Header Navigation Elements
    this.logoLink = page.getByRole('link', { name: /AUTO DEALERSHIP/i });
    this.catalogNavLink = page.getByRole('link', { name: 'Danh mục xe' });
    this.testDriveNavLink = page.getByRole('link', { name: 'Lái thử' });
    this.ordersButton = page.getByRole('button', { name: 'Đơn hàng' });
    this.userProfileButton = page.getByRole('button', { name: /Pham Thi Gam/i });
    this.logoutButton = page.getByRole('button', { name: 'Đăng xuất' });

    // Filter Sidebar Elements
    this.filterHeading = page.getByRole('heading', { name: 'BỘ LỌC' });
    this.resetFilterButton = page.getByRole('button', { name: /Đặt lại/i });
    
    this.allBrandCheckboxes = page.locator('.lg\\:col-span-1 input[type="checkbox"]');
    this.toyotaCheckbox = page.locator('label').filter({ hasText: 'Toyota' }).locator('input[type="checkbox"]');
    this.hondaCheckbox = page.locator('label').filter({ hasText: 'Honda' }).locator('input[type="checkbox"]');
    this.hyundaiCheckbox = page.locator('label').filter({ hasText: 'Hyundai' }).locator('input[type="checkbox"]');
    this.kiaCheckbox = page.locator('label').filter({ hasText: 'Kia' }).locator('input[type="checkbox"]');
    this.fordCheckbox = page.locator('label').filter({ hasText: 'Ford' }).locator('input[type="checkbox"]');
    this.mazdaCheckbox = page.locator('label').filter({ hasText: 'Mazda' }).locator('input[type="checkbox"]');

    this.allBodyTypesRadio = page.locator('label').filter({ hasText: 'Tất cả kiểu xe' }).locator('input[type="radio"]');
    this.sedanRadio = page.locator('label').filter({ hasText: 'Sedan' }).locator('input[type="radio"]');
    this.suvRadio = page.locator('label').filter({ hasText: 'SUV' }).locator('input[type="radio"]');
    this.pickupRadio = page.locator('label').filter({ hasText: 'Pickup' }).locator('input[type="radio"]');
    this.cuvRadio = page.locator('label').filter({ hasText: 'CUV' }).locator('input[type="radio"]');
    this.hatchbackRadio = page.locator('label').filter({ hasText: 'Hatchback' }).locator('input[type="radio"]');

    this.priceRangeSlider = page.locator('input[type="range"]').first();
    this.priceRangeDisplay = page.locator('.lg\\:col-span-1 span.font-mono').first();
    this.showroomSelect = page.locator('.lg\\:col-span-1 select');

    // Product Listing Area Elements
    this.searchCarInput = page.getByPlaceholder('Tìm từ khóa xe...');
    this.sortCombobox = page.locator('button[role="combobox"]').first();
    this.resultsCountText = page.locator('.lg\\:col-span-3').getByText(/Kết quả:/i);
    this.skeletonLoaders = page.locator('.animate-pulse');
    this.carCards = page.locator('.lg\\:col-span-3 .grid > div.rounded-lg.bg-card');
    this.carCardTitles = page.locator('.lg\\:col-span-3 .grid > div.rounded-lg.bg-card h3');
    this.carCardPrices = page.locator('.lg\\:col-span-3 .grid > div.rounded-lg.bg-card .text-primary.font-mono');
    this.carCardStockBadges = page.locator('.lg\\:col-span-3 .grid > div.rounded-lg.bg-card .rounded-full');
    this.carDetailButtons = page.locator('.lg\\:col-span-3 .grid > div.rounded-lg.bg-card').getByRole('button', { name: /Xem chi tiết/i });

    // Pagination Controls
    this.prevPageButton = page.getByRole('button', { name: /Trước/i });
    this.nextPageButton = page.getByRole('button', { name: /Sau/i });
    this.paginationInfo = page.locator('span.font-mono:has-text("Trang")');

    // Quick Quiz Scenario Buttons
    this.familyScenarioButton = page.getByRole('button', { name: '🏠 Gia đình' });
    this.sportScenarioButton = page.getByRole('button', { name: '🏃 Thể thao' });
    this.businessScenarioButton = page.getByRole('button', { name: '💼 Kinh doanh' });
    this.ecoScenarioButton = page.getByRole('button', { name: '🌱 Eco' });

    // 3D WebGL Vehicle Detail Elements
    this.webglCanvas = page.locator('canvas').first();
    this.zoomInButton = page.locator('button[title="Phóng to"]');
    this.zoomOutButton = page.locator('button[title="Thu nhỏ"]');
    this.autoRotateButton = page.locator('button[title="Tự động xoay 360°"]');
    this.resetCameraButton = page.locator('button[title="Đặt lại góc quay"]');
    this.dayNightModeButton = page.locator('button[title="Chế độ Studio Ban Đêm / Ban Ngày"]');
    this.headlightsButton = page.locator('button[title="Bật/Tắt đèn pha LED"]');
    this.carDetailTitle = page.locator('h1.text-3xl.font-bold, h1');

    // Color & Interior Customization Elements
    this.colorButtons = page.locator('div.flex.flex-wrap.gap-2 button');
    this.whiteColorButton = page.getByRole('button', { name: /Trắng Ngọc Trai/i });
    this.blackColorButton = page.getByRole('button', { name: /Đen Huyền Bí/i });
    this.silverColorButton = page.getByRole('button', { name: /Bạc Ánh Trăng/i });
    this.accessoriesSection = page.locator('div.rounded-lg.border.bg-card').filter({ hasText: 'Gói phụ kiện chính hãng' });
    this.accessoryItems = page.locator('div.rounded-lg.border.bg-card').filter({ hasText: 'Gói phụ kiện chính hãng' }).locator('div.cursor-pointer');

    // Bank Financing Estimator Elements
    this.financingSection = page.locator('div.rounded-lg.border.bg-card').filter({ hasText: 'Ước tính trả góp Ngân hàng' });
    this.loanRatioSlider = page.locator('input[type="range"]').last();
    this.loanTermCombobox = this.financingSection.getByRole('combobox');
    this.detailDepositButton = page.getByRole('button', { name: /Đặt cọc giữ xe/i });

    // Checkout & Deposit Confirmation Elements
    this.checkoutHeading = page.locator('h1, h2').first();
    this.confirmDepositButton = page.getByRole('button', { name: /Xác nhận giữ xe & Đặt cọc/i });
    this.mockSuccessPaymentButton = page.getByRole('button', { name: /Mock Thanh Cong|SUCCESS/i });
    this.mockFailedPaymentButton = page.getByRole('button', { name: /Mock That Bai|FAILED/i });
    this.depositSuccessHeading = page.getByText('Đặt cọc xe thành công!');
    this.trackOrderButton = page.getByRole('button', { name: /Theo dõi đơn hàng/i });
    this.continueExploringButton = page.getByRole('button', { name: /Tiếp tục khám phá xe khác/i });
  }

  getBrandCheckbox(brandName: string): Locator {
    return this.page.locator('label').filter({ hasText: brandName }).locator('input[type="checkbox"]');
  }

  getBodyTypeRadio(bodyTypeName: string): Locator {
    return this.page.locator('label').filter({ hasText: bodyTypeName }).locator('input[type="radio"]');
  }

  /**
   * Adjusts the catalog price filter slider and uses smart assertion to ensure value updated.
   */
  async setPriceRange(maxPrice: string) {
    await this.priceRangeSlider.evaluate((el: HTMLInputElement, val: string) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      if (setter) {
        setter.call(el, val);
      } else {
        el.value = val;
      }
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, maxPrice);
    await expect(this.priceRangeDisplay).toBeVisible();
  }

  /**
   * Sets the loan percentage slider on the financing estimator and smart waits for state update.
   */
  async setLoanRatio(percentage: string) {
    const slider = this.loanRatioSlider;
    await slider.evaluate((el: HTMLInputElement, val: string) => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      if (setter) {
        setter.call(el, val);
      } else {
        el.value = val;
      }
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }, percentage);

    const targetRegex = new RegExp(`Tỷ lệ vay \\(${percentage}%\\)`, 'i');
    if (!(await this.financingSection.getByText(targetRegex).isVisible())) {
      await slider.focus();
      for (let i = 0; i < 5; i++) {
        if (await this.financingSection.getByText(targetRegex).isVisible()) break;
        await this.page.keyboard.press('ArrowLeft');
      }
    }
    await expect(this.financingSection.getByText(targetRegex)).toBeVisible();
  }

  /**
   * Opens the loan term combobox, waits for dropdown options to be visible, and selects option.
   */
  async selectLoanTerm(termText: string) {
    await this.loanTermCombobox.click({ force: true, noWaitAfter: true });
    const option = this.page.getByRole('option', { name: new RegExp(termText, 'i') });
    await expect(option).toBeVisible();
    await option.click({ force: true, noWaitAfter: true });
    await expect(this.loanTermCombobox).toContainText(termText);
  }

  /**
   * Interacts with the 3D WebGL vehicle model: zoom in, zoom out, auto-rotate, mouse drag rotate, mouse wheel zoom.
   * Utilizes smart assertions on canvas element readiness.
   */
  async interactWith3DModel() {
    await expect(this.webglCanvas).toBeVisible();

    // 1. Zoom In button
    if (await this.zoomInButton.isVisible()) {
      await this.zoomInButton.click({ force: true, noWaitAfter: true });
    }

    // 2. Zoom Out button
    if (await this.zoomOutButton.isVisible()) {
      await this.zoomOutButton.click({ force: true, noWaitAfter: true });
    }

    // 3. Mouse drag on canvas to rotate / move 3D model
    const box = await this.webglCanvas.boundingBox();
    if (box) {
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      await this.page.mouse.move(centerX, centerY);
      await this.page.mouse.down();
      await this.page.mouse.move(centerX + 60, centerY + 15, { steps: 3 });
      await this.page.mouse.up();

      // Mouse wheel to zoom
      await this.page.mouse.wheel(0, -50);
      await this.page.mouse.wheel(0, 50);
    }
  }
}

// Alias for convenience
export { LoginProductLocators as ProductLocators };
