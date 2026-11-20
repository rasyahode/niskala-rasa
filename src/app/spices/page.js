import Link from "next/link";

const SPICES_CATALOG = [
    {
        id: "andaliman",
        name: "Andaliman",
        origin: "Sumatera Utara, Indonesia",
        category: "Citrus & Szechuan-like",
        dominantTaste: "Asam Segar & Kebas Halus",
        activation: "Haluskan segar di akhir proses atau infusi hangat tanpa memasak terlalu lama.",
        aromaNotes: "Jeruk nipis, serai, sensasi kesemutan/kebas ringan pada lidah.",
    },
    {
        id: "kayu-manis-kerinci",
        name: "Kayu Manis Kerinci",
        origin: "Jambi, Indonesia",
        category: "Warm Sweet Bark",
        dominantTaste: "Manis Hangat",
        activation: "Sangrai kering sebentar atau rebus/infusi perlahan untuk melepas minyak atsiri.",
        aromaNotes: "Manis kayu, hangat, sedikit pedas lembut, aroma klasik yang menenangkan.",
    },
    {
        id: "kapulaga-hijau",
        name: "Kapulaga Hijau",
        origin: "Nusantara & India",
        category: "Aromatic Pod",
        dominantTaste: "Segar Herbal & Manis",
        activation: "Memarkan polong sebelum disangrai ringan agar biji di dalamnya aktif.",
        aromaNotes: "Eukaliptus lembut, citrus, floral hangat.",
    },
    {
        id: "ketumbar-sangrai",
        name: "Ketumbar",
        origin: "Nusantara & Mediterania",
        category: "Earthy Citrus Seed",
        dominantTaste: "Gurih Segar & Sedikit Manis",
        activation: "Sangrai dengan api kecil hingga harum lalu giling kasar atau halus.",
        aromaNotes: "Kulit jeruk kering, tanah hangat, penyeimbang bumbu tajam.",
    },
    {
        id: "cengkeh-zanzibar-maluku",
        name: "Cengkeh",
        origin: "Maluku, Indonesia",
        category: "Intense Floral Bud",
        dominantTaste: "Pedas Hangat & Pahit Halus",
        activation: "Gunakan terukur; sangrai singkat atau seduh dalam kaldu/infusi.",
        aromaNotes: "Kuat, tajam, hangat, kaya eugenol dengan jejak rasa yang tahan lama.",
    },
    {
        id: "sumac",
        name: "Sumac",
        origin: "Timur Tengah & Mediterania",
        category: "Tart Crimson Spice",
        dominantTaste: "Asam Segar",
        activation: "Taburkan di akhir atau campurkan ke racikan kering/marinasi tanpa panas berlebih.",
        aromaNotes: "Asam cerah mirip perasan lemon dengan nuansa buah beri kering.",
    },
];

export default function SpicesEncyclopediaPage() {
    return (
        <main className="mx-auto max-w-6xl px-4 py-10">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-neutral-200 pb-6">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                        Akses Publik Guest · Niskala Rasa
                    </p>
                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-900">
                        Ensiklopedia Rempah &amp; Aktivasi Aroma
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-neutral-600">
                        Pelajari karakter rasa, asal rempah Nusantara dan dunia, serta teknik aktivasi
                        panas/infusi sebelum meracik blend pada masterclass daring maupun Studio Makassar.
                    </p>
                </div>

                <Link
                    href="/recipes"
                    className="rounded-lg border border-emerald-700 px-4 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                >
                    Lihat Katalog Resep
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {SPICES_CATALOG.map((spice) => (
                    <article
                        key={spice.id}
                        className="flex flex-col justify-between rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xs"
                    >
                        <div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800">
                                    {spice.dominantTaste}
                                </span>
                                <span className="text-xs text-neutral-500">{spice.category}</span>
                            </div>
                            <h2 className="mt-3 text-lg font-bold text-neutral-900">{spice.name}</h2>
                            <p className="text-xs font-medium text-neutral-500">Asal: {spice.origin}</p>
                            <p className="mt-3 text-sm text-neutral-700">
                                <span className="font-semibold text-neutral-900">Profil Aroma: </span>
                                {spice.aromaNotes}
                            </p>
                        </div>

                        <div className="mt-4 rounded-xl bg-neutral-50 p-3.5 text-xs text-neutral-700">
                            <p className="font-semibold text-emerald-900">Teknik Aktivasi:</p>
                            <p className="mt-1 leading-relaxed">{spice.activation}</p>
                        </div>
                    </article>
                ))}
            </div>
        </main>
    );
}
