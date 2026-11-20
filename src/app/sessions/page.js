import Link from "next/link";

const HYBRID_SESSIONS = [
    {
        id: 1,
        title: "Fundamental Spice Blending & Aktivasi Aroma",
        mode: "Daring (Live Streaming)",
        location: "Live Zoom / Studio Niskala",
        schedule: "Sabtu, 28 Nov 2026 · 10:00 WITA",
        spiceMaster: "Chef Spice Master Niskala",
    },
    {
        id: 2,
        title: "Racikan Rempah Nusantara & Keseimbangan Rasa",
        mode: "Tatap Muka (Hybrid Studio)",
        location: "Studio Makassar",
        schedule: "Minggu, 29 Nov 2026 · 14:00 WITA",
        spiceMaster: "Spice Master Studio Makassar",
    },
    {
        id: 3,
        title: "Infusi Rempah & Teknik Sangrai Kering",
        mode: "Daring (Live Streaming)",
        location: "Live Streaming Kelas",
        schedule: "Rabu, 02 Des 2026 · 19:00 WITA",
        spiceMaster: "Tim Kurikulum Niskala Rasa",
    },
];

export default function HybridSessionsPage() {
    return (
        <main className="mx-auto max-w-5xl px-4 py-10">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                        Jadwal Masterclass Hibrida
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-neutral-900">
                        Kelas Daring &amp; Studio Makassar
                    </h1>
                    <p className="mt-1 text-sm text-neutral-600">
                        Daftar sesi masterclass *spice blending* untuk akses publik dan peserta.
                    </p>
                </div>

                <Link
                    href="/login"
                    className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                >
                    Masuk untuk Ikut Kelas
                </Link>
            </div>

            <div className="space-y-4">
                {HYBRID_SESSIONS.map((session) => (
                    <div
                        key={session.id}
                        className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-5"
                    >
                        <div>
                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                                {session.mode}
                            </span>
                            <h2 className="mt-2 text-base font-bold text-neutral-900">
                                {session.title}
                            </h2>
                            <p className="mt-1 text-xs text-neutral-600">
                                {session.schedule} · {session.location} · {session.spiceMaster}
                            </p>
                        </div>

                        <Link
                            href="/spices"
                            className="rounded-lg border px-3.5 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                        >
                            Lihat Rempah
                        </Link>
                    </div>
                ))}
            </div>
        </main>
    );
}
