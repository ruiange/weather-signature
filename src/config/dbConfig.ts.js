import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../db/schema.js';

export function createDb(connectionString) {
    return drizzle(neon(connectionString), { schema });
}
