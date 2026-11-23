import Link from "next/link";
import pool from "@/lib/db";

const TEACHER_LEVELS = [
  {
    level: "Basic",
    badge: "Jenjang Teacher",
    summary:
      "Membangun fondasi pengenalan rempah khas Indonesia, karakter aroma alami, serta teknik sangrai dan infusi dasar.",
    href: "/teacher?level=basic",
    cta: "Lihat Profil Teacher",
  },
  {
    level: "Intermediate",
    badge: "Jenjang Teacher",
    summary:
      "Menerapkan racikan rempah asal Indonesia pada masakan khas Nusantara maupun resep luar negeri terpilih.",
    href: "/teacher?level=intermediate",
    cta: "Lihat Profil Teacher",
  },
  {
    level: "Advanced",
    badge: "Jenjang Teacher",
    summary:
      "Menguasai kontrol suhu, waktu sangrai, dan keseimbangan rasa manis, asam, pedas, serta pahit secara presisi.",
    href: "/teacher?level=advanced",
    cta: "Lihat Profil Teacher",
  },
  {
    level: "Professional",
    badge: "Jenjang Teacher",
    summary:
      "Menetapkan standar praktik kuliner profesional dengan verifikasi CV dan lisensi keprofesionalan oleh Admin.",
    href: "/teacher?level=professional",
    cta: "Lihat Profil Teacher",
  },
];

const FALLBACK_POPULAR_COURSES = [
  {
    id: 1,
    title: "Sangrai & Infusi Kayu Manis Kerinci untuk Hidangan Manis",
    category_name: "Teknik Sangrai & Infusi",
    teacher_name: "Chef Basic",
    indonesian_spice: "Kayu Manis",
    enroll_count: 12,
  },
  {
    id: 2,
    title: "Penerapan Andaliman & Asam Gelugur pada Resep Pilihan",
    category_name: "Resep Luar Negeri Berempah",
    teacher_name: "Chef Basic",
    indonesian_spice: "Andaliman",
    enroll_count: 9,
  },
];

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const searchQuery = String(params?.q || "").trim().toLowerCase();
  const selectedCategory = String(params?.category || "semua");

  let categories = ["Rempah Nusantara", "Resep Luar Negeri Berempah", "Teknik Sangrai & Infusi"];
  let popularCourses = FALLBACK_POPULAR_COURSES;

  try {
    const [catRes, clsRes] = await Promise.all([
      pool.query("SELECT name FROM categories ORDER BY id ASC"),
      pool.query(`
        SELECT
          c.id,
          c.title,
          c.category_name,
          c.teacher_name,
          c.indonesian_spice,
          COUNT(ce.id)::int AS enroll_count
        FROM classes c
        LEFT JOIN class_enrollments ce ON ce.class_id = c.id
        WHERE c.status != 'cancelled'
        GROUP BY c.id, c.title, c.category_name, c.teacher_name, c.indonesian_spice
        ORDER BY enroll_count DESC, c.id DESC
      `),
    ]);

    if (catRes.rows.length > 0) {
      categories = catRes.rows.map((r) => r.name);
    }
    if (clsRes.rows.length > 0) {
      popularCourses = clsRes.rows;
    }
  } catch {
    // Gunakan data fallback bila tabel kelas belum dimigrasi
  }

  const filteredCourses = popularCourses
    .filter((course) => {
      const matchCat =
        selectedCategory.toLowerCase() === "semua" ||
        String(course.category_name || "").toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        !searchQuery ||
        String(course.title || "").toLowerCase().includes(searchQuery) ||
        String(course.indonesian_spice || "").toLowerCase().includes(searchQuery) ||
        String(course.teacher_name || "").toLowerCase().includes(searchQuery);
      return matchCat && matchSearch;
    })
    .slice(0, 5); // Maksimal 5 course terpopuler sesuai ketentuan

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-12">
      {/* Bagian Pembuka Two-Column ala Referensi Kursus Kuliner */}
      <section className="grid grid-cols-1 items-center gap-8 border-b pb-10 md:grid-cols-12">
        <div className="md:col-span-6">
          <div className="flex min-h-[260px] flex-col justify-between rounded-xl border border-emerald-900/15 bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-800 p-6 text-white">
            <span className="w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
              Kurikulum Rempah Khas Indonesia
            </span>
            <div className="space-y-2 pt-8">
              <p className="text-xs uppercase tracking-widest text-emerald-200">
                Daring &amp; Studio Makassar
              </p>
              <p className="text-lg font-semibold leading-snug">
                Dari teknik sangrai dan infusi rempah Nusantara hingga penerapan pada hidangan
                dunia berempah Indonesia.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 md:col-span-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
            Niskala Rasa · Program Kuliner Rempah
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Rempah Khas Indonesia: Teknik &amp; Resep Pilihan
          </h1>

          <p className="text-sm leading-relaxed text-neutral-700">
            Di <strong>Niskala Rasa</strong>, pembelajaran difokuskan pada{" "}
            <strong>rempah khas Indonesia</strong> melalui kelas daring maupun sesi praktik di{" "}
            <strong>Makassar</strong>—sambil mempertahankan <strong>resep khas Indonesia</strong>{" "}
            serta menyeleksi dan merekomendasikan{" "}
            <strong>resep luar negeri yang memakai rempah khas Indonesia</strong>.
          </p>

          <p className="text-sm leading-relaxed text-neutral-700">
            Seluruh pengajar (<strong>Teacher</strong>) terstruktur ke dalam empat jenjang (
            <strong>Basic</strong>, <strong>Intermediate</strong>, <strong>Advanced</strong>, dan{" "}
            <strong>Professional</strong>) dengan verifikasi <strong>CV</strong> dan{" "}
            <strong>lisensi keprofesionalan</strong> oleh Admin.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/recipes"
              className="rounded-lg bg-emerald-700 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800"
            >
              Jelajahi Resep &amp; Cara Olah
            </Link>
            <Link
              href="/spices"
              className="rounded-lg border border-emerald-700 px-5 py-2.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
            >
              Katalog 50 Rempah Indonesia
            </Link>
          </div>
        </div>
      </section>

      {/* Pencarian, Filter Kategori & 5 Course Terpopuler */}
      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">5 Course Terpopuler</h2>
            <p className="text-xs text-neutral-600">
              Cari kelas berdasarkan nama/rempah atau saring berdasarkan kategori.
            </p>
          </div>
          <Link
            href="/learning-space"
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Buka Ruang Belajar →
          </Link>
        </div>

        <form method="GET" className="flex flex-wrap gap-2">
          <input
            type="text"
            name="q"
            defaultValue={params?.q || ""}
            placeholder="Cari course atau rempah khas Indonesia..."
            className="flex-1 min-w-[200px] rounded-lg border px-3.5 py-2 text-xs bg-white"
          />
          <select
            name="category"
            defaultValue={selectedCategory}
            className="rounded-lg border bg-white px-3.5 py-2 text-xs"
          >
            <option value="semua">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
          >
            Cari / Filter
          </button>
        </form>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course, idx) => (
            <article
              key={`${course.id}-${idx}`}
              className="rounded-xl border border-neutral-200 bg-white p-4 space-y-2"
            >
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="rounded bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800">
                  #{idx + 1} · {course.category_name || "Rempah Nusantara"}
                </span>
                <span className="text-neutral-500">{course.enroll_count ?? 0} siswa</span>
              </div>
              <h3 className="text-sm font-bold text-neutral-900">{course.title}</h3>
              <p className="text-xs text-neutral-600">
                Rempah: {course.indonesian_spice} · Guru: {course.teacher_name}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Empat Jenjang Teacher */}
      <section className="space-y-5 border-t pt-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-neutral-900">Empat Jenjang Teacher</h2>
          <p className="text-sm text-neutral-600">
            Setiap jenjang memiliki cakupan materi pengolahan rempah yang terukur serta profil
            pengajar terverifikasi CV dan lisensi.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TEACHER_LEVELS.map((item) => (
            <article
              key={item.level}
              className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 space-y-4"
            >
              <div className="space-y-2">
                <span className="inline-block rounded bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                  {item.badge}
                </span>
                <h3 className="text-base font-bold text-neutral-900">{item.level}</h3>
                <p className="text-xs leading-relaxed text-neutral-600">{item.summary}</p>
              </div>

              <Link
                href={item.href}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                {item.cta} →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}