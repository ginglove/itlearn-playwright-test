import { Page, Locator } from '@playwright/test';

export class CatalogPage {
  readonly page: Page;
  readonly resultCountBadge: Locator;
  readonly sedanRadio: Locator;
  readonly pricePresetButton: Locator;
  readonly carCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.resultCountBadge = page.getByText(/Kết quả:/i);
    this.sedanRadio = page.locator('label, div').filter({ hasText: /^Sedan$/i }).locator('input[type="radio"]').or(page.getByRole('radio', { name: 'Sedan' }));
    this.pricePresetButton = page.locator('button, div, span').filter({ hasText: /^500M\s*-\s*2B$/i }).first();
    this.carCards = page.locator('a[href*="/catalog/"]');
   
  }
  async goto() {
    await this.page.goto('https://training-car-sell-system.vercel.app/catalog', { waitUntil: 'domcontentloaded' });
  }
  async getCarCountOnUI(): Promise<number> {
  await this.resultCountBadge.waitFor({state: 'visible'});

  const text = await this.resultCountBadge.locator('..').innerText();

  const matched = text.match(/\d+/);

  return matched ? parseInt(matched[0], 10) : 0;
}

async filterBySedan() {
    const sedanOption = this.page.locator('label').filter({ hasText: 'Sedan' }).first();
    await sedanOption.click();
  }
  async filterByPriceRange() {
    if (await this.pricePresetButton.isVisible()) {
      await this.pricePresetButton.click();
    }
    await this.page.waitForTimeout(500);
  }
  async getFilteredCount(): Promise<number> {
    const resultElement = this.page.locator('text=/\\d+\\s*xe/i').first();
    await resultElement.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    
    const text = await resultElement.innerText().catch(() => '');
    const matched = text.match(/(\d+)/);
    return matched ? parseInt(matched[1], 10) : 0;
  }
  async selectFirstCar() {
    const firstCar = this.carCards.first();
    await firstCar.scrollIntoViewIfNeeded();
    await firstCar.click();
    await this.page.waitForURL(/.*\/catalog\/.+/, { timeout: 10000 });
  }

}
