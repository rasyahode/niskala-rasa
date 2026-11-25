import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');

    if (studentId) {
      const res = await pool.query(
        'SELECT recipe_id, completed_at FROM lesson_progress WHERE student_user_id = $1',
        [studentId]
      );
      return NextResponse.json({ progress: res.rows });
    }

    // Rekap progres semua murid untuk Pengajar
    const summaryRes = await pool.query(`
      SELECT u.id AS student_id, u.full_name, u.email,
             COALESCE(ARRAY_AGG(DISTINCT c.category_name) FILTER (WHERE c.category_name IS NOT NULL), '{}') AS enrolled_categories,
             COUNT(DISTINCT lp.recipe_id)::int AS completed_lessons_count,
             COALESCE(ARRAY_AGG(DISTINCT r.title) FILTER (WHERE r.title IS NOT NULL), '{}') AS completed_titles
      FROM users u
      JOIN students s ON s.user_id = u.id
      LEFT JOIN enrollments e ON e.student_user_id = u.id
      LEFT JOIN classes c ON c.id = e.class_id
      LEFT JOIN lesson_progress lp ON lp.student_user_id = u.id
      LEFT JOIN recipes r ON r.id = lp.recipe_id
      WHERE u.status = 'approved'
      GROUP BY u.id, u.full_name, u.email
      ORDER BY u.id ASC
    `);

    return NextResponse.json({ studentsProgress: summaryRes.rows });
  } catch (err) {
    console.error('GET /api/progress error:', err);
    return NextResponse.json({ error: 'Gagal memuat progres.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { student_id, recipe_id, is_done } = await request.json();
    if (is_done) {
      await pool.query(
        `INSERT INTO lesson_progress (student_user_id, recipe_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [student_id, recipe_id]
      );
    } else {
      await pool.query(
        'DELETE FROM lesson_progress WHERE student_user_id = $1 AND recipe_id = $2',
        [student_id, recipe_id]
      );
    }
    return NextResponse.json({ message: 'Progres diperbarui.' });
  } catch (err) {
    console.error('POST /api/progress error:', err);
    return NextResponse.json({ error: 'Gagal menyimpan progres.' }, { status: 500 });
  }
}