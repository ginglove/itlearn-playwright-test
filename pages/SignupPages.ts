import {Locator, Page} from '@playwright/test';

export class SignUp {
    readonly page: Page;

    readonly nameInput: Locator;
    readonly emailInput: Locator;
    readonly phoneNo: Locator;
    readonly passwordInput: Locator;
    readonly passwordRecf: Locator; 
    readonly otpCode: Locator;
    readonly termsBox: Locator;
    readonly signUpAccBtn: Locator;

    // Validate value
    readonly validation: Locator;

    // Already have account
    readonly haveAccLink: Locator;

    constructor (page: Page) {
        this.page = page;

        this.nameInput = page.locator('input[id="fullName"]');
        this.emailInput = page.locator('input[id="email"]');
        this.phoneNo = page.locator('input[id="phone"]');
        this.passwordInput = page.locator('input[id="password"]');
        this.passwordRecf = page.locator('input[id="confirmPassword"]');
        this.otpCode = page.locator('input[id="otpCode"]');
        this.termsBox = page.locator('input[id="terms"]');
        this.signUpAccBtn = page.getByRole('button', {name: 'ĐĂNG KÝ TÀI KHOẢN'});
        
        this.validation = page.locator('.font-medium').nth(0);

        this.haveAccLink = page.getByRole('link', {name: 'Đăng nhập ngay'});
    }

    async goto(url: string) {
        await this.page.goto(url);
    }

    async signUpInfor(
        name?: string,
        email?: string,
        phone?: string,
        password?: string,
        rePassword?: string,
        otp?: string
    ) {
        if(name) {
            await this.nameInput.fill(name);
        }
        if (email) {
            await this.emailInput.fill(email);
        }
        if (phone) {
            await this.phoneNo.fill(phone);
        }
        if (password) {
            await this.passwordInput.fill(password);
        }
        if (rePassword) {
            await this.passwordRecf.fill(rePassword);
        }
        if (otp) {
            await this.otpCode.fill(otp);
        }
    }
    
    async acceptTerms() {
        await this.termsBox.check();
    }

    async clickSignUp() {
        await this.signUpAccBtn.click();
    }

    async clickHaveAccLink() {
        await this.haveAccLink.click();
    }
}