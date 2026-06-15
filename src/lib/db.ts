import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL!);

// 用户表
export async function createUsersTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        password VARCHAR(255),
        image VARCHAR(500),
        free_credits INTEGER DEFAULT 3,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Users table created');
  } catch (error) {
    console.error('Error creating users table:', error);
  }
}

// 图片处理记录表
export async function createImagesTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        original_url TEXT NOT NULL,
        restored_url TEXT,
        upscaled_url TEXT,
        colorized_url TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        operation VARCHAR(50) NOT NULL,
        scale INTEGER DEFAULT 2,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Images table created');
  } catch (error) {
    console.error('Error creating images table:', error);
  }
}

export async function initDB() {
  await createUsersTable();
  await createImagesTable();
}
