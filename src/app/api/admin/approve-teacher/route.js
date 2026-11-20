import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const currentUserId = cookieStore.get("niskala_user_id")?.value;

        if (!currentUserId) {
            return NextResponse.json({ error: "Belum login." }, { status: 401 });
        }

        const adminCheck = await pool.query(
            "SELECT role FROM users WHERE id = $1",
            [Number(currentUserId)]
        );
        if (adminCheck.rows[0]?.role !== "admin") {
            return NextResponse.json(
                { error: "Akses khusus Admin." },
                { status: 403 }
            );
        }

        const body = await request.json();
        const targetUserId = Number(body.userId ?? body.id);

        if (!targetUserId) {
            return NextResponse.json(
                { error: "ID calon guru tidak valid." },
                { status: 400 }
            );
        }

        const updated = await pool.query(
            `
            UPDATE users
            SET role = 'teacher',
                teacher_status = 'approved',
                approved_at = NOW()
            WHERE id = $1
            RETURNING id, username, email, role, teacher_status, teacher_level, approved_at
            `,
            [targetUserId]
        );

        if (updated.rows.length === 0) {
            return NextResponse.json(
                { error: "Pengguna tidak ditemukan." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Calon guru berhasil disetujui.",
            user: updated.rows[0],
        });
    } catch (error) {
        console.error("Error approve-teacher:", error);
        return NextResponse.json(
            { error: "Gagal menyetujui pengajuan guru." },
            { status: 500 }
        );
    }
}
