import bcrypt from "bcryptjs";
import pool from "../src/lib/db.js";
import { SPICES_50_DATASET } from "../src/lib/spices-data.js";

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
        latin_name VARCHAR(150),
        plant_part VARCHAR(100),
        origin_region VARCHAR(120) NOT NULL,
        dominant_taste VARCHAR(50) NOT NULL,
        characteristics TEXT,
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

    await client.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        title VARCHAR(180) UNIQUE NOT NULL,
        teacher_name VARCHAR(120) NOT NULL,
        teacher_level VARCHAR(20) NOT NULL DEFAULT 'basic',
        indonesian_spice VARCHAR(120) NOT NULL,
        schedule_label VARCHAR(120) NOT NULL,
        recording_status VARCHAR(60) NOT NULL DEFAULT 'Diunggah untuk Siswa',
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS class_enrollments (
        id SERIAL PRIMARY KEY,
        class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (class_id, user_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS private_messages (
        id SERIAL PRIMARY KEY,
        class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sender_name VARCHAR(120) NOT NULL,
        sender_role VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
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

    for (const spice of SPICES_50_DATASET) {
      await client.query(
        `
        INSERT INTO spices (
          name, latin_name, plant_part, origin_region,
          dominant_taste, characteristics, processing_method
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (name) DO UPDATE SET
          latin_name = EXCLUDED.latin_name,
          plant_part = EXCLUDED.plant_part,
          origin_region = EXCLUDED.origin_region,
          dominant_taste = EXCLUDED.dominant_taste,
          characteristics = EXCLUDED.characteristics,
          processing_method = EXCLUDED.processing_method;
        `,
        [
          spice.name,
          spice.latin_name,
          spice.plant_part,
          spice.origin_region,
          spice.dominant_taste,
          spice.characteristics,
          spice.processing_method,
        ]
      );
    }

    await client.query(`
      INSERT INTO recipes (title, origin_country, indonesian_spices, dominant_taste, summary)
      VALUES
        ('Kolak Pisang Kayu Manis Kerinci', 'Indonesia', 'Kayu Manis, Kapulaga', 'manis', 'Hidangan penutup khas Indonesia berkuah santan hangat dengan aroma manis kayu manis dan kapulaga.'),
        ('Arsik Ikan Mas Andaliman', 'Indonesia', 'Andaliman, Asam Gelugur, Kecombrang (Honje)', 'asam', 'Masakan khas Batak, Indonesia dengan keasaman asam gelugur dan kesegaran pedas-kebas andaliman.'),
        ('Coto Makassar Rempah Pilihan', 'Indonesia', 'Cengkeh, Pala, Kapulaga, Jintan, Serai (Sereh)', 'pedas', 'Sup daging khas Makassar dengan racikan rempah Nusantara yang gurih hangat dan beraroma kuat.'),
        ('Rawon Hitam Keluwak', 'Indonesia', 'Kluwek (Kepayang), Kemukus, Cengkeh', 'pahit', 'Sup daging berkuah gelap khas Jawa Timur dengan karakter pahit-gurih keluwak dan kehangatan kemukus.'),
        ('Spiced Lamb Tagine', 'Maroko', 'Kayu Manis, Cengkeh, Kapulaga', 'manis', 'Rebusan daging domba khas Maroko dengan sentuhan manis hangat kayu manis dan cengkeh asal Indonesia.'),
        ('Spiced Chai Infusion', 'India', 'Kayu Manis, Kapulaga, Cengkeh, Jahe', 'manis', 'Seduhan teh rempah ala India yang diperkaya kayu manis, kapulaga, dan jahe.'),
        ('Citrus Herb Poached Fish', 'Yunani', 'Andaliman, Asam Gelugur', 'asam', 'Olahan ikan kuah segar gaya Mediterania dengan sentuhan asam dan aroma khas andaliman Indonesia.'),
        ('Smoked Pepper & Clove Roast Beef', 'Amerika Serikat', 'Cengkeh, Kemukus, Lada Hitam', 'pedas', 'Daging panggang dengan lapisan bumbu rempah pedas-hangat berbahan cengkeh, kemukus, dan lada hitam.'),
        ('Warm Nutmeg Cream Sauce', 'Prancis', 'Pala, Fuli (Bunga Pala)', 'pahit', 'Saus krim klasik Prancis dengan sentuhan aroma khas pala dan fuli yang diparut segar.')
      ON CONFLICT (title) DO NOTHING;
    `);

    await client.query(`
      INSERT INTO classes (
        title, teacher_name, teacher_level, indonesian_spice, schedule_label, recording_status, status
      )
      VALUES
        (
          'Sangrai & Infusi Kayu Manis Kerinci untuk Hidangan Manis',
          'Chef Basic',
          'basic',
          'Kayu Manis',
          'Studio & Rekaman · Sabtu 09:00 WITA',
          'Rekaman Full Terunggah',
          'active'
        ),
        (
          'Penerapan Andaliman & Asam Gelugur pada Resep Pilihan',
          'Chef Basic',
          'intermediate',
          'Andaliman',
          'Studio & Rekaman · Minggu 13:00 WITA',
          'Rekaman Full Terunggah',
          'active'
        ),
        (
          'Kontrol Panas Pala Banda & Kluwek pada Kuah Berempah',
          'Chef Basic',
          'advanced',
          'Pala',
          'Studio & Rekaman · Rabu 16:00 WITA',
          'Menunggu Upload Rekaman',
          'active'
        )
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
