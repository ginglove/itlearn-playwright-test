import { Page, Locator } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly registerNavButton: Locator;
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly termsCheckbox: Locator;
  readonly otpInput: Locator;
  readonly registerButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.registerNavButton = page.getByRole('link', { name: /đăng ký/i }).or(page.locator('a[href*="register"]')).first();
    this.fullNameInput = page.locator('#fullName, input[name="fullName"], input[placeholder*="họ và tên" i]').first();
    this.emailInput = page.locator('#email, input[name="email"], input[type="email"]').first();
    this.phoneInput = page.locator('#phone, input[name="phone"], input[placeholder*="điện thoại" i]').first();
    this.passwordInput = page.locator('#password, input[name="password"]').first();
    this.confirmPasswordInput = page.locator('#confirmPassword, input[name="confirmPassword"]').first();
    this.termsCheckbox = page.locator('#terms, button[role="checkbox"], input[type="checkbox"]').first();
    this.otpInput = page.locator('#otpCode').first();
    this.registerButton = page.getByRole('button', { name: /đăng ký tài khoản|đăng ký/i }).first();
  }

  async navigateFromCatalog() {
    await this.page.goto('https://training-car-sell-system.vercel.app/catalog');
    if (await this.registerNavButton.isVisible().catch(() => false)) {
      await this.registerNavButton.click();
      await this.page.waitForURL('**/register').catch(() => {});
    } else {
      await this.page.goto('https://training-car-sell-system.vercel.app/register');
    }
  }

  async checkTerms() {
    const isChecked = await this.termsCheckbox.isChecked().catch(() => false);
    if (!isChecked) {
      await this.termsCheckbox.click({ force: true });
    }
  }

  async uncheckTerms() {
    const isChecked = await this.termsCheckbox.isChecked().catch(() => false);
    if (isChecked) {
      await this.termsCheckbox.click({ force: true });
    }
  }

  async getActualErrorMessage(): Promise<string> {
    const toast = this.page.locator('[role="alert"], [role="status"], [data-sonner-toast], .Toastify__toast-body, div[class*="toast"]').first();
    if (await toast.isVisible().catch(() => false)) {
      return (await toast.innerText()).trim();
    }

    const inlineError = this.page.locator('p.text-destructive, p.text-red-500, span.text-red-500, .error-message, [class*="errorMessage"]').first();
    if (await inlineError.isVisible().catch(() => false)) {
      return (await inlineError.innerText()).trim();
    }

    const invalidInput = this.page.locator('input:invalid').first();
    if (await invalidInput.count() > 0) {
      const nativeMsg = await invalidInput.evaluate((el: HTMLInputElement) => el.validationMessage).catch(() => '');
      return nativeMsg.trim();
    }

    return '';
  }
}
