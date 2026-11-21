import Link from "next/link";
import pool from "@/lib/db";
import { SPICES_50_DATASET } from "@/lib/spices-data";

const TASTE_FILTERS = ["semua", "manis", "asam", "pedas", "pahit"];

export default async function SpicesPage({ searchParams }) {
    const params = await searchParams;
    const selectedTaste = String(params?.taste || "semua").toLowerCase();

    let spices = SPICES_50_DATASET;

    try {
        const result = await pool.query(`SELECT * FROM spices ORDER BY id ASC`);
        if (result.rows.length > 0) {
            const dbByName = new Map(
                result.rows.map((row) => [String(row.name || "").toLowerCase(), row])
        );

        const mergedFrom50 = SPICES_50_DATASET.map((item) => {
            const dbRow = dbByName.get(item.name.toLowerCase());
            if (!dbRow) return item;
            return {
                ...item,
                id: dbRow.id ?? item.id,
                latin_name: dbRow.latin_name || item.latin_name,
                plant_part: dbRow.plant_part || item.plant_part,
                origin_region: dbRow.origin_region || item.origin_region,
                dominant_taste: dbRow.dominant_taste || item.dominant_taste,
                characteristics: dbRow.characteristics || item.characteristics,
                processing_method: dbRow.processing_method || item.processing_method,
            };
        });

        const knownNames = new Set(SPICES_50_DATASET.map((s) => s.name.toLowerCase()));
        const extraDbRows = result.rows
            .filter((row) => !knownNames.has(String(row.name || "").toLowerCase()))
            .map((row, idx) => ({
                id: row.id ?? 100 + idx,
                name: row.name,
                latin_name: row.latin_name || "Rempah Nusantara",
                plant_part: row.plant_part || "Bagian Tanaman",
                origin_region: row.origin_region || "Indonesia",
                dominant_taste: row.dominant_taste || "manis",
                characteristics: row.characteristics || row.processing_method || "-",
                processing_method:
                    row.processing_method ||
                    "Olah rempah sesuai karakter bahan agar aroma dan cita rasanya optimal.",
            }));

        spices = [...mergedFrom50, ...extraDbRows];
        }
    } catch (error) {
        console.error("Gagal mengambil data rempah dari database, memakai dataset 50 rempah:", error);
    }

    const filteredSpices =
        selectedTaste === "semua"
            ? spices
            : spices.filter(
                (item) => String(item.dominant_taste || "").toLowerCase() === selectedTaste
            );

    return (
        <main className="mx-auto max-w-6xl px-4 py-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                        Katalog Rempah · Niskala Rasa ({filteredSpices.length} Rempah)
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-neutral-900">
                        Pengolahan 50 Rempah Khas Indonesia
                    </h1>
                    <p className="mt-1 text-sm text-neutral-600">
                        Nama ilmiah, bagian tanaman, karakteristik &amp; fungsi utama, serta teknik pengolahan
                        untuk kursus daring maupun Studio Makassar.
                    </p>
                </div>

                <Link
                    href="/recipes"
                    className="rounded-lg border border-emerald-700 px-4 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                >
                    Lihat Resep
                </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-neutral-600">Filter Rasa:</span>
                {TASTE_FILTERS.map((taste) => {
                    const isActive = selectedTaste === taste;
                    const href = taste === "semua" ? "/spices" : `/spices?taste=${taste}`;
                    return (
                        <Link
                            key={taste}
                            href={href}
                            className={`rounded-full px-3.5 py-1 text-xs font-semibold capitalize transition ${
                                isActive
                                ? "bg-emerald-700 text-white"
                                : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                            }`}
                        >
                            {taste}
                        </Link>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSpices.map((spice, index) => (
                    <article
                        key={`${spice.id}-${spice.name}-${index}`}
                        className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 space-y-3"
                    >
                        <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                            <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-emerald-800">
                                Rasa: {spice.dominant_taste}
                            </span>
                            <span className="text-xs font-medium text-neutral-500">
                                {spice.plant_part}
                            </span>
                        </div>

                        <h2 className="text-lg font-bold text-neutral-900">{spice.name}</h2>
                        <p className="text-xs italic text-neutral-500">{spice.latin_name}</p>
                        <p className="text-xs font-medium text-neutral-600">
                            Asal: {spice.origin_region}
                        </p>
                        <p className="pt-1 text-xs leading-relaxed text-neutral-700">
                            <span className="font-semibold text-neutral-900">Karakteristik &amp; Fungsi: </span>
                            {spice.characteristics}
                        </p>
                    </div>

                    <div className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-700">
                        <p className="font-semibold text-neutral-900">Teknik Pengolahan:</p>
                        <p className="mt-1 leading-relaxed">{spice.processing_method}</p>
                    </div>
                </article>
            ))}
        </div>
    </main>
    );
}
