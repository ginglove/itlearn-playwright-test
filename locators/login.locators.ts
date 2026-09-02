import { Locator, Page } from '@playwright/test';

/**
 * LoginLocators class encapsulates all Playwright locators for the Login page
 * and Catalog header navigation elements.
 * 
 * Locator Precedence adhered to:
 * 1. Role-based locators (getByRole)
 * 2. Label-based locators (getByLabel)
 * 3. Placeholder / text-based locators (getByPlaceholder, getByText)
 * 4. Clean, scoped, short CSS selectors (e.g. #identity, #password, .text-destructive)
 */
export class LoginLocators {
  readonly page: Page;

  // --- Catalog / Header Locators ---
  readonly catalogLoginButton: Locator;
  readonly catalogRegisterButton: Locator;
  readonly catalogBrandLogo: Locator;
  readonly catalogNavCatalogLink: Locator;

  // --- Login Page Card & Header ---
  readonly backButton: Locator;
  readonly loginHeading: Locator;
  readonly loginSubtitle: Locator;

  // --- Demo Accounts Section ---
  readonly demoAccountAdminButton: Locator;
  readonly demoAccountManagerButton: Locator;
  readonly demoAccountSaleButton: Locator;
  readonly demoAccountCustomerButton: Locator;

  // --- Tabs ---
  readonly passwordTab: Locator;
  readonly otpTab: Locator;

  // --- Password Mode Form ---
  readonly identityInput: Locator;
  readonly passwordInput: Locator;
  readonly togglePasswordVisibilityButton: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly forgotPasswordButton: Locator;
  readonly submitPasswordLoginButton: Locator;
  readonly passwordErrorMessage: Locator;

  // --- OTP Mode Form ---
  readonly otpPhoneInput: Locator;
  readonly sendOtpButton: Locator;
  readonly otpSandboxHint: Locator;
  readonly otpCodeInput: Locator;
  readonly otpCountdownText: Locator;
  readonly resendOtpButton: Locator;
  readonly submitOtpLoginButton: Locator;
  readonly otpErrorMessage: Locator;

  // --- Forgot Password Modal ---
  readonly forgotPasswordModal: Locator;
  readonly forgotPasswordCloseButton: Locator;
  readonly forgotPasswordIdentityInput: Locator;
  readonly forgotPasswordSendOtpButton: Locator;
  readonly forgotPasswordOtpInput: Locator;
  readonly forgotPasswordNewPasswordInput: Locator;
  readonly forgotPasswordConfirmPasswordInput: Locator;
  readonly forgotPasswordSubmitButton: Locator;
  readonly forgotPasswordAlertMessage: Locator;

  // --- Footer Links ---
  readonly registerLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Catalog / Header
    this.catalogLoginButton = page.locator('header a[href="/login"]');
    this.catalogRegisterButton = page.locator('header a[href="/register"]');
    this.catalogBrandLogo = page.getByRole('link', { name: 'AUTO DEALERSHIP' });
    this.catalogNavCatalogLink = page.getByRole('link', { name: 'Danh mục xe' });

    // Login Page Header & Card
    this.backButton = page.getByRole('button', { name: /Quay lai|Quay lại/i });
    this.loginHeading = page.getByRole('heading', { name: 'AUTO DEALERSHIP' });
    this.loginSubtitle = page.getByText('Đăng nhập vào hệ thống quản lý & bán xe');

    // Demo Accounts
    this.demoAccountAdminButton = page.locator('button:has-text("ADMIN")');
    this.demoAccountManagerButton = page.locator('button:has-text("MANAGER")');
    this.demoAccountSaleButton = page.locator('button:has-text("SALE")');
    this.demoAccountCustomerButton = page.locator('button:has-text("CUSTOMER")');

    // Tabs
    this.passwordTab = page.getByRole('tab', { name: 'Mật khẩu' });
    this.otpTab = page.getByRole('tab', { name: 'Mã OTP SMS' });

    // Password Mode Form
    this.identityInput = page.locator('#identity');
    this.passwordInput = page.locator('#password');
    this.togglePasswordVisibilityButton = page.locator('#password ~ button');
    this.rememberMeCheckbox = page.getByLabel('Ghi nhớ đăng nhập');
    this.forgotPasswordButton = page.getByRole('button', { name: 'Quên mật khẩu?' });
    this.submitPasswordLoginButton = page.locator('form').filter({ has: page.locator('#password') }).getByRole('button', { name: /Đăng nhập|Đang xử lý.../i });
    this.passwordErrorMessage = page.locator('p.text-destructive');

    // OTP Mode Form
    this.otpPhoneInput = page.locator('#otpPhone');
    this.sendOtpButton = page.getByRole('button', { name: 'Gửi mã xác thực OTP' });
    this.otpSandboxHint = page.getByText('Sandbox: Mã OTP cố định là 888888');
    this.otpCodeInput = page.locator('#otpCode');
    this.otpCountdownText = page.getByText(/Mã hết hạn sau:/);
    this.resendOtpButton = page.getByRole('button', { name: 'Gửi lại mã' });
    this.submitOtpLoginButton = page.locator('form').filter({ has: page.locator('#otpPhone') }).getByRole('button', { name: /Xác nhận & Đăng nhập|Đang xử lý.../i });
    this.otpErrorMessage = page.locator('p.text-destructive');

    // Forgot Password Modal
    this.forgotPasswordModal = page.locator('.fixed.inset-0');
    this.forgotPasswordCloseButton = page.locator('.fixed button:has(svg.lucide-x)');
    this.forgotPasswordIdentityInput = page.locator('.fixed input').first();
    this.forgotPasswordSendOtpButton = page.locator('.fixed').getByRole('button', { name: /Gui OTP|\d+s/i });
    this.forgotPasswordOtpInput = page.locator('.fixed input[placeholder="888888"]');
    this.forgotPasswordNewPasswordInput = page.locator('.fixed input[placeholder*="Mat khau moi"]');
    this.forgotPasswordConfirmPasswordInput = page.locator('.fixed input[placeholder*="Nhap lai mat khau moi"]');
    this.forgotPasswordSubmitButton = page.locator('.fixed').getByRole('button', { name: /Dat lai mat khau|Dang dat lai.../i });
    this.forgotPasswordAlertMessage = page.locator('.fixed .rounded-lg.border.flex');

    // Footer Links
    this.registerLink = page.getByRole('link', { name: 'Đăng ký tài khoản mới' });
  }
}

/**
 * Functional factory for creating LoginLocators instance
 */
export const createLoginLocators = (page: Page) => new LoginLocators(page);
