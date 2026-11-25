import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password ?? '');

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    const { rows } = await pool.query(
      `SELECT *
       FROM users
       WHERE LOWER(TRIM(email)) = $1
       LIMIT 1`,
      [email]
    );

    const user = rows[0];
    if (!user) {
      try {
        const noticeRes = await pool.query(
          `SELECT reason FROM rejected_notices WHERE LOWER(TRIM(email)) = $1 LIMIT 1`,
          [email]
        );
        if (noticeRes.rows[0]) {
          const reason = String(noticeRes.rows[0].reason || '').trim();
          return NextResponse.json(
            {
              error: reason
                ? `Akun Anda ditolak oleh Administrator. Alasan: ${reason}`
                : 'Pendaftaran akun Anda ditolak oleh Administrator.',
              status: 'rejected',
              rejection_reason: reason || null,
            },
            { status: 403 }
          );
        }
      } catch {
        // Tabel rejected_notices mungkin belum ada
      }

      return NextResponse.json(
        { error: 'Email atau kata sandi tidak sesuai.' },
        { status: 401 }
      );
    }

    const storedPassword = String(user.password ?? user.password_hash ?? '');

    let passwordValid = false;
    if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
      try {
        const bcryptMod = await import('bcryptjs');
        const bcrypt = bcryptMod.default || bcryptMod;
        passwordValid = await bcrypt.compare(password, storedPassword);
      } catch {
        passwordValid = false;
      }
    } else {
      passwordValid = password === storedPassword;
    }

    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Email atau kata sandi tidak sesuai.' },
        { status: 401 }
      );
    }

    const role = String(user.role || 'student').toLowerCase().trim();
    const status = String(user.status || 'approved').toLowerCase().trim();

    if (role !== 'admin' && status === 'rejected') {
      const reason = String(user.rejection_reason || '').trim();
      return NextResponse.json(
        {
          error: reason
            ? `Akun Anda ditolak oleh Administrator. Alasan: ${reason}`
            : 'Pendaftaran akun Anda ditolak oleh Administrator.',
          status: 'rejected',
          rejection_reason: reason || null,
        },
        { status: 403 }
      );
    }

    let teacherSpecialty = '';
    if (role === 'teacher') {
      try {
        const tRes = await pool.query(
          'SELECT specialization FROM teachers WHERE user_id = $1 LIMIT 1',
          [user.id]
        );
        teacherSpecialty = tRes.rows[0]?.specialization || '';
      } catch {
        teacherSpecialty = '';
      }
    }

    const safeUser = {
      id: user.id,
      full_name: user.full_name || user.email,
      email: user.email,
      role,
      status,
      ...(role === 'teacher'
        ? { specialty: teacherSpecialty, specialization: teacherSpecialty }
        : {}),
      is_approved: status === 'approved' || role === 'admin',
      approved_at: status === 'approved' ? new Date().toISOString() : null,
    };

    const response = NextResponse.json({
      user: safeUser,
      role: safeUser.role,
    });

    response.cookies.set('niskala_user', JSON.stringify(safeUser), {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error('POST /api/auth/login error:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat masuk ke sistem.' },
      { status: 500 }
    );
  }
}
