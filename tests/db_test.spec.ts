// File: api_db_e2e.spec.ts — Chạy thật với training-web API + PostgreSQL
import { test } from '../fixture/db_fixture';
import { expect } from '@playwright/test';
 
const API = 'https://training-web-flower-sale.vercel.app/api';
 
test('Register → DB verify → Cleanup', async ({ request, dbClient }) => {
  const email = `e2e_${Date.now()}@test.com`;
  const username = `user1111_ging_${Date.now()}`;
 
  try {
    // 1. Gọi API thật — tạo user
    const res = await request.post(`${API}/auth/register`, {
      data: {
        ho_kh: 'EE Tester',
        ten_kh: 'EE Test',
        sdt: '0123456789',
        dia_chi: 'E2E Test Address',
        email: email,
        gioi_tinh: 1,
        ten_dn: username,
        mat_khau: 'Test@12345678',
        captcha: 'KS72W'
      }
    });
 
    expect(res.status()).toBe(201);
    console.log(res.body());
    // 2. Verify DB — user được tạo đúng
    const dbRes = await dbClient.query('SELECT * FROM khach_hang WHERE email=$1', [email]);
    
    expect(dbRes.rows.length).toBe(1);
    expect(dbRes.rows[0]).toMatchObject({
      email: email,
      ten_dn: username
    });
 
  } finally {
    // 3. Cleanup — xóa user test (Guaranteed to run even if expect() fails)
    await dbClient.query('DELETE FROM khach_hang WHERE email=$1', [email]);
  }
});

// import { test, expect } from '../fixture/db_fixture';
 
// // ⚠️ SQL INJECTION — PHẢI BIẾT ĐỂ TRÁNH
// // ❌ SAI:  db.query(`SELECT * FROM users WHERE email='${email}'`);
// // ✅ ĐÚNG: db.query('SELECT * FROM users WHERE email=$1', [email]);
// //    → $1 là "chỗ trống", [email] là giá trị điền vào — DB tự bảo vệ.
 
// test('Kiểm tra giá hoa', async ({ dbClient }) => {
//   // 1. Chạy câu SQL — tìm giá hoa có mã = '1'
//   const res = await dbClient.query(
//     'SELECT gia FROM public.hoa WHERE ma_hoa = $1',
//     ['1']     // ← Giá trị điền vào $1
//   );
 
//   // 2. Kiểm tra: có ít nhất 1 kết quả
//   expect(res.rows.length).toBeGreaterThan(0);
 
//   // 3. Lấy giá và kiểm tra giá trị
//   const gia_hoa = Number(res.rows[0].gia);  // Ép sang số
//   expect(gia_hoa).toBe(150000);              // Giá phải = 150.000đ
// });