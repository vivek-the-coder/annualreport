import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

const needsSsl =
  process.env.NODE_ENV === "production" ||
  /sslmode=require|neon\.tech|supabase\.co|vercel-storage|amazonaws\.com/i.test(
    databaseUrl,
  );

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    max: 5,
  });

// Reuse the pool across warm serverless invocations (Vercel).
globalForDb.__arenaNextJsPostgresqlPool = pool;

export const db = drizzle(pool);
