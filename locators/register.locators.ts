import { Locator, Page } from '@playwright/test';

/**
 * RegisterLocators class encapsulates all Playwright locators for the Registration page
 * and relevant navigation elements from the Catalog page.
 * 
 * Locator Precedence adhered to:
 * 1. Role-based locators (getByRole)
 * 2. Label-based locators (getByLabel)
 * 3. Placeholder / text-based locators (getByPlaceholder, getByText)
 * 4. Clean, scoped, short CSS selectors (e.g. #terms, #password ~ button, .bg-red-50)
 */
export class RegisterLocators {
  readonly page: Page;

  // --- Catalog / Header Locators ---
  readonly catalogRegisterButton: Locator;
  readonly catalogLoginButton: Locator;
  readonly catalogBrandLogo: Locator;
  readonly catalogNavCatalogLink: Locator;
  readonly catalogNavTestDriveLink: Locator;

  // --- Register Page Card & Header ---
  readonly registerHeading: Locator;
  readonly registerSubtitle: Locator;

  // --- Form Inputs ---
  readonly fullNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly otpInput: Locator;

  // --- Password Utilities ---
  readonly togglePasswordVisibilityButton: Locator;
  readonly passwordStrengthText: Locator;
  readonly passwordStrengthLabel: Locator;
  readonly passwordStrengthProgressBar: Locator;

  // --- OTP Utilities ---
  readonly sendOtpButton: Locator;
  readonly otpSandboxHint: Locator;

  // --- Terms & Checkbox ---
  readonly termsCheckbox: Locator;
  readonly termsOfUseLink: Locator;
  readonly privacyPolicyLink: Locator;

  // --- Actions & Links ---
  readonly submitRegisterButton: Locator;
  readonly loginLink: Locator;

  // --- Feedback / Alerts ---
  readonly errorMessageBanner: Locator;
  readonly successMessageBanner: Locator;

  constructor(page: Page) {
    this.page = page;

    // Catalog / Header
    this.catalogRegisterButton = page.getByRole('button', { name: 'Đăng ký' });
    this.catalogLoginButton = page.getByRole('button', { name: 'Đăng nhập' });
    this.catalogBrandLogo = page.getByRole('link', { name: 'AUTO DEALERSHIP' });
    this.catalogNavCatalogLink = page.getByRole('link', { name: 'Danh mục xe' });
    this.catalogNavTestDriveLink = page.getByRole('link', { name: 'Lái thử' });

    // Register Page Header
    this.registerHeading = page.getByRole('heading', { name: 'AUTO DEALERSHIP' });
    this.registerSubtitle = page.getByText('Tạo tài khoản mới để trải nghiệm dịch vụ');

    // Form Inputs
    this.fullNameInput = page.getByLabel('Họ và tên *');
    this.emailInput = page.getByLabel('Email *');
    this.phoneInput = page.getByLabel('Số điện thoại *');
    this.passwordInput = page.getByLabel('Mật khẩu *', { exact: true });
    this.confirmPasswordInput = page.getByLabel('Xác nhận mật khẩu *');
    this.otpInput = page.getByLabel('Mã OTP (xác thực SĐT) *');

    // Password Utilities
    this.togglePasswordVisibilityButton = page.locator('#password ~ button');
    this.passwordStrengthText = page.getByText('Độ mạnh mật khẩu:');
    this.passwordStrengthLabel = page.locator('div:has-text("Độ mạnh mật khẩu:") span.font-semibold');
    this.passwordStrengthProgressBar = page.locator('.h-1\\.5 div');

    // OTP Utilities
    this.sendOtpButton = page.getByRole('button', { name: /Gửi mã OTP|\d+s/ });
    this.otpSandboxHint = page.getByText('Môi trường Sandbox OTP cố định: 888888');

    // Terms & Checkbox
    this.termsCheckbox = page.getByLabel(/Tôi đồng ý với/);
    this.termsOfUseLink = page.getByText('Điều khoản sử dụng');
    this.privacyPolicyLink = page.getByText('Chính sách bảo mật');

    // Actions & Navigation
    this.submitRegisterButton = page.getByRole('button', { name: /ĐĂNG KÝ TÀI KHOẢN|Đang tạo tài khoản.../ });
    this.loginLink = page.getByRole('link', { name: 'Đăng nhập ngay' });

    // Alerts / Feedback
    this.errorMessageBanner = page.locator('form div.bg-red-50');
    this.successMessageBanner = page.locator('form div.bg-green-50');
  }
}

/**
 * Functional factory for retrieving RegisterLocators instance
 */
export const createRegisterLocators = (page: Page) => new RegisterLocators(page);
