"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const BASE_SPICES = [
    {
        id: "ketumbar",
        name: "Ketumbar",
        note: "Gurih hangat & citrus lembut",
        defaultGrams: 12,
        tastes: { manis: 1, asam: 1, asin: 0, pahit: 0, pedas: 0, umami: 2 },
    },
    {
        id: "kayu-manis",
        name: "Kayu Manis Kerinci",
        note: "Manis kayu & hangat",
        defaultGrams: 6,
        tastes: { manis: 3, asam: 0, asin: 0, pahit: 1, pedas: 0, umami: 0 },
    },
    {
        id: "kapulaga",
        name: "Kapulaga Hijau",
        note: "Segar herbal & aromatik",
        defaultGrams: 4,
        tastes: { manis: 1, asam: 1, asin: 0, pahit: 0, pedas: 0, umami: 1 },
    },
    {
        id: "cengkeh",
        name: "Cengkeh Maluku",
        note: "Tajam hangat & pedas aromatik",
        defaultGrams: 2,
        tastes: { manis: 0, asam: 0, asin: 0, pahit: 1, pedas: 3, umami: 0 },
    },
    {
        id: "sumac",
        name: "Sumac",
        note: "Asam cerah & segar",
        defaultGrams: 5,
        tastes: { manis: 0, asam: 3, asin: 0, pahit: 0, pedas: 0, umami: 0 },
    },
];

const METHODS = [
    {
        id: "sangrai",
        label: "Sangrai Kering (Dry Toast)",
        desc: "Menguatkan aroma sangrai & ketajaman minyak atsiri sebelum digiling.",
    },
    {
        id: "infusi",
        label: "Infusi Hangat (Warm Steep)",
        desc: "Cocok untuk kaldu, minyak rempah, atau marinasi bertahap.",
    },
    {
        id: "segar",
        label: "Racikan Segar (Raw Blend)",
        desc: "Menjaga kesegaran asam/citrus dan karakter rempah halus di akhir.",
    },
];

export default function SpiceBlendSimulatorPage() {
    const [blendName, setBlendName] = useState("Racikan Niskala Signature");
    const [method, setMethod] = useState("sangrai");
    const [gramsById, setGramsById] = useState(() =>
        Object.fromEntries(BASE_SPICES.map((s) => [s.id, s.defaultGrams]))
    );

    const totalGrams = useMemo(
        () => BASE_SPICES.reduce((sum, s) => sum + (Number(gramsById[s.id]) || 0), 0),
        [gramsById]
    );

    const tasteSummary = useMemo(() => {
        const score = { manis: 0, asam: 0, asin: 0, pahit: 0, pedas: 0, umami: 0 };
        if (totalGrams <= 0) return score;

    for (const s of BASE_SPICES) {
        const weight = (Number(gramsById[s.id]) || 0) / totalGrams;
        for (const key of Object.keys(score)) {
            score[key] += s.tastes[key] * weight * 10;
        }
    }

    if (method === "sangrai") {
        score.pahit += 1.2;
        score.umami += 1.5;
    } else if (method === "infusi") {
        score.manis += 1.2;
        score.umami += 1.0;
    } else if (method === "segar") {
        score.asam += 1.8;
    }

    return score;
}, [gramsById, totalGrams, method]);

const dominantTaste = useMemo(() => {
    const entries = Object.entries(tasteSummary).sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0] || "manis";
}, [tasteSummary]);

function handleGramChange(id, value) {
    const num = Math.max(0, Math.min(100, Number(value) || 0));
    setGramsById((prev) => ({ ...prev, [id]: num }));
}

function handleReset() {
    setBlendName("Racikan Niskala Signature");
    setMethod("sangrai");
    setGramsById(Object.fromEntries(BASE_SPICES.map((s) => [s.id, s.defaultGrams])));
}

const activeMethod = METHODS.find((m) => m.id === method) || METHODS[0];

return (
    <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-6">
            <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Akses Publik Guest · Laboratorium Racikan
                </p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-900">
                    Spice Blend Simulator
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-neutral-600">
                    Simulasikan proporsi gram rempah, pilih metode aktivasi aroma, dan pantau
                    kecenderungan profil rasa sebelum praktik langsung di sesi daring atau Studio Makassar.
                </p>
            </div>

            <Link
                href="/spices"
                className="rounded-lg border border-emerald-700 px-4 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
            >
                Ensiklopedia Rempah
            </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Panel Pengaturan Racikan */}
            <section className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6 lg:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex-1 min-w-[220px]">
                        <label className="mb-1 block text-xs font-semibold text-neutral-700">
                            Nama Racikan Blend
                        </label>
                        <input
                            type="text"
                            value={blendName}
                            onChange={(e) => setBlendName(e.target.value)}
                            className="w-full rounded-lg border px-3 py-2 text-sm font-medium text-neutral-900"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleReset}
                        className="mt-5 rounded-lg border px-3.5 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                    >
                        Reset Takaran
                    </button>
                </div>

                <div>
                    <p className="mb-2 text-xs font-semibold text-neutral-700">
                        Metode Aktivasi Aroma
                    </p>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                        {METHODS.map((m) => (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => setMethod(m.id)}
                                className={`rounded-xl border p-3 text-left transition ${
                                    method === m.id
                                    ? "border-emerald-700 bg-emerald-50/80 text-emerald-950"
                                    : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                                }`}
                            >
                                <p className="text-xs font-bold">{m.label}</p>
                                <p className="mt-1 text-[11px] leading-snug text-neutral-600">{m.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 pt-2">
                    <h2 className="text-sm font-bold text-neutral-900">
                        Atur Proporsi Rempah (Total: {totalGrams} g)
                    </h2>

                    {BASE_SPICES.map((spice) => {
                        const grams = Number(gramsById[spice.id]) || 0;
                        const pct = totalGrams > 0 ? Math.round((grams / totalGrams) * 100) : 0;

                        return (
                            <div
                                key={spice.id}
                                className="rounded-xl border border-neutral-100 bg-neutral-50/70 p-3.5"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <span className="text-sm font-semibold text-neutral-900">
                                            {spice.name}
                                        </span>
                                        <span className="ml-2 text-xs text-neutral-500">({spice.note})</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                                        <span>{grams} g</span>
                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px]">
                                            {pct}%
                                        </span>
                                    </div>
                                </div>

                                <input
                                    type="range"
                                    min="0"
                                    max="40"
                                    value={grams}
                                    onChange={(e) => handleGramChange(spice.id, e.target.value)}
                                    className="mt-2.5 w-full accent-emerald-700"
                                />
                            </div>
                        );
                    })}
                </div>
            </section>

            <aside className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                        Hasil Simulasi
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-neutral-900">
                        {blendName || "Racikan Tanpa Nama"}
                    </h2>
                    <p className="mt-1 text-xs text-neutral-600">
                        Dominan rasa saat ini:{" "}
                        <span className="font-bold capitalize text-emerald-800">{dominantTaste}</span>
                    </p>
                </div>

                <div className="rounded-xl bg-emerald-50/70 p-3.5 text-xs text-emerald-950">
                    <p className="font-semibold">{activeMethod.label}</p>
                    <p className="mt-1 leading-relaxed">{activeMethod.desc}</p>
                </div>

                <div className="space-y-2.5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                        Spektrum Rasa Racikan
                    </h3>
                    {Object.entries(tasteSummary).map(([key, val]) => {
                        const widthPct = Math.min(100, Math.round((val / 35) * 100));
                        return (
                            <div key={key}>
                                <div className="mb-1 flex justify-between text-xs">
                                    <span className="capitalize font-medium text-neutral-800">{key}</span>
                                    <span className="text-neutral-500">{val.toFixed(1)}</span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                                    <div
                                        className="h-full rounded-full bg-emerald-700 transition-all"
                                        style={{ width: `${widthPct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </aside>
        </div>
    </main>
    );
}
