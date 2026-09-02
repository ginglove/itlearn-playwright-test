import type { Locator, Page } from '@playwright/test';

/**
 * Locator cho luồng đăng nhập Google (bản Việt Nam).
 *
 * Nguồn DOM: khảo sát trực tiếp ngày 2026-08-26
 *  - https://google.com.vn  → redirect về https://www.google.com (UI tiếng Việt, region VN)
 *  - Link "Đăng nhập" → https://accounts.google.com/v3/signin/identifier (flowName=GlifWebSignIn)
 *
 * Lưu ý về accessible name: trang Google gần như không dùng thẻ <label>, mà dùng
 * `aria-label`. Playwright lấy `aria-label` làm accessible name nên `getByRole`
 * và `getByLabel` đều khớp; ngược lại, những phần tử có `aria-label` DÀI hơn text
 * hiển thị (ví dụ link footer "Trợ giúp") phải match theo aria-label, không theo text.
 *
 * Trang không có `data-testid` nào, nên không dùng được `getByTestId`.
 */

/** URL dùng cho luồng đăng nhập. */
export const loginUrls = {
  /** Trang chủ Google VN (điểm bắt đầu, sẽ redirect về www.google.com). */
  home: 'https://google.com.vn',
  /** Trang nhập email/số điện thoại. */
  signIn:
    'https://accounts.google.com/ServiceLogin?hl=vi&passive=true&continue=https://www.google.com/',
} as const;

/**
 * Trang chủ Google VN — nơi chứa điểm vào (entry point) của luồng đăng nhập.
 */
export class GoogleHomePage {
  constructor(private readonly page: Page) {}

  // ---------- Thanh điều hướng trên cùng ----------

  /** Link "Gmail". */
  get gmailLink(): Locator {
    return this.page.getByRole('link', { name: 'Gmail' });
  }

  /** Link "Hình ảnh" (aria-label: "Tìm kiếm hình ảnh"). */
  get imageSearchLink(): Locator {
    return this.page.getByRole('link', { name: 'Tìm kiếm hình ảnh' });
  }

  /** Nút lưới "Các ứng dụng của Google" (thẻ <a role="button">). */
  get googleAppsButton(): Locator {
    return this.page.getByRole('button', { name: 'Các ứng dụng của Google' });
  }

  /** Link "Đăng nhập" — điểm vào luồng login. */
  get signInLink(): Locator {
    return this.page.getByRole('link', { name: 'Đăng nhập' });
  }

  // ---------- Khối tìm kiếm ----------

  /** Logo Google. */
  get logo(): Locator {
    return this.page.getByRole('img', { name: 'Google' });
  }

  /** Ô tìm kiếm — thực tế là <textarea name="q" role="combobox">. */
  get searchBox(): Locator {
    return this.page.getByRole('combobox', { name: 'Tìm kiếm' });
  }

  /** Nút "Công cụ nhập" (bộ gõ tiếng Việt), chỉ hiện ở locale VN. */
  get inputToolsButton(): Locator {
    return this.page.getByRole('button', { name: 'Công cụ nhập' });
  }

  /** Nút micro "Tìm kiếm bằng giọng nói". */
  get voiceSearchButton(): Locator {
    return this.page.getByRole('button', { name: 'Tìm kiếm bằng giọng nói' });
  }

  /** Nút Lens "Tìm kiếm bằng hình ảnh". */
  get imageSearchButton(): Locator {
    return this.page.getByRole('button', { name: 'Tìm kiếm bằng hình ảnh' });
  }

  /** Nút "Chế độ AI" (<button role="link">). */
  get aiModeButton(): Locator {
    return this.page.getByRole('link', { name: 'Chế độ AI' });
  }

  /**
   * Nút "Tìm trên Google" (input[name="btnK"]).
   * Google render 2 bản form (desktop/mobile), 1 bản bị ẩn → dùng `.first()`
   * để tránh strict-mode violation.
   */
  get searchSubmitButton(): Locator {
    return this.page.getByRole('button', { name: 'Tìm trên Google' }).first();
  }

  /** Nút "Xem trang đầu tiên tìm được" (input[name="btnI"]), cũng có 2 bản. */
  get luckySubmitButton(): Locator {
    return this.page
      .getByRole('button', { name: 'Xem trang đầu tiên tìm được' })
      .first();
  }

  // ---------- Dropdown gợi ý tìm kiếm (chỉ xuất hiện khi gõ) ----------

  /** Danh sách gợi ý. */
  get suggestionListbox(): Locator {
    return this.page.getByRole('listbox');
  }

  /** Tất cả item gợi ý; dùng `.nth(i)` để chọn. */
  get suggestionOptions(): Locator {
    return this.page.getByRole('option');
  }

  /** Nút "Xem thêm" trong dropdown gợi ý. */
  get suggestionShowMoreButton(): Locator {
    return this.page.getByRole('button', { name: 'Xem thêm' });
  }

  // ---------- Banner / dialog ----------

  /** Nút "đóng" của banner khuyến nghị hiện trên trang chủ. */
  get closeBannerButton(): Locator {
    return this.page.getByRole('button', { name: 'đóng', exact: true });
  }

  /**
   * Dialog phản hồi "Chọn vấn đề mà bạn muốn gửi ý kiến phản hồi".
   * Ẩn sẵn trong DOM, chỉ hiện sau khi mở từ menu Cài đặt.
   */
  get feedbackDialog(): Locator {
    return this.page.getByRole('dialog', {
      name: 'Chọn vấn đề mà bạn muốn gửi ý kiến phản hồi',
    });
  }

  /** Nút đóng dialog phản hồi. */
  get feedbackDialogCloseButton(): Locator {
    return this.feedbackDialog.getByRole('button', { name: /^Đóng/ });
  }

  // ---------- Chọn ngôn ngữ ----------

  /** Link đổi ngôn ngữ theo tên hiển thị: 'English' | 'Français' | '繁體中文'. */
  languageLink(name: 'English' | 'Français' | '繁體中文'): Locator {
    return this.page.getByRole('link', { name, exact: true });
  }

  // ---------- Footer ----------

  get aboutLink(): Locator {
    return this.page.getByRole('link', { name: 'Giới thiệu' });
  }

  get adsLink(): Locator {
    return this.page.getByRole('link', { name: 'Quảng cáo' });
  }

  get businessLink(): Locator {
    return this.page.getByRole('link', { name: 'Doanh nghiệp' });
  }

  get howSearchWorksLink(): Locator {
    return this.page.getByRole('link', { name: 'Cách hoạt động của Tìm kiếm' });
  }

  get privacyLink(): Locator {
    return this.page.getByRole('link', { name: 'Quyền riêng tư' });
  }

  get termsLink(): Locator {
    return this.page.getByRole('link', { name: 'Điều khoản' });
  }

  /** Nút "Cài đặt" ở footer, mở menu bên dưới. */
  get settingsButton(): Locator {
    return this.page.getByRole('button', { name: 'Cài đặt' });
  }

  // ---------- Menu Cài đặt (role="menu") ----------

  get settingsMenu(): Locator {
    return this.page.getByRole('menu');
  }

  /** Item trong menu Cài đặt theo tên. */
  settingsMenuItem(
    name:
      | 'Cài đặt tìm kiếm'
      | 'Tìm kiếm nâng cao'
      | 'Dữ liệu của bạn trong Tìm kiếm'
      | 'Nhật ký tìm kiếm'
      | 'Tìm trong phần trợ giúp'
      | 'Gửi phản hồi',
  ): Locator {
    return this.page.getByRole('menuitem', { name, exact: true });
  }

  /** Link bật/tắt giao diện tối — text đổi theo trạng thái nên match bằng regex. */
  get darkThemeToggleLink(): Locator {
    return this.page.getByRole('link', { name: /Giao diện tối/ });
  }
}

/**
 * Bước 1 của đăng nhập: nhập email / số điện thoại (accounts.google.com).
 */
export class GoogleSignInIdentifierPage {
  constructor(private readonly page: Page) {}

  // ---------- Input ----------

  /** Ô "Email hoặc số điện thoại" (input#identifierId, name="identifier"). */
  get emailInput(): Locator {
    return this.page.getByRole('textbox', { name: 'Email hoặc số điện thoại' });
  }

  /**
   * Input password ẩn mà Google chèn sẵn cho password manager
   * (input[name="hiddenPassword"]) — hữu ích để assert nó không lộ ra UI.
   */
  get hiddenPasswordInput(): Locator {
    return this.page.locator('input[name="hiddenPassword"]');
  }

  // ---------- Button / Link ----------

  /** Nút "Tiếp theo". */
  get nextButton(): Locator {
    return this.page.getByRole('button', { name: 'Tiếp theo' });
  }

  /** Nút "Bạn quên địa chỉ email?". */
  get forgotEmailButton(): Locator {
    return this.page.getByRole('button', { name: 'Bạn quên địa chỉ email?' });
  }

  /** Nút "Tạo tài khoản". */
  get createAccountButton(): Locator {
    return this.page.getByRole('button', { name: 'Tạo tài khoản' });
  }

  /** Link "Tìm hiểu thêm về cách sử dụng Chế độ khách". */
  get guestModeLink(): Locator {
    return this.page.getByRole('link', { name: /Chế độ khách/ });
  }

  /** Nút "Cuộn xuống" khi nội dung dài hơn viewport. */
  get scrollDownButton(): Locator {
    return this.page.getByRole('button', { name: 'Cuộn xuống' });
  }

  // ---------- Dropdown ngôn ngữ ----------

  /** Combobox chọn ngôn ngữ ở footer (giá trị mặc định: "Tiếng Việt"). */
  get languageDropdown(): Locator {
    return this.page.getByRole('combobox');
  }

  /** Item trong dropdown ngôn ngữ sau khi mở. */
  languageOption(name: string): Locator {
    return this.page.getByRole('option', { name, exact: true });
  }

  // ---------- Thông báo lỗi ----------

  /**
   * Text lỗi hiển thị dưới ô email (vd. "Không tìm thấy Tài khoản Google...").
   * Không có role="alert", nên phải dùng CSS class của Google.
   */
  get emailErrorMessage(): Locator {
    return this.page.locator('div.LXRPh div.ovnfwe').first();
  }

  /**
   * Vùng aria-live gắn với ô email qua aria-describedby (div[jsname="NuIDSd"]).
   * Có 2 vùng NuIDSd trên trang (email + CAPTCHA) → `.first()` là của ô email.
   */
  get emailErrorLiveRegion(): Locator {
    return this.page.locator('div[jsname="NuIDSd"][aria-live="polite"]').first();
  }

  /** Vùng lỗi chung của form (aria-live="assertive"). */
  get formErrorLiveRegion(): Locator {
    return this.page.locator('div[jsname="OZNMeb"][aria-live="assertive"]');
  }

  // ---------- CAPTCHA (ẩn sẵn, chỉ hiện khi Google nghi ngờ bot) ----------
  // Dùng để assert & dừng test — KHÔNG tự động giải CAPTCHA.

  /** Ô nhập CAPTCHA (input#ca). */
  get captchaInput(): Locator {
    return this.page.getByRole('textbox', {
      name: 'Hãy nhập văn bản bạn nghe hoặc nhìn thấy',
    });
  }

  /** Nút phát audio CAPTCHA. */
  get captchaAudioButton(): Locator {
    return this.page.getByRole('button', {
      name: 'Hãy nghe và nhập số bạn nghe thấy',
    });
  }

  /** Ảnh CAPTCHA. */
  get captchaImage(): Locator {
    return this.page.locator('#captchaimg');
  }

  // ---------- Footer ----------

  /** Link "Trợ giúp" — accessible name lấy từ aria-label dài hơn text. */
  get helpLink(): Locator {
    return this.page.getByRole('link', { name: /Trung tâm trợ giúp/ });
  }

  /** Link "Quyền riêng tư". */
  get privacyLink(): Locator {
    return this.page.getByRole('link', { name: /Chính sách quyền riêng tư/ });
  }

  /** Link "Điều khoản". */
  get termsLink(): Locator {
    return this.page.getByRole('link', { name: /Điều khoản dịch vụ/ });
  }
}

/**
 * Bước 2 của đăng nhập: nhập mật khẩu.
 *
 * ⚠️ CHƯA XÁC MINH TRỰC TIẾP: để tới được bước này phải submit một địa chỉ email
 * thật, nên các locator dưới đây dựa trên cấu trúc GlifWebSignIn (cùng component
 * `whsOnd zHQkBf` / `VfPpkd-LgbsSe` như bước 1) chứ không phải khảo sát DOM live.
 * Hãy chạy `page.pause()` ở bước này để xác nhận lại trước khi tin.
 */
export class GoogleSignInPasswordPage {
  constructor(private readonly page: Page) {}

  /** Ô "Nhập mật khẩu của bạn" (input[name="Passwd"]). */
  get passwordInput(): Locator {
    return this.page.locator('input[name="Passwd"]');
  }

  /** Checkbox "Hiện mật khẩu". */
  get showPasswordCheckbox(): Locator {
    return this.page.getByRole('checkbox', { name: 'Hiện mật khẩu' });
  }

  /** Nút "Tiếp theo". */
  get nextButton(): Locator {
    return this.page.getByRole('button', { name: 'Tiếp theo' });
  }

  /** Nút "Bạn quên mật khẩu?". */
  get forgotPasswordButton(): Locator {
    return this.page.getByRole('button', { name: 'Bạn quên mật khẩu?' });
  }

  /** Text lỗi mật khẩu (cùng cấu trúc với lỗi ở bước email). */
  get passwordErrorMessage(): Locator {
    return this.page.locator('div.LXRPh div.ovnfwe').first();
  }
}

/**
 * Gom cả 3 trang của luồng đăng nhập vào một entry point.
 *
 * @example
 * const login = new LoginLocators(page);
 * await page.goto(loginUrls.home);
 * await login.home.signInLink.click();
 * await login.identifier.emailInput.fill(process.env.TEST_EMAIL!);
 * await login.identifier.nextButton.click();
 */
export class LoginLocators {
  readonly home: GoogleHomePage;
  readonly identifier: GoogleSignInIdentifierPage;
  readonly password: GoogleSignInPasswordPage;

  constructor(page: Page) {
    this.home = new GoogleHomePage(page);
    this.identifier = new GoogleSignInIdentifierPage(page);
    this.password = new GoogleSignInPasswordPage(page);
  }
}
