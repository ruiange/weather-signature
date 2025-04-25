
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import dotenv from 'dotenv';
dotenv.config();
import * as schema from '../db/schema.js';

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql,{schema });

export default db