"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TEACHER_LEVELS = [
    { value: "basic", label: "Basic" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
    { value: "professional", label: "Professional" },
];

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState("login"); 

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [username, setUsername] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [applyTeacher, setApplyTeacher] = useState(false);
    const [teacherLevel, setTeacherLevel] = useState("basic");
    const [cvInfo, setCvInfo] = useState("");
    const [professionalLicense, setProfessionalLicense] = useState("");

    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLoginSubmit(e) {
        e.preventDefault();
        setErrorMsg("");
        setLoading(true);

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: loginEmail,
                    password: loginPassword,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setErrorMsg(data.error || "Gagal masuk.");
                setLoading(false);
                return;
            }

            const role = data.user?.role;
            if (role === "admin") {
                router.push("/admin");
            } else if (role === "teacher") {
                router.push("/teacher");
            } else {
                router.push("/dashboard");
            }
            router.refresh();
        } catch {
            setErrorMsg("Gagal terhubung ke server.");
            setLoading(false);
            }
        }

        async function handleRegisterSubmit(e) {
            e.preventDefault();
            setErrorMsg("");
            setLoading(true);

            try {
                const res = await fetch("/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        username,
                        email: regEmail,
                        password: regPassword,
                        applyTeacher,
                        teacher_level: applyTeacher ? teacherLevel : null,
                        cv_info: applyTeacher ? cvInfo : null,
                        professional_license: applyTeacher ? professionalLicense : null,
                    }),
                });

                const data = await res.json();
                if (!res.ok) {
                    setErrorMsg(data.error || "Gagal mendaftar.");
                    setLoading(false);
                    return;
                }

                router.push("/dashboard");
                router.refresh();
            } catch {
                setErrorMsg("Gagal terhubung ke server.");
                setLoading(false);
            }
        }

        return (
            <main className="mx-auto max-w-md px-4 py-12">
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
                    <div className="mb-6 grid grid-cols-2 rounded-xl bg-neutral-100 p-1 text-xs font-semibold">
                        <button
                            type="button"
                            onClick={() => {
                                setMode("login");
                                setErrorMsg("");
                            }}
                            className={`rounded-lg py-2 transition ${
                                mode === "login"
                                    ? "bg-white text-emerald-900 shadow-2xs"
                                    : "text-neutral-600"
                            }`}
                        >
                            Masuk
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMode("register");
                                setErrorMsg("");
                            }}
                            className={`rounded-lg py-2 transition ${
                                mode === "register"
                                    ? "bg-white text-emerald-900 shadow-2xs"
                                    : "text-neutral-600"
                            }`}
                        >
                            Daftar Baru
                        </button>
                    </div>

                    {errorMsg && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-700">
                            {errorMsg}
                        </div>
                    )}

                    {mode === "login" ? (
                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                            <h1 className="text-xl font-bold text-neutral-900">
                                Masuk ke Niskala Rasa
                            </h1>
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-neutral-700">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                                className="w-full rounded-lg border px-3 py-2 text-sm"
                                placeholder="nama@email.com"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-semibold text-neutral-700">
                                Kata Sandi
                            </label>
                            <input
                                type="password"
                                required
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                className="w-full rounded-lg border px-3 py-2 text-sm"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                        >
                            {loading ? "Memproses..." : "Masuk"}
                        </button>
                    </form>
                    ) : (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                        <h1 className="text-xl font-bold text-neutral-900">
                            Daftar Akun Niskala Rasa
                        </h1>

                        <div>
                            <label className="mb-1 block text-xs font-semibold text-neutral-700">
                                Username
                            </label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full rounded-lg border px-3 py-2 text-sm"
                                placeholder="Nama pengguna"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-neutral-700">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                className="w-full rounded-lg border px-3 py-2 text-sm"
                                placeholder="nama@email.com"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-neutral-700">
                                Kata Sandi
                            </label>
                            <input
                                type="password"
                                required
                                value={regPassword}
                                onChange={(e) => setRegPassword(e.target.value)}
                                className="w-full rounded-lg border px-3 py-2 text-sm"
                                placeholder="Minimal 6 karakter"
                            />
                        </div>

                        <label className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs font-semibold text-emerald-950">
                            <input
                                type="checkbox"
                                checked={applyTeacher}
                                onChange={(e) => setApplyTeacher(e.target.checked)}
                                className="accent-emerald-700"
                            />
                            <span>Daftar sebagai Teacher (Pengajar Rempah Indonesia)</span>
                        </label>

                        {applyTeacher && (
                            <div className="space-y-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3.5">
                                <p className="text-xs font-bold text-neutral-800">
                                    Data Kualifikasi Guru
                                </p>
                                <div>
                                    <label className="mb-1 block text-xs font-semibold text-neutral-700">
                                        Jenjang Mengajar
                                    </label>
                                <select
                                    value={teacherLevel}
                                    onChange={(e) => setTeacherLevel(e.target.value)}
                                    className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
                                >
                                    {TEACHER_LEVELS.map((lvl) => (
                                        <option key={lvl.value} value={lvl.value}>
                                            {lvl.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-neutral-700">
                                    Curriculum Vitae (CV)
                                </label>
                                <textarea
                                    rows={3}
                                    required={applyTeacher}
                                    value={cvInfo}
                                    onChange={(e) => setCvInfo(e.target.value)}
                                    className="w-full rounded-lg border bg-white px-3 py-2 text-xs"
                                    placeholder="Ringkasan pengalaman mengajar/pengolahan rempah atau tautan CV..."
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-neutral-700">
                                    Lisensi Keprofesionalan
                                </label>
                                <input
                                    type="text"
                                    required={applyTeacher}
                                    value={professionalLicense}
                                    onChange={(e) => setProfessionalLicense(e.target.value)}
                                    className="w-full rounded-lg border bg-white px-3 py-2 text-xs"
                                    placeholder="Nomor/sertifikat lisensi profesi kuliner & rempah"
                                />
                            </div>
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                    >
                        {loading ? "Menyimpan..." : "Daftar"}
                    </button>
                </form>
            )}
        </div>
    </main>
    );
}
