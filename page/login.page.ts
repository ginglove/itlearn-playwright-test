import { Page, Locator } from '@playwright/test';

export type DemoRole = 'admin' | 'sale' | 'manager' | 'customer';
export class LoginPage {
  readonly page: Page;
  readonly emailOrPhoneInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly userAvatarOrProfile: Locator;
  readonly loginNavButton: Locator;
  readonly adminDemoBtn: Locator;
  readonly saleDemoBtn: Locator;
  readonly managerDemoBtn: Locator;
  readonly customerDemoBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginNavButton = page.getByRole('link', { name: /đăng nhập/i }).or(page.locator('a[href*="login"]')).first();
    this.emailOrPhoneInput = page.locator('#email, input[name="email"], input[type="email"], input[placeholder*="email" i], input[placeholder*="tài khoản" i]').first();
    this.passwordInput = page.locator('#password, input[name="password"], input[type="password"]').first();
    this.loginButton = page.getByRole('button', { name: /đăng nhập/i }).first();
    this.userAvatarOrProfile = page.locator('[data-testid="user-profile"], .user-avatar, button:has-text("Đăng xuất"), a[href*="profile"]').first();
    this.adminDemoBtn = page.locator('button:has-text("Admin"), [data-role="admin"], [data-testid*="admin"]').first();
    this.saleDemoBtn = page.locator('button:has-text("Sale"), [data-role="sale"], [data-testid*="sale"]').first();
    this.managerDemoBtn = page.locator('button:has-text("Manager"), [data-role="manager"], [data-testid*="manager"]').first();
    this.customerDemoBtn = page.locator('button:has-text("Customer"), button:has-text("Khách hàng"), [data-role="customer"]').first();

  }
  async goto() {
    await this.page.goto('https://training-car-sell-system.vercel.app/catalog');
    if (await this.loginNavButton.isVisible().catch(() => false)) {
      await this.loginNavButton.click();
    } else {
      await this.page.goto('https://training-car-sell-system.vercel.app/login');
    }
  }
  async login(emailOrPhone?: string, password?: string) {
    if (emailOrPhone) await this.emailOrPhoneInput.fill(emailOrPhone);
    if (password) await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async clickDemoAccount(role: DemoRole) {
    switch (role) {
      case 'admin':
        await this.adminDemoBtn.click();
        break;
      case 'sale':
        await this.saleDemoBtn.click();
        break;
      case 'manager':
        await this.managerDemoBtn.click();
        break;
      case 'customer':
        await this.customerDemoBtn.click();
        break;
    }
  }

  async getErrorMessage(): Promise<string> {
    const toast = this.page.locator('[role="alert"], [role="status"], [data-sonner-toast], .Toastify__toast-body, div[class*="toast"]').first();
    if (await toast.isVisible().catch(() => false)) {
      return (await toast.innerText()).trim();
    }
    const inlineError = this.page.locator('p.text-destructive, p.text-red-500, span.text-red-500, .error-message').first();
    if (await inlineError.isVisible().catch(() => false)) {
      return (await inlineError.innerText()).trim();
    }

    return '';
  }
}
