import pool from "./db";

const query = (sql, params) => pool.query(sql, params);

export const DOMINANT_TASTES = [
  { slug: "manis", label: "Manis", desc: "Manis hangat, floral, karamel, atau licorice" },
  { slug: "asam", label: "Asam", desc: "Segar sitrus, asam jawa, kandis, kecombrang, atau sumac" },
  { slug: "asin", label: "Asin", desc: "Gurih asin fermentasi atau bumbu berkuah asin" },
  { slug: "pahit", label: "Pahit", desc: "Getir aromatik, rimpang, dedaunan, atau biji khas" },
  { slug: "pedas", label: "Pedas", desc: "Pedas hangat, cabai, lada, jahe, atau sensasi kebas" },
  { slug: "umami", label: "Umami", desc: "Gurih pekat fermentasi, kaldu, atau bahan berkekayaan rasa" },
];

export function normalizeTaste(taste) {
  if (!taste) return "";
  const val = String(taste).trim().toLowerCase();
  return DOMINANT_TASTES.some((t) => t.slug === val) ? val : "";
}

export async function getRecipeCategories() {
  const { rows } = await query(
    `SELECT rc.id, rc.slug, rc.name, rc.blurb, COUNT(r.id)::int AS recipe_count
     FROM recipe_categories rc
     LEFT JOIN recipes r ON r.category_id = rc.id
     GROUP BY rc.id, rc.slug, rc.name, rc.blurb
     ORDER BY rc.id ASC`
  );
  return rows;
}

export async function getSpicesForFilter() {
  const { rows } = await query(
    `SELECT s.id, s.code, s.name, s.short_name, s.type, s.dominant_pillar,
            COUNT(rs.recipe_id)::int AS recipe_count
     FROM spices s
     LEFT JOIN recipe_spices rs ON rs.spice_id = s.id
     GROUP BY s.id, s.code, s.name, s.short_name, s.type, s.dominant_pillar
     ORDER BY s.id ASC`
  );
  return rows;
}

export async function searchRecipes({
  q = "",
  taste = "",
  category = "",
  spiceId = "",
  limit = 50,
} = {}) {
  const conditions = [];
  const params = [];

  const cleanQuery = String(q || "").trim();
  if (cleanQuery) {
    params.push(`%${cleanQuery}%`);
    const pIdx = params.length;
    conditions.push(
      `(r.name ILIKE $${pIdx} OR r.spices_text ILIKE $${pIdx} OR r.region ILIKE $${pIdx} OR r.description ILIKE $${pIdx})`
    );
  }

  const cleanTaste = normalizeTaste(taste);
  if (cleanTaste) {
    params.push(cleanTaste);
    conditions.push(`r.dominant_taste = $${params.length}`);
  }

  const cleanCategory = String(category || "").trim();
  if (cleanCategory) {
    params.push(cleanCategory);
    conditions.push(`rc.slug = $${params.length}`);
  }

  const cleanSpiceId = Number.parseInt(spiceId, 10);
  if (Number.isInteger(cleanSpiceId) && cleanSpiceId > 0) {
    params.push(cleanSpiceId);
    conditions.push(
      `EXISTS (SELECT 1 FROM recipe_spices rs WHERE rs.recipe_id = r.id AND rs.spice_id = $${params.length})`
    );
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const safeLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 50, 1), 100);
  params.push(safeLimit);

  const sql = `
    SELECT
      r.id,
      r.dataset_id,
      r.name,
      r.region,
      r.country,
      r.minutes,
      r.difficulty,
      r.dominant_taste,
      r.spices_text,
      r.description,
      r.image_url,
      rc.slug AS category_slug,
      rc.name AS category_name,
      COALESCE(
        ARRAY_AGG(DISTINCT s.name) FILTER (WHERE s.name IS NOT NULL),
        '{}'
      ) AS linked_spices
    FROM recipes r
    LEFT JOIN recipe_categories rc ON rc.id = r.category_id
    LEFT JOIN recipe_spices rs ON rs.recipe_id = r.id
    LEFT JOIN spices s ON s.id = rs.spice_id
    ${whereClause}
    GROUP BY r.id, rc.slug, rc.name
    ORDER BY r.id ASC
    LIMIT $${params.length}
  `;

  const { rows } = await query(sql, params);
  return rows;
}

export async function getRecipeById(id) {
  const recipeId = Number.parseInt(id, 10);
  if (!Number.isInteger(recipeId) || recipeId <= 0) return null;

  const { rows } = await query(
    `SELECT
      r.*,
      rc.slug AS category_slug,
      rc.name AS category_name,
      rc.blurb AS category_blurb,
      COALESCE(
        JSON_AGG(
          DISTINCT JSONB_BUILD_OBJECT(
            'id', s.id,
            'code', s.code,
            'name', s.name,
            'short_name', s.short_name,
            'dominant_pillar', s.dominant_pillar,
            'activation_tech', s.activation_tech
          )
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'::json
      ) AS spices_detail
    FROM recipes r
    LEFT JOIN recipe_categories rc ON rc.id = r.category_id
    LEFT JOIN recipe_spices rs ON rs.recipe_id = r.id
    LEFT JOIN spices s ON s.id = rs.spice_id
    WHERE r.id = $1
    GROUP BY r.id, rc.slug, rc.name, rc.blurb`,
    [recipeId]
  );

  return rows[0] || null;
}
