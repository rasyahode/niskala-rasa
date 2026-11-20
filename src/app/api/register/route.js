import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function POST(request) {
    try {
        const { username, email, password, applyTeacher } = await request.json();
        const cleanName = String(username || "").trim();
        const cleanEmail = String(email || "").trim().toLowerCase();

        if (!cleanName || !cleanEmail || String(password || "").length < 6) {
            return NextResponse.json(
                { error: "Nama, email valid, dan kata sandi minimal 6 karakter wajib diisi." },
                { status: 400 }
            );
        }

        const existing = await pool.query(
            "SELECT id FROM users WHERE LOWER(email) = $1",
            [cleanEmail]
        );
        if (existing.rows.length > 0) {
            return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
        }

        const hash = bcrypt.hashSync(password, 10);
        const teacherStatus = applyTeacher ? "pending" : "none";

        const { rows } = await pool.query(
            `INSERT INTO users (username, email, password_hash, role, teacher_status)
            VALUES ($1, $2, $3, 'student', $4)
            RETURNING id, username, role, teacher_status`,
            [cleanName, cleanEmail, hash, teacherStatus]
        );

        const newUser = rows[0];
        const res = NextResponse.json({
            message: "Pendaftaran berhasil",
            user: newUser,
            redirectTo: "/dashboard",
        });

        res.cookies.set("niskala_user_id", String(newUser.id), {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return res;
    } catch (err) {
        return NextResponse.json({ error: "Gagal mendaftarkan akun." }, { status: 500 });
    }
}