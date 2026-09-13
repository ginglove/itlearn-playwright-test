import {test, expect} from '@playwright/test';
import {readCsv, getDataById} from '../utils/csv.helper';

import {ForgotPassword} from '../pages/ForgotPasswordPage';
import {URL} from '../test-data/url';

// ==================== CSV DATA ====================
interface ForgotPasswordData {
    id: string;
    phone?: string;
    otp?: string;
    newPassword?: string;
    confirmPassword?: string;
    expectedResult: string;
    sendOtpStatus: string;
    resetStatus: string;
}

interface ForgotPasswordMessage {
    id: string;
    sendOtpMessage: string;
    apiMessage: string;
    uiMessage: string;
}

// Read CSV file
const forgotPassData = readCsv<ForgotPasswordData>(
    './test-data/forgotPassword.csv'
);

const errorData = readCsv<ForgotPasswordMessage>(
    './test-data/forgot-password-message.csv'
);

// ==================== TEST CASE ====================

test.describe('Verify Forgot Password flow', async() => {
    test.beforeEach(async({page}) => {
        await page.goto(URL.logIn);
    });

    test('TC_1: Forgot password flow _ Happy path', async({page}) => {
            const forgotPassword = new ForgotPassword(page);
            const data01 = getDataById(forgotPassData, 'TC_01');
            const error01 = getDataById(errorData, 'TC_01');
            
            await forgotPassword.clickForgotPass();
            await forgotPassword.fillPhone(data01.phone!);

            // Catch sent OTP's API
            const [sendOtpResponse] = await Promise.all([
                page.waitForResponse(
                response => response.url().includes(URL.sendOtp) &&
                response.request().method() === 'POST'
                ),

                forgotPassword.clickSentOtp()
            ]);

            // Verify send message successful
            const sendSuccessMessage = page.getByText(error01.sendOtpMessage);
            await expect(sendSuccessMessage).toBeVisible();

            // Send OTP's API verification
            expect(sendOtpResponse.status()).toBe(
                Number(data01.sendOtpStatus)
            )

            // Fill OTP and new password
            await forgotPassword.setNewPass(
                data01.otp!,
                data01.newPassword!,
                data01.confirmPassword!
            );

            // Catch reset password's API
            const [resetResponse] = await Promise.all([
                page.waitForResponse(
                response => response.url().includes(URL.resetPass) &&
                response.request().method() === 'POST'
                ),

                forgotPassword.clickResetPass()
            ]);

            // Reset's API verification
            expect(resetResponse.status()).toBe(
                Number(data01.resetStatus)
            );

            const resetBody = await resetResponse.json();
            expect(resetBody.success).toBe(true);
            expect(resetBody.data.message).toBe(error01.apiMessage);

            // UI verification after reseting successful
            const successMessage = page.getByText(error01.uiMessage);
            await expect(successMessage).toBeVisible();
            await expect(page).toHaveURL(/\/login/);
    });

    test('TC_02: Fill Incorrect phone number', async({page}) => {
        const forgotPassword = new ForgotPassword(page);
        const data02 = getDataById(forgotPassData, 'TC_02');
        const error02 = getDataById(errorData, 'TC_02');

        // Forgot password UI flow
        await forgotPassword.clickForgotPass();
        await forgotPassword.fillPhone(data02.phone!);

        // Catch incorrect phone's API
        const [incorPhoneResponse] = await Promise.all([
            page.waitForResponse(
            response => response.url().includes(URL.sendOtp) && 
            response.request().method() === 'POST'
            ),

            forgotPassword.clickSentOtp()
        ]);

        // Incorrect phone's API verification
        expect(incorPhoneResponse.status()).toBe(
            Number(data02.sendOtpStatus)
        );

        const incorPhoneBody = await incorPhoneResponse.json();
        expect(incorPhoneBody.success).toBe(false);
        expect(incorPhoneBody.error).toBe(error02.apiMessage);

        // Error message UI verification
        const incorPhoneErrMessage = page.getByText(error02.uiMessage);
        await expect(incorPhoneErrMessage).toBeVisible();
    });

    test('TC_03: Fill Incorrect OTP code', async({page}) => {
        const forgotPassword = new ForgotPassword(page);
        const data03 = getDataById(forgotPassData, 'TC_03');
        const error03 = getDataById(errorData, 'TC_03');

         // Forgot password UI flow
        await forgotPassword.clickForgotPass();
        await forgotPassword.fillPhone(data03.phone!);

        // Catch sent OTP's API
        const [sendOtpResponse] = await Promise.all([
            page.waitForResponse(
            response => response.url().includes(URL.sendOtp) &&
            response.request().method() === 'POST'
            ),

            forgotPassword.clickSentOtp()
        ]);

        // Verify send message successful
        const sendSuccessMessage = page.getByText(error03.sendOtpMessage);
        await expect(sendSuccessMessage).toBeVisible();

        // Send OTP's API verification
        expect(sendOtpResponse.status()).toBe(
            Number(data03.sendOtpStatus)
        );

        // Fill incorrect OTP and new password
        await forgotPassword.setNewPass(
            data03.otp!,
            data03.newPassword!,
            data03.confirmPassword!
        );

        // Catch reset password's API
        const [resetResponse] = await Promise.all([
            page.waitForResponse(
            response => response.url().includes(URL.resetPass) &&
            response.request().method() === 'POST'
            ),

            forgotPassword.clickResetPass()
        ]);

        // Reset's API verification
        expect(resetResponse.status()).toBe(
            Number(data03.resetStatus)
        );

        const resetBody = await resetResponse.json();
        expect(resetBody.success).toBe(false);
        expect(resetBody.error).toBe(error03.apiMessage);

        // UI verification after reseting successful
        const errorMessage = page.getByText(error03.uiMessage);
        await expect(errorMessage).toBeVisible();
    });

    test('TC_04: Password mismatch validation', async({page}) => {
        const forgotPassword = new ForgotPassword(page);
        const data04 = getDataById(forgotPassData, 'TC_04');
        const error04 = getDataById(errorData, 'TC_04');

        // Forgot password UI flow
        await forgotPassword.clickForgotPass();
        await forgotPassword.fillPhone(data04.phone!);

        // Catch sent OTP's API
        const [sendOtpResponse] = await Promise.all([
            page.waitForResponse(
            response => response.url().includes(URL.sendOtp) &&
            response.request().method() === 'POST'
            ),

            forgotPassword.clickSentOtp()
        ]);

        // Verify send message successful
        const sendSuccessMessage = page.getByText(error04.sendOtpMessage);
        await expect(sendSuccessMessage).toBeVisible();

        // Send OTP's API verification
        expect(sendOtpResponse.status()).toBe(
            Number(data04.sendOtpStatus)
        );

        // Fill incorrect OTP and new password
        await forgotPassword.setNewPass(
            data04.otp!,
            data04.newPassword!,
            data04.confirmPassword!
        );

        // Click reset password
        await forgotPassword.clickResetPass();

        // UI verification after reseting successful
        const errorMessage = page.getByText(error04.uiMessage);
        await expect(errorMessage).toBeVisible();

    });
})
