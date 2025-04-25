import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

// 👇 用模板字面量调用 sql
await sql`CREATE TABLE IF NOT EXISTS request_logs (
  id SERIAL PRIMARY KEY,
  method TEXT NOT NULL,
  url TEXT NOT NULL,
  ip TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);`;

console.log("✅ Table created successfully");
