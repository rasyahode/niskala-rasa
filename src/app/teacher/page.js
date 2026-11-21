import Link from "next/link";
import { cookies } from "next/headers";
import pool from "@/lib/db";

const LEVELS = ["semua", "basic", "intermediate", "advanced", "professional"];

const LEVEL_GUIDE = {
    basic: "Dasar pengenalan rempah khas Indonesia, aroma, dan teknik pengolahan awal.",
    intermediate: "Kombinasi rempah Indonesia dan penerapan pada resep luar negeri maupun Nusantara.",
    advanced: "Kontrol sangrai, infusi, dan keseimbangan rasa rempah Indonesia untuk hidangan kompleks.",
    professional: "Kurasi standar profesional, pengembangan resep lintas negara, dan bimbingan praktik.",
};

const SAMPLE_TEACHERS = [
    {
        id: "sample-basic",
        username: "Teacher Ardiansyah",
        teacher_level: "basic",
        specialty: "Dasar Rempah Indonesia & Sangrai Awal (Kayu Manis Kerinci, Kapulaga)",
        cv_info: "4 tahun mengajar pengenalan rempah Nusantara dan teknik sangrai dasar di kelas daring serta Makassar.",
        professional_license: "LIS-NR-BASIC-101",
    },
    {
        id: "sample-intermediate",
        username: "Teacher Ratna Kusuma",
        teacher_level: "intermediate",
        specialty: "Penerapan Rempah Indonesia pada Resep Luar Negeri & Masakan Nusantara",
        cv_info: "6 tahun berpengalaman meracik rempah Indonesia pada hidangan tagine, kari, dan masakan daerah.",
        professional_license: "LIS-NR-INTER-204",
    },
    {
        id: "sample-advanced",
        username: "Teacher Hendra Wijaya",
        teacher_level: "advanced",
        specialty: "Kontrol Suhu, Infusi & Keseimbangan Rasa (Manis, Asam, Pedas, Pahit)",
        cv_info: "8 tahun mendalami ekstraksi aroma rempah Indonesia dan pengimbangan rasa kompleks.",
        professional_license: "LIS-NR-ADV-308",
    },
    {
        id: "sample-professional",
        username: "Teacher Maya Lestari",
        teacher_level: "professional",
        specialty: "Kurasi Standar Profesi, Resep Lintas Negara & Praktik Studio Makassar",
        cv_info: "11 tahun praktisi kuliner & pengajar rempah berlisensi untuk program intensif dan profesional.",
        professional_license: "LIS-NR-PRO-412",
    },
];

export default async function TeacherPage({ searchParams }) {
    const params = await searchParams;
    const selectedLevel = String(params?.level || "semua").toLowerCase();

    const cookieStore = await cookies();
    const userId = cookieStore.get("niskala_user_id")?.value;

    let currentTeacher = null;
    let teachers = SAMPLE_TEACHERS;

    try {
        if (userId) {
            const currentRes = await pool.query(
                `
                SELECT id, username, email, role, teacher_status, teacher_level, cv_info, professional_license
                FROM users
                WHERE id = $1
                `,
                [Number(userId)]
            );
        if (currentRes.rows[0]?.role === "teacher") {
            currentTeacher = currentRes.rows[0];
        }
    }

    const listRes = await pool.query(`
        SELECT id, username, teacher_level, cv_info, professional_license
        FROM users
        WHERE role = 'teacher' AND teacher_status = 'approved'
        ORDER BY id ASC
    `);

    if (listRes.rows.length > 0) {
        const dbTeachers = listRes.rows.map((row) => {
            const lvl = String(row.teacher_level || "basic").toLowerCase();
            return {
                ...row,
                teacher_level: lvl,
                specialty: LEVEL_GUIDE[lvl] || LEVEL_GUIDE.basic,
            };
        });
        teachers = [...dbTeachers, ...SAMPLE_TEACHERS];
        }
    } catch (error) {
        console.error("Gagal memuat data teacher:", error);
    }

    const filteredTeachers =
        selectedLevel === "semua"
            ? teachers
            : teachers.filter((t) => String(t.teacher_level || "").toLowerCase() === selectedLevel);

  return (
        <main className="mx-auto max-w-5xl px-4 py-10 space-y-8">
            {currentTeacher && (
                <section className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                            Akun Teacher Aktif
                        </p>
                        <h2 className="text-lg font-bold text-neutral-900">
                            Selamat Datang, {currentTeacher.username}
                        </h2>
                        </div>
                        <span className="rounded-full bg-emerald-700 px-3 py-1 text-xs font-bold uppercase text-white">
                        Jenjang: {currentTeacher.teacher_level || "basic"}
                        </span>
                    </div>
                    <p className="text-xs text-neutral-700">
                        <strong>CV:</strong> {currentTeacher.cv_info || "-"} ·{" "}
                        <strong>Lisensi:</strong> {currentTeacher.professional_license || "-"}
                    </p>
                </section>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                        Profil Pengajar · Niskala Rasa
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-neutral-900">
                        Profil Teacher &amp; Bidang Keahlian Rempah Indonesia
                    </h1>
                    <p className="mt-1 text-sm text-neutral-600">
                        Daftar pengajar terverifikasi berdasarkan jenjang Basic, Intermediate, Advanced, dan
                        Professional.
                    </p>
                </div>

                <Link
                    href="/"
                    className="rounded-lg border border-emerald-700 px-4 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                >
                    Kembali ke Beranda
                </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-neutral-600">Filter Jenjang:</span>
                {LEVELS.map((lvl) => {
                    const isActive = selectedLevel === lvl;
                    const href = lvl === "semua" ? "/teacher" : `/teacher?level=${lvl}`;
                    return (
                        <Link
                        key={lvl}
                        href={href}
                        className={`rounded-full px-3.5 py-1 text-xs font-semibold capitalize transition ${
                            isActive
                                ? "bg-emerald-700 text-white"
                                : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                        }`}
                        >
                            {lvl}
                        </Link>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {filteredTeachers.map((teacher) => (
                    <article
                        key={teacher.id}
                        className="rounded-xl border border-neutral-200 bg-white p-5 space-y-3"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="text-lg font-bold text-neutral-900">{teacher.username}</h2>
                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-emerald-800">
                                {teacher.teacher_level}
                            </span>
                        </div>
                        <p className="text-xs font-semibold text-emerald-900">{teacher.specialty}</p>

                        <div className="rounded-lg bg-neutral-50 p-3 text-xs space-y-2 text-neutral-700">
                            <div>
                                <p className="font-semibold text-neutral-900">Ringkasan CV:</p>
                                <p className="mt-0.5 leading-relaxed">
                                    {teacher.cv_info || "Tercatat di sistem Niskala Rasa."}
                                </p>
                            </div>
                            <div>
                                <p className="font-semibold text-neutral-900">Lisensi Keprofesionalan:</p>
                                <p className="mt-0.5">{teacher.professional_license || "Terverifikasi"}</p>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </main>
    );
}
