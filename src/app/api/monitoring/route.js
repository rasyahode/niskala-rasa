import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const teacherId = searchParams.get('teacher_id');

    if (role === 'teacher') {
      if (!teacherId) {
        return NextResponse.json({ error: 'teacher_id wajib diisi.' }, { status: 400 });
      }

      const teacherInfoRes = await pool.query(
        'SELECT id, username, email, teacher_specialty, teacher_level FROM users WHERE id = $1',
        [teacherId]
      );

      const classesRes = await pool.query(
        'SELECT * FROM classes WHERE teacher_id = $1 ORDER BY created_at DESC',
        [teacherId]
      );

      // Hanya murid yang SUDAH Mark as Done pada kelas yang diajar guru ini
      const completedStudentsRes = await pool.query(
        `SELECT
          p.id AS progress_id,
          p.completed_at,
          u.id AS student_id,
          u.username AS student_name,
          u.email AS student_email,
          c.id AS class_id,
          c.title AS class_title,
          c.dish_type
        FROM class_material_progress p
        JOIN classes c ON c.id = p.class_id
        JOIN users u ON u.id = p.user_id
        WHERE c.teacher_id = $1
        ORDER BY p.completed_at DESC`,
        [teacherId]
      );

      return NextResponse.json({
        teacher: teacherInfoRes.rows[0] || null,
        classes: classesRes.rows,
        completedStudents: completedStudentsRes.rows,
      });
    }

    if (role === 'admin') {
      const classesRes = await pool.query('SELECT * FROM classes ORDER BY created_at DESC');
      const teachersRes = await pool.query(
        `SELECT id, username, email, teacher_specialty, teacher_level, teacher_status
         FROM users WHERE role = 'teacher' ORDER BY id ASC`
      );
      const allProgressRes = await pool.query(
        `SELECT
          e.id AS enrollment_id,
          e.created_at AS enrolled_at,
          u.id AS student_id,
          u.username AS student_name,
          u.email AS student_email,
          c.id AS class_id,
          c.title AS class_title,
          c.dish_type,
          c.teacher_name,
          p.completed_at
        FROM class_enrollments e
        JOIN users u ON u.id = e.user_id
        JOIN classes c ON c.id = e.class_id
        LEFT JOIN class_material_progress p
          ON p.class_id = e.class_id AND p.user_id = e.user_id
        ORDER BY p.completed_at DESC NULLS LAST, e.created_at DESC`
      );

      return NextResponse.json({
        classes: classesRes.rows,
        teachers: teachersRes.rows,
        allProgress: allProgressRes.rows,
      });
    }

    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  } catch (error) {
    console.error('GET /api/monitoring error:', error);
    return NextResponse.json({ error: 'Gagal memuat data pemantauan.' }, { status: 500 });
  }
}
