import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await pool.query(`
      SELECT *
      FROM recipes
      ORDER BY id ASC
    `);

    const recipes = rows.map((row) => {
      const rawCategoryName = String(row?.category_name ?? '').trim();
      const rawDishType = String(row?.dish_type ?? '').trim();

      return {
        ...row,
        dish_type: rawDishType || null,
        category_name:
          rawCategoryName || (rawDishType ? rawDishType.replace(/_/g, ' ') : ''),
      };
    });

    return NextResponse.json({ recipes });
  } catch (err) {
    console.error('GET /api/recipes error:', err);
    return NextResponse.json(
      { error: 'Gagal memuat data resep', recipes: [] },
      { status: 500 }
    );
  }
}

const CATEGORY_TO_DISH_TYPE = {
  'makanan berkuah': 'berkuah',
  berkuah: 'berkuah',
  'makanan tidak berkuah': 'tidak_berkuah',
  tidak_berkuah: 'tidak_berkuah',
  'camilan kering': 'camilan_kering',
  camilan_kering: 'camilan_kering',
  minuman: 'minuman',
  'camilan basah': 'camilan_basah',
  camilan_basah: 'camilan_basah',
};

function resolveDishType(rawCategory, rawDishType) {
  const key = String(rawDishType || rawCategory || '')
    .toLowerCase()
    .trim();
  if (CATEGORY_TO_DISH_TYPE[key]) return CATEGORY_TO_DISH_TYPE[key];
  const slug = key.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  return slug || 'berkuah';
}

async function ensureRecipeCategorySchema(dishType, categoryName) {
  await pool.query(
    'ALTER TABLE classes DROP CONSTRAINT IF EXISTS classes_dish_type_check'
  );
  await pool.query(
    'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS category_name VARCHAR(100)'
  );
  await pool.query(
    `INSERT INTO classes (category_name, dish_type, title, recipe_description)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (dish_type) DO NOTHING`,
    [
      categoryName || dishType.replace(/_/g, ' '),
      dishType,
      `Kelas ${categoryName || dishType.replace(/_/g, ' ')}`,
      'Kelas kuliner Niskala Rasa.',
    ]
  );
}

async function validateTeacherCategory(dishType) {
  try {
    const cookieStore = await cookies();
    const rawCookie = cookieStore.get('niskala_user')?.value;
    if (!rawCookie) return null;
    const parsed = JSON.parse(decodeURIComponent(rawCookie));
    if (String(parsed?.role || '').toLowerCase() !== 'teacher' || !parsed?.id) {
      return null;
    }
    const tRes = await pool.query(
      'SELECT specialization FROM teachers WHERE user_id = $1 LIMIT 1',
      [Number(parsed.id)]
    );
    const assignedList = String(tRes.rows[0]?.specialization || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (assignedList.length === 0) return null;
    const isAllowed = assignedList.some(
      (spec) => resolveDishType(spec, '') === dishType
    );
    if (!isAllowed) {
      return `Pengajar hanya dapat mengelola materi pada kategori: ${assignedList.join(', ')}`;
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const title = String(body?.title || '').trim();
    if (!title) {
      return NextResponse.json({ error: 'Judul resep wajib diisi' }, { status: 400 });
    }

    const dishType = resolveDishType(body?.category_name, body?.dish_type);
    const categoryError = await validateTeacherCategory(dishType);
    if (categoryError) {
      return NextResponse.json({ error: categoryError }, { status: 403 });
    }
    const portionEstimate = String(body?.portion_estimate || '').trim() || null;
    const dominantTaste = String(body?.dominant_taste || '').trim() || null;
    const keySpice = String(body?.key_spice || '').trim() || null;
    const summary =
      String(body?.summary || '').trim() ||
      'Materi praktik hidangan Nusantara dari pengajar Niskala Rasa.';
    const spiceTechnique = String(body?.spice_technique || '').trim() || null;
    const ingredients = String(body?.ingredients || '').trim() || null;
    const instructions = String(body?.instructions || '').trim() || null;
    const videoUrl = String(body?.video_url || '').trim() || null;
    const imageUrl = String(body?.image_url || '').trim() || null;

    await ensureRecipeCategorySchema(dishType, body?.category_name);

    const { rows } = await pool.query(
      `INSERT INTO recipes (
         title, dish_type, category_name, portion_estimate, dominant_taste,
         key_spice, summary, spice_technique, ingredients, instructions,
         video_url, image_url
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        title,
        dishType,
        String(body?.category_name || '').trim() || dishType.replace(/_/g, ' '),
        portionEstimate,
        dominantTaste,
        keySpice,
        summary,
        spiceTechnique,
        ingredients,
        instructions,
        videoUrl,
        imageUrl,
      ]
    );

    const created = rows[0];
    return NextResponse.json(
      {
        recipe: {
          ...created,
          category_name: body?.category_name || dishType.replace(/_/g, ' '),
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('POST /api/recipes error:', err);
    return NextResponse.json(
      { error: 'Gagal menambahkan resep' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const id = Number(body?.id);
    const title = String(body?.title || '').trim();
    if (!id || Number.isNaN(id) || !title) {
      return NextResponse.json(
        { error: 'ID dan judul resep wajib diisi' },
        { status: 400 }
      );
    }

    const dishType = resolveDishType(body?.category_name, body?.dish_type);
    const categoryError = await validateTeacherCategory(dishType);
    if (categoryError) {
      return NextResponse.json({ error: categoryError }, { status: 403 });
    }
    const portionEstimate = String(body?.portion_estimate || '').trim() || null;
    const dominantTaste = String(body?.dominant_taste || '').trim() || null;
    const keySpice = String(body?.key_spice || '').trim() || null;
    const summary =
      String(body?.summary || '').trim() ||
      'Materi praktik hidangan Nusantara dari pengajar Niskala Rasa.';
    const spiceTechnique = String(body?.spice_technique || '').trim() || null;
    const ingredients = String(body?.ingredients || '').trim() || null;
    const instructions = String(body?.instructions || '').trim() || null;
    const videoUrl = String(body?.video_url || '').trim() || null;
    const imageUrl = String(body?.image_url || '').trim() || null;

    await ensureRecipeCategorySchema(dishType, body?.category_name);

    const { rows } = await pool.query(
      `UPDATE recipes
       SET title = $1,
           dish_type = $2,
           category_name = $3,
           portion_estimate = $4,
           dominant_taste = $5,
           key_spice = $6,
           summary = $7,
           spice_technique = $8,
           ingredients = $9,
           instructions = $10,
           video_url = $11,
           image_url = $12
       WHERE id = $13
       RETURNING *`,
      [
        title,
        dishType,
        String(body?.category_name || '').trim() || dishType.replace(/_/g, ' '),
        portionEstimate,
        dominantTaste,
        keySpice,
        summary,
        spiceTechnique,
        ingredients,
        instructions,
        videoUrl,
        imageUrl,
        id,
      ]
    );

    if (!rows[0]) {
      return NextResponse.json({ error: 'Resep tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({
      recipe: {
        ...rows[0],
        category_name: body?.category_name || dishType.replace(/_/g, ' '),
      },
    });
  } catch (err) {
    console.error('PUT /api/recipes error:', err);
    return NextResponse.json(
      { error: 'Gagal memperbarui resep' },
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

    const id = Number(searchParams.get('id') || bodyId);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: 'ID resep wajib disertakan' }, { status: 400 });
    }

    const { rows } = await pool.query(
      `DELETE FROM recipes WHERE id = $1 RETURNING id`,
      [id]
    );

    if (!rows[0]) {
      return NextResponse.json({ error: 'Resep tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ deleted: true, id: rows[0].id });
  } catch (err) {
    console.error('DELETE /api/recipes error:', err);
    return NextResponse.json(
      { error: 'Gagal menghapus resep' },
      { status: 500 }
    );
  }
}