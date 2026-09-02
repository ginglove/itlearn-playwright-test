import { expect, type Page } from '@playwright/test';

import type { CustomerAccount } from '../support/test-data';

export class ProfilePage {
  constructor(private readonly page: Page) {}

  async assertCustomer(account: CustomerAccount): Promise<void> {
    await this.page.goto('/profile');
    await expect(
      this.page.getByRole('heading', {
        name: 'Thông Tin Tài Khoản & Hồ Sơ Pháp Lý (SCR-00-PROF)',
      }),
    ).toBeVisible();
    await expect(this.page.getByText('Role: CUSTOMER', { exact: true })).toBeVisible();
    await expect(
      this.page.getByRole('button', { name: account.fullName }),
    ).toBeVisible();
  }
}
