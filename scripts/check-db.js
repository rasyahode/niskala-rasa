import fs from 'fs';
import path from 'path';
import pg from 'pg';

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  for (const envFile of ['.env.local', '.env']) {
    const fullPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const match = content.match(/^DATABASE_URL\s*=\s*["']?(.+?)["']?\s*$/m);
      if (match) return match[1].trim();
    }
  }
  return null;
}

const { Pool } = pg;
const pool = new Pool({ connectionString: getDatabaseUrl() });

async function checkDatabase() {
  try {
    console.log('\n=== 1. TABEL USERS (INDUK AKUN) ===');
    const users = await pool.query('SELECT id, full_name, email, role, status FROM users ORDER BY id');
    console.table(users.rows);

    console.log('\n=== 2. TABEL ADMINS ===');
    const admins = await pool.query('SELECT * FROM admins ORDER BY id');
    console.table(admins.rows);

    console.log('\n=== 3. TABEL TEACHERS ===');
    const teachers = await pool.query('SELECT * FROM teachers ORDER BY id');
    console.table(teachers.rows);

    console.log('\n=== 4. TABEL STUDENTS ===');
    const students = await pool.query('SELECT * FROM students ORDER BY id');
    console.table(students.rows);

    console.log('\n=== 5. TABEL ENROLLMENTS (KELAS DIPILIH MURID) ===');
    const enrollments = await pool.query('SELECT * FROM enrollments ORDER BY id');
    console.table(enrollments.rows);
  } catch (err) {
    console.error('Gagal membaca database:', err.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();