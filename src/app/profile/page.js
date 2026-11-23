import Link from "next/link";
import { cookies } from "next/headers";
import pool from "@/lib/db";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const rawUserId = cookieStore.get("niskala_user_id")?.value;

  if (!rawUserId) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Profil Pengguna · Niskala Rasa
          </p>
          <h1 className="text-2xl font-bold text-neutral-900">
            Silakan Masuk untuk Melihat Profil Akun
          </h1>
          <p className="text-sm text-neutral-600">
            Halaman profil menampilkan informasi akun, status verifikasi pengajar, serta progres
            kelas Student dan Teacher.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-block rounded-lg bg-emerald-700 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800"
            >
              Masuk / Daftar Akun
            </Link>
          </div>
        </div>
      </main>
    );
  }

  let user = null;
  let studentCourses = [];
  let teacherCourses = [];

  try {
    const userRes = await pool.query(
      `
      SELECT id, username, email, role, teacher_status, teacher_level,
             cv_info, professional_license, approved_at
      FROM users
      WHERE id = $1
      `,
      [Number(rawUserId)]
    );
    user = userRes.rows[0] || null;

    if (user) {
      // Kursus yang diikuti Student beserta progres materinya
      const stRes = await pool.query(
        `
        SELECT
          c.id,
          c.title,
          c.category_name,
          c.teacher_name,
          COUNT(DISTINCT cm.id)::int AS total_materials,
          COUNT(DISTINCT cmp.material_id)::int AS completed_materials
        FROM class_enrollments ce
        JOIN classes c ON c.id = ce.class_id
        LEFT JOIN class_materials cm ON cm.class_id = c.id
        LEFT JOIN class_material_progress cmp
          ON cmp.material_id = cm.id AND cmp.user_id = $1
        WHERE ce.user_id = $1
        GROUP BY c.id, c.title, c.category_name, c.teacher_name
        ORDER BY c.id DESC
        `,
        [user.id]
      );
      studentCourses = stRes.rows;

      // Kursus yang diajarkan Teacher beserta jumlah pendaftar & progres rata-rata
      if (user.role === "teacher" || user.role === "admin") {
        const tchRes = await pool.query(
          `
          SELECT
            c.id,
            c.title,
            c.category_name,
            c.teacher_name,
            COUNT(DISTINCT ce.user_id)::int AS student_count,
            COUNT(DISTINCT cm.id)::int AS total_materials,
            COUNT(DISTINCT cmp.material_id)::int AS completed_count
          FROM classes c
          LEFT JOIN class_enrollments ce ON ce.class_id = c.id
          LEFT JOIN class_materials cm ON cm.class_id = c.id
          LEFT JOIN class_material_progress cmp ON cmp.material_id = cm.id
          WHERE ($1 = 'admin' OR c.teacher_name = $2)
          GROUP BY c.id, c.title, c.category_name, c.teacher_name
          ORDER BY c.id DESC
          `,
          [user.role, user.username]
        );
        teacherCourses = tchRes.rows;
      }
    }
  } catch (error) {
    console.error("Gagal memuat halaman profil:", error);
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-2xl border bg-white p-8 text-center space-y-3">
          <p className="text-sm text-neutral-600">Data akun tidak ditemukan.</p>
          <Link href="/login" className="text-xs font-semibold text-emerald-700 underline">
            Kembali ke halaman masuk
          </Link>
        </div>
      </main>
    );
  }

  // Notifikasi Welcome Teacher jika approved_at kurang dari 24 jam (di Server Component)
  let isNewApprovedTeacher = false;
  if (user.role === "teacher" && user.approved_at) {
    const approvedTime = new Date(user.approved_at).getTime();
    const diffHours = (Date.now() - approvedTime) / (1000 * 60 * 60);
    if (!Number.isNaN(diffHours) && diffHours >= 0 && diffHours < 24) {
      isNewApprovedTeacher = true;
    }
  }

  const isPendingTeacher = user.teacher_status === "pending" && user.role !== "teacher";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Profil Pengguna · Niskala Rasa
          </p>
          <h1 className="mt-1 text-2xl font-bold text-neutral-900">{user.username}</h1>
          <p className="text-xs text-neutral-600">
            Email: {user.email} · Peran: <strong className="uppercase">{user.role}</strong>
          </p>
        </div>
        <Link
          href="/learning-space"
          className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
        >
          Buka Ruang Belajar
        </Link>
      </div>

      {/* Notifikasi Welcome Teacher (< 24 jam) */}
      {isNewApprovedTeacher && (
        <div
          role="alert"
          className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-950 space-y-1"
        >
          <p className="font-bold text-sm">
            Selamat Datang, Teacher {user.username}!
          </p>
          <p>
            Akun pengajar Anda baru saja disetujui oleh Admin dalam 24 jam terakhir (jenjang:{" "}
            <strong>{user.teacher_level || "basic"}</strong>). Anda kini dapat membuat dan mengelola
            kelas serta materi pembelajaran.
          </p>
        </div>
      )}

      {/* Status Pending (Khusus pendaftar Teacher yang belum di-approve) */}
      {isPendingTeacher && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 space-y-1">
          <span className="inline-block rounded bg-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-900">
            STATUS PENDING
          </span>
          <p className="font-semibold">
            Akun Pengajar Anda sedang menunggu verifikasi Admin
          </p>
          <p>
            Jenjang diajukan: <strong>{user.teacher_level || "-"}</strong> · Lisensi:{" "}
            {user.professional_license || "-"}
          </p>
        </div>
      )}

      {/* Ringkasan Kursus yang Diikuti Student & Progres */}
      <section className="rounded-xl border border-neutral-200 bg-white p-5 space-y-3">
        <h2 className="text-base font-bold text-neutral-900">
          Kursus yang Diikuti &amp; Progres Belajar ({studentCourses.length})
        </h2>
        {studentCourses.length === 0 ? (
          <p className="text-xs text-neutral-500">
            Belum ada kursus yang diikuti. Pilih kelas di Ruang Belajar untuk mulai melacak progres.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {studentCourses.map((c) => {
              const pct =
                c.total_materials > 0
                  ? Math.round((c.completed_materials / c.total_materials) * 100)
                  : 0;
              return (
                <div key={c.id} className="rounded-lg border p-4 space-y-1.5">
                  <p className="text-sm font-bold text-neutral-900">{c.title}</p>
                  <p className="text-xs text-neutral-600">
                    Kategori: {c.category_name || "Rempah Nusantara"} · Guru: {c.teacher_name}
                  </p>
                  <p className="text-xs font-semibold text-emerald-800">
                    Progres: {pct}% ({c.completed_materials}/{c.total_materials} materi selesai)
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Ringkasan Kursus yang Diajarkan Teacher & Progres Student */}
      {(user.role === "teacher" || user.role === "admin") && (
        <section className="rounded-xl border border-neutral-200 bg-white p-5 space-y-3">
          <h2 className="text-base font-bold text-neutral-900">
            Kursus yang Diajarkan &amp; Progres Student ({teacherCourses.length})
          </h2>
          {teacherCourses.length === 0 ? (
            <p className="text-xs text-neutral-500">Belum ada kursus yang tercatat.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {teacherCourses.map((tc) => {
                const denom = tc.student_count * tc.total_materials;
                const avgPct =
                  denom > 0 ? Math.round((tc.completed_count / denom) * 100) : 0;
                return (
                  <div key={tc.id} className="rounded-lg border p-4 space-y-1.5">
                    <p className="text-sm font-bold text-neutral-900">{tc.title}</p>
                    <p className="text-xs text-neutral-600">
                      Kategori: {tc.category_name || "Rempah Nusantara"} · Siswa terdaftar:{" "}
                      <strong>{tc.student_count}</strong>
                    </p>
                    <p className="text-xs font-semibold text-emerald-800">
                      Rata-rata progres siswa: {avgPct}%
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </main>
  );
}