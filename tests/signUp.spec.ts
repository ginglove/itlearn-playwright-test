import {test, expect} from '@playwright/test';
import {SignUp} from '../pages/SignupPages';
import {URL} from '../test-data/url';

test.describe('Verify sign up flow', async() => {
    test.beforeEach(async({page}) => {
        await page.goto(URL.signUp);
    });

    test('TC_01: Happy path_Sign up successful', async ({page}) => {
        const signUp = new SignUp(page);

        // UI verification
        await signUp.signUp();
        await signUp.fillName('Vu Minh Hang');
        await signUp.fillEmail('mihhang2409@gmail.com');
        await signUp.fillPhone('0971285898');
        await signUp.fillPassword('Abc@123456');
        await signUp.fillConfirmPassword('Abc@123456');
        await signUp.fillOtp('888888');
        await signUp.acceptTerms();

        // Catch API
        const signUpPromise = page.waitForResponse(
            response => response.url().includes('/api/v1/auth/register') && 
            response.request().method() === 'POST'
        );

        // Sign Up action
        await signUp.clickSignUp();

        // API verification
        const signUpResponse = await signUpPromise;
        expect(signUpResponse.status()).toBe(409);
        
        const signUpBody = await signUpResponse.json();
        expect(signUpBody.success).toBe(false);
        expect(signUpBody.error.message).toBe('Email hoặc số điện thoại này đã được đăng ký trước đó');

        // Error message _ UI verification
        const errorMessage = page.getByText('Email hoặc số điện thoại này đã được đăng ký trước đó');
        await expect(errorMessage).toBeVisible();
    });

    test('TC_02: Invaid email', async ({page}) => {
        const signUp = new SignUp(page);
        await signUp.signUp();
        await signUp.fillName('Vu Minh Hang');
        await signUp.fillEmail('vmh1.testgmail.com');
        await signUp.fillPhone('0971285898');
        await signUp.fillPassword('Abc@123456');
        await signUp.fillConfirmPassword('Abc@123456');
        await signUp.fillOtp('888888');
        await signUp.acceptTerms();
        await signUp.clickSignUp();

        const validationEmail = await signUp.emailInput.evaluate(
            (input: HTMLInputElement) => input.validationMessage
        );
        expect(validationEmail).not.toBe('');
    });

    test('TC_03: Empty email', async ({page}) => {
        const signUp = new SignUp(page);
        await signUp.signUp();
        await signUp.fillName('Vu Minh Hang');

        await signUp.fillPhone('0971285898');
        await signUp.fillPassword('Abc@123456');
        await signUp.fillConfirmPassword('Abc@123456');
        await signUp.fillOtp('888888');
        await signUp.acceptTerms();
        await signUp.clickSignUp();

        const validationEmail = await signUp.emailInput.evaluate(
            (input: HTMLInputElement) => input.validationMessage
        );
        expect(validationEmail).toBe('Please fill out this field.');
    });

    test('TC_04: Invalid phone number', async ({page}) => {
        const signUp = new SignUp(page);
        await signUp.signUp();
        await signUp.fillName('Vu Minh Hang');
        await signUp.fillEmail('vmh1.test@gmail.com');
        await signUp.fillPhone('097128589712345678');
        await signUp.fillPassword('Abc@123456');
        await signUp.fillConfirmPassword('Abc@123456');
        await signUp.fillOtp('888888');
        await signUp.acceptTerms();
        await signUp.clickSignUp();

        const validationPhoneNo = signUp.validation;
        await expect(validationPhoneNo).toBeVisible();
        await expect(validationPhoneNo).toHaveText('Số điện thoại Việt Nam không hợp lệ');
    });

    test('TC_05: Empty phone number', async ({page}) => {
        const signUp = new SignUp(page);
        await signUp.signUp();
        await signUp.fillName('Vu Minh Hang');
        await signUp.fillEmail('vmh1.test@gmail.com');
        
        await signUp.fillPassword('Abc@123456');
        await signUp.fillConfirmPassword('Abc@123456');
        await signUp.fillOtp('888888');
        await signUp.acceptTerms();
        await signUp.clickSignUp();

        const validationPhoneNo = await signUp.phoneNo.evaluate(
            (input: HTMLInputElement) => input.validationMessage
        );
        expect(validationPhoneNo).toBe('Please fill out this field.');
    });

    test('TC_06: Invalid password', async ({page}) => {
        const signUp = new SignUp(page);
        await signUp.signUp();
        await signUp.fillName('Vu Minh Hang');
        await signUp.fillEmail('vmh1.test@gmail.com');
        await signUp.fillPhone('0971285898');
        await signUp.fillPassword('1');
        await signUp.fillConfirmPassword('1');
        await signUp.fillOtp('888888');
        await signUp.acceptTerms();
        await signUp.clickSignUp();

        const validationPassword = signUp.validation;
        await expect(validationPassword).toBeVisible();
        await expect(validationPassword).toHaveText('Mật khẩu phải từ 10 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt (@$!%*?&)');
    });

    test('TC_07: Empty password', async ({page}) => {
        const signUp = new SignUp(page);
        await signUp.signUp();
        await signUp.fillName('Vu Minh Hang');
        await signUp.fillEmail('vmh1.test@gmail.com');
        await signUp.fillPhone('0971285898');
        
        await signUp.fillOtp('888888');
        await signUp.acceptTerms();
        await signUp.clickSignUp();

        const validationPassword = await signUp.passwordInput.evaluate(
            (input: HTMLInputElement) => input.validationMessage
        );
        expect(validationPassword).toBe('Please fill out this field.');
    });

    test('TC_08: Password mismatch validation', async ({page}) => {
        const signUp = new SignUp(page);
        await signUp.signUp();
        await signUp.fillName('Vu Minh Hang');
        await signUp.fillEmail('vmh1.test@gmail.com');
        await signUp.fillPhone('0971285898');
        await signUp.fillPassword('Abc@123456');
        await signUp.fillConfirmPassword('Abc@123456789');
        await signUp.fillOtp('888888');
        await signUp.acceptTerms();
        await signUp.clickSignUp();

        const validationPassword = signUp.validation;
        await expect(validationPassword).toBeVisible();
        await expect(validationPassword).toHaveText('Mật khẩu xác nhận không khớp!');
    });

    test('TC_09: Invalid OTP Code', async ({page}) => {
        const signUp = new SignUp(page);
        await signUp.signUp();
        await signUp.fillName('Vu Minh Hang');
        await signUp.fillEmail('vmh1.test@gmail.com');
        await signUp.fillPhone('0971285898');
        await signUp.fillPassword('Abc@123456');
        await signUp.fillConfirmPassword('Abc@123456');
        await signUp.fillOtp('990099');
        await signUp.acceptTerms();
        await signUp.clickSignUp();

        const validationOtp = signUp.validation;
        await expect(validationOtp).toBeVisible();
        await expect(validationOtp).toHaveText('Mã OTP không đúng hoặc đã hết hạn (Sandbox code: 888888)');
    });

    test('TC_10: Empty OTP Code', async ({page}) => {
        const signUp = new SignUp(page);
        await signUp.signUp();
        await signUp.fillName('Vu Minh Hang');
        await signUp.fillEmail('vmh1.test@gmail.com');
        await signUp.fillPhone('0971285898');
        await signUp.fillPassword('Abc@123456');
        await signUp.fillConfirmPassword('Abc@123456');
        
        await signUp.acceptTerms();
        await signUp.clickSignUp();

        const validationOtp = await signUp.otpCode.evaluate(
            (input: HTMLInputElement) => input.validationMessage
        );
        expect(validationOtp).toBe('Please fill out this field.');
    });

    test('TC_11: Uncheck Terms & Privacy', async ({page}) => {
        const signUp = new SignUp(page);
        await signUp.signUp();
        await signUp.fillName('Vu Minh Hang');
        await signUp.fillEmail('vmh1.test@gmail.com');
        await signUp.fillPhone('0971285898');
        await signUp.fillPassword('Abc@123456');
        await signUp.fillConfirmPassword('Abc@123456');
        await signUp.fillOtp('888888');

        await expect(signUp.signUpAccBtn).toBeDisabled();
    });

    test('TC_12: Already have account', async ({page}) => {
        const signUp = new SignUp(page);
        await signUp.signUp();
        await signUp.clickHaveAccLink();
        await expect(page).toHaveURL('https://training-car-sell.netlify.app/login');
    });
})