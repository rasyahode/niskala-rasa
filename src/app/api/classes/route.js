import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

const FALLBACK_CLASSES = [
    {
        id: 1,
        title: "Sangrai & Infusi Kayu Manis Kerinci untuk Hidangan Manis",
        teacher_name: "Chef Basic",
        teacher_level: "basic",
        indonesian_spice: "Kayu Manis",
        schedule_label: "Studio & Rekaman · Sabtu 09:00 WITA",
        recording_status: "Video Pembelajaran Diunggah oleh Admin",
        recording_url: "/videos/kayu-manis-kerinci.mp4",
        status: "active",
    },
    {
        id: 2,
        title: "Penerapan Andaliman & Asam Gelugur pada Resep Pilihan",
        teacher_name: "Chef Basic",
        teacher_level: "intermediate",
        indonesian_spice: "Andaliman",
        schedule_label: "Studio & Rekaman · Minggu 13:00 WITA",
        recording_status: "Menunggu Unggahan Video oleh Admin",
        recording_url: null,
        status: "active",
    },
];

async function getCurrentUser() {
    const cookieStore = await cookies();
    const rawId = cookieStore.get("niskala_user_id")?.value;
    if (!rawId) return null;

    const res = await pool.query(
        "SELECT id, username, email, role, teacher_level FROM users WHERE id = $1",
        [Number(rawId)]
    );
    return res.rows[0] || null;
}

export async function GET(request) {
    try {
        const user = await getCurrentUser();
        const { searchParams } = new URL(request.url);
        const classIdParam = Number(searchParams.get("classId") || 0);

        let classes = [];
        let enrolledClassIds = [];
        let messages = [];

        try {
            const clsRes = await pool.query("SELECT * FROM classes ORDER BY id DESC");
            classes = clsRes.rows;

            if (user) {
                const enrRes = await pool.query(
                "SELECT class_id FROM class_enrollments WHERE user_id = $1",
                [user.id]
                );
                enrolledClassIds = enrRes.rows.map((r) => Number(r.class_id));
            }

            const targetClassId = classIdParam || classes[0]?.id || 0;
            if (targetClassId && user) {
                const msgRes = await pool.query(
                `
                SELECT id, class_id, sender_id, sender_name, sender_role, message, created_at
                FROM private_messages
                WHERE class_id = $1 AND (sender_id = $2 OR $3 IN ('teacher', 'admin'))
                ORDER BY id ASC
                `,
                [targetClassId, user.id, user.role]
            );
                messages = msgRes.rows;
            }
        } catch {
            classes = FALLBACK_CLASSES;
        }

        return NextResponse.json({
            user,
            classes,
            enrolledClassIds,
            messages,
        });
    } catch (error) {
        console.error("Error GET /api/classes:", error);
        return NextResponse.json(
            { error: "Gagal memuat data ruang belajar." },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Silakan masuk terlebih dahulu. Guest tidak dapat membuka ruang belajar." },
                { status: 401 }
        );
    }

    const body = await request.json();
    const action = String(body.action || "");

    if (action === "create_class") {
        if (!["teacher", "admin"].includes(user.role)) {
            return NextResponse.json(
                { error: "Hanya Teacher dan Admin yang dapat menambah kelas." },
                { status: 403 }
            );
        }

        const title = String(body.title || "").trim();
        const indonesianSpice = String(body.indonesian_spice || "").trim();
        const scheduleLabel = String(body.schedule_label || "").trim();
        const teacherLevel = String(
            body.teacher_level || user.teacher_level || "basic"
        )
            .trim()
            .toLowerCase();

        if (!title || !indonesianSpice || !scheduleLabel) {
            return NextResponse.json(
                { error: "Judul kelas, rempah khas Indonesia, dan jadwal wajib diisi." },
                { status: 400 }
            );
        }

        const inserted = await pool.query(
            `
            INSERT INTO classes (
            title, teacher_name, teacher_level, indonesian_spice,
            schedule_label, recording_status, recording_url, status
            )
            VALUES ($1, $2, $3, $4, $5, 'Menunggu Unggahan Video oleh Admin', NULL, 'active')
            RETURNING *
            `,
            [title, user.username, teacherLevel, indonesianSpice, scheduleLabel]
        );

        return NextResponse.json(
            { message: "Kelas baru berhasil ditambahkan.", classItem: inserted.rows[0] },
            { status: 201 }
        );
    }

    if (action === "cancel_class") {
        if (!["teacher", "admin"].includes(user.role)) {
            return NextResponse.json(
                { error: "Hanya Teacher dan Admin yang dapat membatalkan kelas." },
                { status: 403 }
            );
        }

        const classId = Number(body.classId);
            if (!classId) {
                return NextResponse.json({ error: "ID kelas tidak valid." }, { status: 400 });
        }

        const updated = await pool.query(
            `
            UPDATE classes
            SET status = 'cancelled'
            WHERE id = $1
            RETURNING *
            `,
            [classId]
        );

        return NextResponse.json({
            message: "Kelas berhasil dibatalkan.",
            classItem: updated.rows[0],
        });
    }

    if (action === "upload_recording") {
        if (user.role !== "admin") {
            return NextResponse.json(
                { error: "Hanya Admin yang dapat mengunggah video pembelajaran." },
                { status: 403 }
            );
        }

        const classId = Number(body.classId);
        const recordingUrl = String(body.recording_url || "").trim();

        if (!classId || !recordingUrl) {
            return NextResponse.json(
                { error: "Pilih kelas dan masukkan URL/nama file video pembelajaran." },
                { status: 400 }
            );
        }

        const updated = await pool.query(
            `
            UPDATE classes
            SET recording_url = $1,
                recording_status = 'Video Pembelajaran Diunggah oleh Admin'
            WHERE id = $2
            RETURNING *
            `,
            [recordingUrl, classId]
        );

        return NextResponse.json({
            message: "Video pembelajaran berhasil diunggah oleh Admin.",
            classItem: updated.rows[0],
        });
    }

    if (action === "toggle_enrollment") {
        if (user.role !== "student") {
            return NextResponse.json(
                { error: "Hanya Student yang dapat memilih kelas." },
                { status: 403 }
            );
        }

        const classId = Number(body.classId);
        if (!classId) {
            return NextResponse.json({ error: "ID kelas tidak valid." }, { status: 400 });
        }

        const existing = await pool.query(
            "SELECT id FROM class_enrollments WHERE class_id = $1 AND user_id = $2",
            [classId, user.id]
        );

        if (existing.rows.length > 0) {
            await pool.query("DELETE FROM class_enrollments WHERE id = $1", [
            existing.rows[0].id,
            ]);
            return NextResponse.json({ message: "Pilihan kelas dibatalkan." });
        }

        await pool.query(
            "INSERT INTO class_enrollments (class_id, user_id) VALUES ($1, $2)",
            [classId, user.id]
        );
        return NextResponse.json({ message: "Kelas berhasil dipilih." });
        }

    if (action === "send_chat") {
        const classId = Number(body.classId);
        const message = String(body.message || "").trim();

        if (!classId || !message) {
            return NextResponse.json(
                { error: "Pilih kelas dan tulis pesan terlebih dahulu." },
                { status: 400 }
            );
        }

        const msgRes = await pool.query(
            `
            INSERT INTO private_messages (
            class_id, sender_id, sender_name, sender_role, message
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
            `,
            [classId, user.id, user.username, user.role, message]
        );

        return NextResponse.json(
            { message: "Pesan privat terkirim ke guru.", chat: msgRes.rows[0] },
            { status: 201 }
        );
    }

        return NextResponse.json({ error: "Aksi tidak dikenali." }, { status: 400 });
    } catch (error) {
        console.error("Error POST /api/classes:", error);
        return NextResponse.json(
            { error: "Gagal memproses permintaan kelas." },
            { status: 500 }
        );
    }
}
