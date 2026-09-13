import { test } from '../fixture/db_fixture';
import { expect } from '@playwright/test';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

const API = 'https://training-web-flower-sale.vercel.app/api/auth/register';
const csvFilePath = path.join(__dirname, '../data/users_data.csv');

interface UserRow {
  testCase: string;
  username: string;
  ho_kh: string;
  ten_kh: string;
  sdt: string;
  dia_chi: string;
  email: string;
  gioi_tinh: string; 
  ten_dn: string;
  mat_khau: string;
  captcha: string;
  apiStatus: number;
}

const REQUIRED_COLUMNS: (keyof UserRow)[] = [
  'testCase', 'username', 'ten_kh', 'sdt', 'dia_chi',
  'email', 'gioi_tinh', 'ten_dn', 'mat_khau', 'captcha',
];

function loadRows(): UserRow[] {
  if (!fs.existsSync(csvFilePath)) {
    throw new Error(`[CSV] Không tìm thấy file: ${csvFilePath}`);
  }

  const rows = parse(fs.readFileSync(csvFilePath, 'utf-8'), {
    columns: (header: string[]) => header.map((h) => h.trim()),
    skip_empty_lines: true,
    trim: true,
    bom: true, 
  }) as UserRow[];

  return rows;
}

const users = loadRows();

for (const [index, user] of users.entries()) {
  const rowNo = index + 2; 

  test(`Register | TC ${user.testCase} (dòng ${rowNo}) | ${user.email}`, async ({
    request,
    dbClient,
  }) => {

    await dbClient.query('DELETE FROM khach_hang WHERE email=$1', [user.email]);

    try {

      const res = await request.post(API, {
        data: {
          ho_kh: user.ho_kh,
          ten_kh: user.ten_kh,
          sdt: user.sdt,
          dia_chi: user.dia_chi,
          email: user.email,
          gioi_tinh: Number(user.gioi_tinh),
          ten_dn: user.ten_dn,
          mat_khau: user.mat_khau,
          captcha: user.captcha,
        },
      });

      const body = await res.text();
      expect(res.status(), `API trả ${res.status()} — body: ${body}`).toBe(Number(user.apiStatus));

      const dbRes = await dbClient.query(
        'SELECT * FROM khach_hang WHERE sdt=$1',
        [user.sdt],
      );

    } finally {
      await dbClient.query('DELETE FROM khach_hang WHERE email=$1', [user.email]);
    }
  });
}