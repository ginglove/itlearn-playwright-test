import { test, expect, APIRequestContext, APIResponse } from '@playwright/test';

const BASE_URL =
  process.env.API_BASE_URL ?? 'https://training-web-class-management.vercel.app/api';

const LOGIN_URL = `${BASE_URL}/auth/login`;
const REGISTER_URL = `${BASE_URL}/auth/register`;

/** Account ACTIVE dùng cho case 200 và 401. */
const VALID_USER = 'creator1';
const VALID_PASSWORD = 'Password@123';
const WRONG_PASSWORD = 'WrongPassword@999';

/** Body trả về dạng JSON; nếu server trả HTML/text thì fail với thông báo rõ ràng. */
async function jsonBody(res: APIResponse): Promise<any> {
  const raw = await res.text();
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(
      `Response không phải JSON (status ${res.status()}). Body: ${raw.slice(0, 300)}`,
    );
  }
}

function login(request: APIRequestContext, data: Record<string, unknown>) {
  return request.post(LOGIN_URL, { data });
}

/**
 * Đăng ký 1 account mới để test 403 / 423.
 * Theo doc chương 3.3: user mới có status=INACTIVE, email_verified=false.
 */
async function registerThrowawayUser(
  request: APIRequestContext,
  prefix: string,
): Promise<{ username: string; email: string; password: string }> {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const username = `${prefix}${suffix}`.slice(0, 50);
  const email = `${username}@example.com`;
  const password = 'Password@123';

  const res = await request.post(REGISTER_URL, {
    data: {
      full_name: 'Test Auto User',
      email,
      username,
      password,
      confirm_password: password,
      // Rate limit register: 5 request/phút/IP
    },
  });

  if (res.status() !== 201) {
    throw new Error(
      `Không tạo được user test qua POST /auth/register — status ${res.status()}, body: ${(
        await res.text()
      ).slice(0, 300)}`,
    );
  }

  return { username, email, password };
}

// Chạy serial: các case sai password tác động lên failed_login_count trên DB thật.
test.describe.configure({ mode: 'serial' });

test.describe('POST /auth/login', () => {
  // ------------------------------------------------------ 200 OK

  test('TC01 - 200 OK: login đúng credentials trả về token và thông tin user', async ({
    request,
  }) => {
    const res = await login(request, {
      username_or_email: VALID_USER,
      password: VALID_PASSWORD,
      // Không truyền remember_me -> verify default (TTL refresh token 7 ngày).
    });

    expect(res.status(), 'login đúng credentials phải trả 200').toBe(200);
    expect(res.headers()['content-type'] ?? '', 'Content-Type phải là application/json').toContain(
      'application/json',
    );

    const body = await jsonBody(res);
    expect(body.success, 'success phải = true').toBe(true);
    expect(body.timestamp, 'response phải có timestamp').toBeTruthy();
    expect(
      Number.isNaN(new Date(body.timestamp).getTime()),
      'timestamp phải là ISO8601 hợp lệ',
    ).toBe(false);

    const d = body.data;
    expect(d, 'phải có object data').toBeTruthy();
    expect(typeof d.access_token, 'access_token phải là string').toBe('string');
    expect(d.access_token.length, 'access_token không được rỗng').toBeGreaterThan(0);
    expect(typeof d.refresh_token, 'refresh_token phải là string').toBe('string');
    expect(d.refresh_token.length, 'refresh_token không được rỗng').toBeGreaterThan(0);
    expect(d.token_type, 'token_type phải = Bearer').toBe('Bearer');
    expect(d.expires_in, 'expires_in phải = 900 giây').toBe(900);

    expect(d.user, 'phải có object user').toBeTruthy();
    expect(typeof d.user.id, 'user.id phải là string').toBe('string');
    expect(d.user.id, 'user.id phải là UUID').toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(typeof d.user.full_name, 'user.full_name phải là string').toBe('string');
    expect(
      ['ADMIN', 'APPROVER', 'REVIEWER', 'CREATOR'],
      'user.role phải là 1 trong 4 role hợp lệ',
    ).toContain(d.user.role);
  });

  test('TC02 - 200 OK: remember_me = true vẫn login thành công (TTL refresh token 30 ngày)', async ({
    request,
  }) => {
    // Không assert được TTL 30 ngày từ response: /auth/login không trả expires_at
    // của refresh_token. Muốn verify cần GET /users/me/sessions hoặc query DB.
    const res = await login(request, {
      username_or_email: VALID_USER,
      password: VALID_PASSWORD,
      remember_me: true,
    });

    expect(res.status()).toBe(200);
    const body = await jsonBody(res);
    expect(body.success).toBe(true);
    expect(body.data.refresh_token, 'phải trả refresh_token').toBeTruthy();
  });

  // ------------------------------------------------- 401 Unauthorized

  test('TC03 - 401 ERR_INVALID_CREDENTIALS: sai password', async ({ request }) => {
    const res = await login(request, {
      username_or_email: VALID_USER,
      password: WRONG_PASSWORD,
    });

    expect(res.status(), 'sai password phải trả 401').toBe(401);

    const body = await jsonBody(res);
    expect(body.success, 'success phải = false').toBe(false);
    expect(body.error_code).toBe('ERR_INVALID_CREDENTIALS');
    expect(body.details, 'phải có details.remaining_attempts').toBeTruthy();
    expect(typeof body.details.remaining_attempts, 'remaining_attempts phải là number').toBe(
      'number',
    );
    expect(body.details.remaining_attempts, 'remaining_attempts phải trong khoảng 0..4')
      .toBeGreaterThanOrEqual(0);
    expect(body.details.remaining_attempts).toBeLessThan(5);
    expect(body.data?.access_token, 'không được trả access_token khi sai password').toBeUndefined();
  });

  test('TC04 - 401 Anti-enumeration: user không tồn tại trả lỗi giống hệt sai password', async ({
    request,
  }) => {
    const notExist = await login(request, {
      username_or_email: 'user_khong_ton_tai_99999',
      password: VALID_PASSWORD,
    });
    const wrongPass = await login(request, {
      username_or_email: VALID_USER,
      password: WRONG_PASSWORD,
    });

    expect(notExist.status(), 'user không tồn tại phải trả 401').toBe(401);
    expect(notExist.status(), 'status phải giống case sai password').toBe(wrongPass.status());

    const a = await jsonBody(notExist);
    const b = await jsonBody(wrongPass);
    expect(a.error_code).toBe('ERR_INVALID_CREDENTIALS');
    expect(a.error_code, 'error_code phải giống nhau — không lộ user nào tồn tại').toBe(
      b.error_code,
    );
    expect(a.message, 'message phải giống nhau — không lộ user nào tồn tại').toBe(b.message);
  });

  // ---------------------------------------------------- 403 Forbidden

  test('TC05 - 403 ERR_ACCOUNT_INACTIVE: tài khoản mới đăng ký chưa kích hoạt', async ({
    request,
  }) => {
    // User vừa register có status=INACTIVE (doc chương 3.3) → login phải bị chặn.
    const user = await registerThrowawayUser(request, 'inactive_');

    const res = await login(request, {
      username_or_email: user.username,
      password: user.password,
    });

    expect(res.status(), 'account INACTIVE phải trả 403').toBe(403);
    const body = await jsonBody(res);
    expect(body.success).toBe(false);
    expect(body.error_code).toBe('ERR_ACCOUNT_INACTIVE');
    expect(body.message, 'phải có message mô tả lỗi').toBeTruthy();
    expect(body.data?.access_token, 'không được trả token').toBeUndefined();
  });

  test('TC06 - 403 ERR_EMAIL_NOT_VERIFIED: email chưa xác nhận', async ({ request }) => {
    // Cần account status=ACTIVE nhưng email_verified=false — KHÔNG tạo được bằng
    // /auth/register (user mới là INACTIVE nên sẽ trả ERR_ACCOUNT_INACTIVE trước).
    // Set env để bật test này: UNVERIFIED_USER=<username> UNVERIFIED_PASS=<password>
    const username = process.env.UNVERIFIED_USER;
    const password = process.env.UNVERIFIED_PASS;
    test.skip(
      !username || !password,
      'Cần account ACTIVE + email chưa verify. Set env UNVERIFIED_USER / UNVERIFIED_PASS để chạy.',
    );

    const res = await login(request, { username_or_email: username, password });

    expect(res.status(), 'email chưa verify phải trả 403').toBe(403);
    const body = await jsonBody(res);
    expect(body.success).toBe(false);
    expect(body.error_code).toBe('ERR_EMAIL_NOT_VERIFIED');
    expect(body.message).toBeTruthy();
  });

  // ------------------------------------------------------- 423 Locked

  test('TC07 - 423 ERR_ACCOUNT_LOCKED: sai password 5 lần liên tiếp → khóa 15 phút', async ({
    request,
  }) => {
    test.setTimeout(120_000); // 6 request x bcrypt ~150ms + cold start Vercel

    // Mặc định: tự đăng ký user mới để khóa, không ảnh hưởng 4 account test data.
    // Nếu cần dùng account ACTIVE có sẵn: LOCKOUT_USER=<username> LOCKOUT_PASS=<password>
    const envUser = process.env.LOCKOUT_USER;
    const envPass = process.env.LOCKOUT_PASS;
    const target = envUser && envPass
      ? { username: envUser, password: envPass }
      : await registerThrowawayUser(request, 'lockout_');

    const statuses: number[] = [];
    for (let i = 1; i <= 5; i++) {
      const res = await login(request, {
        username_or_email: target.username,
        password: WRONG_PASSWORD,
      });
      statuses.push(res.status());

      if (res.status() === 403) {
        const b = await jsonBody(res);
        throw new Error(
          `Lần sai thứ ${i} trả 403 ${b.error_code} thay vì 401. ` +
            'Server chặn theo status ACTIVE TRƯỚC khi tăng failed_login_count, ' +
            'nên account vừa register (INACTIVE) không bao giờ bị khóa. ' +
            'Cần 1 account ACTIVE dùng riêng: chạy lại với LOCKOUT_USER / LOCKOUT_PASS.',
        );
      }
    }

    // Doc mô tả không rõ 423 xuất hiện ở lần thứ 5 hay thứ 6 (lần 5 vẫn trả 401
    // nhưng đã SET locked_until). Probe thêm 1 lần bằng password ĐÚNG:
    // theo DB logic, check lockout đứng trước verify password → vẫn phải 423.
    const probe = await login(request, {
      username_or_email: target.username,
      password: target.password,
    });

    expect(
      probe.status(),
      `Sau 5 lần sai (statuses: ${statuses.join(',')}), login kể cả password ĐÚNG phải trả 423`,
    ).toBe(423);

    const body = await jsonBody(probe);
    expect(body.success).toBe(false);
    expect(body.error_code).toBe('ERR_ACCOUNT_LOCKED');
    expect(body.details, 'phải có details.unlock_at').toBeTruthy();
    expect(body.details.unlock_at, 'unlock_at phải là timestamp hợp lệ').toBeTruthy();

    const unlockAt = new Date(body.details.unlock_at).getTime();
    expect(Number.isNaN(unlockAt), 'unlock_at phải parse được thành Date').toBe(false);
    expect(unlockAt, 'unlock_at phải ở tương lai').toBeGreaterThan(Date.now());
    expect(
      unlockAt - Date.now(),
      'unlock_at phải trong vòng ~15 phút kể từ hiện tại',
    ).toBeLessThanOrEqual(16 * 60 * 1000);
    expect(body.data?.access_token, 'không được trả token khi bị khóa').toBeUndefined();
  });

  // -------------------------------------------------------- CLEANUP

  test.afterAll(async ({ playwright }) => {
    // TC03 + TC04 đã tăng failed_login_count của creator1 (2 lần sai).
    // Login đúng để reset về 0, tránh tích lũy tới ngưỡng khóa khi chạy lại nhiều lần.
    const ctx = await playwright.request.newContext();
    try {
      await ctx.post(LOGIN_URL, {
        data: { username_or_email: VALID_USER, password: VALID_PASSWORD },
      });
    } finally {
      await ctx.dispose();
    }
  });
});
