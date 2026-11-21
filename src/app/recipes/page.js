import Link from "next/link";
import pool from "@/lib/db";

const TASTE_FILTERS = ["semua", "manis", "asam", "pedas", "pahit"];

const FALLBACK_RECIPES = [
    {
        id: 1,
        title: "Spiced Lamb Tagine",
        origin_country: "Maroko",
        indonesian_spices: "Kayu Manis Kerinci, Cengkeh Maluku, Kapulaga Hijau",
        dominant_taste: "manis",
        summary:
            "Rebusan daging domba khas Maroko dengan kuah kaldu beraroma hangat kayu manis Kerinci, kapulaga hijau, dan cengkeh Maluku.",
        spice_prep:
            "Sangrai singkat kayu manis Kerinci, cengkeh Maluku, dan kapulaga hijau yang sudah dimemarkan selama 1–2 menit dengan api kecil hingga harum.",
        cooking_steps:
            "1. Tumis bawang bombay dan bawang putih hingga harum. 2. Masukkan potongan daging domba dan rempah yang sudah disangrai. 3. Tambahkan kaldu, tomat cincang, dan sedikit madu/kurma, lalu masak dengan api kecil tertutup hingga daging empuk.",
    },
    {
        id: 2,
        title: "Spiced Chai Infusion",
        origin_country: "India",
        indonesian_spices: "Kayu Manis Kerinci, Kapulaga Hijau, Cengkeh Maluku",
        dominant_taste: "manis",
        summary:
            "Seduhan teh hitam dan susu dengan aroma rempah hangat dari kayu manis Kerinci, kapulaga hijau, dan cengkeh Maluku.",
        spice_prep:
            "Memarkan kapulaga hijau dan cengkeh Maluku, lalu sangrai kering sebentar bersama potongan kayu manis Kerinci.",
        cooking_steps:
            "1. Didihkan air bersama rempah yang sudah disangrai selama 3–4 menit. 2. Masukkan daun teh hitam dan seduh 2 menit. 3. Tuang susu, didihkan perlahan sebentar, saring, dan beri pemanis secukupnya.",
    },
    {
        id: 3,
        title: "Warm Nutmeg Cream Sauce",
        origin_country: "Prancis",
        indonesian_spices: "Pala Banda",
        dominant_taste: "pahit",
        summary:
            "Saus krim gurih bergaya klasik Prancis dengan karakter hangat dan sedikit pahit aromatik dari pala Banda segar.",
        spice_prep:
            "Parut biji pala Banda segar secukupnya (hindari merebus terlalu lama agar minyak atsirinya tidak menguap).",
        cooking_steps:
            "1. Lelehkan mentega dengan api kecil, aduk tepung terigu sebentar menjadi roux. 2. Tuang susu/krim hangat sedikit demi sedikit sambil diaduk hingga mengental. 3. Matikan api atau kecilkan, lalu aduk masuk pala Banda parut dan garam.",
    },
    {
        id: 4,
        title: "Citrus Herb Poached Fish",
        origin_country: "Yunani",
        indonesian_spices: "Andaliman, Kapulaga Hijau",
        dominant_taste: "asam",
        summary:
            "Ikan yang dimasak perlahan dalam kuah kaldu segar bernuansa sitrus dengan sentuhan andaliman dan kapulaga hijau.",
        spice_prep:
            "Haluskan kasar andaliman segar dan memarkan kapulaga hijau; simpan andaliman agar dimasukkan di tahap akhir.",
        cooking_steps:
            "1. Didihkan kaldu ringan bersama air perasan lemon/jeruk dan kapulaga hijau, lalu kecilkan api hingga tenang (poach). 2. Masukkan potongan ikan dan masak 6–8 menit hingga matang lembut. 3. Taburkan andaliman di akhir agar aroma segar dan sensasi kebasnya tetap terasa.",
    },
    {
        id: 5,
        title: "Kolak Pisang Kayu Manis Kerinci",
        origin_country: "Indonesia",
        indonesian_spices: "Kayu Manis Kerinci, Kapulaga Hijau",
        dominant_taste: "manis",
        summary:
            "Hidangan manis khas Indonesia berkuah santan dan gula aren dengan keharuman kayu manis Kerinci serta kapulaga.",
        spice_prep:
            "Sangrai singkat kayu manis Kerinci dan kapulaga hijau yang dimemarkan agar aromanya keluar tanpa membuat kuah keruh.",
        cooking_steps:
            "1. Rebus gula aren dan air hingga larut lalu saring. 2. Masukkan kayu manis Kerinci, kapulaga hijau, dan potongan pisang kepok/tanduk hingga pisang melunak. 3. Tuang santan sambil diaduk perlahan dengan api kecil hingga mendidih rata.",
    },
    {
        id: 6,
        title: "Coto Makassar Rempah Pilihan",
        origin_country: "Indonesia",
        indonesian_spices: "Cengkeh Maluku, Pala Banda, Kapulaga Hijau",
        dominant_taste: "pedas",
        summary:
            "Sup daging khas Makassar dengan kuah kaldu berempah Nusantara yang gurih, hangat, dan berkarakter kuat.",
        spice_prep:
            "Sangrai ringan cengkeh Maluku, pala Banda, dan kapulaga hijau sebelum dihaluskan bersama bumbu dasar.",
        cooking_steps:
            "1. Rebus daging hingga empuk, ambil kaldunya. 2. Tumis bumbu halus dan rempah pilihan hingga matang dan berminyak. 3. Masukkan bumbu ke kuah kaldu, bumbui garam dan cabai/merica sesuai selera, lalu sajikan panas.",
    },
];

function isIndonesianOrigin(countryText) {
    const value = String(countryText || "").toLowerCase();
    return value.includes("indonesia") || value.includes("nusantara");
}

function usesIndonesianSpice(recipe) {
    const explicitSpices = String(recipe.indonesian_spices || "").trim();
    return explicitSpices.length > 0 && explicitSpices !== "-";
}

export default async function RecipesPage({ searchParams }) {
    const params = await searchParams;
    const selectedTaste = String(params?.taste || "semua").toLowerCase();

    let recipes = FALLBACK_RECIPES;

    try {
        const result = await pool.query(`SELECT * FROM recipes ORDER BY id ASC`);
        if (result.rows.length > 0) {
            recipes = result.rows.map((row) => {
                const matchedFallback = FALLBACK_RECIPES.find(
                    (f) => f.title.toLowerCase() === String(row.title || "").toLowerCase()
                );
                return {
                    ...matchedFallback,
                    ...row,
                    spice_prep:
                        row.spice_prep ||
                        matchedFallback?.spice_prep ||
                        "Sangrai ringan atau haluskan rempah khas Indonesia sesuai karakter aromanya sebelum dipadukan.",
                    cooking_steps:
                        row.cooking_steps ||
                        row.steps ||
                        matchedFallback?.cooking_steps ||
                        "1. Siapkan bahan utama dan rempah. 2. Olah rempah dengan api terkontrol agar aroma tidak gosong. 3. Padukan dengan bahan utama hingga matang merata.",
                };
            });
        }
    } catch (error) {
        console.error("Gagal mengambil data resep:", error);
    }

    const normalized = recipes.map((r) => ({
        ...r,
        countryLabel: r.origin_country || r.country || r.origin || "Indonesia",
    }));

    const filtered =
        selectedTaste === "semua"
            ? normalized
            : normalized.filter(
                (item) => String(item.dominant_taste || "").toLowerCase() === selectedTaste
            );

    const recommendedForeign = filtered.filter(
        (item) => !isIndonesianOrigin(item.countryLabel) && usesIndonesianSpice(item)
    );
    const indonesianRecipes = filtered.filter((item) =>
        isIndonesianOrigin(item.countryLabel)
    );
    
    return (
        <main className="mx-auto max-w-5xl px-4 py-10 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                        Katalog &amp; Cara Pengolahan · Niskala Rasa
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-neutral-900">
                        Resep Khas Indonesia &amp; Rekomendasi Luar Negeri Berempah Indonesia
                    </h1>
                    <p className="mt-1 text-sm text-neutral-600">
                        Telusuri semua resep, cek rempah asal Indonesia yang dipakai, dan buka cara
                        pengolahannya.
                    </p>
                </div>

                <Link
                    href="/spices"
                    className="rounded-lg border border-emerald-700 px-4 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                >
                    Lihat Rempah Indonesia
                </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-neutral-600">Filter Rasa:</span>
                {TASTE_FILTERS.map((taste) => {
                    const isActive = selectedTaste === taste;
                    const href = taste === "semua" ? "/recipes" : `/recipes?taste=${taste}`;
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

            <section className="space-y-4">
                <h2 className="text-lg font-bold text-neutral-900">
                    Rekomendasi Resep Luar Negeri Berempah Khas Indonesia ({recommendedForeign.length})
                </h2>

                {recommendedForeign.length === 0 ? (
                    <div className="rounded-xl border bg-white p-5 text-sm text-neutral-600">
                        Tidak ada resep luar negeri berempah Indonesia untuk filter ini.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {recommendedForeign.map((recipe) => (
                            <article
                                key={recipe.id}
                                className="flex flex-col justify-between rounded-xl border border-emerald-200 bg-white p-5 space-y-3"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                                            Direkomendasikan · {recipe.countryLabel}
                                        </span>
                                        <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium capitalize text-neutral-700">
                                            Rasa: {recipe.dominant_taste || "-"}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-bold text-neutral-900">{recipe.title}</h3>
                                    <p className="text-sm text-neutral-600 leading-relaxed">{recipe.summary}</p>
                                    {recipe.indonesian_spices && (
                                        <p className="rounded-lg bg-emerald-50/70 p-2.5 text-xs text-emerald-950">
                                            <span className="font-semibold">Rempah Khas Indonesia: </span>
                                            {recipe.indonesian_spices}
                                        </p>
                                    )}
                                </div>

                                <details className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs">
                                    <summary className="cursor-pointer font-semibold text-emerald-800">
                                        Lihat Cara Pengolahan Rempah &amp; Resep
                                    </summary>
                                    <div className="mt-2.5 space-y-2 text-neutral-700">
                                        <div>
                                            <p className="font-semibold text-neutral-900">Cara Mengolah Rempah:</p>
                                            <p className="mt-0.5 leading-relaxed">{recipe.spice_prep}</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-neutral-900">Langkah Memasak:</p>
                                            <p className="mt-0.5 leading-relaxed">{recipe.cooking_steps}</p>
                                        </div>
                                    </div>
                                </details>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section className="space-y-4">
                <h2 className="text-lg font-bold text-neutral-900">
                    Resep Khas Indonesia ({indonesianRecipes.length})
                </h2>

                {indonesianRecipes.length === 0 ? (
                    <div className="rounded-xl border bg-white p-5 text-sm text-neutral-600">
                        Tidak ada resep khas Indonesia untuk filter ini.
                    </div>
                ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {indonesianRecipes.map((recipe) => (
                        <article
                            key={recipe.id}
                            className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 space-y-3"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                                        Khas Indonesia · {recipe.countryLabel}
                                    </span>
                                    <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium capitalize text-neutral-700">
                                        Rasa: {recipe.dominant_taste || "-"}
                                    </span>
                                </div>

                                <h3 className="text-base font-bold text-neutral-900">{recipe.title}</h3>
                                <p className="text-sm text-neutral-600 leading-relaxed">{recipe.summary}</p>

                                {recipe.indonesian_spices && (
                                    <p className="rounded-lg bg-neutral-50 p-2.5 text-xs text-neutral-700">
                                        <span className="font-semibold">Rempah Khas Indonesia: </span>
                                        {recipe.indonesian_spices}
                                    </p>
                                )}
                            </div>

                            <details className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs">
                                <summary className="cursor-pointer font-semibold text-emerald-800">
                                    Lihat Cara Pengolahan Rempah &amp; Resep
                                </summary>
                                <div className="mt-2.5 space-y-2 text-neutral-700">
                                    <div>
                                        <p className="font-semibold text-neutral-900">Cara Mengolah Rempah:</p>
                                        <p className="mt-0.5 leading-relaxed">{recipe.spice_prep}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-neutral-900">Langkah Memasak:</p>
                                        <p className="mt-0.5 leading-relaxed">{recipe.cooking_steps}</p>
                                    </div>
                                </div>
                            </details>
                        </article>
                    ))}
                </div>
            )}
        </section>
    </main>
    );
}
