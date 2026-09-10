import { Page, Locator } from '@playwright/test';

export class CarDetailPage {
  readonly page: Page;
  readonly canvas3D: Locator;
  readonly colorOptions: Locator;
  readonly interiorOptions: Locator;
  readonly loanTabOrCheckbox: Locator;
  readonly loanPercentageInput: Locator;
  readonly loanTermSelect: Locator;
  readonly depositButton: Locator;
  readonly confirmDepositButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.canvas3D = page.locator('canvas, [data-testid="3d-viewer"], div[class*="canvas-container"]').first();
    this.colorOptions = page.locator('[data-testid*="color"], [class*="color-swatch"], button[aria-label*="màu"], button[title*="Màu"]');
    this.interiorOptions = page.locator('[data-testid*="interior"], [class*="interior"], button:has-text("Nội thất")');
    this.loanTabOrCheckbox = page.locator('button:has-text("Trả góp"), button:has-text("Vay"), input[value="loan"], [data-tab="loan"]').first();
    this.loanPercentageInput = page.locator('select[name*="loan"], input[name*="percentage"], [aria-label*="tỷ lệ vay"]').first();
    this.loanTermSelect = page.locator('select[name*="term"], select[name*="year"], [aria-label*="thời hạn vay"]').first();
    this.depositButton = page.getByRole('button', { name: /đặt cọc ngay|đặt cọc|tiến hành cọc/i }).first();
    this.confirmDepositButton = page.getByRole('button', { name: /xác nhận đặt cọc|thanh toán cọc|xác nhận/i }).first();
    this.successMessage = page.locator('[role="alert"], [data-sonner-toast], h2:has-text("thành công"), p:has-text("thành công")').first();
  }
  async interactWith3DModel() {
    if (await this.canvas3D.isVisible().catch(() => false)) {
      const box = await this.canvas3D.boundingBox();
      if (box) {
        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;
        console.log('--- Đang thao tác 3D WebGL ---');
        await this.page.mouse.move(centerX, centerY);
        await this.page.mouse.wheel(0, -300);
        await this.page.mouse.wheel(0, 300);
        await this.page.mouse.down();
        await this.page.mouse.move(centerX + 150, centerY, { steps: 10 });
        await this.page.mouse.up();
        console.log('✔ Đã hoàn thành thao tác Zoom & Xoay xe 3D WebGL');
      }
    }
  }
  async selectColorAndInterior() {
    if (await this.colorOptions.count() > 1) {
      await this.colorOptions.nth(1).click();
    }
    if (await this.interiorOptions.count() > 0) {
      await this.interiorOptions.first().click();
    }
  }
  async configureLoan(percentage: string = '60', termYears: string = '8') {
    if (await this.loanTabOrCheckbox.isVisible().catch(() => false)) {
      await this.loanTabOrCheckbox.click();
    }
    const loan60Option = this.page.locator(`option[value*="60"], button:has-text("60%"), label:has-text("60%")`).first();
    if (await loan60Option.isVisible().catch(() => false)) {
      await loan60Option.click();
    } else if (await this.loanPercentageInput.isVisible().catch(() => false)) {
      await this.loanPercentageInput.selectOption({ value: percentage }).catch(() => {});
    }

    const term8Option = this.page.locator(`option[value*="8"], button:has-text("8 năm"), label:has-text("8 năm")`).first();
    if (await term8Option.isVisible().catch(() => false)) {
      await term8Option.click();
    } else if (await this.loanTermSelect.isVisible().catch(() => false)) {
      await this.loanTermSelect.selectOption({ label: `${termYears} năm` }).catch(() => {});
    }
  }
  async placeDeposit() {
    await this.depositButton.click();
    if (await this.confirmDepositButton.isVisible().catch(() => false)) {
      await this.confirmDepositButton.click();
    }
  }
  async isDepositSuccess(): Promise<boolean> {
    const isToastVisible = await this.successMessage.isVisible().catch(() => false);
    const isUrlOrder = this.page.url().includes('order') || this.page.url().includes('success');
    return isToastVisible || isUrlOrder;
  }
}
