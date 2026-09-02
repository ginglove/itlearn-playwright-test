import { expect, type Page } from '@playwright/test';

import type { CustomerAccount } from '../support/test-data';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async logoutIfAuthenticated(): Promise<void> {
    const logoutButton = this.page.getByRole('button', { name: 'Đăng xuất' });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await expect(logoutButton).toBeHidden();
    }
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
    await expect(
      this.page.getByText('Đăng nhập vào hệ thống quản lý & bán xe'),
    ).toBeVisible();
  }

  async login(account: CustomerAccount): Promise<void> {
    await this.page
      .getByRole('textbox', { name: 'Email / Số điện thoại' })
      .fill(account.email);
    await this.page
      .getByRole('textbox', { name: 'Mật khẩu', exact: true })
      .fill(account.password);

    await this.page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await this.page.waitForURL((url) => url.pathname === '/catalog', {
      timeout: 30_000,
    });
    await expect(
      this.page.getByRole('button', { name: account.fullName }),
    ).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Đăng xuất' })).toBeVisible();
  }
}
