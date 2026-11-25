import Link from "next/link";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import { SPICES_50_DATASET } from "@/lib/spices-data";
import { AddSpiceForm, DeleteItemButton } from "@/components/TeacherAdminCatalogManager";

const TASTE_FILTERS = ["semua", "manis", "asam", "pedas", "pahit"];

export default async function SpicesPage({ searchParams }) {
    const params = await searchParams;
    const selectedTaste = String(params?.taste || "semua").toLowerCase();

    const cookieStore = await cookies();
    const rawUserId = cookieStore.get("niskala_user_id")?.value;
    let currentUser = null;

    if (rawUserId) {
        try {
            const userRes = await pool.query(
                "SELECT id, role FROM users WHERE id = $1",
                [Number(rawUserId)]
            );
            currentUser = userRes.rows[0] || null;
        } catch {
            currentUser = null;
        }
    }

    const isGuest = !currentUser;
    const canManage = currentUser && ["teacher", "admin"].includes(currentUser.role);

    let spices = SPICES_50_DATASET;
    let recipes = [];
    let activeStudents = [];

    try {
        const [spiceRes, recipeRes] = await Promise.all([
            pool.query("SELECT * FROM spices ORDER BY id ASC"),
            pool.query("SELECT id, title, origin_country, indonesian_spices FROM recipes ORDER BY id ASC"),
        ]);

        recipes = recipeRes.rows;

        if (canManage) {
            const studentRes = await pool.query(`
                SELECT DISTINCT u.id, u.username, u.email, c.title AS class_title
                FROM users u
                LEFT JOIN class_enrollments ce ON ce.user_id = u.id
                LEFT JOIN classes c ON c.id = ce.class_id
                WHERE u.role = 'student'
                AND (
                    ce.id IS NOT NULL
                    OR EXISTS (SELECT 1 FROM private_messages pm WHERE pm.sender_id = u.id)
                )
                ORDER BY u.username ASC
            `);
            activeStudents = studentRes.rows;
        }

        if (spiceRes.rows.length > 0) {
            const dbByName = new Map(
                spiceRes.rows.map((row) => [String(row.name || "").toLowerCase(), row])
        );

        const merged = SPICES_50_DATASET.map((item) => {
            const dbRow = dbByName.get(item.name.toLowerCase());
            if (!dbRow) return { ...item, dbId: null };
            return {
                ...item,
                id: dbRow.id,
                dbId: dbRow.id,
                latin_name: dbRow.latin_name || item.latin_name,
                plant_part: dbRow.plant_part || item.plant_part,
                origin_region: dbRow.origin_region || item.origin_region,
                dominant_taste: dbRow.dominant_taste || item.dominant_taste,
                characteristics: dbRow.characteristics || item.characteristics,
                processing_method: dbRow.processing_method || item.processing_method,
            };
        });

        const knownNames = new Set(SPICES_50_DATASET.map((s) => s.name.toLowerCase()));
        const extraRows = spiceRes.rows
            .filter((row) => !knownNames.has(String(row.name || "").toLowerCase()))
            .map((row) => ({
                id: row.id,
                dbId: row.id,
                name: row.name,
                latin_name: row.latin_name || "Rempah Nusantara",
                plant_part: row.plant_part || "Bagian Tanaman",
                origin_region: row.origin_region || "Indonesia",
                dominant_taste: row.dominant_taste || "manis",
                characteristics: row.characteristics || "-",
                processing_method: row.processing_method || "-",
        }));

        spices = [...merged, ...extraRows];
        }
    } catch (error) {
        console.error("Gagal mengambil data rempah, resep, atau murid aktif:", error);
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
                        Karakteristik, Pengolahan &amp; Resep Rempah Khas Indonesia
                    </h1>
                    <p className="mt-1 text-sm text-neutral-600">
                        {isGuest
                        ? "Guest dapat melihat karakteristik rempah, cara mengolahnya, dan daftar resep yang memakai rempah tersebut. Daftar sebagai murid untuk membaca resep secara lengkap."
                        : "Kelola katalog rempah khas Indonesia dan pantau murid yang aktif di ruang belajar."}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/recipes"
                        className="rounded-lg border border-emerald-700 px-4 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                    >
                        Katalog Resep
                    </Link>
                    {isGuest && (
                        <Link
                            href="/login"
                            className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                        >
                            Daftar sebagai Murid
                        </Link>
                    )}
                    </div>
            </div>

            {canManage && (
                <section className="rounded-xl border border-neutral-200 bg-white p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                        <h2 className="text-base font-bold text-neutral-900">
                            Murid Aktif di Ruang Belajar ({activeStudents.length})
                        </h2>
                        <Link
                            href="/learning-space"
                            className="text-xs font-semibold text-emerald-700 hover:underline"
                        >
                            Buka Ruang Belajar
                        </Link>
                    </div>

                    {activeStudents.length === 0 ? (
                        <p className="text-xs text-neutral-500">
                            Belum ada murid yang tercatat aktif memilih kelas atau berkirim pesan di ruang
                            belajar.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {activeStudents.map((st, idx) => (
                                <div
                                    key={`${st.id}-${st.class_title || "chat"}-${idx}`}
                                    className="rounded-lg border border-emerald-100 bg-emerald-50/40 p-3 text-xs"
                                >
                                    <p className="font-bold text-neutral-900">{st.username}</p>
                                    <p className="text-neutral-600">{st.email}</p>
                                    <p className="mt-1 font-medium text-emerald-800">
                                        {st.class_title ? `Kelas: ${st.class_title}` : "Aktif di Chat Ruang Belajar"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* Form Tambah Rempah (Khusus Teacher & Admin) */}
            {canManage && <AddSpiceForm />}

            {/* Filter Rasa */}
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
                {filteredSpices.map((spice, index) => {
                    const relatedRecipes = recipes.filter((r) =>
                        String(r.indonesian_spices || "")
                        .toLowerCase()
                        .includes(spice.name.toLowerCase())
                    );

                    return (
                        <article
                            key={`${spice.id}-${spice.name}-${index}`}
                            className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 space-y-3"
                        >
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                                <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-emerald-800">
                                    Rasa: {spice.dominant_taste}
                                </span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-neutral-500">
                                    {spice.plant_part}
                                </span>
                                    {canManage && spice.dbId && (
                                    <DeleteItemButton action="delete_spice" id={spice.dbId} />
                                )}
                            </div>
                        </div>

                        <h2 className="text-lg font-bold text-neutral-900">{spice.name}</h2>
                        <p className="text-xs italic text-neutral-500">{spice.latin_name}</p>
                        <p className="text-xs font-medium text-neutral-600">
                            Asal: {spice.origin_region}
                        </p>

                        <p className="pt-1 text-xs leading-relaxed text-neutral-700">
                        <span className="font-semibold text-neutral-900">Karakteristik: </span>
                            {spice.characteristics}
                        </p>

                        <div className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-700">
                            <p className="font-semibold text-neutral-900">Cara Mengolahnya:</p>
                            <p className="mt-1 leading-relaxed">{spice.processing_method}</p>
                        </div>
                    </div>

                    <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 text-xs space-y-2">
                        <p className="font-semibold text-emerald-950">
                            Resep yang Memakai {spice.name} ({relatedRecipes.length}):
                        </p>

                        {relatedRecipes.length === 0 ? (
                            <p className="text-neutral-600">
                                Dapat dipadukan pada racikan bumbu Nusantara maupun hidangan rempah pilihan.
                            </p>
                        ) : (
                            <ul className="list-disc pl-4 space-y-1 text-neutral-800">
                                {relatedRecipes.map((rec) => (
                                    <li key={rec.id}>
                                        <span className="font-medium">{rec.title}</span> ({rec.origin_country})
                                    </li>
                                ))}
                            </ul>
                        )}

                        {isGuest ? (
                            <div className="pt-1">
                                <Link
                                    href="/login"
                                    className="inline-block font-semibold text-emerald-800 underline hover:text-emerald-950"
                                >
                                    Daftar sebagai murid untuk melihat resep lengkap
                                </Link>
                            </div>
                        ) : (
                            <div className="pt-1">
                                <Link
                                    href="/recipes"
                                    className="inline-block font-semibold text-emerald-800 underline hover:text-emerald-950"
                                >
                                    Buka resep lengkap &amp; langkah memasak
                                </Link>
                            </div>
                        )}
                    </div>
                </article>
            );
            })}
        </div>
        </main>
    );
}
