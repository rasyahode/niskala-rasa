import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

const SPECIALTY_LABELS = {
  berkuah: 'Makanan Berkuah',
  tidak_berkuah: 'Makanan Tidak Berkuah',
  camilan_kering: 'Camilan Kering',
  minuman: 'Minuman',
  camilan_basah: 'Camilan Basah',
};

export async function POST(request) {
  let client;
  try {
    const body = await request.json();
    const fullName = String(body?.full_name || body?.name || body?.username || '').trim();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');
    const rawRole = String(body?.role || 'student').toLowerCase().trim();
    const role = rawRole === 'teacher' ? 'teacher' : 'student';

    const rawSpec = String(body?.specialization || body?.teacher_specialty || '').trim();
    const specialization = SPECIALTY_LABELS[rawSpec] || rawSpec || 'Kuliner Nusantara';
    const cvUrl = String(body?.cv_url || body?.cv_info || '').trim() || null;
    const certificateUrl =
      String(body?.certificate_url || body?.professional_license || '').trim() || null;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: 'Nama lengkap, email, dan kata sandi wajib diisi' },
        { status: 400 }
      );
    }

    if (role === 'teacher' && body?.agreed_terms === false) {
      return NextResponse.json(
        { error: 'Anda harus menyetujui seluruh 5 ketentuan pengajar sebelum mendaftar' },
        { status: 400 }
      );
    }

    client = await pool.connect();

    const existing = await client.query(
      `SELECT id FROM users WHERE LOWER(TRIM(email)) = $1 LIMIT 1`,
      [email]
    );
    if (existing.rows[0]) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 409 }
      );
    }

    const isApproved = false;
    const status = 'pending';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      await client.query(
        'DELETE FROM rejected_notices WHERE LOWER(TRIM(email)) = $1',
        [email]
      );
    } catch {
      // Tabel rejected_notices mungkin belum ada
    }

    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO users (full_name, email, password, role, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, role, status`,
      [fullName, email, hashedPassword, role, status]
    );

    const createdUser = {
      ...rows[0],
      is_approved: isApproved,
    };

    if (role === 'teacher') {
      await client.query(
        `INSERT INTO teachers (user_id, specialization, cv_url, certificate_url)
         VALUES ($1, $2, $3, $4)`,
        [createdUser.id, specialization, cvUrl, certificateUrl]
      );
    } else {
      await client.query(
        `INSERT INTO students (user_id, skill_level)
         VALUES ($1, 'Murid Terdaftar')`,
        [createdUser.id]
      );
    }

    await client.query('COMMIT');

    const response = NextResponse.json(
      {
        user: createdUser,
        message:
          role === 'teacher'
            ? 'Pendaftaran pengajar berhasil. Akun Anda sedang menunggu persetujuan Admin (mode lihat saja).'
            : 'Pendaftaran murid berhasil. Akun Anda sedang menunggu persetujuan Admin (mode lihat saja).',
      },
      { status: 201 }
    );

    response.cookies.set('niskala_user', JSON.stringify(createdUser), {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch {}
    }
    console.error('POST /api/auth/register error:', err);
    return NextResponse.json(
      { error: 'Gagal mendaftarkan akun baru' },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
