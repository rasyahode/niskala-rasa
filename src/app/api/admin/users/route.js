import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT id, full_name, email, role, status
      FROM users
      ORDER BY id ASC
    `);

    const users = rows.map((row) => ({
      ...row,
      role: String(row.role || 'student').toLowerCase().trim(),
      status: String(row.status || 'approved').toLowerCase().trim(),
    }));

    return NextResponse.json({ users });
  } catch (err) {
    console.error('GET /api/admin/users error:', err);
    return NextResponse.json(
      { error: 'Gagal memuat daftar pengguna', users: [] },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const id = Number(body?.id);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: 'ID pengguna wajib diisi' }, { status: 400 });
    }

    const status = String(body?.status || 'approved').toLowerCase().trim();
    const role = body?.role ? String(body.role).toLowerCase().trim() : null;

    const { rows } = await pool.query(
      `UPDATE users
       SET status = $1,
           role = COALESCE($2, role)
       WHERE id = $3
       RETURNING id, full_name, email, role, status`,
      [status, role, id]
    );

    if (!rows[0]) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ user: rows[0] });
  } catch (err) {
    console.error('PUT /api/admin/users error:', err);
    return NextResponse.json(
      { error: 'Gagal memperbarui status pengguna' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: 'ID pengguna wajib diisi' }, { status: 400 });
    }

    await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
    return NextResponse.json({ deleted: true, id });
  } catch (err) {
    console.error('DELETE /api/admin/users error:', err);
    return NextResponse.json(
      { error: 'Gagal menghapus pengguna' },
      { status: 500 }
    );
  }
}
