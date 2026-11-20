import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function POST(request) {
    try {
        const { email, password } = await request.json();
        const cleanEmail = String(email || "").trim().toLowerCase();

        if (!cleanEmail || !password) {
        return NextResponse.json(
            { error: "Email dan kata sandi wajib diisi." },
            { status: 400 }
        );
    }

    const { rows } = await pool.query(
        "SELECT id, username, email, password_hash, role, teacher_status FROM users WHERE LOWER(email) = $1",
        [cleanEmail]
    );
    const user = rows[0];

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return NextResponse.json(
            { error: "Email atau kata sandi salah." },
            { status: 401 }
        );
    }

    let redirectTo = "/dashboard";
    if (user.role === "admin") redirectTo = "/admin";
    else if (user.role === "teacher" && user.teacher_status === "approved") {
        redirectTo = "/teacher";
    }

    const res = NextResponse.json({
        message: "Berhasil masuk",
        user: { id: user.id, username: user.username, role: user.role },
        redirectTo,
    });

    res.cookies.set("niskala_user_id", String(user.id), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });

    return res;
    } catch (err) {
        return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
    }
}