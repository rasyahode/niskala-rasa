"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LearningSpacePage() {
    const [user, setUser] = useState(null);
    const [classes, setClasses] = useState([]);
    const [enrolledIds, setEnrolledIds] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [messages, setMessages] = useState([]);

    const [title, setTitle] = useState("");
    const [indonesianSpice, setIndonesianSpice] = useState("Kayu Manis");
    const [scheduleLabel, setScheduleLabel] = useState("Studio & Rekaman · Sabtu 10:00 WITA");
    const [teacherLevel, setTeacherLevel] = useState("basic");

    const [recordingClassId, setRecordingClassId] = useState(null);
    const [recordingUrl, setRecordingUrl] = useState("");

    const [chatText, setChatText] = useState("");
    const [statusMsg, setStatusMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(true);

    async function loadSpace(targetId = selectedClassId) {
        setLoading(true);
        try {
            const query = targetId ? `?classId=${targetId}` : "";
            const res = await fetch(`/api/classes${query}`, { cache: "no-store" });
            const data = await res.json();
            setUser(data.user || null);
            const clsList = Array.isArray(data.classes) ? data.classes : [];
            setClasses(clsList);
            setEnrolledIds(Array.isArray(data.enrolledClassIds) ? data.enrolledClassIds : []);
            setMessages(Array.isArray(data.messages) ? data.messages : []);

            if (clsList.length > 0) {
                if (!targetId) {
                    setSelectedClassId(clsList[0].id);
                }
                    setRecordingClassId((prev) => prev || clsList[0].id);
            }
        } catch {
            setErrorMsg("Gagal memuat ruang belajar.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadSpace();
    }, []);

    async function postAction(payload) {
        setStatusMsg("");
        setErrorMsg("");
        const res = await fetch("/api/classes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
            setErrorMsg(data.error || "Terjadi kesalahan.");
            return false;
        }
        setStatusMsg(data.message || "Berhasil diperbarui.");
        return true;
    }

    async function handleCreateClass(e) {
        e.preventDefault();
        const ok = await postAction({
            action: "create_class",
            title,
            indonesian_spice: indonesianSpice,
            schedule_label: scheduleLabel,
            teacher_level: teacherLevel,
        });
        if (ok) {
            setTitle("");
            await loadSpace();
        }
    }

    async function handleCancelClass(classId) {
        const ok = await postAction({ action: "cancel_class", classId });
            if (ok) {
            await loadSpace(classId);
        }
    }

    async function handleUploadRecording(e) {
        e.preventDefault();
        if (!recordingClassId || !recordingUrl.trim()) return;
        const ok = await postAction({
            action: "upload_recording",
            classId: recordingClassId,
            recording_url: recordingUrl.trim(),
        });
        if (ok) {
            setRecordingUrl("");
            await loadSpace(recordingClassId);
        }
    }

    async function handleToggleEnroll(classId) {
        const ok = await postAction({ action: "toggle_enrollment", classId });
            if (ok) {
            await loadSpace(classId);
        }
    }

    async function handleSendChat(e) {
        e.preventDefault();
        if (!selectedClassId || !chatText.trim()) return;
        const ok = await postAction({
            action: "send_chat",
            classId: selectedClassId,
            message: chatText.trim(),
        });
        if (ok) {
            setChatText("");
            await loadSpace(selectedClassId);
        }
    }

    if (loading) {
        return (
            <main className="mx-auto max-w-5xl px-4 py-12">
                <p className="text-sm text-neutral-600">Memuat Ruang Belajar...</p>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="mx-auto max-w-2xl px-4 py-16">
                <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center space-y-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                        Akses Terbatas · Ruang Belajar
                    </p>
                    <h1 className="text-2xl font-bold text-neutral-900">
                        Guest Tidak Dapat Membuka Ruang Belajar
                    </h1>
                    <p className="text-sm text-neutral-600">
                        Silakan masuk menggunakan akun Student, Teacher, atau Admin untuk mengakses kelas,
                        video pembelajaran, dan chat privat bersama guru.
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

    const activeClasses = classes.filter((c) => c.status !== "cancelled");
    const selectedClasses = activeClasses.filter((c) => enrolledIds.includes(Number(c.id)));
    const unselectedClasses = activeClasses.filter((c) => !enrolledIds.includes(Number(c.id)));
    const canManageClasses = ["teacher", "admin"].includes(user.role);

    return (
        <main className="mx-auto max-w-5xl px-4 py-10 space-y-8">
            <div className="border-b pb-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Ruang Belajar · {user.username} ({user.role})
                </p>
                <h1 className="text-2xl font-bold text-neutral-900">
                    Kelas Studio &amp; Video Rekaman Pembelajaran Rempah Indonesia
                </h1>
                <p className="text-sm text-neutral-600">
                    Setiap kelas diadakan satu kali di studio (pengajaran langsung hanya untuk peserta di
                    studio), direkam penuh tanpa live streaming, dan video pembelajarannya diunggah oleh
                    Admin untuk dipelajari siswa.
                </p>
            </div>

            {statusMsg && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-900">
                    {statusMsg}
                </div>
            )}
            {errorMsg && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-medium text-red-700">
                    {errorMsg}
                </div>
            )}

        {canManageClasses && (
            <section className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
                <h2 className="text-base font-bold text-neutral-900">
                    Tambah Kelas Baru ({user.role === "admin" ? "Admin" : "Teacher"})
                </h2>
                <form onSubmit={handleCreateClass} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Judul kelas pengolahan rempah Indonesia"
                        className="rounded-lg border px-3 py-2 text-sm"
                    />
                    <input
                        type="text"
                        required
                        value={indonesianSpice}
                        onChange={(e) => setIndonesianSpice(e.target.value)}
                        placeholder="Rempah khas Indonesia (misal: Kayu Manis)"
                        className="rounded-lg border px-3 py-2 text-sm"
                    />
                    <input
                        type="text"
                        required
                        value={scheduleLabel}
                        onChange={(e) => setScheduleLabel(e.target.value)}
                        placeholder="Jadwal studio & unggahan rekaman"
                        className="rounded-lg border px-3 py-2 text-sm"
                    />
                    <select
                        value={teacherLevel}
                        onChange={(e) => setTeacherLevel(e.target.value)}
                        className="rounded-lg border bg-white px-3 py-2 text-sm"
                    >
                        <option value="basic">Basic</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="professional">Professional</option>
                    </select>
                    <div className="sm:col-span-2">
                        <button
                            type="submit"
                            className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                        >
                            Simpan Kelas Baru
                        </button>
                    </div>
                </form>
            </section>
        )}

        {user.role === "admin" && (
            <section className="rounded-xl border border-emerald-200 bg-white p-5 space-y-3">
                <h2 className="text-base font-bold text-neutral-900">
                    Unggah Video Pembelajaran (Khusus Admin)
                </h2>
                <p className="text-xs text-neutral-600">
                    Unggah video rekaman penuh kelas studio (bukan live streaming) agar dapat dipelajari
                    oleh siswa.
                </p>
                <form onSubmit={handleUploadRecording} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <select
                        value={recordingClassId || ""}
                        onChange={(e) => setRecordingClassId(Number(e.target.value))}
                        className="rounded-lg border bg-white px-3 py-2 text-xs"
                    >
                        {classes.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.title}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        required
                        value={recordingUrl}
                        onChange={(e) => setRecordingUrl(e.target.value)}
                        placeholder="URL video (misal: /videos/kayu-manis.mp4 atau https://...)"
                        className="rounded-lg border px-3 py-2 text-xs"
                    />
                    <button
                        type="submit"
                        className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                    >
                        Unggah Video
                    </button>
                </form>
            </section>
        )}

        {user.role === "student" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <section className="rounded-xl border border-emerald-200 bg-white p-5 space-y-3">
                    <h2 className="text-base font-bold text-neutral-900">
                        Kelas Sudah Dipilih ({selectedClasses.length})
                    </h2>
                    {selectedClasses.length === 0 ? (
                        <p className="text-xs text-neutral-500">Belum ada kelas yang Anda pilih.</p>
                    ) : (
                        <div className="space-y-3">
                            {selectedClasses.map((cls) => (
                                <div key={cls.id} className="rounded-lg border bg-emerald-50/40 p-3.5 space-y-2">
                                    <div>
                                        <p className="text-sm font-bold text-neutral-900">{cls.title}</p>
                                        <p className="text-xs text-neutral-600">
                                            Guru: {cls.teacher_name} · Rempah: {cls.indonesian_spice}
                                        </p>
                                        <p className="text-xs font-medium text-emerald-800">
                                            {cls.schedule_label} ·{" "}
                                            {cls.recording_url
                                                ? `Video tersedia: ${cls.recording_url}`
                                                : cls.recording_status || "Menunggu Unggahan Video oleh Admin"}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedClassId(cls.id);
                                                loadSpace(cls.id);
                                            }}
                                            className="rounded bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white"
                                        >
                                            Chat Privat Guru
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleToggleEnroll(cls.id)}
                                            className="rounded border border-neutral-300 px-2.5 py-1 text-xs font-semibold text-neutral-700"
                                        >
                                            Lepas Pilihan
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="rounded-xl border border-neutral-200 bg-white p-5 space-y-3">
                    <h2 className="text-base font-bold text-neutral-900">
                        Kelas Belum Dipilih ({unselectedClasses.length})
                    </h2>
                    {unselectedClasses.length === 0 ? (
                        <p className="text-xs text-neutral-500">Semua kelas tersedia sudah Anda pilih.</p>
                    ) : (
                        <div className="space-y-3">
                            {unselectedClasses.map((cls) => (
                                <div key={cls.id} className="rounded-lg border p-3.5 space-y-2">
                                    <p className="text-sm font-bold text-neutral-900">{cls.title}</p>
                                    <p className="text-xs text-neutral-600">
                                        Guru: {cls.teacher_name} · Rempah: {cls.indonesian_spice}
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                        {cls.schedule_label} ·{" "}
                                        {cls.recording_url
                                            ? `Video tersedia: ${cls.recording_url}`
                                            : cls.recording_status || "Menunggu Unggahan Video oleh Admin"}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => handleToggleEnroll(cls.id)}
                                        className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
                                    >
                                        Pilih Kelas
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        )}

      {/* Daftar Semua Kelas (Termasuk Tombol Batalkan Kelas untuk Teacher & Admin) */}
        <section className="rounded-xl border border-neutral-200 bg-white p-5 space-y-3">
            <h2 className="text-base font-bold text-neutral-900">Daftar Seluruh Kelas</h2>
            <div className="divide-y">
                {classes.map((cls) => {
                    const isCancelled = cls.status === "cancelled";
                    return (
                        <div
                            key={cls.id}
                            className="flex flex-wrap items-center justify-between gap-3 py-3"
                        >
                            <div>
                                <p className="text-sm font-bold text-neutral-900">
                                    {cls.title}{" "}
                                    {isCancelled && (
                                        <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                                            Dibatalkan
                                        </span>
                                    )}
                                </p>
                                <p className="text-xs text-neutral-600">
                                    Guru: {cls.teacher_name} ({cls.teacher_level}) · Rempah: {cls.indonesian_spice} ·{" "}
                                        {cls.schedule_label} ·{" "}
                                        {cls.recording_url
                                            ? `Video: ${cls.recording_url}`
                                            : cls.recording_status || "Menunggu Unggahan Video oleh Admin"}
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedClassId(cls.id);
                                        loadSpace(cls.id);
                                    }}
                                    className="rounded border border-emerald-700 px-3 py-1 text-xs font-semibold text-emerald-800"
                                >
                                    Pilih Chat
                                </button>
                                {canManageClasses && !isCancelled && (
                                    <button
                                        type="button"
                                        onClick={() => handleCancelClass(cls.id)}
                                        className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                                    >
                                        Batalkan Kelas
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>

      {/* Chat Box Privat ke Guru */}
        <section className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                    <h2 className="text-base font-bold text-neutral-900">
                        Chat Box Privat dengan Guru
                    </h2>
                    <p className="text-xs text-neutral-600">
                        Komunikasi langsung satu-lawan-satu antara siswa dan guru pengampu kelas.
                    </p>
                </div>
                <select
                    value={selectedClassId || ""}
                    onChange={(e) => {
                        const id = Number(e.target.value);
                        setSelectedClassId(id);
                        loadSpace(id);
                    }}
                    className="rounded-lg border bg-white px-3 py-1.5 text-xs"
                >
                    {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.title}
                        </option>
                    ))}
                </select>
            </div>

            <div className="max-h-60 overflow-y-auto rounded-lg border bg-neutral-50 p-3 space-y-2 text-xs">
                {messages.length === 0 ? (
                    <p className="text-neutral-500">Belum ada pesan privat pada kelas ini.</p>
                ) : (
                    messages.map((m) => (
                        <div key={m.id} className="rounded bg-white p-2.5 border">
                            <p className="font-semibold text-neutral-900">
                                    {m.sender_name}{" "}
                                <span className="text-[11px] font-normal text-emerald-700">
                                    ({m.sender_role})
                                </span>
                            </p>
                            <p className="mt-0.5 text-neutral-700">{m.message}</p>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                    type="text"
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    placeholder="Tulis pesan privat ke guru..."
                    className="flex-1 rounded-lg border px-3 py-2 text-sm"
                />
                <button
                    type="submit"
                    className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                >
                    Kirim Pesan
                </button>
            </form>
        </section>
        </main>
    );
}
