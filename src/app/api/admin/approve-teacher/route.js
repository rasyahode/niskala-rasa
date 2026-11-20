import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const adminId = cookieStore.get("niskala_user_id")?.value;

        if (!adminId) {
            return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
        }

        const adminRes = await pool.query(
            "SELECT id, role FROM users WHERE id = $1",
            [Number(adminId)]
        );
        const adminUser = adminRes.rows[0];

        if (!adminUser || adminUser.role !== "admin") {
            return NextResponse.json(
                { error: "Hanya Admin yang dapat memvalidasi Spice Master." },
                { status: 403 }
            );
        }

        const { userId } = await request.json();
        const targetId = Number(userId);

        if (!targetId) {
            return NextResponse.json({ error: "ID pengguna tidak valid." }, { status: 400 });
        }

        const { rows } = await pool.query(
            `UPDATE users
            SET role = 'teacher', teacher_status = 'approved', approved_at = NOW()
            WHERE id = $1
            RETURNING id, username, email, role, teacher_status, approved_at`,
            [targetId]
        );

        if (!rows[0]) {
            return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
        }

        return NextResponse.json({
            message: "Calon Spice Master berhasil disetujui.",
            user: rows[0],
        });
    } catch (err) {
        return NextResponse.json({ error: "Gagal memproses persetujuan." }, { status: 500 });
    }
}
