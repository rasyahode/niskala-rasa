import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import ApproveTeacherButton from "@/components/ApproveTeacherButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("niskala_user_id")?.value;

    if (!userId) {
        redirect("/login");
    }

    const { rows } = await pool.query(
        "SELECT id, username, email, role, teacher_status FROM users WHERE id = $1",
        [Number(userId)]
    );
    const currentUser = rows[0];

    if (!currentUser) {
        redirect("/login");
    }

    if (currentUser.role !== "admin") {
        redirect(currentUser.role === "teacher" ? "/teacher" : "/dashboard");
    }

    const [pendingRes, usersRes] = await Promise.all([
        pool.query(
            `SELECT id, username, email, role, teacher_status
            FROM users
            WHERE teacher_status = 'pending'
            ORDER BY id ASC`
        ),
        pool.query(
            `SELECT id, username, email, role, teacher_status, approved_at
            FROM users
            ORDER BY id ASC`
        ),
    ]);

    const pendingTeachers = pendingRes.rows;
    const allUsers = usersRes.rows;

    return (
        <main className="mx-auto max-w-5xl px-4 py-10">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-6">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                        Panel Pengelola Sistem · Admin
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-neutral-900">
                        Selamat Datang, {currentUser.username}
                    </h1>
                    <p className="text-sm text-neutral-600">{currentUser.email}</p>
                </div>

                <Link
                    href="/recipes"
                    className="rounded-lg border bg-white px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
                >
                    Lihat Katalog Resep
                </Link>
            </div>

            <section className="mb-10 rounded-xl border bg-white p-6">
                <h2 className="mb-1 text-lg font-bold text-neutral-900">
                    Validasi Pengajuan Spice Master ({pendingTeachers.length})
                </h2>
                <p className="mb-4 text-xs text-neutral-600">
                    Setujui akun berstatus <em>pending</em> agar resmi mendapatkan hak akses peran{" "}
                    <strong>Teacher / Spice Master</strong>.
                </p>

                {pendingTeachers.length === 0 ? (
                    <p className="rounded-lg bg-neutral-50 p-4 text-sm text-neutral-600">
                        Tidak ada pengajuan Spice Master yang menunggu validasi saat ini.
                    </p>
                ) : (
                    <div className="divide-y rounded-lg border">
                        {pendingTeachers.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-wrap items-center justify-between gap-4 p-4"
                            >
                                <div>
                                    <p className="font-semibold text-neutral-900">{item.username}</p>
                                    <p className="text-xs text-neutral-600">{item.email}</p>
                                </div>
                                <ApproveTeacherButton userId={item.id} />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="rounded-xl border bg-white p-6">
                <h2 className="mb-4 text-lg font-bold text-neutral-900">
                    Daftar Pengguna Sistem ({allUsers.length})
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b text-xs uppercase text-neutral-500">
                                <th className="py-2 pr-4">Nama</th>
                                <th className="py-2 pr-4">Email</th>
                                <th className="py-2 pr-4">Peran</th>
                                <th className="py-2">Status Teacher</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {allUsers.map((u) => (
                                <tr key={u.id}>
                                    <td className="py-2.5 pr-4 font-medium text-neutral-900">{u.username}</td>
                                    <td className="py-2.5 pr-4 text-neutral-600">{u.email}</td>
                                    <td className="py-2.5 pr-4 capitalize text-neutral-800">{u.role}</td>
                                    <td className="py-2.5 text-xs text-neutral-600">{u.teacher_status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </main>
    );
}