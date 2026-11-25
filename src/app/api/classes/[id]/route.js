import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, category_name, recipe_description, teacher_id, video_url, status } = body;

    if (!title || !category_name) {
      return NextResponse.json({ error: 'Judul dan kategori kelas wajib diisi' }, { status: 400 });
    }

    let validTeacherId = null;
    if (teacher_id) {
      const checkTeacher = await pool.query(
        `SELECT t.id FROM teachers t
         JOIN users u ON t.user_id = u.id
         WHERE (t.id = $1 OR u.id = $1) AND u.role = 'teacher'
         LIMIT 1`,
        [teacher_id]
      );
      if (!checkTeacher.rows[0]) {
        return NextResponse.json({ error: 'Pengajar tidak valid (bukan role teacher)' }, { status: 400 });
      }
      validTeacherId = checkTeacher.rows[0].id;
    }

    const { rows } = await pool.query(
      `UPDATE classes
       SET title = $1,
           category_name = $2,
           recipe_description = COALESCE($3, recipe_description),
           teacher_id = COALESCE($4, teacher_id),
           video_url = COALESCE($5, video_url),
           status = COALESCE($6, status)
       WHERE id = $7
       RETURNING *`,
      [title.trim(), category_name.trim(), recipe_description, validTeacherId, video_url, status, id]
    );

    if (!rows[0]) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ class: rows[0] });
  } catch (err) {
    console.error('PUT /api/classes/[id] error:', err);
    return NextResponse.json({ error: 'Gagal memperbarui kelas' }, { status: 500 });
  }
}
