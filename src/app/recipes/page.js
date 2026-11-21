import Link from "next/link";
import pool from "@/lib/db";

const TASTE_FILTERS = ["semua", "manis", "asam", "pedas", "pahit"];

const INDONESIAN_SPICE_KEYWORDS = [
    "kayu manis",
    "cengkeh",
    "pala",
    "andaliman",
    "kapulaga",
    "kemukus",
    "kluwek",
    "keluwak",
    "bunga lawang",
    "ketumbar",
    "jahe",
    "kunyit",
    "lengkuas",
    "serai",
];

function isIndonesianOrigin(countryText) {
    const value = String(countryText || "").toLowerCase();
    return value.includes("indonesia") || value.includes("nusantara");
}

function usesIndonesianSpice(recipe) {
    const explicitSpices = String(recipe.indonesian_spices || "").trim();
    if (explicitSpices.length > 0) {
        return true;
    }

    const combinedText = `${recipe.title || ""} ${recipe.summary || ""} ${
        recipe.spices || ""
    }`.toLowerCase();
    return INDONESIAN_SPICE_KEYWORDS.some((spice) => combinedText.includes(spice));
}

export default async function RecipesPage({ searchParams }) {
    const params = await searchParams;
    const selectedTaste = String(params?.taste || "semua").toLowerCase();

    let recipes = [];
    try {
        const result = await pool.query(`
        SELECT *
        FROM recipes
        ORDER BY id ASC
        `);
        recipes = result.rows;
    } catch (error) {
        console.error("Gagal mengambil data resep:", error);
    }

    const normalizedRecipes = recipes.map((r) => ({
        ...r,
        countryLabel: r.origin_country || r.country || r.origin || "Tidak tercatat",
    }));

    const tasteFiltered =
        selectedTaste === "semua"
            ? normalizedRecipes
            : normalizedRecipes.filter(
                (item) => String(item.dominant_taste || "").toLowerCase() === selectedTaste
            );

    const indonesianRecipes = tasteFiltered.filter((item) =>
        isIndonesianOrigin(item.countryLabel)
    );

    const recommendedForeignRecipes = tasteFiltered.filter(
        (item) => !isIndonesianOrigin(item.countryLabel) && usesIndonesianSpice(item)
    );

    return (
        <main className="mx-auto max-w-5xl px-4 py-10 space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                        Kurikulum Resep · Niskala Rasa
                    </p>
                    <h1 className="mt-1 text-2xl font-bold text-neutral-900">
                        Resep Khas Indonesia &amp; Rekomendasi Luar Negeri Berempah Indonesia
                    </h1>
                    <p className="mt-1 text-sm text-neutral-600">
                        Mempertahankan resep khas Indonesia serta merekomendasikan resep luar negeri yang
                        menggunakan rempah khas asal Indonesia.
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
                Rekomendasi Resep Luar Negeri Berempah Khas Indonesia (
                {recommendedForeignRecipes.length})
            </h2>

            {recommendedForeignRecipes.length === 0 ? (
                <div className="rounded-xl border bg-white p-5 text-sm text-neutral-600">
                    Belum ada rekomendasi resep luar negeri berempah Indonesia untuk filter ini.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {recommendedForeignRecipes.map((recipe) => (
                        <article
                            key={recipe.id}
                            className="flex flex-col justify-between rounded-xl border border-emerald-200 bg-white p-5 space-y-3"
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                                        Direkomendasikan · {recipe.countryLabel}
                                    </span>
                                    <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium capitalize text-neutral-700">
                                        Rasa: {recipe.dominant_taste || "-"}
                                    </span>
                                </div>

                                <h3 className="mt-3 text-base font-bold text-neutral-900">
                                    {recipe.title}
                                </h3>
                                <p className="mt-1.5 text-sm text-neutral-600 leading-relaxed">
                                    {recipe.summary || "-"}
                                </p>
                            </div>

                            {recipe.indonesian_spices && (
                                <div className="rounded-lg bg-emerald-50/70 p-3 text-xs text-emerald-950">
                                    <span className="font-semibold">Rempah Khas Indonesia: </span>
                                    {recipe.indonesian_spices}
                                </div>
                            )}
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
                    Belum ada resep khas Indonesia untuk filter ini.
                </div>
            ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {indonesianRecipes.map((recipe) => (
                    <article
                        key={recipe.id}
                        className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 space-y-3"
                    >
                        <div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                                    Khas Indonesia · {recipe.countryLabel}
                                </span>
                                <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium capitalize text-neutral-700">
                                    Rasa: {recipe.dominant_taste || "-"}
                                </span>
                            </div>

                            <h3 className="mt-3 text-base font-bold text-neutral-900">
                                {recipe.title}
                            </h3>
                            <p className="mt-1.5 text-sm text-neutral-600 leading-relaxed">
                                {recipe.summary || "-"}
                            </p>
                        </div>

                        {recipe.indonesian_spices && (
                            <div className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-700">
                                <span className="font-semibold">Rempah Khas Indonesia: </span>
                                {recipe.indonesian_spices}
                            </div>
                        )}
                    </article>
                ))}
            </div>
        )}
        </section>
    </main>
    );
}
