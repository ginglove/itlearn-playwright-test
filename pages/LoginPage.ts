import {Locator, Page} from '@playwright/test';

export class LogIn {
    readonly page: Page;

    // Log In by demo account
    readonly adminAcc: Locator;
    readonly managerAcc: Locator;
    readonly saleAcc: Locator;
    readonly customerAcc: Locator;

    // Log In Manual by password
    // readonly logInBtn: Locator;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly rememberInfo: Locator;
    readonly logInAccBtn: Locator;

    // Log In Manual by OTP
    readonly otpSms: Locator;
    readonly phoneInput: Locator;
    readonly sentOtpBtn: Locator;
    readonly otpInput: Locator;
    readonly confirmAndLoginBtn: Locator;

    // No Account link
    readonly noAccLink: Locator;


    constructor (page: Page) {
        this.page = page;
        // this.logInBtn = page.getByRole('button', {name: 'Đăng nhập'});

        // Login by demo
        this.adminAcc = page.locator('//button[contains(@class, "transition-colors")]').nth(1);
        this.managerAcc = page.locator('//button[contains(@class, "transition-colors")]').nth(2);
        this.saleAcc = page.locator('//button[contains(@class, "transition-colors")]').nth(3);
        this.customerAcc = page.locator('//button[contains(@class, "transition-colors")]').nth(4);

        // Login manual by password
        this.emailInput = page.locator('input[id="identity"]');
        this.passwordInput = page.locator('input[id="password"]');
        this.rememberInfo = page.locator('input[type="checkbox"]');
        this.logInAccBtn = page.locator('button[type="submit"]');
        
        // Log In Manual by OTP
        this.otpSms = page.locator('div[role="tablist"] button').nth(1);
        this.phoneInput = page.locator('input[id="otpPhone"]');
        this.sentOtpBtn = page.getByRole('button', {name: 'Gửi mã xác thực OTP'});
        this.otpInput = page.locator('input[id="otpCode"]');
        this.confirmAndLoginBtn = page.getByRole('button', {name: 'Xác nhận & Đăng nhập'});

        // No Account link
        this.noAccLink = page.getByRole('link', {name: 'Đăng ký tài khoản mới'});
    }

    async goto(url: string) {
        await this.page.goto(url);
    }

    // Demo account
    async demoLoginRole(role: string) {
        await this.page.getByText(role, {exact: true}).click();
    }

    async customerLogIn() {
        await this.customerAcc.click();
    }

    // Manual log in by password
    async logInByPass(email?: string, password?: string) {
        if (email) {
            await this.emailInput.fill(email);
        }
        if (password) {
            await this.passwordInput.fill(password);
        }
    }

    async rememberPass() {
        await this.rememberInfo.check();
    }

    async clickLogIn() {
        await this.logInAccBtn.click();
    }

    // Manual log in by OTP
    async navOtpSms() {
        await this.otpSms.click();
    }

    async fillPhone(phone: string) {
        await this.phoneInput.fill(phone);
    }

    async sentOtpCode() {
        await this.sentOtpBtn.click();
    }

    async fillOtp(otp: string) {
        await this.otpInput.fill(otp);
    }

    async clickOtpLogIn() {
        await this.confirmAndLoginBtn.click();
    }

    // No Account link
    async clickNoAccBtn() {
        await this.noAccLink.click();
    }

}