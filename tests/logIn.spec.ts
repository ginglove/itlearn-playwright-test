import {test, expect} from '@playwright/test';
import {readCsv, getDataById} from '../utils/csv.helper';

import {LogIn} from '../pages/LoginPage';
import {URL} from '../test-data/url';
import {DEMO_ACC} from '../test-data/login.data';

// ==================== CSV DATA ====================
interface LoginData {
    id: string;
    email?: string;
    password?: string;
    phone?: string;
    otp?: string;
    expectedResult: string;
    expectedRole: string;
    errorKey: string;
}

interface LoginMessage {
    id: string;
    errorKey: string;
    expectedMessage: string;
}

// Read CSV file
const loginData = readCsv<LoginData>(
    './test-data/login.csv'
);

const errorData = readCsv<LoginMessage>(
    './test-data/login-message.csv'
);

// ==================== TEST CASE ====================
test.describe('Verify Log In flow', async() => {
    test.beforeEach(async({page}) => {
        await page.goto(URL.logIn);
    });

    for(const account of DEMO_ACC) {
        test(`TC_01: Log in successful as ${account.role}`, async({page}) => {
        const logIn = new LogIn(page);
        await logIn.demoLoginRole(account.role);

        // Catch API
        const [credentialsResponse, sessionResponse] = await Promise.all([
            page.waitForResponse(
                response => response.url().includes(URL.credentials) &&
                response.request().method() === 'POST'
            ),

            page.waitForResponse(async response => {
                if (
                response.url().includes(URL.session) &&
                response.request().method() === 'GET'
                ) {
                const body = await response.json();
                return body?.user != null;
                }

                return false;
            }),

            logIn.clickLogIn()
        ]);

        // API verification
        expect(credentialsResponse.status()).toBe(200);
        expect(sessionResponse.status()).toBe(200);

        const sessionBody = await sessionResponse.json();
        expect(sessionBody.user.email).toBe(account.email);
        expect(sessionBody.user.role).toBe(account.role);
        })
    };

    test('TC_02: Log in successful by password', async({page}) => {
        const logIn = new LogIn(page);
        const data02 = getDataById(loginData, 'TC_02');

        // UI Verification
        await logIn.logInByPass(
            data02.email!,
            data02.password!
        );
        await logIn.rememberPass();

        // Catch API
        const [credentialsResponse, sessionResponse] = await Promise.all([
            page.waitForResponse(
            response => response.url().includes(URL.credentials) &&
            response.request().method() === 'POST'
            ),

            page.waitForResponse(
                response => response.url().includes(URL.session) &&
                response.request().method() === 'GET'
            ),

            logIn.clickLogIn()
        ]);

        // API verification
        expect(credentialsResponse.status()).toBe(200);
        expect(sessionResponse.status()).toBe(200);
    });

    test('TC_03: Log in fail by password _ Invalid email', async({page}) => {
        const logIn = new LogIn(page);
        const data03 = getDataById(loginData, 'TC_03');
        const error03 = getDataById(errorData, 'TC_03');

        // UI Verification
        await logIn.logInByPass(
            data03.email!,
            data03.password!
        );
        await logIn.rememberPass();

        // Catch API
        const [credentialsResponse, sessionResponse] = await Promise.all([
            page.waitForResponse(
            response => response.url().includes(URL.credentials) &&
            response.request().method() === 'POST'
            ),

            page.waitForResponse(
            response => response.url().includes(URL.session) &&
            response.request().method() === 'GET'
            ),

            logIn.clickLogIn()
        ]);

        // API verification
        expect(credentialsResponse.status()).toBe(200);
        expect(sessionResponse.status()).toBe(200);

        const sessionBody = await sessionResponse.json();
        expect(sessionBody).toBeNull();

        // Error message verification
        const wrongLogInInfor = page.getByText(error03.expectedMessage);
        await expect(wrongLogInInfor).toBeVisible();
    });
    
    test('TC_04: Log in fail by password _ Empty email', async({page}) => {
        const logIn = new LogIn(page);
        const data04 = getDataById(loginData, 'TC_04');
        const error04 = getDataById(errorData, 'TC_04');

        // UI Verification
        await logIn.logInByPass(
            data04.email!,
            data04.password!
        );
        await logIn.rememberPass();
        await logIn.clickLogIn();
        
        const validationEmail = await logIn.emailInput.evaluate(
            (input: HTMLInputElement) => input.validationMessage
        );
        expect(validationEmail).toBe(error04.expectedMessage);
    });

    test('TC_05: Log in fail by password _ Invalid password', async({page}) => {
        const logIn = new LogIn(page);
        const data05 = getDataById(loginData, 'TC_05');
        const error05 = getDataById(errorData, 'TC_05');

        // UI Verification
        await logIn.logInByPass(
            data05.email!,
            data05.password!
        );
        await logIn.rememberPass();

        // Catch API
        const [credentialsResponse, sessionResponse] = await Promise.all([
            page.waitForResponse(
            response => response.url().includes(URL.credentials) &&
            response.request().method() === 'POST'
            ),

            page.waitForResponse(
            response => response.url().includes(URL.session) &&
            response.request().method() === 'GET'
            ),

            logIn.clickLogIn()
        ]);

        // API verification
        expect(credentialsResponse.status()).toBe(200);
        expect(sessionResponse.status()).toBe(200);

        const sessionBody = await sessionResponse.json();
        expect(sessionBody).toBeNull();

        // Error message verification
        const wrongLogInInfor = page.getByText(error05.expectedMessage);
        await expect(wrongLogInInfor).toBeVisible();
    });

    test('TC_06: Log in fail by password _ Empty password', async({page}) => {
        const logIn = new LogIn(page);
        const data06 = getDataById(loginData, 'TC_06');
        const error06 = getDataById(errorData, 'TC_06');

        // UI Verification
        await logIn.logInByPass(
            data06.email!,
            data06.password!
        );
        await logIn.rememberPass();
        await logIn.clickLogIn();
        
        const validationEmail = await logIn.passwordInput.evaluate(
            (input: HTMLInputElement) => input.validationMessage
        );
        expect(validationEmail).toBe(error06.expectedMessage);
    });

    test('TC_07: Log in successful by OTP SMS', async({page}) => {
        const logIn = new LogIn(page);
        const data07 = getDataById(loginData, 'TC_07');
        const error07 = getDataById(errorData, 'TC_07');

        // UI Verification
        await logIn.navOtpSms();
        await logIn.fillPhone(data07.phone!);

        // Catch sent OTP's API
        const [otpResponse] = await Promise.all ([
            page.waitForResponse(
            response => response.url().includes(URL.sendOtp) &&
            response.request().method() === 'POST'
            ),

            logIn.sentOtpCode()
        ]);

        // OTP's API verification
        expect(otpResponse.status()).toBe(200);

        const otpBody = await otpResponse.json();
        expect(otpBody.success).toBe(true);
        expect(otpBody.data.message).toContain(error07.expectedMessage);

        // Fill OTP after receiving 
        await logIn.fillOtp(data07.otp!);

        // Catch Login's API
        const [credentialsResponse, sessionResponse] = await Promise.all([
            page.waitForResponse(
            response => response.url().includes(URL.credentials) &&
            response.request().method() === 'POST'
            ),

            page.waitForResponse(
            response => response.url().includes(URL.session) &&
            response.request().method() === 'GET'
            ),

            logIn.clickLogIn()
        ]);

        // API verification
        expect(credentialsResponse.status()).toBe(200);
        expect(sessionResponse.status()).toBe(200);

        const sessionBody = await sessionResponse.json();
        expect(sessionBody).toBeNull();
    });

    test('TC_08: Log in fail by OTP SMS _ Invalid phone', async({page}) => {
        const logIn = new LogIn(page);
        const data08 = getDataById(loginData, 'TC_08');

        // UI Verification
        await logIn.navOtpSms();
        await logIn.fillPhone(data08.phone!);

        // Sent OTP code action
        await logIn.sentOtpCode();

        // UI verification
        await expect(logIn.otpInput).not.toBeVisible();
    });

    test('TC_09: Log in successful by OTP SMS _ Empty phone', async({page}) => {
        const logIn = new LogIn(page);

        // UI Verification
        await logIn.navOtpSms();

        // Sent OTP code action
        await logIn.sentOtpCode();

        // UI verification
        await expect(logIn.otpInput).not.toBeVisible();
    });

    test('TC_10: Log in fail by OTP SMS _ Invalid OTP', async({page}) => {
        const logIn = new LogIn(page);
        const data10 = getDataById(loginData, 'TC_10');
        const error07 = getDataById(errorData, 'TC_07');
        const error10 = getDataById(errorData, 'TC_10');

        // UI Verification
        await logIn.navOtpSms();
        await logIn.fillPhone(data10.phone!);

        // Catch sent OTP's API
        const [otpResponse] = await Promise.all([
            page.waitForResponse(
            response => response.url().includes(URL.sendOtp) &&
            response.request().method() === 'POST'
            ),

            logIn.sentOtpCode()
        ]);

        // OTP's API verification
        expect(otpResponse.status()).toBe(200);

        const otpBody = await otpResponse.json();
        expect(otpBody.success).toBe(true);
        expect(otpBody.data.message).toContain(error07.expectedMessage);

        // Fill OTP after receiving 
        await logIn.fillOtp(data10.otp!);

        // Catch Login's API
        const [credentialsResponse, sessionResponse] = await Promise.all([
            page.waitForResponse(
            response => response.url().includes(URL.credentials) &&
            response.request().method() === 'POST'
            ),
            
            page.waitForResponse(
            response => response.url().includes(URL.session) &&
            response.request().method() === 'GET'
            ),

            logIn.clickOtpLogIn()
        ]);

        // API verification
        expect(credentialsResponse.status()).toBe(200);
        expect(sessionResponse.status()).toBe(200);

        const sessionBody = await sessionResponse.json();
        expect(sessionBody).toBeNull();

        // Error message verification
        const wrongLogInOtp = page.getByText(error10.expectedMessage);
        await expect(wrongLogInOtp).toBeVisible();
    });

    test('TC_11: Log in fail by OTP SMS _ Empty OTP', async({page}) => {
        const logIn = new LogIn(page);
        const data11 = getDataById(loginData, 'TC_11');
        const error11 = getDataById(errorData, 'TC_11');

        // UI Verification
        await logIn.navOtpSms();
        await logIn.fillPhone(data11.phone!);
        await logIn.sentOtpCode();
        await logIn.clickOtpLogIn();
        
        const validationEmail = await logIn.otpInput.evaluate(
            (input: HTMLInputElement) => input.validationMessage
        );
        expect(validationEmail).toBe(error11.expectedMessage);
    });

    test('TC_12: No Account flow', async({page}) => {
        const logIn = new LogIn(page);

        await logIn.clickNoAccBtn();
        await expect(page).toHaveURL(/\/register/);
    });
})