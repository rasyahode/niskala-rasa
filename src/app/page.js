import Link from "next/link";
import {
    DOMINANT_TASTES,
    getRecipeCategories,
    getSpicesForFilter,
    normalizeTaste,
    searchRecipes,
    } from "@/lib/recipes";

export const dynamic = "force-dynamic";

function buildFilterUrl({ q, taste, category, spice }) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (taste) params.set("taste", taste);
    if (category) params.set("category", category);
    if (spice) params.set("spice", String(spice));
    const queryString = params.toString();
    return queryString ? `/recipes?${queryString}` : "/recipes";
}

export default async function RecipesPage({ searchParams }) {
    const resolvedParams = await searchParams;
    const q = String(resolvedParams?.q || "").trim();
    const taste = normalizeTaste(resolvedParams?.taste || "");
    const category = String(resolvedParams?.category || "").trim();
    const spice = String(resolvedParams?.spice || "").trim();

    const [recipes, categories, spices] = await Promise.all([
        searchRecipes({ q, taste, category, spice, limit: 100 }),
        getRecipeCategories(),
        getSpicesForFilter(),
    ]);

    return (
        <main className="mx-auto max-w-6xl px-4 py-8">
            <div className="mb-8 flex flex-col gap-2 border-b pb-6">
                <p className="text-sm font-medium uppercase tracking-wider text-emerald-700">
                    Katalog Resep &amp; Pemetaan Rasa
                </p>
                <h1 className="text-3xl font-bold tracking-tight">
                    Jelajah Resep Berdasarkan Dominan Rasa &amp; Rempah
                </h1>
                <p className="text-sm text-neutral-600">
                    Cari resep berdasarkan nama hidangan, rempah, wilayah, kategori, atau filter dominan rasa
                    (manis, asam, asin, pahit, pedas, umami).
                </p>
            </div>

            {/* Filter Dominan Rasa */}
            <section className="mb-6">
                <h2 className="mb-3 text-sm font-semibold text-neutral-800">Dominan Rasa</h2>
                <div className="flex flex-wrap gap-2">
                    <Link
                        href={buildFilterUrl({ q, taste: "", category, spice })}
                        className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                        !taste
                                ? "border-emerald-700 bg-emerald-700 text-white"
                                : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400"
                        }`}
                    >
                        Semua Rasa
                    </Link>
                    {DOMINANT_TASTES.map((item) => {
                        const isActive = taste === item.slug;
                        return (
                            <Link
                                key={item.slug}
                                href={buildFilterUrl({ q, taste: item.slug, category, spice })}
                                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                                    isActive
                                            ? "border-emerald-700 bg-emerald-700 text-white"
                                            : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400"
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* Form Pencarian Kata Kunci, Kategori, dan Rempah */}
            <form
                method="GET"
                action="/recipes"
                className="mb-8 grid grid-cols-1 gap-4 rounded-xl border bg-neutral-50 p-4 md:grid-cols-4"
            >
                {taste ? <input type="hidden" name="taste" value={taste} /> : null}

                <div>
                <label htmlFor="q" className="mb-1 block text-xs font-semibold uppercase text-neutral-600">
                    Kata Kunci / Rempah
                </label>
                <input
                    id="q"
                    name="q"
                    type="text"
                    defaultValue={q}
                    placeholder="Contoh: rendang, kunyit, soto..."
                    className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700"
                />
                </div>

                <div>
                <label
                    htmlFor="category"
                    className="mb-1 block text-xs font-semibold uppercase text-neutral-600"
                >
                    Kategori Resep
                </label>
                <select
                    id="category"
                    name="category"
                    defaultValue={category}
                    className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700"
                >
                    <option value="">Semua Kategori</option>
                    {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                        {cat.name} ({cat.recipe_count})
                    </option>
                    ))}
                </select>
                </div>

                <div>
                    <label
                        htmlFor="spice"
                        className="mb-1 block text-xs font-semibold uppercase text-neutral-600"
                    >
                        Relasi Rempah
                    </label>
                    <select
                        id="spice"
                        name="spice"
                        defaultValue={spice}
                        className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-emerald-700"
                    >
                        <option value="">Semua Rempah Terhubung</option>
                        {spices.map((sp) => (
                            <option key={sp.id} value={sp.id}>
                                {sp.name} ({sp.recipe_count})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-end gap-2">
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                    >
                        Terapkan Filter
                    </button>
                    <Link
                        href="/recipes"
                        className="rounded-lg border bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                    >
                        Reset
                    </Link>
                </div>
            </form>

            {/* Ringkasan Hasil */}
            <div className="mb-4 flex items-center justify-between text-sm text-neutral-600">
                <span>
                    Menampilkan <strong>{recipes.length}</strong> resep
                    {taste ? (
                        <>
                            {" "}
                            dengan dominan rasa <strong>{taste}</strong>
                        </>
                    ) : null}
                    {q ? (
                        <>
                            {" "}
                            untuk kata kunci <strong>&ldquo;{q}&rdquo;</strong>
                        </>
                    ) : null}
                </span>
            </div>

            {/* Daftar Resep */}
            {recipes.length === 0 ? (
                <div className="rounded-xl border border-dashed p-10 text-center text-neutral-600">
                    Tidak ada resep yang cocok dengan kombinasi filter saat ini. Coba reset filter atau gunakan
                    kata kunci lain.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {recipes.map((recipe) => (
                        <article
                            key={recipe.id}
                            className="flex flex-col justify-between rounded-xl border bg-white p-5 shadow-2xs"
                        >
                        <div>
                                <div className="mb-3 flex items-center justify-between gap-2">
                                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-800">
                                        Rasa: {recipe.dominant_taste || "umami"}
                                    </span>
                                    <span className="text-xs text-neutral-500">
                                        {recipe.minutes ? `${recipe.minutes} mnt` : ""}
                                        {recipe.minutes && recipe.difficulty ? " · " : ""}
                                        {recipe.difficulty || ""}
                                    </span>
                                </div>

                                <h3 className="mb-1 text-lg font-bold text-neutral-900">{recipe.name}</h3>
                                <p className="mb-3 text-xs text-neutral-500">
                                    {recipe.category_name || "Umum"}
                                    {recipe.region ? ` · ${recipe.region}` : ""}
                                    {recipe.country ? ` (${recipe.country})` : ""}
                                </p>

                                {recipe.description ? (
                                    <p className="mb-4 line-clamp-3 text-sm text-neutral-700">
                                        {recipe.description}
                                    </p>
                                ) : null}
                            </div>

                            <div className="border-t pt-3">
                                <p className="mb-1 text-xs font-semibold text-neutral-600">Rempah Utama:</p>
                                <p className="text-xs text-neutral-700">
                                    {recipe.spices_text || "Tidak tercantum"}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}
