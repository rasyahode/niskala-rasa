"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [mode, setMode] = useState("login");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        const fd = new FormData(e.currentTarget);
        const endpoint = mode === "login" ? "/api/login" : "/api/register";
        const payload =
            mode === "login"
                ? {
                    email: fd.get("email"),
                    password: fd.get("password"),
                }
                : {
                    username: fd.get("username"),
                    email: fd.get("email"),
                    password: fd.get("password"),
                    applyTeacher: fd.get("apply_teacher") === "on",
                };

        try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
            setError(data.error || "Permintaan gagal.");
            setLoading(false);
            return;
        }
        router.push(data.redirectTo || "/");
        router.refresh();
        } catch {
        setError("Gagal terhubung ke server.");
        setLoading(false);
        }
    }

    return (
        <main className="mx-auto max-w-md px-4 py-12">
            <div className="rounded-2xl border bg-white p-6 shadow-xs">
                <div className="mb-6 flex rounded-lg bg-neutral-100 p-1 text-sm font-medium">
                    <button
                        type="button"
                        onClick={() => {
                            setMode("login");
                            setError("");
                        }}
                        className={`w-1/2 rounded-md py-2 ${
                            mode === "login"
                                ? "bg-white text-emerald-800 shadow-2xs"
                                : "text-neutral-600"
                        }`}
                    >
                        Masuk
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setMode("register");
                            setError("");
                        }}
                        className={`w-1/2 rounded-md py-2 ${
                        mode === "register"
                            ? "bg-white text-emerald-800 shadow-2xs"
                            : "text-neutral-600"
                        }`}
                    >
                        Daftar Baru
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <h1 className="text-xl font-bold text-neutral-900">
                        {mode === "login" ? "Masuk ke Niskala Rasa" : "Buat Akun Baru"}
                    </h1>

                    {error ? (
                        <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>
                    ) : null}

                    {mode === "register" && (
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-neutral-700">
                                Nama Lengkap
                            </label>
                            <input
                                name="username"
                                type="text"
                                required
                                placeholder="Nama Anda"
                                className="w-full rounded-lg border px-3 py-2 text-sm"
                            />
                        </div>
                    )}

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-neutral-700">
                            Email
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder="student@niskalarasa.id"
                            className="w-full rounded-lg border px-3 py-2 text-sm"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-semibold text-neutral-700">
                            Kata Sandi
                        </label>
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full rounded-lg border px-3 py-2 text-sm"
                        />
                    </div>

                    {mode === "register" && (
                        <label className="flex items-start gap-2 rounded-lg border bg-neutral-50 p-3 text-xs text-neutral-700">
                            <input type="checkbox" name="apply_teacher" className="mt-0.5" />
                            <span>
                                Ajukan akun sebagai <strong>Teacher / Spice Master</strong> (menunggu
                                validasi Admin).
                            </span>
                        </label>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
                    >
                        {loading ? "Memproses..." : mode === "login" ? "Masuk" : "Daftar Sekarang"}
                    </button>

                    {mode === "login" && (
                        <div className="rounded-lg bg-emerald-50/70 p-3 text-[11px] text-emerald-950">
                            <p className="mb-1 font-semibold">Akun Uji Coba 4 Peran:</p>
                            <p>• Admin: admin@niskalarasa.id / admin123</p>
                            <p>• Teacher: teacher@niskalarasa.id / teacher123</p>
                            <p>• Student: student@niskalarasa.id / student123</p>
                            <p>• Calon Teacher: pending@niskalarasa.id / pending123</p>
                        </div>
                    )}
                </form>
            </div>
        </main>
    );
}