import bcrypt from "bcryptjs";
import pool from "../src/lib/db.js";

async function setupDatabase() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'student',
        teacher_status VARCHAR(20) NOT NULL DEFAULT 'none',
        teacher_level VARCHAR(20),
        cv_info TEXT,
        professional_license TEXT,
        approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS teacher_level VARCHAR(20),
      ADD COLUMN IF NOT EXISTS cv_info TEXT,
      ADD COLUMN IF NOT EXISTS professional_license TEXT;
    `);

    await client.query(`DROP TABLE IF EXISTS spices CASCADE;`);
    await client.query(`
      CREATE TABLE spices (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        origin_region VARCHAR(120) NOT NULL,
        dominant_taste VARCHAR(50) NOT NULL,
        processing_method TEXT NOT NULL
      );
    `);

    await client.query(`DROP TABLE IF EXISTS recipes CASCADE;`);
    await client.query(`
      CREATE TABLE recipes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) UNIQUE NOT NULL,
        origin_country VARCHAR(100) NOT NULL,
        indonesian_spices TEXT NOT NULL,
        dominant_taste VARCHAR(50) NOT NULL,
        summary TEXT NOT NULL
      );
    `);

    const adminPass = await bcrypt.hash("admin123", 10);
    const teacherPass = await bcrypt.hash("teacher123", 10);
    const studentPass = await bcrypt.hash("student123", 10);
    const pendingPass = await bcrypt.hash("pending123", 10);

    await client.query(
      `
      INSERT INTO users (
        username, email, password_hash, role, teacher_status,
        teacher_level, cv_info, professional_license, approved_at
      )
      VALUES
        ('Admin Niskala', 'admin@niskalarasa.id', $1, 'admin', 'none', NULL, NULL, NULL, NULL),
        ('Chef Basic', 'teacher@niskalarasa.id', $2, 'teacher', 'approved', 'basic', 'CV Pengajar Dasar Rempah Nusantara (3 tahun)', 'LIS-REMPAH-BASIC-01', NOW()),
        ('Siswa Rempah', 'student@niskalarasa.id', $3, 'student', 'none', NULL, NULL, NULL, NULL),
        ('Calon Guru Adv', 'pending@niskalarasa.id', $4, 'student', 'pending', 'advanced', 'CV Spesialis Ekstraksi & Sangrai Rempah (6 tahun)', 'LIS-KULINER-ADV-09', NULL)
      ON CONFLICT (email) DO NOTHING;
      `,
      [adminPass, teacherPass, studentPass, pendingPass]
    );

    await client.query(`
      INSERT INTO spices (name, origin_region, dominant_taste, processing_method)
      VALUES
        ('Kayu Manis Kerinci', 'Jambi, Indonesia', 'manis', 'Sangrai singkat api kecil lalu giling atau infusi hangat.'),
        ('Cengkeh Maluku', 'Maluku, Indonesia', 'pedas', 'Sangrai ringan terukur atau seduh dalam kaldu/minyak rempah.'),
        ('Pala Banda', 'Maluku, Indonesia', 'pahit', 'Parut segar atau sangrai tipis untuk menjaga minyak atsiri.'),
        ('Andaliman', 'Sumatera Utara, Indonesia', 'asam', 'Haluskan segar di akhir proses agar sensasi segar & kebas terjaga.'),
        ('Kapulaga Hijau', 'Nusantara, Indonesia', 'manis', 'Memarkan polong sebelum disangrai ringan agar biji aktif.')
      ON CONFLICT (name) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO recipes (title, origin_country, indonesian_spices, dominant_taste, summary)
      VALUES
        ('Spiced Lamb Tagine', 'Maroko', 'Kayu Manis Kerinci, Cengkeh Maluku, Kapulaga Hijau', 'manis', 'Rebusan daging domba khas Maroko dengan sentuhan rempah hangat asal Indonesia.'),
        ('Spiced Chai Infusion', 'India', 'Kayu Manis Kerinci, Kapulaga Hijau, Cengkeh Maluku', 'manis', 'Seduhan teh rempah dengan karakter manis hangat kayu manis Kerinci dan kapulaga.'),
        ('Warm Nutmeg Cream Sauce', 'Prancis', 'Pala Banda', 'pahit', 'Saus krim gurih dengan aroma khas pala Banda yang diparut halus.'),
        ('Citrus Herb Poached Fish', 'Yunani', 'Andaliman, Kapulaga Hijau', 'asam', 'Olahan ikan berkuah segar dengan sentuhan asam aromatik andaliman dan kapulaga.')
      ON CONFLICT (title) DO NOTHING;
    `);

    await client.query("COMMIT");
    console.log("Setup database Niskala Rasa berhasil.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Gagal setup database:", error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();
