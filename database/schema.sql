-- =========================================================
-- 1. SCHEMA DATABASE POSTGRESQL - NISKALA RASA
-- =========================================================

BEGIN;

DROP TABLE IF EXISTS private_messages CASCADE;
DROP TABLE IF EXISTS class_enrollments CASCADE;
DROP TABLE IF EXISTS material_discussions CASCADE;
DROP TABLE IF EXISTS class_material_progress CASCADE;
DROP TABLE IF EXISTS class_materials CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS spices CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Tabel Pengguna (Admin, Teacher 4 Jenjang, Student)
CREATE TABLE users (
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

-- Tabel Kategori Kelas
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

-- Tabel 50 Rempah Khas Indonesia
CREATE TABLE spices (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  latin_name VARCHAR(150),
  plant_part VARCHAR(100),
  origin_region VARCHAR(120) NOT NULL DEFAULT 'Indonesia',
  dominant_taste VARCHAR(50) NOT NULL,
  characteristics TEXT,
  processing_method TEXT NOT NULL
);

-- Tabel Resep (Khas Indonesia & Luar Negeri Berempah Indonesia)
CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) UNIQUE NOT NULL,
  origin_country VARCHAR(100) NOT NULL,
  indonesian_spices TEXT NOT NULL,
  dominant_taste VARCHAR(50) NOT NULL,
  summary TEXT NOT NULL
);

-- Tabel Kelas (Satu Pelaksanaan di Studio + Rekaman Penuh Diunggah Admin)
CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(180) UNIQUE NOT NULL,
  category_name VARCHAR(100) NOT NULL DEFAULT 'Rempah Nusantara',
  start_date DATE,
  end_date DATE,
  teacher_name VARCHAR(120) NOT NULL,
  teacher_level VARCHAR(20) NOT NULL DEFAULT 'basic',
  indonesian_spice VARCHAR(120) NOT NULL,
  schedule_label VARCHAR(120) NOT NULL,
  recording_status VARCHAR(80) NOT NULL DEFAULT 'Menunggu Unggahan Video oleh Admin',
  recording_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel Materi Kelas Berurutan
CREATE TABLE class_materials (
  id SERIAL PRIMARY KEY,
  class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  order_index INT NOT NULL DEFAULT 1,
  title VARCHAR(180) NOT NULL,
  content_body TEXT NOT NULL
);

-- Tabel Progres Penyelesaian Materi Siswa
CREATE TABLE class_material_progress (
  id SERIAL PRIMARY KEY,
  material_id INT NOT NULL REFERENCES class_materials(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (material_id, user_id)
);

-- Tabel Forum Diskusi per Materi
CREATE TABLE material_discussions (
  id SERIAL PRIMARY KEY,
  material_id INT NOT NULL REFERENCES class_materials(id) ON DELETE CASCADE,
  sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_name VARCHAR(120) NOT NULL,
  sender_role VARCHAR(20) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabel Pendaftaran / Pilihan Kelas Siswa
CREATE TABLE class_enrollments (
  id SERIAL PRIMARY KEY,
  class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (class_id, user_id)
);

-- Tabel Chat Privat Siswa - Guru
CREATE TABLE private_messages (
  id SERIAL PRIMARY KEY,
  class_id INT NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_name VARCHAR(120) NOT NULL,
  sender_role VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

COMMIT;