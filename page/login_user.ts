import type { Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly url = 'https://training-car-sell-system.vercel.app/login';

  // --- Form ---
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.emailInput    = page.getByPlaceholder('admin@autodealer.vn');
    this.passwordInput = page.getByRole('textbox', { name: 'Mật khẩu', exact: true });
    this.submitButton  = page.getByRole('button', { name: 'ĐĂNG NHẬP' });
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
