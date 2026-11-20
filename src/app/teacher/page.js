import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("niskala_user_id")?.value;

    if (!userId) {
        redirect("/login");
    }

    const { rows } = await pool.query(
        "SELECT id, username, email, role, teacher_status FROM users WHERE id = $1",
        [Number(userId)]
    );
    const user = rows[0];

    if (!user) {
        redirect("/login");
    }

    if (user.role === "admin") {
        redirect("/admin");
    }

    if (user.role !== "teacher" || user.teacher_status !== "approved") {
        redirect("/dashboard");
    }

    return (
        <main className="mx-auto max-w-5xl px-4 py-10">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-6">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                        Panel Pengajar · Teacher / Spice Master
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-neutral-900">
                        Selamat Datang, {user.username}
                    </h1>
                    <p className="text-sm text-neutral-600">{user.email}</p>
                </div>

                <span className="rounded-full bg-emerald-100 px-3.5 py-1.5 text-xs font-semibold text-emerald-900">
                    Status Spice Master: Approved
                </span>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <div className="rounded-xl border bg-white p-5">
                    <h2 className="font-bold text-neutral-900">Kurikulum &amp; Modul</h2>
                    <p className="mt-1 text-sm text-neutral-600">
                        Susun modul *spice blending*, profil rasa rempah, dan materi praktik bertahap.
                    </p>
                    <span className="mt-4 inline-block rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600">
                        Modul kurikulum siap dikembangkan
                    </span>
                </div>

                <div className="rounded-xl border bg-white p-5">
                    <h2 className="font-bold text-neutral-900">Kelas Hybrid (Daring &amp; Makassar)</h2>
                    <p className="mt-1 text-sm text-neutral-600">
                        Kelola jadwal sesi *live streaming* dan praktik tatap muka eksklusif di Studio Makassar.
                    </p>
                    <span className="mt-4 inline-block rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600">
                        Jadwal hybrid siap dikembangkan
                    </span>
                </div>

                <div className="rounded-xl border bg-white p-5">
                    <h2 className="font-bold text-neutral-900">Evaluasi Peserta &amp; Resep</h2>
                    <p className="mt-1 text-sm text-neutral-600">
                        Tinjau progres peserta dan rujuk katalog resep berdasarkan dominan rasa.
                    </p>
                    <Link
                        href="/recipes"
                        className="mt-4 inline-block rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                    >
                        Lihat Katalog Resep
                    </Link>
                </div>
            </div>
        </main>
    );
}
