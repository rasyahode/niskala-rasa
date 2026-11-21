import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import pool from "@/lib/db";

const LEVEL_GUIDE = {
    basic: "Dasar pengenalan rempah khas Indonesia, aroma, dan teknik pengolahan awal.",
    intermediate: "Kombinasi rempah Indonesia dan penerapan pada resep luar negeri sehari-hari.",
    advanced: "Kontrol sangrai, infusi, dan keseimbangan rasa rempah Indonesia untuk hidangan kompleks.",
    professional: "Kurasi standar profesional, pengembangan resep lintas negara, dan bimbingan praktik.",
};

export default async function TeacherPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("niskala_user_id")?.value;

    if (!userId) {
        redirect("/login");
    }

    const res = await pool.query(
        `
        SELECT id, username, email, role, teacher_status, teacher_level, cv_info, professional_license
        FROM users
        WHERE id = $1
        `,
        [Number(userId)]
    );

    const user = res.rows[0];
    if (!user || user.role !== "teacher") {
        redirect("/login");
    }

    const levelKey = String(user.teacher_level || "basic").toLowerCase();

    return (
        <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                        Panel Teacher · Kursus Rempah Indonesia
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-neutral-900">
                        Selamat Datang, {user.username}
                    </h1>
                    <p className="mt-1 text-xs text-neutral-600">
                        Jenjang Pengajar:{" "}
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-bold uppercase text-emerald-800">
                        {levelKey}
                        </span>
                    </p>
                </div>

                <Link
                    href="/recipes"
                    className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                >
                    Lihat Resep Berempah Indonesia
                </Link>
            </div>

            <section className="rounded-xl border bg-white p-5 space-y-2">
                <h2 className="text-sm font-bold text-neutral-900">
                    Fokus Jenjang {levelKey.toUpperCase()}
                </h2>
                <p className="text-sm text-neutral-700">
                    {LEVEL_GUIDE[levelKey] || LEVEL_GUIDE.basic}
                </p>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border bg-white p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                        Curriculum Vitae (CV)
                    </h3>
                    <p className="mt-2 text-sm text-neutral-700 whitespace-pre-line">
                        {user.cv_info || "Tercatat pada profil pengajar."}
                    </p>
                </div>

                <div className="rounded-xl border bg-white p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                        Lisensi Keprofesionalan
                    </h3>
                    <p className="mt-2 text-sm text-neutral-700">
                        {user.professional_license || "Terverifikasi oleh Admin Niskala Rasa."}
                    </p>
                </div>
            </section>
        </main>
    );
}
