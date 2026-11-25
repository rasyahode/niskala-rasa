import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const studentId = searchParams.get('student_id');

    if (role !== 'admin') {
      return NextResponse.json(
        { error: 'Akses ditolak. Hanya Admin yang dapat menghapus akun murid.' },
        { status: 403 }
      );
    }

    if (!studentId) {
      return NextResponse.json({ error: 'student_id wajib diisi.' }, { status: 400 });
    }

    await pool.query("DELETE FROM users WHERE id = $1 AND role = 'student'", [studentId]);
    return NextResponse.json({ message: 'Akun murid berhasil dihapus oleh Admin.' });
  } catch (error) {
    console.error('DELETE /api/admin/students error:', error);
    return NextResponse.json({ error: 'Gagal menghapus murid.' }, { status: 500 });
  }
}
