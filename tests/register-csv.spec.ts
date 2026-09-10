import { test } from '@playwright/test';
import { RegisterPage } from '../page/RegisterPage';
import { readCsv, updateTestCaseStatus } from '../utils/csv.helper';

test.describe('Kiểm thử Đăng ký bằng dữ liệu CSV', () => {
  const csvPath = 'data/register_data.csv';

  test('chạy testcase CSV', async ({ page }) => {
    const testCases = await readCsv(csvPath);
    const registerPage = new RegisterPage(page);

    for (const tc of testCases) {
      console.log(`\n--- Đang chạy [${tc.testCaseId}]: ${tc.description} ---`);
      let status: 'PASS' | 'FAIL';
      try {
        await registerPage.navigateFromCatalog();
        let email = tc.email;
        if (tc.email === 'AUTO_GENERATE') {
          email = `user_${Date.now()}@gmail.com`;
        }
        let phone = tc.phone;
        if (tc.phone === 'AUTO_GENERATE') {
          phone = '09' + Math.floor(10000000 + Math.random() * 90000000);
        }
        if (tc.fullName) {
          await registerPage.fullNameInput.fill(tc.fullName);
        }
        if (email) {
          await registerPage.emailInput.fill(email);
        }
        if (phone) {
          await registerPage.phoneInput.fill(phone);
        }
        if (tc.password) {
          await registerPage.passwordInput.fill(tc.password);
        }
        if (tc.confirmPassword) {
          await registerPage.confirmPasswordInput.fill(tc.confirmPassword);
        }
        if (tc.otp) {
          await registerPage.otpInput.fill(tc.otp);
        }

        if (tc.agreeTerms === 'true') {
          await registerPage.checkTerms();
        } else {
          await registerPage.uncheckTerms();
        }

        const isBlankField = !tc.fullName?.trim() || !email?.trim() || !phone?.trim() || !tc.password || !tc.confirmPassword;
        const isTermsUnchecked = tc.agreeTerms !== 'true';
        const isButtonEnabled = await registerPage.registerButton.isEnabled();
        if (isBlankField || isTermsUnchecked) {
          if (isButtonEnabled) {
            status = 'PASS';
          } else {
            status = 'FAIL';
          }
        }
        else if (tc.testCaseId === 'TC01') {

          if (!isButtonEnabled) {
            status = 'FAIL';
          } else {
            await registerPage.registerButton.click();
            const hasError = await registerPage.getActualErrorMessage();
            if (hasError) {
              status = 'FAIL';
            } else {
              status = 'PASS';
            }
          }
        }
        else {
          if (!isButtonEnabled) {

            await registerPage.registerButton.click();
            const actualError = await registerPage.getActualErrorMessage();
            if (actualError.length > 0) {
              status = 'PASS';
            } else {
              status = 'FAIL';
            }

          }
          else {

            status = 'PASS';
          }
        }

      } catch (err) {
        status = 'FAIL';
      }
      await updateTestCaseStatus(csvPath, tc.testCaseId, status);
      console.log(`=> Kết quả [${tc.testCaseId}]: ${status}`);
    }
  });
});
