import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

const VALID_LEVELS = ["basic", "intermediate", "advanced", "professional"];

export async function POST(request) {
    try {
        const body = await request.json();
        const username = String(body.username || "").trim();
        const email = String(body.email || "").trim().toLowerCase();
        const password = String(body.password || "");
        const applyTeacher = Boolean(body.applyTeacher || body.role === "teacher");

        const teacherLevel = String(body.teacher_level || body.teacherLevel || "")
            .trim()
            .toLowerCase();
        const cvInfo = String(body.cv_info || body.cvInfo || "").trim();
        const professionalLicense = String(
            body.professional_license || body.professionalLicense || ""
        ).trim();

        if (!username || !email || !password) {
            return NextResponse.json(
                { error: "Username, email, dan kata sandi wajib diisi." },
                { status: 400 }
            );
        }

        if (applyTeacher) {
            if (!VALID_LEVELS.includes(teacherLevel)) {
                return NextResponse.json(
                    {
                        error:
                        "Pilih jenjang guru yang valid: basic, intermediate, advanced, atau professional.",
                    },
                    { status: 400 }
                );
            }
            if (!cvInfo || !professionalLicense) {
                return NextResponse.json(
                    {
                        error:
                        "Pendaftaran guru wajib menyertakan Curriculum Vitae (CV) dan lisensi keprofesionalan.",
                    },
                    { status: 400 }
                );
            }
        }

        const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
            email,
        ]);
        if (existing.rows.length > 0) {
            return NextResponse.json(
                { error: "Email sudah terdaftar." },
                { status: 409 }
            );
        }

    const passwordHash = await bcrypt.hash(password, 10);
    const teacherStatus = applyTeacher ? "pending" : "none";

    const result = await pool.query(
        ` INSERT INTO users (
            username,
            email,
            password_hash,
            role,
            teacher_status,
            teacher_level,
            cv_info,
            professional_license
        )
        VALUES ($1, $2, $3, 'student', $4, $5, $6, $7)
        RETURNING id, username, email, role, teacher_status, teacher_level
        `,
        [
            username,
            email,
            passwordHash,
            teacherStatus,
            applyTeacher ? teacherLevel : null,
            applyTeacher ? cvInfo : null,
            applyTeacher ? professionalLicense : null,
        ]
    );

    const user = result.rows[0];
    const response = NextResponse.json(
        {
            message: applyTeacher
                ? "Pendaftaran berhasil. Pengajuan guru beserta CV dan lisensi menunggu persetujuan Admin."
                : "Pendaftaran akun student berhasil.",
            user,
        },
        { status: 201 }
    );

    response.cookies.set("niskala_user_id", String(user.id), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
    });

    return response;
} catch (error) {
    console.error("Error register:", error);
        return NextResponse.json(
            { error: "Gagal memproses pendaftaran." },
            { status: 500 }
        );
    }
}
