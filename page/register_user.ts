import type { Locator, Page } from '@playwright/test';

export type RegisterData = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
  otp?: string;
};

export class RegisterPage {
  readonly url = 'https://training-car-sell-system.vercel.app/register';

  // --- Form ---
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly otpInput: Locator;
  readonly termsCheckbox: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.fullNameInput        = page.getByPlaceholder('Nguyễn Văn A');
    this.emailInput           = page.getByPlaceholder('nguyenvana@gmail.com');
    this.phoneInput           = page.getByPlaceholder('0901234567');
    this.passwordInput        = page.getByLabel('Mật khẩu *', { exact: true });
    this.confirmPasswordInput = page.getByPlaceholder('Nhập lại mật khẩu');
    this.otpInput             = page.getByPlaceholder('888888');
    this.termsCheckbox        = page.getByRole('checkbox', { name: /Tôi đồng ý/ });
    this.submitButton         = page.getByRole('button', { name: 'ĐĂNG KÝ TÀI KHOẢN' });
  }

  async goto(): Promise<void> {
    await this.page.goto(this.url);
  }

  async fillForm(data: Partial<RegisterData>): Promise<void> {
    if (data.fullName !== undefined) await this.fullNameInput.fill(data.fullName);
    if (data.email !== undefined) await this.emailInput.fill(data.email);
    if (data.phone !== undefined) await this.phoneInput.fill(data.phone);
    if (data.password !== undefined) await this.passwordInput.fill(data.password);
    if (data.password !== undefined || data.confirmPassword !== undefined) {
      await this.confirmPasswordInput.fill(data.confirmPassword ?? data.password!);
    }
    await this.otpInput.fill(data.otp ?? '888888');
  }

  async submit(): Promise<void> {
    await this.termsCheckbox.check();
    await this.submitButton.click();
  }
  async register(data: RegisterData): Promise<void> {
    await this.fillForm(data);
    await this.submit();
  }
}
