import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

const FALLBACK_CLASSES = [
  {
    id: 1,
    title: "Sangrai & Infusi Kayu Manis Kerinci untuk Hidangan Manis",
    category_name: "Teknik Sangrai & Infusi",
    start_date: null,
    end_date: null,
    teacher_name: "Chef Basic",
    teacher_level: "basic",
    indonesian_spice: "Kayu Manis",
    schedule_label: "Studio & Rekaman · Sabtu 09:00 WITA",
    recording_status: "Video Pembelajaran Diunggah oleh Admin",
    recording_url: "/videos/kayu-manis-kerinci.mp4",
    status: "active",
  },
];

const FALLBACK_MATERIALS = [
  {
    id: 1,
    class_id: 1,
    order_index: 1,
    title: "Pengenalan Karakter & Seleksi Rempah",
    content_body: "Pelajari aroma, bagian tanaman, serta cara memilih rempah khas Indonesia sebelum diolah.",
  },
  {
    id: 2,
    class_id: 1,
    order_index: 2,
    title: "Teknik Pengolahan & Penerapan Resep",
    content_body: "Ikuti panduan pengolahan rempah serta saksikan rekaman penuh kelas studio.",
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
    let categories = ["Rempah Nusantara", "Resep Luar Negeri Berempah", "Teknik Sangrai & Infusi"];
    let enrolledClassIds = [];
    let materials = [];
    let completedMaterialIds = [];
    let discussions = [];
    let messages = [];

    try {
      const [clsRes, catRes] = await Promise.all([
        pool.query("SELECT * FROM classes ORDER BY id DESC"),
        pool.query("SELECT name FROM categories ORDER BY id ASC"),
      ]);
      classes = clsRes.rows;
      if (catRes.rows.length > 0) {
        categories = catRes.rows.map((r) => r.name);
      }

      const targetClassId = classIdParam || classes[0]?.id || 0;

      if (user) {
        const enrRes = await pool.query(
          "SELECT class_id FROM class_enrollments WHERE user_id = $1",
          [user.id]
        );
        enrolledClassIds = enrRes.rows.map((r) => Number(r.class_id));

        const progRes = await pool.query(
          "SELECT material_id FROM class_material_progress WHERE user_id = $1",
          [user.id]
        );
        completedMaterialIds = progRes.rows.map((r) => Number(r.material_id));
      }

      if (targetClassId) {
        const matRes = await pool.query(
          "SELECT * FROM class_materials WHERE class_id = $1 ORDER BY order_index ASC, id ASC",
          [targetClassId]
        );
        materials = matRes.rows;

        if (materials.length > 0) {
          const matIds = materials.map((m) => m.id);
          const discRes = await pool.query(
            `
            SELECT id, material_id, sender_name, sender_role, comment, created_at
            FROM material_discussions
            WHERE material_id = ANY($1::int[])
            ORDER BY id ASC
            `,
            [matIds]
          );
          discussions = discRes.rows;
        }

        if (user) {
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
      }
    } catch {
      classes = FALLBACK_CLASSES;
      materials = FALLBACK_MATERIALS;
    }

    return NextResponse.json({
      user,
      classes,
      categories,
      enrolledClassIds,
      materials,
      completedMaterialIds,
      discussions,
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

    // Teacher & Admin: menambah kelas
    if (action === "create_class") {
      if (!["teacher", "admin"].includes(user.role)) {
        return NextResponse.json(
          { error: "Hanya Teacher dan Admin yang dapat menambah kelas." },
          { status: 403 }
        );
      }

      const title = String(body.title || "").trim();
      const categoryName = String(body.category_name || "Rempah Nusantara").trim();
      const startDate = body.start_date ? String(body.start_date) : null;
      const endDate = body.end_date ? String(body.end_date) : null;
      const indonesianSpice = String(body.indonesian_spice || "").trim();
      const scheduleLabel = String(body.schedule_label || "").trim();
      const teacherName =
        user.role === "admin" && body.teacher_name
          ? String(body.teacher_name).trim()
          : user.username;
      const teacherLevel = String(body.teacher_level || user.teacher_level || "basic")
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
          title, category_name, start_date, end_date, teacher_name, teacher_level,
          indonesian_spice, schedule_label, recording_status, recording_url, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Menunggu Unggahan Video oleh Admin', NULL, 'active')
        RETURNING *
        `,
        [
          title,
          categoryName,
          startDate,
          endDate,
          teacherName,
          teacherLevel,
          indonesianSpice,
          scheduleLabel,
        ]
      );

      await pool.query(
        `
        INSERT INTO class_materials (class_id, order_index, title, content_body)
        VALUES
          ($1, 1, 'Pengenalan Karakter & Seleksi Rempah', 'Materi dasar pengenalan rempah khas Indonesia pada kelas ini.'),
          ($1, 2, 'Pengolahan & Rekaman Studio', 'Panduan teknik pengolahan serta rekaman penuh kelas studio.')
        `,
        [inserted.rows[0].id]
      );

      return NextResponse.json(
        { message: "Kelas baru berhasil ditambahkan.", classItem: inserted.rows[0] },
        { status: 201 }
      );
    }

    // Teacher & Admin: edit kelas (judul, kategori, rentang waktu, nama teacher)
    if (action === "edit_class") {
      if (!["teacher", "admin"].includes(user.role)) {
        return NextResponse.json(
          { error: "Hanya Teacher dan Admin yang dapat mengubah kelas." },
          { status: 403 }
        );
      }

      const classId = Number(body.classId);
      const title = String(body.title || "").trim();
      const categoryName = String(body.category_name || "Rempah Nusantara").trim();
      const startDate = body.start_date ? String(body.start_date) : null;
      const endDate = body.end_date ? String(body.end_date) : null;
      const teacherName = String(body.teacher_name || user.username).trim();

      if (!classId || !title) {
        return NextResponse.json(
          { error: "ID kelas dan judul kelas wajib diisi." },
          { status: 400 }
        );
      }

      const updated = await pool.query(
        `
        UPDATE classes
        SET title = $1,
            category_name = $2,
            start_date = $3,
            end_date = $4,
            teacher_name = $5
        WHERE id = $6
        RETURNING *
        `,
        [title, categoryName, startDate, endDate, teacherName, classId]
      );

      return NextResponse.json({
        message: "Data kelas berhasil diperbarui.",
        classItem: updated.rows[0],
      });
    }

    // Teacher & Admin: membatalkan atau menghapus kelas (Teacher hanya kelas miliknya; Admin bebas)
    if (action === "cancel_class" || action === "delete_class") {
      if (!["teacher", "admin"].includes(user.role)) {
        return NextResponse.json(
          { error: "Hanya Teacher dan Admin yang dapat membatalkan/menghapus kelas." },
          { status: 403 }
        );
      }

      const classId = Number(body.classId);
      if (!classId) {
        return NextResponse.json({ error: "ID kelas tidak valid." }, { status: 400 });
      }

      const clsCheck = await pool.query(
        "SELECT id, teacher_name FROM classes WHERE id = $1",
        [classId]
      );
      const target = clsCheck.rows[0];
      if (!target) {
        return NextResponse.json({ error: "Kelas tidak ditemukan." }, { status: 404 });
      }

      if (user.role === "teacher" && target.teacher_name !== user.username) {
        return NextResponse.json(
          { error: "Teacher hanya dapat membatalkan atau menghapus kelas miliknya sendiri." },
          { status: 403 }
        );
      }

      if (action === "delete_class") {
        await pool.query("DELETE FROM classes WHERE id = $1", [classId]);
        return NextResponse.json({ message: "Kelas berhasil dihapus." });
      }

      const updated = await pool.query(
        "UPDATE classes SET status = 'cancelled' WHERE id = $1 RETURNING *",
        [classId]
      );
      return NextResponse.json({
        message: "Kelas berhasil dibatalkan.",
        classItem: updated.rows[0],
      });
    }

    // Teacher & Admin: CRUD Materi (order_index, judul, isi materi)
    if (action === "create_material") {
      if (!["teacher", "admin"].includes(user.role)) {
        return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
      }
      const classId = Number(body.classId);
      const orderIndex = Number(body.order_index || 1);
      const matTitle = String(body.title || "").trim();
      const contentBody = String(body.content_body || "").trim();

      if (!classId || !matTitle || !contentBody) {
        return NextResponse.json(
          { error: "Kelas, judul materi, dan isi materi wajib diisi." },
          { status: 400 }
        );
      }

      await pool.query(
        `
        INSERT INTO class_materials (class_id, order_index, title, content_body)
        VALUES ($1, $2, $3, $4)
        `,
        [classId, orderIndex, matTitle, contentBody]
      );
      return NextResponse.json({ message: "Materi baru ditambahkan." }, { status: 201 });
    }

    if (action === "edit_material") {
      if (!["teacher", "admin"].includes(user.role)) {
        return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
      }
      const materialId = Number(body.materialId);
      const orderIndex = Number(body.order_index || 1);
      const matTitle = String(body.title || "").trim();
      const contentBody = String(body.content_body || "").trim();

      if (!materialId || !matTitle || !contentBody) {
        return NextResponse.json({ error: "Data materi tidak lengkap." }, { status: 400 });
      }

      await pool.query(
        `
        UPDATE class_materials
        SET order_index = $1, title = $2, content_body = $3
        WHERE id = $4
        `,
        [orderIndex, matTitle, contentBody, materialId]
      );
      return NextResponse.json({ message: "Materi berhasil diperbarui." });
    }

    if (action === "delete_material") {
      if (!["teacher", "admin"].includes(user.role)) {
        return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
      }
      const materialId = Number(body.materialId);
      if (!materialId) {
        return NextResponse.json({ error: "ID materi tidak valid." }, { status: 400 });
      }

      await pool.query("DELETE FROM class_materials WHERE id = $1", [materialId]);
      return NextResponse.json({ message: "Materi berhasil dihapus." });
    }

    // Khusus Admin: mengunggah video pembelajaran rekaman penuh kelas
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

    // Student: memilih / melepas kelas
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

    // Student: menandai materi selesai (Mark as Done)
    if (action === "mark_material_done") {
      const materialId = Number(body.materialId);
      if (!materialId) {
        return NextResponse.json({ error: "ID materi tidak valid." }, { status: 400 });
      }

      await pool.query(
        `
        INSERT INTO class_material_progress (material_id, user_id)
        VALUES ($1, $2)
        ON CONFLICT (material_id, user_id) DO NOTHING
        `,
        [materialId, user.id]
      );

      return NextResponse.json({ message: "Materi ditandai selesai." });
    }

    // Forum diskusi per materi
    if (action === "add_discussion") {
      const materialId = Number(body.materialId);
      const comment = String(body.comment || "").trim();

      if (!materialId || !comment) {
        return NextResponse.json(
          { error: "Pilih materi dan isi komentar diskusi." },
          { status: 400 }
        );
      }

      await pool.query(
        `
        INSERT INTO material_discussions (material_id, sender_id, sender_name, sender_role, comment)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [materialId, user.id, user.username, user.role, comment]
      );

      return NextResponse.json({ message: "Komentar diskusi terkirim." }, { status: 201 });
    }

    // Chat privat ke guru pengampu kelas
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
