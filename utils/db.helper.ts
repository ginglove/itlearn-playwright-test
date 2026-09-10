import { Pool, PoolClient } from 'pg';
import 'dotenv/config';

export interface UserDB {
  id?: string;
  email?: string;
  phone?: string;
  full_name?: string;
  role?: string;
}

export class DatabaseHelper {
  private pool: Pool;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('❌ Missing DATABASE_URL');
    }

    // Tạo PostgreSQL Connection Pool
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  async getValidUser(): Promise<UserDB | null> {
    let client: PoolClient | undefined;

    try {
      // Lấy connection từ Pool
      client = await this.pool.connect();

      console.log('✅ Kết nối Database thành công');

      // Query Database
      const result = await client.query(`
        SELECT id, email, phone, full_name, role
        FROM users
        WHERE email IS NOT NULL
        LIMIT 1
      `);

      if (result.rows.length === 0) {
        console.log('⚠️ Không tìm thấy user');
        return null;
      }

      console.log(
        '✅ User lấy từ Database:',
        result.rows[0].email
      );

      return result.rows[0];

    } catch (error) {
      console.error(
        '❌ Không thể kết nối Database:',
        (error as Error).message
      );

      return null;

    } finally {
      // Trả connection về Pool
      client?.release();
    }
  }

  async close(): Promise<void> {
    // Đóng toàn bộ Pool
    await this.pool.end();
  }
}