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