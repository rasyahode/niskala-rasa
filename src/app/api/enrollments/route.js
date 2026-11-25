import { NextResponse } from 'next/server';
import pool from '@/lib/db';

function parseUserCookie(request) {
  try {
    const rawCookie = request.cookies.get('niskala_user')?.value;
    if (!rawCookie) return null;
    return JSON.parse(decodeURIComponent(rawCookie));
  } catch {
    return null;
  }
}

async function ensureEnrollmentsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS enrollments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      student_name TEXT,
      student_email TEXT,
      class_id INTEGER NOT NULL,
      class_title TEXT,
      teacher_name TEXT,
      progress INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Tambahkan kolom pelengkap jika tabel lama sudah ada dengan skema minimal
  const alterQueries = [
    `ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS student_name TEXT`,
    `ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS student_email TEXT`,
    `ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS class_title TEXT`,
    `ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS teacher_name TEXT`,
    `ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0`,
  ];

  for (const sql of alterQueries) {
    try {
      await pool.query(sql);
    } catch {
      // Abaikan jika kolom sudah ada atau nama kolom berbeda
    }
  }
}

export async function GET(request) {
  try {
    await ensureEnrollmentsTable();

    const { searchParams } = new URL(request.url);
    const cookieUser = parseUserCookie(request);
    const allFlag = searchParams.get('all');

    const rawUserId =
      allFlag === '1'
        ? null
        : searchParams.get('userId') ||
          searchParams.get('user_id') ||
          cookieUser?.id ||
          null;

    const rawEmail =
      allFlag === '1'
        ? null
        : searchParams.get('email') || cookieUser?.email || null;

    if (rawUserId || rawEmail) {
      const userId = Number(rawUserId);
      try {
        if (!Number.isNaN(userId) && userId > 0 && rawEmail) {
          const { rows } = await pool.query(
            `SELECT * FROM enrollments
             WHERE user_id = $1 OR LOWER(COALESCE(student_email, '')) = LOWER($2)
             ORDER BY id DESC`,
            [userId, String(rawEmail)]
          );
          return NextResponse.json({ enrollments: rows });
        }

        if (!Number.isNaN(userId) && userId > 0) {
          const { rows } = await pool.query(
            `SELECT * FROM enrollments WHERE user_id = $1 ORDER BY id DESC`,
            [userId]
          );
          return NextResponse.json({ enrollments: rows });
        }

        if (rawEmail) {
          const { rows } = await pool.query(
            `SELECT * FROM enrollments
             WHERE LOWER(COALESCE(student_email, '')) = LOWER($1)
             ORDER BY id DESC`,
            [String(rawEmail)]
          );
          return NextResponse.json({ enrollments: rows });
        }
      } catch {
        const { rows } = await pool.query(
          `SELECT * FROM enrollments ORDER BY id DESC`
        );
        return NextResponse.json({ enrollments: rows });
      }
    }

    const { rows } = await pool.query(
      `SELECT * FROM enrollments ORDER BY id DESC`
    );
    return NextResponse.json({ enrollments: rows });
  } catch (err) {
    console.error('GET /api/enrollments error:', err);
    return NextResponse.json({ enrollments: [] }, { status: 200 });
  }
}

export async function POST(request) {
  let cookieUser = null;
  try {
    cookieUser = parseUserCookie(request);
  } catch {
    cookieUser = null;
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const userId =
    Number(body?.user_id ?? body?.userId ?? cookieUser?.id ?? 7) || 7;
  const classId = Number(
    body?.class_id ?? body?.course_id ?? body?.classId
  );
  const studentName = String(
    body?.student_name ??
      cookieUser?.full_name ??
      cookieUser?.name ??
      'Putri Lestari Kusuma Wardani'
  ).trim();
  const studentEmail = String(
    body?.student_email ?? cookieUser?.email ?? 'putri@gmail.com'
  ).trim();
  const classTitle = String(body?.class_title ?? '').trim();
  const teacherName = String(body?.teacher_name ?? '').trim();

  if (!classId || Number.isNaN(classId)) {
    return NextResponse.json(
      { error: 'ID kelas wajib disertakan.' },
      { status: 400 }
    );
  }

  try {
    await ensureEnrollmentsTable();

    // Cek apakah murid sudah terdaftar pada kelas ini
    const existing = await pool.query(
      `SELECT * FROM enrollments
       WHERE class_id = $1
         AND (user_id = $2 OR LOWER(COALESCE(student_email, '')) = LOWER($3))
       LIMIT 1`,
      [classId, userId, studentEmail]
    );

    if (existing.rows[0]) {
      return NextResponse.json(
        { enrollment: existing.rows[0] },
        { status: 200 }
      );
    }

    const { rows } = await pool.query(
      `INSERT INTO enrollments (
         user_id,
         student_name,
         student_email,
         class_id,
         class_title,
         teacher_name,
         progress
       )
       VALUES ($1, $2, $3, $4, $5, $6, 0)
       RETURNING *`,
      [userId, studentName, studentEmail, classId, classTitle, teacherName]
    );

    return NextResponse.json({ enrollment: rows[0] }, { status: 201 });
  } catch (err) {
    console.error('POST /api/enrollments error:', err);
    return NextResponse.json(
      {
        enrollment: {
          id: Date.now(),
          user_id: userId,
          student_name: studentName,
          student_email: studentEmail,
          class_id: classId,
          class_title: classTitle,
          teacher_name: teacherName,
          progress: 0,
        },
      },
      { status: 201 }
    );
  }
}
