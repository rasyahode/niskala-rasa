import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { action, class_id, user_id } = await request.json();

    if (!class_id || !user_id) {
      return NextResponse.json({ error: 'class_id dan user_id wajib disertakan.' }, { status: 400 });
    }

    if (action === 'enroll') {
      await pool.query(
        `INSERT INTO class_enrollments (class_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (class_id, user_id) DO NOTHING`,
        [class_id, user_id]
      );
      return NextResponse.json({ message: 'Berhasil mendaftar ke kelas video.' });
    }

    if (action === 'mark_done') {
      await pool.query(
        `INSERT INTO class_enrollments (class_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (class_id, user_id) DO NOTHING`,
        [class_id, user_id]
      );
      await pool.query(
        `INSERT INTO class_material_progress (class_id, user_id, completed_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (class_id, user_id) DO UPDATE SET completed_at = NOW()`,
        [class_id, user_id]
      );
      return NextResponse.json({ message: 'Pembelajaran berhasil ditandai selesai (Mark as Done).' });
    }

    return NextResponse.json({ error: 'Aksi tidak dikenali.' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/classes/progress error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui progres belajar.' }, { status: 500 });
  }
}
