<div align="center">

# 🍲 Niskala Rasa

> **Platform Kursus & Katalog Kuliner Nusantara Berbasis Web dengan Manajemen Peran Terintegrasi.**

![Next.js](https://img.shields.io/badge/Next.js-16.4.6-000000?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.3.0-20232A?style=for-the-badge&logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

<img src="public/images/logo%20niskala%20rasa.jpg" alt="Niskala Rasa Banner" width="220" style="border-radius: 16px;" />

[Tentang Proyek](#-about-the-project) • [Fitur Utama](#-features) • [Tech Stack](#-tech-stack) • [Instalasi](#-getting-started) • [Struktur Folder](#-project-structure) • [Panduan Penggunaan](#-usage)

</div>

---

## 📖 About The Project

**Niskala Rasa** adalah platform pembelajaran dan kurasi resep kuliner tradisional Nusantara yang menghubungkan **Administrator**, **Pengajar (Guru)**, dan **Murid** dalam satu ekosistem terpadu.

Platform ini dirancang untuk menyelesaikan tantangan pembelajaran kuliner tradisional yang terstruktur:
- Memastikan setiap pengajar dan murid melalui **verifikasi Administrator** sebelum mengakses kelas maupun mengunggah materi.
- Menjaga kualitas materi resep dengan membatasi **hak akses berdasarkan peran dan kategori ampu** (Makanan Berkuah, Makanan Tidak Berkuah, Camilan Kering, Minuman, dan Camilan Basah, hingga kategori baru yang dibuat pengajar).
- Menyediakan katalog resep lengkap dengan teknik pengolahan rempah, takaran bahan, langkah memasak, gambar hidangan, serta video pembelajaran.

---

## ✨ Features

### 🔐 Autentikasi & Verifikasi Akun
- **Registrasi Multi-Peran**: Pendaftaran Murid dan Pengajar (dilengkapi ketentuan kategori, ringkasan CV, dan sertifikat keahlian).
- **Antrean Verifikasi Admin**: Akun baru berstatus `pending` (ditangguhkan) hingga disetujui oleh Administrator.
- **Penolakan dengan Alasan**: Jika ditolak, data akun dihapus dari sistem dan pengguna menerima notifikasi beserta alasan penolakan saat mencoba masuk.

### 🛡️ Portal Administrator (`/dashboard/admin`)
- **Verifikasi Pendaftaran**: Menyetujui (`ACC`) atau menolak calon Murid maupun Pengajar dengan alasan penolakan.
- **Manajemen Kategori Kelas**: Menambah dan menghapus kategori kelas kuliner.
- **Manajemen Pengajar & Murid**: Melihat daftar pengajar dan murid dalam bentuk tabel, mengedit profil, serta menetapkan **lebih dari 1 kategori ampu** untuk satu pengajar.
- **Proteksi Penghapusan Murid**: Admin hanya dapat menghapus murid yang tidak sedang mengikuti kelas apa pun.
- **Kurasi Materi**: Meninjau dan menghapus materi resep (dengan pop-up konfirmasi).

### 👨‍🍳 Portal Pengajar (`/dashboard/teacher`)
- **Tambah Kategori & Kelola Kelas**: Menambah kategori baru serta mengedit/menghapus kelas pada kategori yang diampu.
- **Kelola Materi Resep Lengkap**: Menambah, mengedit (melalui halaman khusus `/dashboard/teacher/recipes/[id]/edit`), dan menghapus resep sesuai kategori ampu—lengkap dengan gambar, link video pembelajaran (YouTube/MP4), estimasi porsi, rasa dominan, teknik rempah, bahan, dan langkah memasak.
- **Katalog Terfilter & Feedback Murid**: Melihat katalog khusus kategori ampu serta membalas diskusi/feedback murid.

### 🎓 Portal Murid (`/dashboard/student` & `/recipes`)
- **Ruang Belajar & Progres**: Mengikuti kelas, mempelajari detail resep & video tutorial, dan menandai resep selesai (**✓ Selesai Dipelajari**).
- **Akses Read-Only Materi**: Murid dapat belajar dan berdiskusi dengan guru tanpa akses untuk mengedit atau menghapus materi.

---

## 🖼️ Preview

> Galeri aset visual tersedia di direktori [`public/images/`](public/images/) (mencakup foto hidangan Nusantara, kelas, dan logo Niskala Rasa).

<details>
<summary>📸 Lihat Daftar Halaman Utama Aplikasi</summary>

| Halaman | Rute | Deskripsi |
| :--- | :--- | :--- |
| Beranda | `/` | Landing page, hero slideshow, kategori populer, dan pengenalan Niskala Rasa |
| Katalog Resep | `/recipes` | Pencarian & filter 50+ resep Nusantara beserta status selesai belajar |
| Detail Resep | `/recipes/[id]` | Bahan, langkah masak, teknik rempah, pemutar video, dan diskusi |
| Masuk & Daftar | `/login` & `/register` | Autentikasi akun dan pengajuan pendaftaran Murid/Pengajar |
| Dashboard Admin | `/dashboard/admin` | Verifikasi akun, manajemen kategori, pengajar, murid, dan materi |
| Dashboard Pengajar | `/dashboard/teacher` | Manajemen kategori/kelas, materi resep, dan feedback murid |
| Dashboard Murid | `/dashboard/student` | Kelas terdaftar, materi resep, progres belajar, dan chat guru |

</details>

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 16.4.6](https://nextjs.org/) (App Router & Turbopack), [React 19.3.0](https://react.dev/), [Tailwind CSS 4.3.3](https://tailwindcss.com/)
- **Backend**: Next.js Route Handlers (`src/app/api/*`), `bcryptjs`
- **Database**: [PostgreSQL](https://www.postgresql.org/) dengan driver `pg` (`^8.23.1`)
- **Tools**: ESLint 9 (`eslint-config-next`), Node.js

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v20+ direkomendasikan)
- **npm**
- **PostgreSQL** aktif secara lokal atau remote

### Installation

1. **Clone repositori**

```bash
git clone https://github.com/username/niskala-rasa.git
```

2. **Masuk ke direktori proyek**

```bash
cd niskala-rasa
```

3. **Install dependencies**

```bash
npm install
```

4. **Konfigurasi environment variables**

Buat file `.env.local` pada root proyek dan isi koneksi PostgreSQL Anda:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/niskala_rasa
```

5. **Setup & Seed Database**

Jalankan skrip setup untuk membuat tabel dan mengisi data awal (Admin, Pengajar, Murid, Kelas, dan 50 Resep Nusantara):

```bash
npm run db:setup
```

6. **Jalankan server development**

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

---

## 📁 Project Structure

```text
niskala-rasa/
├── database/
│   ├── recipes-data.js          # Dataset 50 resep kuliner Nusantara
│   ├── schema.sql               # Skema 8 tabel PostgreSQL ternormalisasi
│   └── seed.sql                 # Data seed SQL
├── public/
│   └── images/
│       ├── classes/             # Aset gambar kategori kelas
│       ├── recipes/             # Aset foto-foto resep Nusantara
│       └── logo niskala rasa.jpg
├── scripts/
│   ├── check-db.js              # Skrip pengecekan koneksi database
│   └── setup-db.js              # Skrip inisialisasi skema & seeding database
├── src/
│   ├── app/
│   │   ├── admin/               # Rute redirect/admin
│   │   ├── api/                 # Backend Route Handlers (auth, users, classes, recipes, enrollments, progress, monitoring)
│   │   ├── classes/             # Halaman jelajah kelas
│   │   ├── dashboard/
│   │   │   ├── admin/           # Dashboard Administrator
│   │   │   ├── student/         # Dashboard Murid
│   │   │   └── teacher/         # Dashboard Pengajar & halaman edit resep ([id]/edit)
│   │   ├── learning-space/      # Pengarah ruang belajar sesuai peran
│   │   ├── login/               # Halaman Masuk & Daftar
│   │   ├── profile/             # Halaman profil pengguna
│   │   ├── recipes/             # Katalog resep & halaman detail ([id])
│   │   ├── register/            # Halaman pendaftaran akun
│   │   ├── sessions/            # Halaman sesi belajar
│   │   ├── spices/              # Halaman ensiklopedia rempah
│   │   ├── teacher/             # Halaman portal pengajar
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.js              # Beranda utama
│   ├── components/
│   │   ├── admin/               # Komponen UI khusus Admin
│   │   ├── student/             # Komponen UI khusus Murid
│   │   ├── teacher/             # Komponen UI khusus Pengajar
│   │   └── *.js                 # Komponen bersama (Navbar, Footer, HeroSlideshow, RecipeCard, dll.)
│   └── lib/
│       ├── db.js                # Konfigurasi PostgreSQL Pool
│       ├── recipes.js           # Helper data resep
│       └── spices-data.js       # Data referensi rempah Nusantara
├── eslint.config.mjs
├── jsconfig.json
├── next.config.mjs
├── package.json
└── README.md
```

---

## 💡 Usage

<details>
<summary>🔑 Akun Bawaan (Hasil <code>npm run db:setup</code>)</summary>

| Peran | Email | Kata Sandi | Keterangan |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@gmail.com` | `admin123` | Akses penuh verifikasi & manajemen |
| **Pengajar (Berkuah)** | `raka@gmail.com` | `guru123` | Kategori *Makanan Berkuah* |
| **Pengajar (Tidak Berkuah)** | `sari@gmail.com` | `guru123` | Kategori *Makanan Tidak Berkuah* |
| **Pengajar (Camilan Kering)** | `dimas@gmail.com` | `guru123` | Kategori *Camilan Kering* |
| **Pengajar (Minuman)** | `maya@gmail.com` | `guru123` | Kategori *Minuman* |
| **Pengajar (Camilan Basah)** | `tari@gmail.com` | `guru123` | Kategori *Camilan Basah* |
| **Murid** | `putri@gmail.com` | `murid123` | Akun murid terdaftar |

</details>

<details>
<summary>🧭 Alur Kerja Pengguna</summary>

1. **Pendaftaran**: Pengguna baru mendaftar melalui `/login` atau `/register`. Akun berstatus `pending` dan muncul di tab **Verifikasi Pendaftaran** milik Admin.
2. **Persetujuan Admin**: Admin masuk ke `/dashboard/admin`, lalu memilih **ACC / Terima** (mengaktifkan akun) atau **Tolak** (memasukkan alasan penolakan dan menghapus data akun).
3. **Pengelolaan oleh Guru**: Setelah disetujui, guru masuk ke `/dashboard/teacher` untuk menambah kategori, mengelola kelas, serta menambah/mengedit/menghapus materi resep sesuai kategori yang diampu.
4. **Belajar oleh Murid**: Setelah disetujui, murid masuk ke `/dashboard/student` atau `/recipes`, mempelajari video dan resep, lalu menekan tombol tandai selesai untuk memantau progres belajarnya.

</details>

---

## 🤝 Contributing

Kontribusi, laporan *issue*, dan permintaan fitur baru sangat diterima!

1. *Fork* proyek ini.
2. Buat *branch* fitur Anda (`git checkout -b feature/FiturBaru`).
3. *Commit* perubahan Anda (`git commit -m 'Menambahkan FiturBaru'`).
4. *Push* ke *branch* tersebut (`git push origin feature/FiturBaru`).
5. Buat *Pull Request*.

---

## 📄 License

Proyek ini bersifat privat (`"private": true` pada `package.json`) untuk pengembangan **Niskala Rasa**.

---

## ✍️ Author

**Tim Niskala Rasa**
