import {Locator, Page} from '@playwright/test';

export class ForgotPassword {
    readonly page: Page;
    readonly logInBtn: Locator;
    readonly forgotPass: Locator;
    readonly phoneInput: Locator;
    readonly sendOtpBtn: Locator;
    readonly otpInput: Locator;
    readonly newPass: Locator;
    readonly reCfNewPass: Locator;
    readonly resetPwBtn: Locator;

    constructor (page: Page) {
        this.page = page;
        this.logInBtn = page.getByRole('button', {name: 'Đăng nhập'});
        this.forgotPass = page.getByRole('button', {name: 'Quên mật khẩu?'});
        this.phoneInput = page.locator('div[class="flex gap-2"] input');
        this.sendOtpBtn = page.locator('div[class="flex gap-2"] button');
        this.otpInput = page.getByPlaceholder('888888');
        this.newPass = page.locator('input[type="password"]').nth(1);
        this.reCfNewPass = page.locator('input[type="password"]').nth(2);
        this.resetPwBtn = page.getByRole('button', {name: 'Dat lai mat khau'});
    }

    async goto(url: string) {
        await this.page.goto(url);
    }

    async clickLogInBtn() {
        await this.logInBtn.click();
    }

    async clickForgotPass() {
        await this.forgotPass.click();
    }

    async fillPhone(phone: string) {
        await this.phoneInput.fill(phone);
    }

    async clickSentOtp() {
        await this.sendOtpBtn.click();
    }

    async fillOtp(otp: string) {
        await this.otpInput.fill(otp);
    }

    async fillNewPass(newPass: string) {
        await this.newPass.fill(newPass);
    }

    async fillConfirmPass(confirmPass: string) {
        await this.reCfNewPass.fill(confirmPass);
    }

    async clickResetPass() {
        await this.resetPwBtn.click();
    }
} 