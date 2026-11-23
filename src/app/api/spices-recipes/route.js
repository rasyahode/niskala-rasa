import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

async function getCurrentUser() {
    const cookieStore = await cookies();
    const rawId = cookieStore.get("niskala_user_id")?.value;
    if (!rawId) return null;

    const res = await pool.query(
        "SELECT id, username, role FROM users WHERE id = $1",
        [Number(rawId)]
    );
    return res.rows[0] || null;
}

export async function POST(request) {
    try {
        const user = await getCurrentUser();
        if (!user || !["teacher", "admin"].includes(user.role)) {
            return NextResponse.json(
                { error: "Hanya Teacher dan Admin yang dapat menambah atau menghapus data." },
                { status: 403 }
            );
        }

        const body = await request.json();
        const action = String(body.action || "");

        if (action === "add_spice") {
            const name = String(body.name || "").trim();
            const latinName = String(body.latin_name || "").trim();
            const plantPart = String(body.plant_part || "").trim();
            const dominantTaste = String(body.dominant_taste || "manis").trim().toLowerCase();
            const characteristics = String(body.characteristics || "").trim();
            const processingMethod = String(body.processing_method || "").trim();

            if (!name || !characteristics || !processingMethod) {
                return NextResponse.json(
                    { error: "Nama rempah, karakteristik, dan cara pengolahan wajib diisi." },
                    { status: 400 }
                );
            }

            const inserted = await pool.query(
                `
                INSERT INTO spices (
                name, latin_name, plant_part, origin_region,
                dominant_taste, characteristics, processing_method
                )
                VALUES ($1, $2, $3, 'Indonesia', $4, $5, $6)
                RETURNING *
                `,
                [
                    name,
                    latinName || "Rempah Indonesia",
                    plantPart || "Bagian Tanaman",
                    dominantTaste,
                    characteristics,
                    processingMethod,
                ]
            );

            return NextResponse.json(
                { message: "Rempah khas Indonesia berhasil ditambahkan.", item: inserted.rows[0] },
                { status: 201 }
            );
    }

    if (action === "delete_spice") {
        const id = Number(body.id);
        if (!id) {
            return NextResponse.json({ error: "ID rempah tidak valid." }, { status: 400 });
        }
        await pool.query("DELETE FROM spices WHERE id = $1", [id]);
        return NextResponse.json({ message: "Rempah berhasil dihapus." });
    }

    if (action === "add_recipe") {
        const title = String(body.title || "").trim();
        const originCountry = String(body.origin_country || "Indonesia").trim();
        const indonesianSpices = String(body.indonesian_spices || "").trim();
        const dominantTaste = String(body.dominant_taste || "manis").trim().toLowerCase();
        const summary = String(body.summary || "").trim();

        if (!title || !indonesianSpices || !summary) {
            return NextResponse.json(
                { error: "Judul resep, rempah Indonesia yang dipakai, dan detail resep wajib diisi." },
                { status: 400 }
            );
        }

        const inserted = await pool.query(
            `
            INSERT INTO recipes (
            title, origin_country, indonesian_spices, dominant_taste, summary
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [title, originCountry, indonesianSpices, dominantTaste, summary]
        );

        return NextResponse.json(
            { message: "Resep berhasil ditambahkan.", item: inserted.rows[0] },
            { status: 201 }
        );
    }

    if (action === "delete_recipe") {
        const id = Number(body.id);
        if (!id) {
            return NextResponse.json({ error: "ID resep tidak valid." }, { status: 400 });
        }
        await pool.query("DELETE FROM recipes WHERE id = $1", [id]);
        return NextResponse.json({ message: "Resep berhasil dihapus." });
    }

    return NextResponse.json({ error: "Aksi tidak dikenali." }, { status: 400 });
} catch (error) {
    console.error("Error /api/spices-recipes:", error);
    return NextResponse.json(
        { error: "Gagal memproses perubahan data rempah/resep." },
        { status: 500 }
    );
    }
}
