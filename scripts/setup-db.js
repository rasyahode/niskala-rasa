import fs from 'fs';
import path from 'path';
import pg from 'pg';
import * as recipesModule from '../database/recipes-data.js';

const RECIPES_LIST =
  recipesModule.RECIPES_DATASET ||
  recipesModule.recipes ||
  recipesModule.RECIPES ||
  recipesModule.default ||
  Object.values(recipesModule).find((val) => Array.isArray(val)) ||
  [];

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

const SCHEMA_SQL = `
DROP TABLE IF EXISTS lesson_progress CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'teacher', 'student')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_code VARCHAR(50) NOT NULL DEFAULT 'ADM-001',
  department VARCHAR(100) NOT NULL DEFAULT 'Manajemen Kurikulum & Verifikasi',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teachers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  specialization VARCHAR(100) NOT NULL,
  cv_url TEXT,
  certificate_url TEXT,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_level VARCHAR(50) NOT NULL DEFAULT 'Pemula Nusantara',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL,
  dish_type VARCHAR(50) UNIQUE NOT NULL CHECK (
    dish_type IN ('berkuah', 'tidak_berkuah', 'camilan_kering', 'minuman', 'camilan_basah')
  ),
  title VARCHAR(200) NOT NULL,
  recipe_description TEXT NOT NULL,
  teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL
);

CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  dish_type VARCHAR(50) NOT NULL REFERENCES classes(dish_type) ON DELETE CASCADE,
  portion_estimate VARCHAR(80),
  dominant_taste VARCHAR(100),
  key_spice VARCHAR(120),
  summary TEXT NOT NULL,
  spice_technique TEXT,
  ingredients TEXT,
  instructions TEXT,
  video_url TEXT,
  image_url TEXT,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enrollments (
  id SERIAL PRIMARY KEY,
  student_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (student_user_id, class_id)
);

CREATE TABLE lesson_progress (
  id SERIAL PRIMARY KEY,
  student_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (student_user_id, recipe_id)
);
`;

const databaseUrl = getDatabaseUrl();
const { Pool } = pg;
const pool = new Pool({ connectionString: databaseUrl });

async function setupDatabase() {
  const client = await pool.connect();
  try {
    console.log('1/4 Membangun ulang 8 tabel PostgreSQL ternormalisasi...');
    await client.query(SCHEMA_SQL);

    // Sekaligus sinkronkan file database/schema.sql agar selalu rapi
    fs.writeFileSync(path.join(process.cwd(), 'database', 'schema.sql'), SCHEMA_SQL.trim());

    console.log('2/4 Mengisi tabel users, admins, teachers, dan students...');
    const adminUser = await client.query(
      `INSERT INTO users (full_name, email, password, role, status)
       VALUES ('Admin Utama Niskala Rasa Indonesia', 'admin@gmail.com', 'admin123', 'admin', 'approved')
       RETURNING id`
    );
    await client.query(
      `INSERT INTO admins (user_id, admin_code, department)
       VALUES ($1, 'ADM-NISKALA-01', 'Kepala Kurikulum & Verifikasi Pengajar')`,
      [adminUser.rows[0].id]
    );

    const teachersSeed = [
      {
        name: 'Raka Pratama Wijaya Kusuma Putra',
        email: 'raka@gmail.com',
        spec: 'Makanan Berkuah',
        dishType: 'berkuah',
        classTitle: 'Mastery Hidangan Berkuah & Rempah Nusantara',
        desc: 'Kuasai teknik ekstraksi kaldu bening, santan pecah terkendali, dan bumbu ulek khas Sumatera hingga Jawa.',
      },
      {
        name: 'Sari Dewi Lestari Putri Andini',
        email: 'sari@gmail.com',
        spec: 'Makanan Tidak Berkuah',
        dishType: 'tidak_berkuah',
        classTitle: 'Olahan Lauk Kering, Tumis & Bakar Autentik',
        desc: 'Pelajari teknik ungkep bumbu meresap, sambal Nusantara, dan pengolahan lauk pauk tradisional.',
      },
      {
        name: 'Dimas Aditya Nugraha Pratama Jaya',
        email: 'dimas@gmail.com',
        spec: 'Camilan Kering',
        dishType: 'camilan_kering',
        classTitle: 'Kue Kering Klasik & Camilan Renyah Tahan Lama',
        desc: 'Teknik pengovenan kue kering tradisional, penggorengan rempeyek renyah, dan keripik Nusantara.',
      },
      {
        name: 'Maya Kartika Sari Dewi Permata',
        email: 'maya@gmail.com',
        spec: 'Minuman',
        dishType: 'minuman',
        classTitle: 'Racikan Jamu & Minuman Rempah Tradisional',
        desc: 'Ekstraksi rimpang, balans gula aren, dan penyajian minuman herbal hangat maupun segar khas Indonesia.',
      },
      {
        name: 'Tari Rahmawati Putri Kusuma Ningrum',
        email: 'tari@gmail.com',
        spec: 'Camilan Basah',
        dishType: 'camilan_basah',
        classTitle: 'Kue Basah Kukus & Jajanan Pasar Tradisional',
        desc: 'Seni mengolah tepung ketan, daun suji, santan kental, dan gula merah untuk kue basah autentik.',
      },
    ];

    for (const t of teachersSeed) {
      const uRes = await client.query(
        `INSERT INTO users (full_name, email, password, role, status)
         VALUES ($1, $2, 'guru123', 'teacher', 'approved')
         RETURNING id`,
        [t.name, t.email]
      );
      const tRes = await client.query(
        `INSERT INTO teachers (user_id, specialization, cv_url, certificate_url, verified_at)
         VALUES ($1, $2, 'https://example.com/cv-instruktur.pdf', 'https://example.com/sertifikat-koki.pdf', NOW())
         RETURNING id`,
        [uRes.rows[0].id, t.spec]
      );
      await client.query(
        `INSERT INTO classes (category_name, dish_type, title, recipe_description, teacher_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [t.spec, t.dishType, t.classTitle, t.desc, tRes.rows[0].id]
      );
    }

    const studentUser = await client.query(
      `INSERT INTO users (full_name, email, password, role, status)
       VALUES ('Putri Lestari Kusuma Wardani', 'putri@gmail.com', 'murid123', 'student', 'approved')
       RETURNING id`
    );
    await client.query(
      `INSERT INTO students (user_id, skill_level) VALUES ($1, 'Menengah Nusantara')`,
      [studentUser.rows[0].id]
    );

    console.log(`3/4 Mengisi ${RECIPES_LIST.length} resep ke tabel recipes...`);
    const recipesImgDir = path.join(process.cwd(), 'public', 'images', 'recipes');
    const recipeImgFiles = fs.existsSync(recipesImgDir)
      ? fs.readdirSync(recipesImgDir)
      : [];
    const normImgKey = (raw) =>
      String(raw || '')
        .toLowerCase()
        .replace(/\.(png|jpe?g|webp)$/i, '')
        .replace(/&/g, ' dan ')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
    const imgLookup = recipeImgFiles.map((file) => ({
      file,
      key: normImgKey(file),
    }));
    const resolveImageUrl = (recipe) => {
      if (recipe.image_url) return recipe.image_url;
      const target = normImgKey(recipe.title);
      if (!target) return null;
      const exact = imgLookup.find((item) => item.key === target);
      if (exact) return `/images/recipes/${exact.file}`;
      const targetTokens = target.split(/\s+/).filter((t) => t.length > 1);
      let best = null;
      let bestScore = 0;
      for (const item of imgLookup) {
        const fileTokens = item.key.split(/\s+/).filter((t) => t.length > 1);
        const overlap = targetTokens.filter((t) => fileTokens.includes(t)).length;
        const bonus =
          item.key.includes(target) || target.includes(item.key) ? 2 : 0;
        const score = overlap + bonus;
        if (score > bestScore) {
          bestScore = score;
          best = item;
        }
      }
      return best && bestScore >= 1 ? `/images/recipes/${best.file}` : null;
    };

    for (const r of RECIPES_LIST) {
      await client.query(
        `INSERT INTO recipes (
          title, dish_type, portion_estimate, dominant_taste, key_spice,
          summary, spice_technique, ingredients, instructions, video_url, image_url, created_by
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,1)`,
        [
          r.title,
          r.dish_type,
          r.portion_estimate,
          r.dominant_taste,
          r.key_spice,
          r.summary,
          r.spice_technique,
          r.ingredients,
          r.instructions,
          r.video_url || 'https://youtu.be/T0F0vClQaWI',
          resolveImageUrl(r),
        ]
      );
    }

    console.log('4/4 SUKSES! Seluruh 8 tabel ternormalisasi berhasil dibuat & diisi.');
  } catch (err) {
    console.error('Error setup-db:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();
