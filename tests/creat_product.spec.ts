import { test } from '../fixture/db_fixture';
import { expect } from '@playwright/test';
import { parse } from 'csv-parse/sync';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';



const API = 'https://training-web-flower-sale.vercel.app/api/products';
const csvFilePath = path.join(__dirname, '../data/product_data.csv');

interface UserRow {
  testCase: string;
  ten_hoa: string;
  ma_loai: string;
  gia: string;
  trang_thai: string;
  mo_ta: string;
  hinh_anh: string;
}

type ResultRow = UserRow & {
  status: 'PASS' | 'FAIL';
};

const results: ResultRow[] = [];

const RESULT_HEADERS = [
  'testCase', 'ten_hoa', 'ma_loai', 'gia', 'trang_thai', 'mo_ta', 'hinh_anh',
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

    test(`Register | TC ${user.testCase} (dòng ${rowNo}) | ${user.ten_hoa}`, async ({
    request,
    dbClient,
  }) => {
    const countAllUsers = async (): Promise<number> => {
      const r = await dbClient.query('SELECT COUNT(*)::int AS total FROM hoa');
      return r.rows[0].total;
    };

    let countUsetAfer: number | null = null;
    let isPassed = false;

    try {
      const res = await request.post(API, {
        data: {
          testCase: user.testCase,
          ten_hoa: user.ten_hoa,
          ma_loai: user.ma_loai,
          gia: user.gia,
          trang_thai: user.trang_thai,
          mo_ta: user.mo_ta,
          hinh_anh: user.hinh_anh,
        },
      });

      // GET lai san pham vua tao theo id.
      // GIA DINH: POST tra ve JSON co truong `id` o cap ngoai cung.
      const created = await res.json();
      const id = created.id;
      const res1 = await request.get(`${API}/${id}`);
      console.log(res1.body);


      isPassed = true; 
    } finally {
      results.push({
        ...user,
        status: isPassed ? 'PASS' : 'FAIL',
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