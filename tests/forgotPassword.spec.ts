import {test, expect} from '@playwright/test';
import {ForgotPassword} from '../pages/ForgotPasswordPage';
import {URL} from '../test-data/url';

test.describe('Verify Forgot Password flow', async() => {
    test.beforeEach(async({page}) => {
        await page.goto(URL.logIn);
    });

    test('TC_1: Forgot password flow _ Happy path', async({page}) => {
            const forgotPassword = new ForgotPassword(page);
            await forgotPassword.goto(URL.logIn);
            await forgotPassword.clickLogInBtn();
            await forgotPassword.clickForgotPass();
            await forgotPassword.fillPhone('0971285897');

            // Catch sent OTP's API
            const sendOtpPromise = page.waitForResponse(
                response => response.url().includes('/api/v1/auth/otp/send') &&
                response.request().method() === 'POST'
            );
            
            // Click send OTP
            await forgotPassword.clickSentOtp();

            // Verify send message successful
            const sendSuccessMessage = page.getByText('Mã OTP khôi phục mật khẩu đã gửi (Sandbox: 888888)');
            await expect(sendSuccessMessage).toBeVisible();

            // Send OTP's API verification
            const sendOtpResponse = await sendOtpPromise;
            expect(sendOtpResponse.status()).toBe(200)

            // Fill OTP and new password
            await forgotPassword.fillOtp('888888');
            await forgotPassword.fillNewPass('Abc@240902');
            await forgotPassword.fillConfirmPass('Abc@240902');

            // Catch reset password's API
            const resetPromise = page.waitForResponse(
                response => response.url().includes('/api/v1/auth/reset-password') &&
                response.request().method() === 'POST'
            );

            // Click reset password
            await forgotPassword.clickResetPass();

            // Reset's API verification
            const resetResponse = await resetPromise;
            expect(resetResponse.status()).toBe(200);

            const resetBody = await resetResponse.json();
            expect(resetBody.success).toBe(true);
            expect(resetBody.data.message).toBe('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');

            // UI verification after reseting successful
            const successMessage = page.getByText('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.');
            await expect(successMessage).toBeVisible();
            await expect(page).toHaveURL(/\/login/);
    });

    test('TC_02: Fill Incorrect phone number', async({page}) => {
        const forgotPassword = new ForgotPassword(page);
        await forgotPassword.goto(URL.logIn);
        await forgotPassword.clickLogInBtn();

        // Forgot password UI flow
        await forgotPassword.clickForgotPass();
        await forgotPassword.fillPhone('0971285897999');

        // Catch incorrect phone's API
        const incorPhonePromise = page.waitForResponse(
            response => response.url().includes('/api/v1/auth/otp/send') && 
            response.request().method() === 'POST'
        );

        // Click send OTP code
        await forgotPassword.clickSentOtp();

        // Incorrect phone's API verification
        const incorPhoneResponse = await incorPhonePromise;
        expect(incorPhoneResponse.status()).toBe(400);

        const incorPhoneBody = await incorPhoneResponse.json();
        expect(incorPhoneBody.success).toBe(false);
        expect(incorPhoneBody.error).toBe('Định dạng số điện thoại không hợp lệ (Ví dụ: 0912345678)');

        // Error message UI verification
        const incorPhoneErrMessage = page.getByText('Định dạng số điện thoại không hợp lệ (Ví dụ: 0912345678)');
        await expect(incorPhoneErrMessage).toBeVisible();
    });

    test('TC_03: Fill Incorrect OTP code', async({page}) => {
        const forgotPassword = new ForgotPassword(page);
        await forgotPassword.goto(URL.logIn);
        await forgotPassword.clickLogInBtn();

         // Forgot password UI flow
        await forgotPassword.clickForgotPass();
        await forgotPassword.fillPhone('0971285897');

        // Catch sent OTP's API
        const sendOtpPromise = page.waitForResponse(
            response => response.url().includes('/api/v1/auth/otp/send') &&
            response.request().method() === 'POST'
        );
            
        // Click send OTP
        await forgotPassword.clickSentOtp();

        // Verify send message successful
        const sendSuccessMessage = page.getByText('Mã OTP khôi phục mật khẩu đã gửi (Sandbox: 888888)');
        await expect(sendSuccessMessage).toBeVisible();

        // Send OTP's API verification
        const sendOtpResponse = await sendOtpPromise;
        expect(sendOtpResponse.status()).toBe(200)

        // Fill incorrect OTP and new password
        await forgotPassword.fillOtp('990099');
        await forgotPassword.fillNewPass('Abc@240902');
        await forgotPassword.fillConfirmPass('Abc@240902');

        // Catch reset password's API
        const resetPromise = page.waitForResponse(
            response => response.url().includes('/api/v1/auth/reset-password') &&
            response.request().method() === 'POST'
        );

        // Click reset password
        await forgotPassword.clickResetPass();

        // Reset's API verification
        const resetResponse = await resetPromise;
        expect(resetResponse.status()).toBe(400);

        const resetBody = await resetResponse.json();
        expect(resetBody.success).toBe(false);
        expect(resetBody.error).toBe('Mã OTP không hợp lệ hoặc đã hết hạn');

        // UI verification after reseting successful
        const errorMessage = page.getByText('Mã OTP không hợp lệ hoặc đã hết hạn');
        await expect(errorMessage).toBeVisible();
    });

    test('TC_04: Password mismatch validation', async({page}) => {
        const forgotPassword = new ForgotPassword(page);
        await forgotPassword.goto(URL.logIn);
        await forgotPassword.clickLogInBtn();

        // Forgot password UI flow
        await forgotPassword.clickForgotPass();
        await forgotPassword.fillPhone('0971285897');

        // Catch sent OTP's API
        const sendOtpPromise = page.waitForResponse(
            response => response.url().includes('/api/v1/auth/otp/send') &&
            response.request().method() === 'POST'
        );
            
        // Click send OTP
        await forgotPassword.clickSentOtp();

        // Verify send message successful
        const sendSuccessMessage = page.getByText('Mã OTP khôi phục mật khẩu đã gửi (Sandbox: 888888)');
        await expect(sendSuccessMessage).toBeVisible();

        // Send OTP's API verification
        const sendOtpResponse = await sendOtpPromise;
        expect(sendOtpResponse.status()).toBe(200)

        // Fill incorrect OTP and new password
        await forgotPassword.fillOtp('888888');
        await forgotPassword.fillNewPass('Abc@240902');
        await forgotPassword.fillConfirmPass('Abc@24092002');

        // Click reset password
        await forgotPassword.clickResetPass();

        // UI verification after reseting successful
        const errorMessage = page.getByText('Mật khẩu mới và xác nhận mật khẩu không trùng khớp');
        await expect(errorMessage).toBeVisible();

    });
})
