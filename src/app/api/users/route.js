import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const globalForPg = globalThis;
const pool =
  globalForPg.__niskalaPool ||
  new Pool({
    connectionString:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/niskala_rasa',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPg.__niskalaPool = pool;
}

async function getTableColumns(client, tableName) {
  const res = await client.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1`,
    [tableName]
  );
  return new Set(res.rows.map((r) => r.column_name));
}

export async function GET() {
  let client;
  try {
    client = await pool.connect();
    const userCols = await getTableColumns(client, 'users');
    if (userCols.size === 0) {
      return NextResponse.json({ users: [] }, { status: 200 });
    }

    const teacherCols = await getTableColumns(client, 'teachers');
    const studentCols = await getTableColumns(client, 'students');

    const usersRes = await client.query('SELECT * FROM users ORDER BY id ASC');

    const teacherMap = new Map();
    if (teacherCols.size > 0 && teacherCols.has('user_id')) {
      const tRes = await client.query('SELECT * FROM teachers');
      tRes.rows.forEach((t) => teacherMap.set(String(t.user_id), t));
    }

    const studentMap = new Map();
    if (studentCols.size > 0 && studentCols.has('user_id')) {
      const sRes = await client.query('SELECT * FROM students');
      sRes.rows.forEach((s) => studentMap.set(String(s.user_id), s));
    }

    const enrollmentCountMap = new Map();
    try {
      const enrollCols = await getTableColumns(client, 'enrollments');
      if (enrollCols.has('student_user_id')) {
        const eRes = await client.query(
          'SELECT student_user_id, COUNT(*)::int AS cnt FROM enrollments GROUP BY student_user_id'
        );
        eRes.rows.forEach((e) =>
          enrollmentCountMap.set(String(e.student_user_id), Number(e.cnt || 0))
        );
      }
    } catch {
      // Abaikan bila tabel enrollments belum tersedia
    }

    const users = usersRes.rows.map((u) => {
      const tInfo = teacherMap.get(String(u.id)) || {};
      const sInfo = studentMap.get(String(u.id)) || {};

      return {
        id: u.id,
        name: u.name || u.full_name || u.username || u.email,
        full_name: u.full_name || u.name || u.username || u.email,
        email: u.email,
        role: String(u.role || 'student').toLowerCase(),
        status: u.status || tInfo.status || sInfo.status || 'active',
        specialty:
          u.specialty ||
          tInfo.specialization ||
          tInfo.specialty ||
          tInfo.category_name ||
          tInfo.expertise ||
          '',
        cv_url: tInfo.cv_url || '',
        certificate_url: tInfo.certificate_url || '',
        rejection_reason: u.rejection_reason || '',
        skill_level:
          u.skill_level ||
          sInfo.skill_level ||
          sInfo.level ||
          'Murid Terdaftar',
        enrolled_classes_count: enrollmentCountMap.get(String(u.id)) || 0,
      };
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('GET /api/users error:', error);
    return NextResponse.json(
      { users: [], error: error.message },
      { status: 200 }
    );
  } finally {
    if (client) client.release();
  }
}

export async function PUT(request) {
  let client;
  try {
    const body = await request.json();
    const { id, name, email, password, role, specialty, specialties, status, rejection_reason } =
      body || {};
    const resolvedSpecialty = Array.isArray(specialties)
      ? specialties.map((s) => String(s || '').trim()).filter(Boolean).join(', ')
      : String(specialty || '').trim();

    client = await pool.connect();
    await client.query(
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_reason TEXT'
    );
    const userCols = await getTableColumns(client, 'users');
    if (userCols.size === 0) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const updates = [];
    const values = [];
    let paramIdx = 1;

    if (name) {
      if (userCols.has('name')) {
        updates.push(`name = $${paramIdx++}`);
        values.push(name);
      } else if (userCols.has('full_name')) {
        updates.push(`full_name = $${paramIdx++}`);
        values.push(name);
      }
    }

    if (email && userCols.has('email')) {
      updates.push(`email = $${paramIdx++}`);
      values.push(email);
    }

    if (password) {
      if (userCols.has('password')) {
        updates.push(`password = $${paramIdx++}`);
        values.push(password);
      } else if (userCols.has('password_hash')) {
        updates.push(`password_hash = $${paramIdx++}`);
        values.push(password);
      }
    }

    const normalizedStatus =
      String(status || '').toLowerCase().trim() === 'active'
        ? 'approved'
        : String(status || '').toLowerCase().trim();

    if (normalizedStatus && userCols.has('status')) {
      updates.push(`status = $${paramIdx++}`);
      values.push(normalizedStatus);
      if (userCols.has('rejection_reason')) {
        if (normalizedStatus === 'rejected') {
          updates.push(`rejection_reason = $${paramIdx++}`);
          values.push(String(rejection_reason || '').trim() || null);
        } else if (normalizedStatus === 'approved') {
          updates.push(`rejection_reason = NULL`);
        }
      }
    }

    if (resolvedSpecialty && userCols.has('specialty')) {
      updates.push(`specialty = $${paramIdx++}`);
      values.push(resolvedSpecialty);
    }

    let targetUserId = id;
    if (updates.length > 0) {
      const numericId = Number(id);
      if (!Number.isNaN(numericId) && userCols.has('id')) {
        values.push(numericId);
        await client.query(
          `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIdx}`,
          values
        );
      } else if (email && userCols.has('email')) {
        values.push(email);
        const resByEmail = await client.query(
          `UPDATE users SET ${updates.join(', ')} WHERE email = $${paramIdx} RETURNING id`,
          values
        );
        if (resByEmail.rows[0]?.id) {
          targetUserId = resByEmail.rows[0].id;
        }
      }
    }

    // Perbarui kategori ampu guru di tabel teachers bila tersedia
    if (resolvedSpecialty && String(role || '').toLowerCase() === 'teacher') {
      const teacherCols = await getTableColumns(client, 'teachers');
      const numericUserId = Number(targetUserId);
      if (teacherCols.size > 0 && !Number.isNaN(numericUserId)) {
        if (teacherCols.has('specialization')) {
          await client.query(
            'ALTER TABLE teachers ALTER COLUMN specialization TYPE TEXT'
          );
          await client.query(
            'UPDATE teachers SET specialization = $1 WHERE user_id = $2',
            [resolvedSpecialty, numericUserId]
          );
        }
        if (teacherCols.has('specialty')) {
          await client.query(
            'UPDATE teachers SET specialty = $1 WHERE user_id = $2',
            [resolvedSpecialty, numericUserId]
          );
        } else if (teacherCols.has('category_name')) {
          await client.query(
            'UPDATE teachers SET category_name = $1 WHERE user_id = $2',
            [resolvedSpecialty, numericUserId]
          );
        }
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('PUT /api/users error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 200 }
    );
  } finally {
    if (client) client.release();
  }
}

export async function DELETE(request) {
  let client;
  try {
    const { searchParams } = new URL(request.url);
    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const rawId = searchParams.get('id') ?? body?.id;
    const rawEmail = searchParams.get('email') ?? body?.email;
    const rejectionReason = String(body?.rejection_reason || '').trim();
    const isRejection = Boolean(body?.is_rejection || rejectionReason);

    client = await pool.connect();

    let targetEmail = String(rawEmail || '').trim().toLowerCase();
    const numericId = Number(rawId);

    // Pastikan murid yang masih mengikuti kelas tidak dapat dihapus (kecuali penolakan pendaftaran)
    if (!isRejection) {
      let targetUser = null;
      if (!Number.isNaN(numericId) && numericId > 0) {
        const uRes = await client.query(
          'SELECT id, email, role FROM users WHERE id = $1 LIMIT 1',
          [numericId]
        );
        targetUser = uRes.rows[0] || null;
      } else if (targetEmail) {
        const uRes = await client.query(
          'SELECT id, email, role FROM users WHERE LOWER(TRIM(email)) = $1 LIMIT 1',
          [targetEmail]
        );
        targetUser = uRes.rows[0] || null;
      }

      if (
        targetUser &&
        String(targetUser.role || '').toLowerCase() === 'student'
      ) {
        const enrollRes = await client.query(
          'SELECT COUNT(*)::int AS cnt FROM enrollments WHERE student_user_id = $1',
          [targetUser.id]
        );
        const enrollCount = Number(enrollRes.rows[0]?.cnt || 0);
        if (enrollCount > 0) {
          return NextResponse.json(
            {
              ok: false,
              error:
                'Murid tidak dapat dihapus karena masih mengikuti kelas.',
            },
            { status: 409 }
          );
        }
      }
    }

    if (!Number.isNaN(numericId) && numericId > 0) {
      const delRes = await client.query(
        'DELETE FROM users WHERE id = $1 RETURNING email',
        [numericId]
      );
      if (delRes.rows[0]?.email) {
        targetEmail = String(delRes.rows[0].email).trim().toLowerCase();
      }
    } else if (targetEmail) {
      await client.query(
        'DELETE FROM users WHERE LOWER(TRIM(email)) = $1',
        [targetEmail]
      );
    } else {
      return NextResponse.json(
        { ok: false, error: 'ID atau email pengguna wajib diisi' },
        { status: 400 }
      );
    }

    if (isRejection && targetEmail) {
      await client.query(
        `CREATE TABLE IF NOT EXISTS rejected_notices (
          email TEXT PRIMARY KEY,
          reason TEXT,
          rejected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      );
      await client.query(
        `INSERT INTO rejected_notices (email, reason, rejected_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (email) DO UPDATE
         SET reason = EXCLUDED.reason, rejected_at = NOW()`,
        [targetEmail, rejectionReason || null]
      );
    }

    return NextResponse.json({ ok: true, deleted: true }, { status: 200 });
  } catch (error) {
    console.error('DELETE /api/users error:', error);
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
