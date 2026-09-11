import {test, expect} from '@playwright/test';
import {readCsv, getDataById} from '../utils/csv.helper';

import {SignUp} from '../pages/SignupPages';
import {URL} from '../test-data/url';

// ==================== CSV DATA ====================
interface SignupData {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
    otp?: string;
    expectedResult: string;
    expectedStatus: string;
}

interface SignupMessage {
    id: string;
    expectedMessage: string;
}

// Read CSV file
const signupData = readCsv<SignupData>(
    './test-data/signup.csv'
);

const errorData = readCsv<SignupMessage> (
    './test-data/signup-message.csv'
);

// ==================== TEST CASE ====================

test.describe('Verify sign up flow', async() => {
    test.beforeEach(async({page}) => {
        await page.goto(URL.signUp);
    });

    test('TC_01: Happy path_Sign up successful', async ({page}) => {
        const signUp = new SignUp(page);
        const data01 = getDataById(signupData, 'TC_01');
        const error01 = getDataById(errorData, 'TC_01');

        // UI verification
        await signUp.signUpInfor(
            data01.name!,
            data01.email!,
            data01.phone!,
            data01.password!,
            data01.confirmPassword!,
            data01.otp!
        );
        await signUp.acceptTerms();

        // Catch API
        const [signUpResponse] = await Promise.all([
            page.waitForResponse(
            response => response.url().includes(URL.registerApi) && 
            response.request().method() === 'POST'
            ),

            signUp.clickSignUp()
        ]);

        // API verification
        expect(signUpResponse.status()).toBe(
            Number(data01.expectedStatus)
        );
        
        const signUpBody = await signUpResponse.json();
        expect(signUpBody.success).toBe(false);
        expect(signUpBody.error.message).toBe(error01.expectedMessage);

        // Error message _ UI verification
        const errorMessage = page.getByText(error01.expectedMessage);
        await expect(errorMessage).toBeVisible();
    });

    test('TC_02: Invaid email', async ({page}) => {
        const signUp = new SignUp(page);
        const data02 = getDataById(signupData, 'TC_02');
        const error02 = getDataById(errorData, 'TC_02');

        await signUp.signUpInfor(
            data02.name!,
            data02.email!,
            data02.phone!,
            data02.password!,
            data02.confirmPassword!,
            data02.otp!
        );
        await signUp.acceptTerms();
        await signUp.clickSignUp();

        const validationEmail = await signUp.emailInput.evaluate(
            (input: HTMLInputElement) => input.validationMessage
        );
        expect(validationEmail).toBe(error02.expectedMessage);
    });

    test('TC_03: Empty email', async ({page}) => {
        const signUp = new SignUp(page);
        const data03 = getDataById(signupData, 'TC_03');
        const error03 = getDataById(errorData, 'TC_03');

        await signUp.signUpInfor(
            data03.name!,
            data03.email!,
            data03.phone!,
            data03.password!,
            data03.confirmPassword!,
            data03.otp!
        );
        await signUp.acceptTerms();
        await signUp.clickSignUp();

        const validationEmail = await signUp.emailInput.evaluate(
            (input: HTMLInputElement) => input.validationMessage
        );
        expect(validationEmail).toBe(error03.expectedMessage);
    });

    test('TC_04: Invalid phone number', async ({page}) => {
        const signUp = new SignUp(page);
        const data04 = getDataById(signupData, 'TC_04');
        const error04 = getDataById(errorData, 'TC_04');

        await signUp.signUpInfor(
            data04.name!,
            data04.email!,
            data04.phone!,
            data04.password!,
            data04.confirmPassword!,
            data04.otp!
        );
        await signUp.acceptTerms();
        await signUp.clickSignUp();

        const validationPhoneNo = signUp.validation;
        await expect(validationPhoneNo).toBeVisible();
        await expect(validationPhoneNo).toHaveText(error04.expectedMessage);
    });

    test('TC_05: Empty phone number', async ({page}) => {
        const signUp = new SignUp(page);
        const data05 = getDataById(signupData, 'TC_05');
        const error05 = getDataById(errorData, 'TC_05');

        await signUp.signUpInfor(
            data05.name!,
            data05.email!,
            data05.phone!,
            data05.password!,
            data05.confirmPassword!,
            data05.otp!
        );
        await signUp.acceptTerms();
        await signUp.clickSignUp();

        const validationPhoneNo = await signUp.phoneNo.evaluate(
            (input: HTMLInputElement) => input.validationMessage
        );
        expect(validationPhoneNo).toBe(error05.expectedMessage);
    });

    test('TC_06: Invalid password', async ({page}) => {
        const signUp = new SignUp(page);
        const data06 = getDataById(signupData, 'TC_06');
        const error06 = getDataById(errorData, 'TC_06');

        await signUp.signUpInfor(
            data06.name!,
            data06.email!,
            data06.phone!,
            data06.password!,
            data06.confirmPassword!,
            data06.otp!
        );
        await signUp.acceptTerms();
        await signUp.clickSignUp();

        const validationPassword = signUp.validation;
        await expect(validationPassword).toBeVisible();
        await expect(validationPassword).toHaveText(error06.expectedMessage);
    });

    test('TC_07: Empty password', async ({page}) => {
        const signUp = new SignUp(page);
        const data07 = getDataById(signupData, 'TC_07');
        const error07 = getDataById(errorData, 'TC_07');

        await signUp.signUpInfor(
            data07.name!,
            data07.email!,
            data07.phone!,
            data07.password!,
            data07.confirmPassword!,
            data07.otp!
        );
        await signUp.acceptTerms();
        await signUp.clickSignUp();

        const validationPassword = await signUp.passwordInput.evaluate(
            (input: HTMLInputElement) => input.validationMessage
        );
        expect(validationPassword).toBe(error07.expectedMessage);
    });

    test('TC_08: Password mismatch validation', async ({page}) => {
        const signUp = new SignUp(page);
        const data08 = getDataById(signupData, 'TC_08');
        const error08 = getDataById(errorData, 'TC_08');

        await signUp.signUpInfor(
            data08.name!,
            data08.email!,
            data08.phone!,
            data08.password!,
            data08.confirmPassword!,
            data08.otp!
        );
        await signUp.acceptTerms();
        await signUp.clickSignUp();

        const validationPassword = signUp.validation;
        await expect(validationPassword).toBeVisible();
        await expect(validationPassword).toHaveText(error08.expectedMessage);
    });

    test('TC_09: Invalid OTP Code', async ({page}) => {
        const signUp = new SignUp(page);
        const data09 = getDataById(signupData, 'TC_09');
        const error09 = getDataById(errorData, 'TC_09');

        await signUp.signUpInfor(
            data09.name!,
            data09.email!,
            data09.phone!,
            data09.password!,
            data09.confirmPassword!,
            data09.otp!
        );
        await signUp.acceptTerms();
        await signUp.clickSignUp();

        const validationOtp = signUp.validation;
        await expect(validationOtp).toBeVisible();
        await expect(validationOtp).toHaveText(error09.expectedMessage);
    });

    test('TC_10: Empty OTP Code', async ({page}) => {
        const signUp = new SignUp(page);
        const data10 = getDataById(signupData, 'TC_10');
        const error10 = getDataById(errorData, 'TC_10');

        await signUp.signUpInfor(
            data10.name!,
            data10.email!,
            data10.phone!,
            data10.password!,
            data10.confirmPassword!,
            data10.otp!
        );
        await signUp.acceptTerms();
        await signUp.clickSignUp();

        const validationOtp = await signUp.otpCode.evaluate(
            (input: HTMLInputElement) => input.validationMessage
        );
        expect(validationOtp).toBe(error10.expectedMessage);
    });

    test('TC_11: Uncheck Terms & Privacy', async ({page}) => {
        const signUp = new SignUp(page);
        const data11 = getDataById(signupData, 'TC_11');

        await signUp.signUpInfor(
                data11.name!,
                data11.email!,
                data11.phone!,
                data11.password!,
                data11.confirmPassword!,
                data11.otp!
            );

        await expect(signUp.signUpAccBtn).toBeDisabled();
    });

    test('TC_12: Already have account', async ({page}) => {
        const signUp = new SignUp(page);
        await signUp.clickHaveAccLink();
        await expect(page).toHaveURL(URL.logIn);
    });
})