import { expect, type Locator, type Page } from '@playwright/test';

import type { CatalogVehicle } from '../api/catalog-api';

export class CatalogPage {
  private readonly resultSummary: Locator;
  private readonly priceSlider: Locator;

  constructor(private readonly page: Page) {
    this.resultSummary = page.getByText(/Kết quả:\s*\d+\s*xe/u).first();
    this.priceSlider = page.getByRole('slider');
  }

  async goto(): Promise<void> {
    await this.page.goto('/catalog');
    await expect(this.page.getByRole('heading', { name: 'BỘ LỌC' })).toBeVisible();
    await expect(this.resultSummary).toBeVisible();
  }

  async resultCount(): Promise<number> {
    const summary = (await this.resultSummary.innerText()).replace(/\s+/gu, ' ');
    const match = summary.match(/Kết quả:\s*(\d+)\s*xe/u);
    if (!match) {
      throw new Error(`Unable to parse catalog result count from: ${summary}`);
    }
    return Number(match[1]);
  }

  async expectResultCount(expectedCount: number): Promise<void> {
    await expect
      .poll(() => this.resultCount(), {
        message: `Expected catalog result count to become ${expectedCount}.`,
        timeout: 20_000,
      })
      .toBe(expectedCount);
  }

  async assertDefaultPriceRange(): Promise<void> {
    await expect(this.priceSlider).toHaveValue('2000000000');
    await expect(this.page.getByText('0.5B - 2.0B', { exact: true })).toBeVisible();
  }

  async filterBySedanAndMaximumPrice(maximumPrice: number): Promise<void> {
    const sedanRadio = this.page.getByRole('radio', { name: 'Sedan', exact: true });
    await sedanRadio.check();
    await expect(sedanRadio).toBeChecked();

    await this.priceSlider.fill(String(maximumPrice));
    await expect(this.priceSlider).toHaveValue(String(maximumPrice));
    await expect(this.page.getByText('0.5B - 1.6B', { exact: true })).toBeVisible();
  }

  async assertAndOpenFirstVehicle(expectedVehicle: CatalogVehicle): Promise<void> {
    const detailsButton = this.page
      .getByRole('button', { name: '[Xem chi tiết]', exact: true })
      .first();
    await expect(detailsButton).toBeVisible();

    const href = await detailsButton.evaluate((element) =>
      element.closest('a')?.getAttribute('href'),
    );
    expect(href).toBe(`/catalog/${expectedVehicle.id}`);

    await detailsButton.click();
    await expect(this.page).toHaveURL(
      new RegExp(`/catalog/${expectedVehicle.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'u'),
    );
  }
}
