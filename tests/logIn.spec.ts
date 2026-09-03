import {test, expect} from '@playwright/test';
import {LogIn} from '../pages/LoginPage';
import {URL} from '../test-data/url';
import {DEMO_ACC} from '../test-data/login.data';

test.describe('Verify Log In flow', async() => {
    test.beforeEach(async({page}) => {
        await page.goto(URL.logIn);
    });

    for(const account of DEMO_ACC) {
        test(`TC_01: Log in successful as ${account.role}`, async({page}) => {
        const logIn = new LogIn(page);
        await logIn.logIn();
        await logIn.demoLoginRole(account.role);

        // Catch API
        const [credentialsPromise, sessionPromise] = await Promise.all([
            page.waitForResponse(
                response => response.url().includes('/api/auth/callback/credentials') &&
                response.request().method() === 'POST'
            ),

            page.waitForResponse(async response => {
                if (
                response.url().includes('/api/auth/session') &&
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
        const credentialsResponse = credentialsPromise;
        const sessionResponse = sessionPromise;

        expect(credentialsResponse.status()).toBe(200);
        expect(sessionResponse.status()).toBe(200);

        const credentialsBody = await credentialsResponse.json();
        const sessionBody = await sessionResponse.json();

        expect(credentialsBody.url).toContain('/login');

        expect(sessionBody.user.email).toBe(account.email);
        expect(sessionBody.user.role).toBe(account.role);
        })
    };

    test('TC_02: Log in successful by password', async({page}) => {
        const logIn = new LogIn(page);

        // UI Verification
        await logIn.logIn();
        await logIn.emailInput.fill('mihhang2409@gmail.com');
        await logIn.passwordInput.fill('Abc@123456');
        await logIn.rememberPass();

        // Catch API
        const credentialsPromise = page.waitForResponse(
            response => response.url().includes('/api/auth/callback/credentials?') &&
            response.request().method() === 'POST'
        );

        const sessionPromise = page.waitForResponse(async response => {
            if (
                response.url().includes('/api/auth/session') &&
                response.request().method() === 'GET'
            ) {
                const body = await response.json();

                return body?.user?.email != null;
            }

            return false;
        }); // Có 2 phase: null và include data -> cần dùng if

        // Log In action
        await logIn.clickLogIn();

        // API verification
        const credentialsResponse = await credentialsPromise;
        const sessionResponse = await sessionPromise;

        expect(credentialsResponse.status()).toBe(200);
        expect(sessionResponse.status()).toBe(200);

        const credentialsBody = await credentialsResponse.json();
        const sessionBody = await sessionResponse.json();

        expect(credentialsBody.url).toContain('/login');

        expect(sessionBody.user.email).toBe('mihhang2409@gmail.com');
        expect(sessionBody.user.id).toBeTruthy();
        expect(sessionBody.user.role).toBe('CUSTOMER');
    });

    test('TC_03: Log in fail by password _ Invalid email', async({page}) => {
        const logIn = new LogIn(page);

        // UI Verification
        await logIn.logIn();
        await logIn.emailInput.fill('mihhang24@gmail.com');
        await logIn.passwordInput.fill('Abc@123456');
        await logIn.rememberPass();

        // Catch API
        const credentialsPromise = page.waitForResponse(
            response => response.url().includes('/api/auth/callback/credentials?') &&
            response.request().method() === 'POST'
        );

        const sessionPromise = page.waitForResponse(
            response => response.url().includes('/api/auth/session') &&
            response.request().method() === 'GET'
        );

        // Log In action
        await logIn.clickLogIn();

        // API verification
        const credentialsResponse = await credentialsPromise;
        const sessionResponse = await sessionPromise;

        expect(credentialsResponse.status()).toBe(200);
        expect(sessionResponse.status()).toBe(200);

        const credentialsBody = await credentialsResponse.json();
        const sessionBody = await sessionResponse.json();

        expect(credentialsBody.url).toContain('error=CredentialsSignin');
        expect(credentialsBody.url).toContain('code=credentials');
        expect(sessionBody).toBeNull();

        // Error message verification
        const wrongLogInInfor = page.getByText('Sai thông tin đăng nhập. Mật khẩu hoặc Email/SĐT không đúng.');
        await expect(wrongLogInInfor).toBeVisible();
    });
    
    test('TC_04: Log in fail by password _ Empty email', async({page}) => {
        const logIn = new LogIn(page);

        // UI Verification
        await logIn.logIn();
        
        await logIn.passwordInput.fill('Abc@123456');
        await logIn.rememberPass();
        await logIn.clickLogIn();
        
        const validationEmail = await logIn.emailInput.evaluate(
            (input: HTMLInputElement) => input.validationMessage
        );
        expect(validationEmail).toBe('Please fill out this field.');
    });

    test('TC_05: Log in fail by password _ Invalid password', async({page}) => {
        const logIn = new LogIn(page);

        // UI Verification
        await logIn.logIn();
        await logIn.emailInput.fill('mihhang2409@gmail.com');
        await logIn.passwordInput.fill('Abc@123456789');
        await logIn.rememberPass();

        // Catch API
        const credentialsPromise = page.waitForResponse(
            response => response.url().includes('/api/auth/callback/credentials?') &&
            response.request().method() === 'POST'
        );

        const sessionPromise = page.waitForResponse(
            response => response.url().includes('/api/auth/session') &&
            response.request().method() === 'GET'
        );

        // Log In action
        await logIn.clickLogIn();

        // API verification
        const credentialsResponse = await credentialsPromise;
        const sessionResponse = await sessionPromise;

        expect(credentialsResponse.status()).toBe(200);
        expect(sessionResponse.status()).toBe(200);

        const credentialsBody = await credentialsResponse.json();
        const sessionBody = await sessionResponse.json();

        expect(credentialsBody.url).toContain('error=Configuration');
        expect(sessionBody).toBeNull();

        // Error message verification
        const wrongLogInInfor = page.getByText('Sai thông tin đăng nhập. Mật khẩu hoặc Email/SĐT không đúng.');
        await expect(wrongLogInInfor).toBeVisible();
    });

    test('TC_06: Log in fail by password _ Empty password', async({page}) => {
        const logIn = new LogIn(page);

        // UI Verification
        await logIn.logIn();
        await logIn.emailInput.fill('mihhang2409@gmail.com');

        await logIn.rememberPass();
        await logIn.clickLogIn();
        
        const validationEmail = await logIn.passwordInput.evaluate(
            (input: HTMLInputElement) => input.validationMessage
        );
        expect(validationEmail).toBe('Please fill out this field.');
    });

    test('TC_07: Log in successful by OTP SMS', async({page}) => {
        const logIn = new LogIn(page);

        // UI Verification
        await logIn.logIn();
        await logIn.navOtpSms();
        await logIn.fillPhone('0971285897');

        // Catch sent OTP's API
        const sentOtpPromise = page.waitForResponse(
            response => response.url().includes('/api/v1/auth/otp/send') &&
            response.request().method() === 'POST'
        );

        // Sent OTP code action
        await logIn.sentOtpCode();

        // OTP's API verification
        const otpResponse = await sentOtpPromise;
        expect(otpResponse.status()).toBe(200);

        const otpBody = await otpResponse.json();
        expect(otpBody.success).toBe(true);
        expect(otpBody.data.message).toContain('OTP sent successfully (Sandbox: 888888)');

        // Fill OTP after receiving 
        await logIn.fillOtp('888888');

        // Catch Login's API
        const credentialsPromise = page.waitForResponse(
            response => response.url().includes('/api/auth/callback/credentials?') &&
            response.request().method() === 'POST'
        );

        const sessionPromise = page.waitForResponse(
            response => response.url().includes('/api/auth/session') &&
            response.request().method() === 'GET'
        );

        // Log In action
        await logIn.clickOtpLogIn();

        // API verification
        const credentialsResponse = await credentialsPromise;
        const sessionResponse = await sessionPromise;

        expect(credentialsResponse.status()).toBe(200);
        expect(sessionResponse.status()).toBe(200);

        const credentialsBody = await credentialsResponse.json();
        const sessionBody = await sessionResponse.json();

        expect(credentialsBody.url).toContain('/login');

        expect(sessionBody).not.toBeNull();
        expect(sessionBody.user.phone).toBe('0971285897');
        expect(sessionBody.user.id).toBeTruthy();
        expect(sessionBody.user.role).toBe('CUSTOMER');
    });

    test('TC_08: Log in fail by OTP SMS _ Invalid phone', async({page}) => {
        const logIn = new LogIn(page);

        // UI Verification
        await logIn.logIn();
        await logIn.navOtpSms();
        await logIn.fillPhone('09712858978900');

        // Sent OTP code action
        await logIn.sentOtpCode();

        // UI verification
        await expect(logIn.otpInput).not.toBeVisible();
    });

    test('TC_09: Log in successful by OTP SMS _ Empty phone', async({page}) => {
        const logIn = new LogIn(page);

        // UI Verification
        await logIn.logIn();
        await logIn.navOtpSms();

        // Sent OTP code action
        await logIn.sentOtpCode();

        // UI verification
        await expect(logIn.otpInput).not.toBeVisible();
    });

    test('TC_10: Log in fail by OTP SMS _ Invalid OTP', async({page}) => {
        const logIn = new LogIn(page);

        // UI Verification
        await logIn.logIn();
        await logIn.navOtpSms();
        await logIn.fillPhone('0971285897');

        // Catch sent OTP's API
        const sentOtpPromise = page.waitForResponse(
            response => response.url().includes('/api/v1/auth/otp/send') &&
            response.request().method() === 'POST'
        );

        // Sent OTP code action
        await logIn.sentOtpCode();

        // OTP's API verification
        const otpResponse = await sentOtpPromise;
        expect(otpResponse.status()).toBe(200);

        const otpBody = await otpResponse.json();
        expect(otpBody.success).toBe(true);
        expect(otpBody.data.message).toContain('OTP sent successfully (Sandbox: 888888)');

        // Fill OTP after receiving 
        await logIn.fillOtp('990099');

        // Catch Login's API
        const credentialsPromise = page.waitForResponse(
            response => response.url().includes('/api/auth/callback/credentials?') &&
            response.request().method() === 'POST'
        );

        const sessionPromise = page.waitForResponse(
            response => response.url().includes('/api/auth/session') &&
            response.request().method() === 'GET'
        );

        // Log In action
        await logIn.clickOtpLogIn();

        // API verification
        const credentialsResponse = await credentialsPromise;
        const sessionResponse = await sessionPromise;

        expect(credentialsResponse.status()).toBe(200);
        expect(sessionResponse.status()).toBe(200);

        const credentialsBody = await credentialsResponse.json();
        const sessionBody = await sessionResponse.json();

        expect(credentialsBody.url).toContain('error=Configuration');
        expect(sessionBody).toBeNull();

        // Error message verification
        const wrongLogInOtp = page.getByText('Số điện thoại chưa được đăng ký trong hệ thống hoặc không chính xác.');
        await expect(wrongLogInOtp).toBeVisible();
    });

    test('TC_11: Log in fail by OTP SMS _ Empty OTP', async({page}) => {
        const logIn = new LogIn(page);

        // UI Verification
        await logIn.logIn();
        await logIn.navOtpSms();
        await logIn.fillPhone('0971285897');
        await logIn.sentOtpCode();
        await logIn.clickOtpLogIn();
        
        const validationEmail = await logIn.otpInput.evaluate(
            (input: HTMLInputElement) => input.validationMessage
        );
        expect(validationEmail).toBe('Please fill out this field.');
    });

    test('TC_12: No Account flow', async({page}) => {
        const logIn = new LogIn(page);

        await logIn.logIn();
        await logIn.clickNoAccBtn();
        await expect(page).toHaveURL(/\/register/);
    });
})