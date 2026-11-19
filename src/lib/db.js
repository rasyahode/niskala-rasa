import { Pool } from "pg";

// Satu Pool dipakai bersama oleh seluruh halaman, action, dan API.
const globalForPg = globalThis;
const pool =
    globalForPg.__pgPool ||
    new Pool({ connectionString: process.env.DATABASE_URL });
if (process.env.NODE_ENV !== "production") globalForPg.__pgPool = pool;

export default pool;