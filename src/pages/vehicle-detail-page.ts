import { expect, type Locator, type Page } from '@playwright/test';

import type { CatalogVehicle } from '../api/catalog-api';

export class VehicleDetailPage {
  private readonly canvas: Locator;

  constructor(private readonly page: Page) {
    this.canvas = page.locator('canvas');
  }

  async assertVehicle(vehicle: CatalogVehicle): Promise<void> {
    const heading = this.page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText(vehicle.modelName);
    await expect(heading).toContainText(vehicle.variantName);
  }

  private async waitForCanvasChange(reference: Buffer, action: string): Promise<Buffer> {
    await expect
      .poll(
        async () => {
          const current = await this.canvas.screenshot();
          return current.equals(reference);
        },
        {
          message: `Expected WebGL canvas to change after ${action}.`,
          timeout: 10_000,
          intervals: [250, 500, 1_000],
        },
      )
      .toBe(false);
    return this.canvas.screenshot();
  }

  async exerciseWebGl(): Promise<void> {
    await expect(this.canvas).toHaveCount(1);
    await expect(this.canvas).toBeVisible();
    await this.canvas.scrollIntoViewIfNeeded();

    const dimensions = await this.canvas.evaluate((element) => {
      const canvas = element as HTMLCanvasElement;
      return {
        width: canvas.width,
        height: canvas.height,
      };
    });
    expect(dimensions.width).toBeGreaterThan(0);
    expect(dimensions.height).toBeGreaterThan(0);

    await this.page.getByRole('button', { name: 'Đặt lại góc quay' }).click();
    const baseline = await this.canvas.screenshot();

    await this.page.getByRole('button', { name: 'Phóng to', exact: true }).click();
    const zoomedIn = await this.waitForCanvasChange(baseline, 'zoom in');

    await this.page.getByRole('button', { name: 'Thu nhỏ', exact: true }).click();
    const zoomedOut = await this.waitForCanvasChange(zoomedIn, 'zoom out');

    const box = await this.canvas.boundingBox();
    if (!box) {
      throw new Error('WebGL canvas has no bounding box.');
    }
    const startX = box.x + box.width * 0.5;
    const startY = box.y + box.height * 0.5;
    const endX = startX + Math.min(120, box.width * 0.2);
    const endY = startY + Math.min(60, box.height * 0.12);

    await this.page.mouse.move(startX, startY);
    await this.page.mouse.down();
    await this.page.mouse.move(endX, endY, { steps: 12 });
    await this.page.mouse.up();
    await this.waitForCanvasChange(zoomedOut, 'drag rotation');
  }

  async selectFirstAvailableColor(): Promise<string> {
    const colorButtons = this.page.getByRole('button', { name: /Còn \d+ xe$/u });
    const count = await colorButtons.count();

    for (let index = 0; index < count; index += 1) {
      const button = colorButtons.nth(index);
      const label = (await button.innerText()).replace(/\s+/gu, ' ').trim();
      const match = label.match(/^(.*?)\s+Còn\s+(\d+)\s+xe$/u);
      if (!match || Number(match[2]) <= 0) {
        continue;
      }

      const color = match[1].trim();
      await button.click();
      await expect(
        this.page.getByText(`2. Chọn Đại Lý / Showroom Nhận Xe (Màu ${color}):`, {
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        this.page.getByText(/Đại lý đã chọn có sẵn \d+ xe màu/u),
      ).toBeVisible();
      return color;
    }

    throw new Error('No exterior color with positive quota is available.');
  }

  async configureLoan(loanPercentage: number, termLabel: string): Promise<void> {
    const slider = this.page.getByRole('slider');
    await slider.fill(String(loanPercentage));
    await expect(slider).toHaveValue(String(loanPercentage));
    await expect(
      this.page.getByText(`Tỷ lệ vay (${loanPercentage}%)`, { exact: true }),
    ).toBeVisible();

    const durationControl = this.page
      .getByText('Thời hạn vay', { exact: true })
      .locator('..')
      .getByRole('combobox');
    await durationControl.click();
    await this.page.getByRole('option', { name: termLabel, exact: true }).click();
    await expect(durationControl).toContainText(termLabel);
  }

  async openCheckout(): Promise<void> {
    await this.page
      .getByRole('button', { name: /Đặt cọc giữ xe \(20\.000\.000 ₫\)/u })
      .click();
    await expect(this.page).toHaveURL(/\/checkout\?/u);
  }
}
