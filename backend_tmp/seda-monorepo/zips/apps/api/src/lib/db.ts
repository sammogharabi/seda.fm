// Placeholder DB client. Swap for Supabase JS or pg.
import { Pool } from "pg";
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
