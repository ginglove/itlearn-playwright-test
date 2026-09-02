import { expect, type Page } from '@playwright/test';

import type { CustomerAccount } from '../support/test-data';

export class RegisterPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/register');
    await expect(
      this.page.getByRole('heading', { name: 'AUTO DEALERSHIP' }),
    ).toBeVisible();
    await expect(
      this.page.getByText('Tạo tài khoản mới để trải nghiệm dịch vụ'),
    ).toBeVisible();
  }

  async register(account: CustomerAccount): Promise<void> {
    await this.page.getByRole('textbox', { name: 'Họ và tên *' }).fill(account.fullName);
    await this.page.getByRole('textbox', { name: 'Email *' }).fill(account.email);
    await this.page.getByRole('textbox', { name: 'Số điện thoại *' }).fill(account.phone);
    await this.page.getByRole('textbox', { name: 'Mật khẩu *', exact: true }).fill(account.password);
    await this.page
      .getByRole('textbox', { name: 'Xác nhận mật khẩu *' })
      .fill(account.password);

    await this.page.getByRole('button', { name: 'Gửi mã OTP' }).click();
    await this.page
      .getByRole('textbox', { name: 'Mã OTP (xác thực SĐT) *' })
      .fill(account.otp);
    await this.page
      .getByRole('checkbox', {
        name: 'Tôi đồng ý với Điều khoản sử dụng và Chính sách bảo mật.',
      })
      .check();

    const submitButton = this.page.getByRole('button', {
      name: 'ĐĂNG KÝ TÀI KHOẢN',
    });
    await expect(submitButton).toBeEnabled();

    await submitButton.click();
    await this.page.waitForURL(
      (url) => url.pathname === '/login' || url.pathname === '/catalog',
      { timeout: 30_000 },
    );
  }
}
