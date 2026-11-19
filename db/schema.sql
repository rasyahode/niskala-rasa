-- =====================================================================
-- SCHEMA.SQL BARU: NISKALA RASA (ICE Spice Blending & Masterclasses)
-- Database target: niskala-rasa
-- =====================================================================

-- 1. PENGGUNA & MANAJEMEN PERAN (Admin, Teacher, Student)
CREATE TABLE IF NOT EXISTS users (
  id             SERIAL PRIMARY KEY,
  username       VARCHAR(100) NOT NULL,
  email          VARCHAR(150) UNIQUE NOT NULL,
  password_hash  VARCHAR(100) NOT NULL,
  role           VARCHAR(20)  NOT NULL DEFAULT 'student'
                 CHECK (role IN ('admin','teacher','student')),
  teacher_status VARCHAR(20)  NOT NULL DEFAULT 'none'
                 CHECK (teacher_status IN ('none','pending','approved')),
  approved_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 2. KURSUS, MATERI, PROGRES, SERTIFIKAT & CATATAN SENSORIK
CREATE TABLE IF NOT EXISTS categories (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS courses (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  teacher_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  start_date  DATE,
  end_date    DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS contents (
  id          SERIAL PRIMARY KEY,
  course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       VARCHAR(200) NOT NULL,
  body        TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL,
  video_url   VARCHAR(300),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, order_index)
);

CREATE TABLE IF NOT EXISTS enrollments (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS enrollment_progress (
  enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  content_id    INTEGER NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  done_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (enrollment_id, content_id)
);

CREATE TABLE IF NOT EXISTS comments (
  id         SERIAL PRIMARY KEY,
  content_id INTEGER NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS certificates (
  id        SERIAL PRIMARY KEY,
  user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  code      VARCHAR(30) UNIQUE NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS tasting_notes (
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_id INTEGER NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  note       TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, content_id)
);

-- 3. SESI KELAS HYBRID (Live Streaming & Studio Makassar)
CREATE TABLE IF NOT EXISTS class_sessions (
  id            SERIAL PRIMARY KEY,
  course_id     INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title         VARCHAR(200) NOT NULL,
  mode          VARCHAR(10) NOT NULL CHECK (mode IN ('online','offline')),
  starts_at     TIMESTAMPTZ NOT NULL,
  location      VARCHAR(200),
  stream_url    VARCHAR(300),
  recording_url VARCHAR(300),
  quota         INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS session_bookings (
  id         SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status     VARCHAR(20) NOT NULL CHECK (status IN ('booked','online_fallback')),
  attended   BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, user_id)
);

-- 4. KURIKULUM REMPAH ICE MASTERCLASS (Ensiklopedia, Formula Blending, Metode ICE)
CREATE TABLE IF NOT EXISTS spices (
  id              SERIAL PRIMARY KEY,
  code            VARCHAR(15) UNIQUE NOT NULL,
  name            VARCHAR(120) UNIQUE NOT NULL,
  short_name      VARCHAR(60) NOT NULL,
  botanical_name  VARCHAR(150) NOT NULL,
  plant_part      VARCHAR(100) NOT NULL,
  type            VARCHAR(30) NOT NULL,
  origin          VARCHAR(150) NOT NULL,
  lat             NUMERIC(6,2),
  lng             NUMERIC(6,2),
  aroma_compounds TEXT NOT NULL DEFAULT '',
  profile         TEXT NOT NULL DEFAULT '',
  activation_tech TEXT NOT NULL DEFAULT '',
  pairing_spices  TEXT NOT NULL DEFAULT '',
  blending_ratio  VARCHAR(150) NOT NULL DEFAULT '',
  storage_notes   TEXT NOT NULL DEFAULT '',
  dominant_pillar VARCHAR(15) NOT NULL
                  CHECK (dominant_pillar IN ('manis','asam','asin','pahit','pedas','umami')),
  manis           INTEGER NOT NULL DEFAULT 0 CHECK (manis BETWEEN 0 AND 10),
  asam            INTEGER NOT NULL DEFAULT 0 CHECK (asam BETWEEN 0 AND 10),
  asin            INTEGER NOT NULL DEFAULT 0 CHECK (asin BETWEEN 0 AND 10),
  pahit           INTEGER NOT NULL DEFAULT 0 CHECK (pahit BETWEEN 0 AND 10),
  pedas           INTEGER NOT NULL DEFAULT 0 CHECK (pedas BETWEEN 0 AND 10),
  umami           INTEGER NOT NULL DEFAULT 0 CHECK (umami BETWEEN 0 AND 10)
);

CREATE TABLE IF NOT EXISTS spice_blends (
  id                SERIAL PRIMARY KEY,
  code              VARCHAR(15) UNIQUE NOT NULL,
  name              VARCHAR(150) NOT NULL,
  curriculum_cat    VARCHAR(100) NOT NULL,
  composition_ratio TEXT NOT NULL,
  prep_method_ice   TEXT NOT NULL,
  sensory_profile   TEXT NOT NULL,
  dish_applications TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS masterclass_methods (
  id                SERIAL PRIMARY KEY,
  curriculum_stage  VARCHAR(100) NOT NULL,
  technique_name    VARCHAR(150) NOT NULL,
  technical_desc    TEXT NOT NULL,
  practical_example TEXT NOT NULL
);

-- 5. KATALOG RESEP & PENCARIAN BERDASARKAN DOMINAN RASA REMPAH
CREATE TABLE IF NOT EXISTS recipe_categories (
  id    SERIAL PRIMARY KEY,
  slug  VARCHAR(60) UNIQUE NOT NULL,
  name  VARCHAR(100) NOT NULL,
  blurb TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS recipes (
  id             SERIAL PRIMARY KEY,
  dataset_id     INTEGER UNIQUE,
  name           VARCHAR(150) NOT NULL,
  category_id    INTEGER REFERENCES recipe_categories(id) ON DELETE SET NULL,
  region         VARCHAR(100),
  country        VARCHAR(60),
  minutes        INTEGER NOT NULL DEFAULT 0,
  difficulty     VARCHAR(10) NOT NULL DEFAULT 'Sedang'
                 CHECK (difficulty IN ('Mudah','Sedang','Sulit')),
  dominant_taste VARCHAR(15) NOT NULL DEFAULT 'umami'
                 CHECK (dominant_taste IN ('manis','asam','asin','pahit','pedas','umami')),
  spices_text    TEXT NOT NULL DEFAULT '',
  description    TEXT NOT NULL DEFAULT '',
  tools          TEXT NOT NULL DEFAULT '',
  ingredients    TEXT NOT NULL DEFAULT '',
  steps          TEXT[] NOT NULL DEFAULT '{}',
  overview       TEXT[] NOT NULL DEFAULT '{}',
  authenticity   VARCHAR(120),
  image_url      VARCHAR(400)
);

CREATE TABLE IF NOT EXISTS recipe_spices (
  recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  spice_id  INTEGER NOT NULL REFERENCES spices(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, spice_id)
);

CREATE TABLE IF NOT EXISTS spice_effects (
  id      SERIAL PRIMARY KEY,
  keyword VARCHAR(60) UNIQUE NOT NULL,
  pillar  VARCHAR(15) NOT NULL,
  effect  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contents_course     ON contents(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_enroll_user         ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_spices_dominant     ON spices(dominant_pillar);
CREATE INDEX IF NOT EXISTS idx_recipes_cat         ON recipes(category_id);
CREATE INDEX IF NOT EXISTS idx_recipes_dominant    ON recipes(dominant_taste);
CREATE INDEX IF NOT EXISTS idx_recipe_spices_spice ON recipe_spices(spice_id);
