"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LearningSpacePage() {
    const [user, setUser] = useState(null);
    const [classes, setClasses] = useState([]);
    const [categories, setCategories] = useState([
        "Rempah Nusantara",
        "Resep Luar Negeri Berempah",
        "Teknik Sangrai & Infusi",
    ]);
    const [enrolledIds, setEnrolledIds] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [completedIds, setCompletedIds] = useState([]);
    const [discussions, setDiscussions] = useState([]);
    const [messages, setMessages] = useState([]);

  // Form tambah kelas (Teacher & Admin)
    const [title, setTitle] = useState("");
    const [categoryName, setCategoryName] = useState("Rempah Nusantara");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [indonesianSpice, setIndonesianSpice] = useState("Kayu Manis");
    const [scheduleLabel, setScheduleLabel] = useState("Studio & Rekaman · Sabtu 10:00 WITA");
    const [teacherLevel, setTeacherLevel] = useState("basic");

  // Form unggah video pembelajaran (Khusus Admin)
    const [recordingClassId, setRecordingClassId] = useState(null);
    const [recordingUrl, setRecordingUrl] = useState("");

  // Forum diskusi per materi & chat privat ke guru
    const [activeMaterialId, setActiveMaterialId] = useState(null);
    const [discussionText, setDiscussionText] = useState("");
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
            const matList = Array.isArray(data.materials) ? data.materials : [];
            setClasses(clsList);
            if (Array.isArray(data.categories) && data.categories.length > 0) {
                setCategories(data.categories);
            }
            setEnrolledIds(Array.isArray(data.enrolledClassIds) ? data.enrolledClassIds : []);
            setMaterials(matList);
            setCompletedIds(Array.isArray(data.completedMaterialIds) ? data.completedMaterialIds : []);
            setDiscussions(Array.isArray(data.discussions) ? data.discussions : []);
            setMessages(Array.isArray(data.messages) ? data.messages : []);

            if (clsList.length > 0) {
                if (!targetId) setSelectedClassId(clsList[0].id);
                setRecordingClassId((prev) => prev || clsList[0].id);
            }
            if (matList.length > 0) {
                setActiveMaterialId((prev) => prev || matList[0].id);
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
            category_name: categoryName,
            start_date: startDate || null,
            end_date: endDate || null,
            indonesian_spice: indonesianSpice,
            schedule_label: scheduleLabel,
            teacher_level: teacherLevel,
        });
        if (ok) {
            setTitle("");
            setStartDate("");
            setEndDate("");
        await loadSpace();
        }
    }

    async function handleCancelClass(classId) {
        const ok = await postAction({ action: "cancel_class", classId });
        if (ok) await loadSpace(classId);
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
        if (ok) await loadSpace(classId);
    }

    async function handleMarkDone(materialId) {
        const ok = await postAction({ action: "mark_material_done", materialId });
        if (ok) await loadSpace(selectedClassId);
    }

    function handleContinueNext() {
        const nextMat = materials.find((m) => !completedIds.includes(Number(m.id)));
        if (nextMat) {
            setActiveMaterialId(nextMat.id);
            setStatusMsg(`Melanjutkan ke materi: ${nextMat.title}`);
        } else if (materials.length > 0) {
            setActiveMaterialId(materials[0].id);
            setStatusMsg("Seluruh materi pada kelas ini sudah selesai.");
        }
    }

    async function handleAddDiscussion(e) {
        e.preventDefault();
        if (!activeMaterialId || !discussionText.trim()) return;
        const ok = await postAction({
            action: "add_discussion",
            materialId: activeMaterialId,
            comment: discussionText.trim(),
        });
        if (ok) {
            setDiscussionText("");
            await loadSpace(selectedClassId);
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

  // Guest tidak bisa membuka ruang belajar
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
                    materi, video pembelajaran, dan chat privat bersama guru.
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

    const progressPercent =
        materials.length > 0
        ? Math.round(
            (materials.filter((m) => completedIds.includes(Number(m.id))).length / materials.length) *
                100
            )
        : 0;

    return (
        <main className="mx-auto max-w-5xl px-4 py-10 space-y-8">
            <div className="border-b pb-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Ruang Belajar · {user.username} ({user.role})
                </p>
                <h1 className="text-2xl font-bold text-neutral-900">
                    Kelas Studio, Materi, Progres &amp; Rekaman Pembelajaran
                </h1>
                <p className="text-sm text-neutral-600">
                    Kelas berlangsung satu kali di studio (pengajaran langsung bagi peserta di studio),
                    direkam penuh tanpa live streaming, dan video pembelajarannya diunggah oleh Admin.
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

      {/* Teacher & Admin: Tambah Kelas (Kategori & Rentang Waktu Opsional) */}
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
                        <select
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            className="rounded-lg border bg-white px-3 py-2 text-sm"
                        >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                Kategori: {cat}
                            </option>
                        ))}
                        </select>
                        <input
                            type="text"
                            required
                            value={indonesianSpice}
                            onChange={(e) => setIndonesianSpice(e.target.value)}
                            placeholder="Rempah khas Indonesia (misal: Kayu Manis)"
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
                            <input
                                type="text"
                                required
                                value={scheduleLabel}
                                onChange={(e) => setScheduleLabel(e.target.value)}
                                placeholder="Jadwal studio & unggahan rekaman"
                                className="rounded-lg border px-3 py-2 text-sm sm:col-span-2"
                                />
                                <div className="space-y-1">
                                    <label className="text-[11px] text-neutral-500">
                                        Tanggal Mulai (Opsional / Kosongkan untuk Lifetime Access)
                                    </label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full rounded-lg border px-3 py-2 text-xs"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[11px] text-neutral-500">
                                        Tanggal Selesai (Opsional / Kosongkan untuk Lifetime Access)
                                    </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full rounded-lg border px-3 py-2 text-xs"
                                />
                                </div>
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

      {/* Khusus Admin: Unggah Video Rekaman Pembelajaran */}
                {user.role === "admin" && (
                    <section className="rounded-xl border border-emerald-200 bg-white p-5 space-y-3">
                        <h2 className="text-base font-bold text-neutral-900">
                            Unggah Video Pembelajaran (Khusus Admin)
                        </h2>
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
                                placeholder="URL video (misal: /videos/kayu-manis.mp4)"
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

      {/* Student: Kelas yang Sudah Dipilih vs Belum Dipilih */}
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
                    <p className="text-sm font-bold text-neutral-900">{cls.title}</p>
                    <p className="text-xs text-neutral-600">
                      Kategori: {cls.category_name || "Rempah Nusantara"} · Guru: {cls.teacher_name}
                    </p>
                    <p className="text-xs font-medium text-emerald-800">
                      {cls.schedule_label} ·{" "}
                      {cls.recording_url
                        ? `Video: ${cls.recording_url}`
                        : cls.recording_status || "Menunggu Unggahan Video oleh Admin"}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClassId(cls.id);
                          loadSpace(cls.id);
                        }}
                        className="rounded bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white"
                      >
                        Buka Materi &amp; Chat
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
                      Kategori: {cls.category_name || "Rempah Nusantara"} · Guru: {cls.teacher_name}
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

      {/* Daftar Seluruh Kelas (Termasuk Tombol Batalkan Kelas untuk Teacher & Admin) */}
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
                    Kategori: {cls.category_name || "Rempah Nusantara"} · Guru: {cls.teacher_name} ·{" "}
                    {cls.start_date ? `${cls.start_date} s/d ${cls.end_date || "-"}` : "Lifetime Access"}
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
                    Pilih Kelas
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

      {/* Materi, Progres ("Mark as Done" / "Lanjutkan") & Forum Diskusi per Materi */}
      <section className="rounded-xl border border-neutral-200 bg-white p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              Materi Pembelajaran &amp; Forum Diskusi ({progressPercent}% Selesai)
            </h2>
            <p className="text-xs text-neutral-600">
              Tandai materi selesai, lanjutkan ke materi berikutnya, dan berdiskusi di bawah materi.
            </p>
          </div>
          <button
            type="button"
            onClick={handleContinueNext}
            className="rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
          >
            Lanjutkan
          </button>
        </div>

        <div className="space-y-3">
          {materials.map((mat) => {
            const isDone = completedIds.includes(Number(mat.id));
            const matDiscs = discussions.filter((d) => Number(d.material_id) === Number(mat.id));
            const isSelectedMat = Number(activeMaterialId) === Number(mat.id);

            return (
              <div
                key={mat.id}
                className={`rounded-lg border p-4 space-y-3 ${
                  isSelectedMat ? "border-emerald-300 bg-emerald-50/20" : "border-neutral-200"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-neutral-900">
                    {mat.order_index}. {mat.title}{" "}
                    {isDone && (
                      <span className="ml-2 rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                        Selesai
                      </span>
                    )}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleMarkDone(mat.id)}
                      className="rounded border border-emerald-700 px-2.5 py-1 text-xs font-semibold text-emerald-800"
                    >
                      Mark as Done
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMaterialId(mat.id)}
                      className="rounded border border-neutral-300 px-2.5 py-1 text-xs font-semibold text-neutral-700"
                    >
                      Diskusi Materi ({matDiscs.length})
                    </button>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-neutral-700">{mat.content_body}</p>

                {/* Forum diskusi (kolom komentar) di bagian bawah tiap materi */}
                <div className="rounded-lg bg-neutral-50 p-3 space-y-2 text-xs">
                  <p className="font-semibold text-neutral-800">Forum Diskusi Materi:</p>
                  {matDiscs.length === 0 ? (
                    <p className="text-neutral-500">Belum ada komentar pada materi ini.</p>
                  ) : (
                    matDiscs.map((d) => (
                      <div key={d.id} className="rounded bg-white p-2 border">
                        <span className="font-semibold text-neutral-900">{d.sender_name}</span>{" "}
                        <span className="text-[11px] text-emerald-700">({d.sender_role}): </span>
                        <span className="text-neutral-700">{d.comment}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleAddDiscussion} className="flex flex-wrap gap-2">
          <select
            value={activeMaterialId || ""}
            onChange={(e) => setActiveMaterialId(Number(e.target.value))}
            className="rounded-lg border bg-white px-3 py-2 text-xs"
          >
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                Materi {m.order_index}: {m.title}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={discussionText}
            onChange={(e) => setDiscussionText(e.target.value)}
            placeholder="Tulis komentar pada forum diskusi materi..."
            className="flex-1 rounded-lg border px-3 py-2 text-xs"
          />
          <button
            type="submit"
            className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
          >
            Kirim Komentar
          </button>
        </form>
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
