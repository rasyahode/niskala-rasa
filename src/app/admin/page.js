"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
    const router = useRouter();
    const [pendingTeachers, setPendingTeachers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    async function loadAdminData() {
        setLoading(true);
        setErrorMsg("");
        try {
            const res = await fetch("/api/admin/users");
            if (res.status === 401 || res.status === 403) {
                router.push("/login");
                return;
            }
            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.error || "Gagal memuat data Admin.");
                setLoading(false);
                return;
            }

            const list = Array.isArray(data.users) ? data.users : [];
                setUsers(list);
                setPendingTeachers(list.filter((u) => u.teacher_status === "pending"));
            } catch {
                setErrorMsg("Gagal terhubung ke server.");
            } finally {
                setLoading(false);
            }
        }

        useEffect(() => {
            loadAdminData();
        }, []);

        async function handleApprove(userId) {
            setMessage("");
            setErrorMsg("");
            try {
                const res = await fetch("/api/admin/approve-teacher", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                });
                const data = await res.json();
                if (!res.ok) {
                    setErrorMsg(data.error || "Gagal menyetujui guru.");
                    return;
                }
                setMessage(data.message || "Calon guru disetujui.");
                await loadAdminData();
            } catch {
                setErrorMsg("Gagal memproses persetujuan.");
            }
        }

        return (
            <main className="mx-auto max-w-5xl px-4 py-10 space-y-8">
                <div className="border-b pb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                        Panel Admin · Niskala Rasa
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-neutral-900">
                        Verifikasi Pengajar &amp; Data Pengguna
                    </h1>
                </div>
                {message && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-900">
                        {message}
                    </div>
                )}
                {errorMsg && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
                        {errorMsg}
                    </div>
                )}

                <section className="space-y-4">
                    <h2 className="text-lg font-bold text-neutral-900">
                        Pengajuan Teacher Menunggu Persetujuan ({pendingTeachers.length})
                    </h2>

                    {loading ? (
                        <p className="text-sm text-neutral-500">Memuat data...</p>
                    ) : pendingTeachers.length === 0 ? (
                        <div className="rounded-xl border bg-white p-5 text-sm text-neutral-600">
                            Tidak ada pengajuan guru yang menunggu verifikasi saat ini.
                        </div>
                    ) : (
                        <div className="space-y-4">
                                {pendingTeachers.map((cand) => (
                            <div
                                key={cand.id}
                                className="rounded-xl border border-neutral-200 bg-white p-5 space-y-3"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h3 className="text-base font-bold text-neutral-900">
                                            {cand.username}{" "}
                                            <span className="text-xs font-normal text-neutral-500">
                                                ({cand.email})
                                            </span>
                                        </h3>
                                        <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-emerald-800">
                                            Jenjang: {cand.teacher_level || "-"}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleApprove(cand.id)}
                                        className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                                    >
                                        Setujui Teacher
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 gap-3 rounded-lg bg-neutral-50 p-3.5 text-xs sm:grid-cols-2">
                                    <div>
                                        <p className="font-semibold text-neutral-800">Curriculum Vitae (CV)</p>
                                        <p className="mt-1 text-neutral-600 whitespace-pre-line">
                                            {cand.cv_info || "Belum diisi"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-neutral-800">Lisensi Keprofesionalan</p>
                                        <p className="mt-1 text-neutral-600">
                                            {cand.professional_license || "Belum diisi"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="space-y-3">
                    <h2 className="text-lg font-bold text-neutral-900">Daftar Akun Terdaftar</h2>
                    <div className="overflow-x-auto rounded-xl border bg-white">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b bg-neutral-50 text-neutral-600">
                                <tr>
                                    <th className="px-4 py-3">Username</th>
                                    <th className="px-4 py-3">Email</th>
                                    <th className="px-4 py-3">Role</th>
                                    <th className="px-4 py-3">Jenjang Guru</th>
                                    <th className="px-4 py-3">Status Guru</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td className="px-4 py-3 font-medium text-neutral-900">{u.username}</td>
                                        <td className="px-4 py-3 text-neutral-600">{u.email}</td>
                                        <td className="px-4 py-3 capitalize">{u.role}</td>
                                        <td className="px-4 py-3 capitalize">{u.teacher_level || "-"}</td>
                                        <td className="px-4 py-3">{u.teacher_status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        );
}
