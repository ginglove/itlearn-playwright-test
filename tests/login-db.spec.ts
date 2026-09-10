import { test, expect } from '@playwright/test';
import { LoginPage, DemoRole } from '../page/login.page';
import { DatabaseHelper, UserDB } from '../utils/db.helper';

test.describe('Kiểm thử chức năng Đăng nhập', () => {
  let dbUser: UserDB | null = null;
  const dbHelper = new DatabaseHelper();
  test.beforeAll(async () => {
    dbUser = await dbHelper.getValidUser();
    if (dbUser) {
        console.log(dbUser.email);
    } else {
        console.log('Không lấy được tài khoản');
    }
  });
  test('TC01: Đăng nhập thành công với tài khoản hợp lệ từ DB', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    const account = dbUser?.email || dbUser?.phone;
    const validPassword = 'Password@123'; 
    await loginPage.login(account, validPassword);
    const hasError = await loginPage.getErrorMessage();
    expect(hasError).toBe('');
  });
//   test('TC01: Đăng nhập thành công với tài khoản hợp lệ từ DB', async ({ page }) => {
//   const loginPage = new LoginPage(page);

//   await loginPage.goto();

//   await loginPage.login(
//     dbUser!.email!,
//     dbUser!.password!
//   );

//   const hasError = await loginPage.getErrorMessage();

//   expect(hasError).toBe('');
// });

  test('TC02: Bỏ trống Email thì báo lỗi', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();

  await loginPage.login('', 'Password@123');

  const error = await loginPage.getErrorMessage();

  expect(error.length).toBeGreaterThan(0);
  });

  test('TC03: Bỏ trống Mật khẩu thì báo lỗi', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    const acc = dbUser?.email || dbUser?.phone;
    await loginPage.login(acc, '');
    const error = await loginPage.getErrorMessage();
    expect(error.length).toBeGreaterThan(0);
  });

  test('TC04: Nhập đúng Email nhưng Mật khẩu sai phải hiển thị lỗi', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    const acc = dbUser?.email || dbUser?.phone;
    await loginPage.login(acc, 'WrongPassword@999');
    const error = await loginPage.getErrorMessage();
    expect(error.length).toBeGreaterThan(0);
  });

  test('TC05: Đăng nhập với tài khoản chưa đăng ký phải hiển thị lỗi', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    const nonExistentEmail = `not_found_${Date.now()}@gmail.com`;
    await loginPage.login(nonExistentEmail, 'Password@123');
    const error = await loginPage.getErrorMessage();
    expect(error.length).toBeGreaterThan(0);
  });
  test('TC06: Số điện thoại chưa đăng ký phải hiển thị lỗi', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  const phone = `09${Date.now().toString().slice(-8)}`;
  await loginPage.login(phone, 'Password@123');
  const error = await loginPage.getErrorMessage();
  expect(error.length).toBeGreaterThan(0);
});

test('TC07: Kiểm thử 4 tài khoản Demo', async ({ page }) => {
  const loginPage = new LoginPage(page);

  const roles: DemoRole[] = [
    'admin',
    'sale',
    'manager',
    'customer'
  ];

  for (const role of roles) {
    await loginPage.goto();
    await loginPage.clickDemoAccount(role);
    expect(
      await loginPage.emailOrPhoneInput.inputValue()
    ).not.toBe('');
    expect(
      await loginPage.passwordInput.inputValue()
    ).not.toBe('');
    await loginPage.loginButton.click();
    expect(
      await loginPage.getErrorMessage()
    ).toBe('');
  }
});

});
