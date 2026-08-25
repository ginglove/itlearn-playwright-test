import { test as base } from '@playwright/test';
import { Pool, PoolClient } from 'pg';
import 'dotenv/config';
 
 
// ✅ 1. VALIDATION — Kiểm tra env vars ngay khi module được load
const requiredVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const v of requiredVars) {
  if (!process.env[v]) {
    throw new Error(`❌ Missing required environment variable: ${v}`);
  }
}
 
// Khởi tạo Connection Pool cho PostgreSQL (Dùng chung cho toàn bộ test runner)
const pgPool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});
 
// Khai báo Type cho Custom Fixture
type MyFixtures = {
  dbClient: PoolClient;
};
 
// Định nghĩa Custom Fixture với tự động Connect và Release
export const test = base.extend<MyFixtures>({
  dbClient: async ({}, use) => {
    // 1. Mượn 1 Client kết nối từ Pool trước khi Test bắt đầu
    const client = await pgPool.connect();
    
    // 2. Cấp Client cho Test case sử dụng
    await use(client);
    
    // 3. Tự động trả (release) Client lại cho Pool sau khi Test kết thúc
    client.release();
  },
});
 
export { expect } from '@playwright/test';
 
// Giải phóng toàn bộ Pool khi tất cả test kết thúc (Tránh treo process)
test.afterAll(async () => {
  await pgPool.end();
});
 