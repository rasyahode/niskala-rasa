import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const OFFICIAL_TEACHER_BY_CATEGORY = {
  'Makanan Berkuah': 'Raka Pratama Wijaya Kusuma Putra',
  'Makanan Tidak Berkuah': 'Sari Dewi Lestari Putri Andini',
  'Camilan Kering': 'Dimas Aditya Nugraha Pratama Jaya',
  'Camilan Basah': 'Tari Rahmawati Putri Kusuma Ningrum',
  Minuman: 'Maya Kartika Sari Dewi Permata',
};

const DISH_TYPE_BY_CATEGORY = {
  'Makanan Berkuah': 'berkuah',
  'Makanan Tidak Berkuah': 'tidak_berkuah',
  'Camilan Kering': 'camilan_kering',
  'Camilan Basah': 'camilan_basah',
  Minuman: 'minuman',
};

function resolveSafeTeacherName(row) {
  const role = String(row.teacher_role || '').toLowerCase().trim();
  const name = String(row.teacher_name || '').trim();
  if (role === 'teacher' && name && !/admin/i.test(name)) {
    return name;
  }
  return OFFICIAL_TEACHER_BY_CATEGORY[row.category_name] || 'Instruktur Niskala Rasa';
}

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT
        c.id,
        c.category_name,
        c.dish_type,
        c.title,
        c.recipe_description,
        c.teacher_id,
        u.full_name AS teacher_name,
        u.role AS teacher_role,
        t.specialization AS teacher_specialization,
        COUNT(r.id)::int AS total_lessons
      FROM classes c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      LEFT JOIN users u
        ON t.user_id = u.id
       AND LOWER(TRIM(COALESCE(u.role, ''))) = 'teacher'
      LEFT JOIN recipes r ON r.dish_type = c.dish_type
      GROUP BY
        c.id,
        c.category_name,
        c.dish_type,
        c.title,
        c.recipe_description,
        c.teacher_id,
        u.full_name,
        u.role,
        t.specialization
      ORDER BY c.id ASC
    `);

    const classes = rows.map((row) => ({
      ...row,
      teacher_name: resolveSafeTeacherName(row),
      dish_type: row.dish_type || DISH_TYPE_BY_CATEGORY[row.category_name] || null,
    }));

    return NextResponse.json({ classes });
  } catch (err) {
    console.error('GET /api/classes error:', err);
    return NextResponse.json(
      { error: 'Gagal memuat data kelas', classes: [] },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const title = String(body?.title || '').trim();
    const categoryName = String(body?.category_name || '').trim();
    const dishType = String(
      body?.dish_type ||
        DISH_TYPE_BY_CATEGORY[categoryName] ||
        categoryName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '')
    )
      .trim()
      .toLowerCase();
    const description = String(
      body?.recipe_description ?? body?.description ?? ''
    ).trim();

    if (!title || !categoryName || !dishType) {
      return NextResponse.json(
        { error: 'Judul, kategori, dan jenis masakan kelas wajib diisi' },
        { status: 400 }
      );
    }

    let validTeacherId = null;
    if (body?.teacher_id) {
      const checkTeacher = await pool.query(
        `SELECT t.id, t.specialization
         FROM teachers t
         JOIN users u ON t.user_id = u.id
         WHERE (t.id = $1 OR u.id = $1)
           AND LOWER(TRIM(COALESCE(u.role, ''))) = 'teacher'
         LIMIT 1`,
        [body.teacher_id]
      );
      if (!checkTeacher.rows[0]) {
        return NextResponse.json(
          { error: 'Pengajar harus akun dengan role teacher' },
          { status: 400 }
        );
      }
      const assignedList = String(checkTeacher.rows[0].specialization || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const isAllowed =
        assignedList.length === 0 ||
        assignedList.some((spec) => {
          const specDishType =
            DISH_TYPE_BY_CATEGORY[spec] ||
            spec
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '_')
              .replace(/^_+|_+$/g, '');
          return (
            specDishType === dishType ||
            spec.toLowerCase() === categoryName.toLowerCase()
          );
        });
      if (!isAllowed) {
        return NextResponse.json(
          {
            error: `Pengajar hanya dapat menambah kelas pada kategori: ${assignedList.join(', ')}`,
          },
          { status: 403 }
        );
      }
      validTeacherId = checkTeacher.rows[0].id;
    }

    await pool.query(
      'ALTER TABLE classes DROP CONSTRAINT IF EXISTS classes_dish_type_check'
    );

    const { rows } = await pool.query(
      `INSERT INTO classes (
         title,
         category_name,
         dish_type,
         recipe_description,
         teacher_id
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, categoryName, dishType, description, validTeacherId]
    );

    return NextResponse.json({ class: rows[0] }, { status: 201 });
  } catch (err) {
    console.error('POST /api/classes error:', err);
    return NextResponse.json(
      { error: 'Gagal menambahkan kelas' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const body = await request.json();
    const id = searchParams.get('id') || body?.id;

    if (!id) {
      return NextResponse.json({ error: 'ID kelas wajib disertakan' }, { status: 400 });
    }

    const title = String(body?.title || '').trim();
    const categoryName = String(body?.category_name || '').trim();
    const dishType = String(
      body?.dish_type ||
        DISH_TYPE_BY_CATEGORY[categoryName] ||
        categoryName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_+|_+$/g, '')
    )
      .trim()
      .toLowerCase();
    const description = body?.recipe_description ?? body?.description ?? null;

    if (!title) {
      return NextResponse.json({ error: 'Judul kelas wajib diisi' }, { status: 400 });
    }

    let validTeacherId = null;
    if (body?.teacher_id) {
      const checkTeacher = await pool.query(
        `SELECT t.id, t.specialization
         FROM teachers t
         JOIN users u ON t.user_id = u.id
         WHERE (t.id = $1 OR u.id = $1)
           AND LOWER(TRIM(COALESCE(u.role, ''))) = 'teacher'
         LIMIT 1`,
        [body.teacher_id]
      );
      if (!checkTeacher.rows[0]) {
        return NextResponse.json(
          { error: 'Pengajar harus akun dengan role teacher' },
          { status: 400 }
        );
      }
      const assignedList = String(checkTeacher.rows[0].specialization || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const isAllowed =
        assignedList.length === 0 ||
        assignedList.some((spec) => {
          const specDishType =
            DISH_TYPE_BY_CATEGORY[spec] ||
            spec
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '_')
              .replace(/^_+|_+$/g, '');
          return (
            specDishType === dishType ||
            spec.toLowerCase() === categoryName.toLowerCase()
          );
        });
      if (!isAllowed) {
        return NextResponse.json(
          {
            error: `Pengajar hanya dapat menambah kelas pada kategori: ${assignedList.join(', ')}`,
          },
          { status: 403 }
        );
      }
      validTeacherId = checkTeacher.rows[0].id;
    }

    await pool.query(
      'ALTER TABLE classes DROP CONSTRAINT IF EXISTS classes_dish_type_check'
    );

    const { rows } = await pool.query(
      `UPDATE classes
       SET title = $1,
           category_name = COALESCE(NULLIF($2, ''), category_name),
           recipe_description = COALESCE($3, recipe_description),
           teacher_id = COALESCE($4, teacher_id)
       WHERE id = $5
       RETURNING *`,
      [title, categoryName, description, validTeacherId, id]
    );

    if (!rows[0]) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ class: rows[0] });
  } catch (err) {
    console.error('PUT /api/classes error:', err);
    return NextResponse.json(
      { error: 'Gagal memperbarui kelas' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    let bodyId = null;
    try {
      const body = await request.json();
      bodyId = body?.id;
    } catch {
      bodyId = null;
    }

    const id = searchParams.get('id') || bodyId;
    if (!id) {
      return NextResponse.json({ error: 'ID kelas wajib disertakan' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `DELETE FROM classes WHERE id = $1 RETURNING id`,
      [id]
    );

    if (!rows[0]) {
      return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ deleted: true, id: rows[0].id });
  } catch (err) {
    console.error('DELETE /api/classes error:', err);
    return NextResponse.json(
      { error: 'Gagal menghapus kelas' },
      { status: 500 }
    );
  }
}
