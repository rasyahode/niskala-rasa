import Link from "next/link";
import pool from "@/lib/db";

const DEFAULT_INDONESIAN_SPICES = [
    {
        id: 1,
        name: "Kayu Manis Kerinci",
        origin_region: "Jambi, Indonesia",
        dominant_taste: "manis",
        processing_method: "Sangrai singkat api kecil lalu giling atau infusi hangat.",
    },
    {
        id: 2,
        name: "Cengkeh Maluku",
        origin_region: "Maluku, Indonesia",
        dominant_taste: "pedas",
        processing_method: "Sangrai ringan terukur atau seduh dalam kaldu maupun minyak rempah.",
    },
    {
        id: 3,
        name: "Pala Banda",
        origin_region: "Maluku, Indonesia",
        dominant_taste: "pahit",
        processing_method: "Parut segar atau sangrai tipis agar aroma minyak atsiri tetap terjaga.",
    },
    {
        id: 4,
        name: "Andaliman",
        origin_region: "Sumatera Utara, Indonesia",
        dominant_taste: "asam",
        processing_method: "Haluskan segar di akhir proses agar karakter segar dan sensasi kebas tidak hilang.",
    },
    {
        id: 5,
        name: "Kapulaga Hijau",
        origin_region: "Nusantara, Indonesia",
        dominant_taste: "manis",
        processing_method: "Memarkan polong sebelum disangrai ringan agar biji di dalamnya aktif.",
    },
];

export default async function SpicesPage() {
    let spices = DEFAULT_INDONESIAN_SPICES;

    try {
        const result = await pool.query(`
            SELECT id, name, origin_region, dominant_taste, processing_method
            FROM spices
            ORDER BY id ASC
        `);
        if (result.rows.length > 0) {
            spices = result.rows;
        }
    } catch (error) {
        console.error("Gagal mengambil data rempah Indonesia:", error);
    }

    return (
        <main className="mx-auto max-w-5xl px-4 py-10 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                        Katalog Rempah · Niskala Rasa
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-neutral-900">
                        Pengolahan Rempah Khas Indonesia
                    </h1>
                    <p className="mt-1 text-sm text-neutral-600">
                        Profil rempah asal daerah di Indonesia dan teknik pengolahan yang dipakai pada kursus
                        daring maupun Studio Makassar.
                    </p>
                </div>

                <Link
                    href="/recipes"
                    className="rounded-lg border border-emerald-700 px-4 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                >
                    Lihat Resep
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {spices.map((spice) => (
                    <article
                        key={spice.id}
                        className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 space-y-3"
                    >
                        <div>
                            <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-emerald-800">
                                Rasa: {spice.dominant_taste}
                            </span>
                            <h2 className="mt-2.5 text-lg font-bold text-neutral-900">
                                {spice.name}
                            </h2>
                            <p className="text-xs font-medium text-neutral-500">
                                Asal: {spice.origin_region}
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
