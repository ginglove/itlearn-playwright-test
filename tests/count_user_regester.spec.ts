import { test } from '../fixture/db_fixture';
import { expect } from '@playwright/test';
import { parse } from 'csv-parse/sync';
import { createObjectCsvWriter } from 'csv-writer';
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
  apiStatus: string;
}

type ResultRow = UserRow & {
  status: 'PASS' | 'FAIL';
  countUserBefor: string;
  countUserAfter: string;
};

const results: ResultRow[] = [];

const RESULT_HEADERS = [
  'testCase', 'username', 'ho_kh', 'ten_kh', 'sdt', 'dia_chi', 'email',
  'gioi_tinh', 'ten_dn', 'mat_khau', 'captcha', 'apiStatus',
  'status', 'countUserBefor','countUserAfter'
];

function loadRows(): UserRow[] {

  const rows = parse(fs.readFileSync(csvFilePath, 'utf-8'), {
    columns: (header: string[]) => header.map((h) => h.trim()),
    skip_empty_lines: true,
    trim: true,
    bom: true,
    relax_column_count: true,
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
    const countAllUsers = async (): Promise<number> => {
      const r = await dbClient.query('SELECT COUNT(*)::int AS total FROM khach_hang');
      return r.rows[0].total;
    };

    await dbClient.query('DELETE FROM khach_hang WHERE email=$1', [user.email]);

    const countUsetBefor = await countAllUsers();
    console.log(`[TC ${user.testCase}] Số user trước khi đăng ký: ${countUsetBefor}`);

    let countUsetAfer: number | null = null;
    let isPassed = false;

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

      await dbClient.query('DELETE FROM khach_hang WHERE email=$1', [user.email]);
      countUsetAfer = await countAllUsers();
      console.log(`[TC ${user.testCase}] Số user sau khi đăng ký: ${countUsetAfer}`);

      const dbRes = await dbClient.query(
        'SELECT * FROM khach_hang WHERE sdt=$1',
        [user.sdt],
      );

      isPassed = true; 
    } finally {
      results.push({
        ...user,
        status: isPassed ? 'PASS' : 'FAIL',
        countUserBefor: countUsetBefor === null ? '' : String(countUsetBefor),
        countUserAfter: countUsetAfer === null ? '' : String(countUsetAfer),
      });

    }
  });
}

test.afterAll(async () => {
  //if (results.length === 0) return;

  const csvWriter = createObjectCsvWriter({
    path: csvFilePath,
    header: RESULT_HEADERS.map((h) => ({ id: h, title: h })),
  });

  const recordsToWrite = results.map((record) => {
    const row: Record<string, string> = {};
    for (const key of RESULT_HEADERS) {
      const value = (record as Record<string, unknown>)[key];
      row[key] = value !== undefined && value !== null ? String(value) : '';
    }
    return row;
  });

  await csvWriter.writeRecords(recordsToWrite);
});