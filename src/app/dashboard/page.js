import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import pool from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
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

    if (user.role === "teacher" && user.teacher_status === "approved") {
        redirect("/teacher");
    }

    return (
        <main className="mx-auto max-w-5xl px-4 py-10">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-6">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                        Ruang Belajar · Student
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-neutral-900">
                        Selamat Datang, {user.username}
                    </h1>
                    <p className="text-sm text-neutral-600">{user.email}</p>
                </div>

                {user.teacher_status === "pending" ? (
                    <span className="rounded-full bg-amber-100 px-3.5 py-1.5 text-xs font-semibold text-amber-900">
                        Pengajuan Spice Master: Menunggu Validasi Admin
                    </span>
                ) : null}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="rounded-xl border bg-white p-5">
                    <h2 className="font-bold text-neutral-900">Katalog Resep &amp; Dominan Rasa</h2>
                    <p className="mt-1 text-sm text-neutral-600">
                        Eksplorasi racikan rempah Nusantara dan dunia berdasarkan enam pilar dominan rasa.
                    </p>
                    <Link
                        href="/recipes"
                        className="mt-4 inline-block rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                    >
                        Buka Katalog Resep
                    </Link>
                </div>

                <div className="rounded-xl border bg-white p-5">
                    <h2 className="font-bold text-neutral-900">Kurikulum Masterclass &amp; Catatan Sensorik</h2>
                    <p className="mt-1 text-sm text-neutral-600">
                        Akses modul pembelajaran berurutan, pemesanan sesi Studio Makassar, dan catatan sensorik privat.
                    </p>
                    <span className="mt-4 inline-block rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-600">
                        Siap dilengkapi pada tahap modul Student
                    </span>
                </div>
            </div>
        </main>
    );
}

