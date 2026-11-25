'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORY_KEY_MAP = {
  'makanan berkuah': 'berkuah',
  berkuah: 'berkuah',
  'makanan tidak berkuah': 'tidak_berkuah',
  'tidak berkuah': 'tidak_berkuah',
  tidak_berkuah: 'tidak_berkuah',
  'camilan kering': 'camilan_kering',
  camilan_kering: 'camilan_kering',
  'camilan basah': 'camilan_basah',
  camilan_basah: 'camilan_basah',
  minuman: 'minuman',
};

function toCategoryKey(raw) {
  const norm = String(raw || '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .trim();
  return (
    CATEGORY_KEY_MAP[norm] ||
    norm.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
  );
}

const LOCAL_RECIPES_STORAGE_KEY = 'niskala_teacher_custom_recipes';
const EDITED_RECIPES_STORAGE_KEY = 'niskala_edited_recipes';
const DELETED_RECIPES_STORAGE_KEY = 'niskala_deleted_recipes';
const ITEMS_PER_PAGE = 9;

const PUBLIC_RECIPE_FILES = [
  'Asam Padeh Ikan Tongkol Khas Minang.png',
  'Ayam Goreng Bawang Putih Renyah.png',
  'Ayam Goreng Lengkuas Renyah Gurih.png',
  'Ayam Tangkap Daun Kari Khas Aceh.png',
  'Bakwan Sayur Renyah Gurih.jpg',
  'Bir Pletok Hangat Khas Betawi.jpg',
  'Bubur Sumsum Kuah Kinca Gula Merah Pandan.png',
  'Dadar Gulung Hijau Suji Unti Kelapa.png',
  'Gulai Ikan Kakap Asam Gelugur.png',
  'Gulai Kambing Bumbu Adas.png',
  'Jamu Beras Kencur Segar.png',
  'Jamu Cabe Puyang.jpg',
  'Jamu Kunyit Asam Segar.jpg',
  'Jamu Temulawak.jpg',
  'Kacang Telur Keriting Aroma Kencur.jpg',
  'Keripik Tempe Sagu Renyah.png',
  'Klepon Ketan Pandan Gula Merah.png',
  'Kolak Pisang Ubi Wangi Pandan & Cengkeh.png',
  'Kuah Masam Keu-eung Ikan Khas Aceh.png',
  'Kue Bawang Gunting Renyah Gurih.jpg',
  'Kue Kering Kayu Manis (Cinnamon Cookies).jpg',
  'Kue Kering Nastar Klasik Aroma Cengkeh.jpg',
  'Kue Lidah Kucing Vanili Asli.jpg',
  'Kue Putu Ayu Hijau Suji Pandan.png',
  'Kue Semprit Pandan Suji Renyah.png',
  'Kue Spekulas (Spiku Kering) Rempah Pala & Fuli.jpg',
  'Kue Sus Isi Vla Vanili.jpg',
  'Lapis Legit Kukus.png',
  'Minuman Herbal Lempuyang Gula Aren.jpg',
  'Nasi Bakar Ayam Suwir Kemangi.png',
  'Puding Susu Sutra Vanili Saus Karamel.jpg',
  'Rawon Daging Sapi Khas Jawa Timur.jpg',
  'Rempeyek Kacang Tanah.png',
  'Sambal Andaliman Khas Batak.png',
  'Sambal Kecombrang Teri Medan.png',
  'Sambal Matah Bawang Merah Khas Bali.png',
  'Sapi Lada Hitam (Beef Blackpepper).png',
  'Sayur Asem Segar Khas Nusantara.jpg',
  'Sayur Bening Bayam Jagung Temu Kunci.jpg',
  'Semur Daging Sapi Bunga Lawang.jpg',
  'Setup Pisang Kepok Kayu Manis.jpg',
  'Soto Ayam Kuah Kuning Segar.jpg',
  'Soto Betawi Kuah Santan Kapulaga.png',
  'Stik Keju Lada Hitam (Blackpepper Cheese Stick).png',
  'Teh Rempah Adas Kapulaga Kayu Manis (Chai Nusantara).jpg',
  'Telur Balado Khas Padang.png',
  'Tempe & Tahu Bacem Ketumbar Khas Jogja.png',
  'Wedang Jamu Bangle Jahe Madu.png',
  'Wedang Serai Jahe Jeruk Nipis.jpg',
  'Wedang Uwuh Komplit Khas Yogyakarta.jpg',
];

function normalizeMatchKey(raw) {
  return String(raw || '')
    .toLowerCase()
    .replace(/\.(png|jpe?g|webp)$/i, '')
    .replace(/&/g, ' dan ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const FILE_LOOKUP = PUBLIC_RECIPE_FILES.map((fileName) => ({
  fileName,
  key: normalizeMatchKey(fileName),
  rawPath: `/images/recipes/${fileName}`,
}));

function getRecipePhotoSrc(recipe) {
  const explicit = String(
    recipe?.image_url || recipe?.imageUrl || recipe?.image || ''
  ).trim();

  if (explicit) {
    if (
      explicit.startsWith('http://') ||
      explicit.startsWith('https://') ||
      explicit.startsWith('data:')
    ) {
      return explicit;
    }
    const cleanExplicit = explicit.replace(/^\/?public\//i, '/');
    return cleanExplicit.startsWith('/') ? cleanExplicit : `/${cleanExplicit}`;
  }

  const targetKey = normalizeMatchKey(recipe?.title);
  if (targetKey) {
    const exact = FILE_LOOKUP.find((item) => item.key === targetKey);
    if (exact) return exact.rawPath;

    const targetTokens = targetKey.split(/\s+/).filter((t) => t.length > 1);
    let bestMatch = null;
    let bestScore = 0;

    FILE_LOOKUP.forEach((item) => {
      const fileTokens = item.key.split(/\s+/).filter((t) => t.length > 1);
      const overlap = targetTokens.filter((tok) => fileTokens.includes(tok)).length;
      const bonus =
        item.key.includes(targetKey) || targetKey.includes(item.key) ? 2 : 0;
      const score = overlap + bonus;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    });

    if (bestMatch && bestScore >= 1) {
      return bestMatch.rawPath;
    }
  }

  return `/images/recipes/${String(recipe?.title || '').trim()}.png`;
}

function ScrollRevealCard({ children }) {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -16px 0px',
      }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={cardRef}
      style={{
        opacity: isVisible ? 1 : 0.35,
        transform: isVisible
          ? 'translateY(0px) scale(1)'
          : 'translateY(14px) scale(0.99)',
        transition:
          'opacity 420ms cubic-bezier(0.22, 1, 0.36, 1), transform 420ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      className="will-change-[transform,opacity]"
    >
      {children}
    </div>
  );
}

export default function RecipesCatalogPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusMessage, setStatusMessage] = useState('');
  const [completedRecipeIds, setCompletedRecipeIds] = useState([]);
  const [teacherSpecialties, setTeacherSpecialties] = useState([]);
  const [isTeacherScope, setIsTeacherScope] = useState(false);
  const [confirmDeleteRecipe, setConfirmDeleteRecipe] = useState(null);

  useEffect(() => {
    try {
      const cookieStr = document.cookie || '';
      const found = cookieStr
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('niskala_user='));
      if (found) {
        const raw = decodeURIComponent(found.split('=').slice(1).join('='));
        const parsed = JSON.parse(raw);
        if (parsed && (parsed.email || parsed.role)) {
          setUser(parsed);
        }
      }
    } catch {
      setUser(null);
    }
  }, []);

  const role = String(user?.role || 'guest').toLowerCase().trim();
  const isGuest = !user || role === 'guest' || role === 'public';

  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      setIsTeacherScope(sp.get('scope') === 'teacher');
    } catch {
      setIsTeacherScope(false);
    }
  }, []);

  useEffect(() => {
    if (role !== 'teacher') {
      setTeacherSpecialties([]);
      return;
    }

    let active = true;
    async function loadTeacherSpecs() {
      let resolvedSpec = user?.specialty || user?.specialization || '';
      try {
        const resUsers = await fetch('/api/users', { cache: 'no-store' });
        if (resUsers.ok) {
          const dataUsers = await resUsers.json();
          const list = Array.isArray(dataUsers?.users) ? dataUsers.users : [];
          const me = list.find(
            (u) =>
              (user?.id && String(u.id) === String(user.id)) ||
              (user?.email &&
                String(u.email || '').toLowerCase().trim() ===
                  String(user.email || '').toLowerCase().trim())
          );
          if (me?.specialty) resolvedSpec = me.specialty;
        }
      } catch {
        // Fallback ke localStorage
      }

      if (!resolvedSpec) {
        try {
          const rawAdminTeachers = window.localStorage.getItem(
            'niskala_admin_teachers'
          );
          if (rawAdminTeachers) {
            const parsedTeachers = JSON.parse(rawAdminTeachers);
            if (Array.isArray(parsedTeachers)) {
              const meLocal = parsedTeachers.find(
                (t) =>
                  (user?.id && String(t.id) === String(user.id)) ||
                  (user?.email &&
                    String(t.email || '').toLowerCase().trim() ===
                      String(user.email || '').toLowerCase().trim())
              );
              if (meLocal?.specialty) resolvedSpec = meLocal.specialty;
            }
          }
        } catch {
          // Abaikan error storage
        }
      }

      const specs = String(resolvedSpec || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (active) setTeacherSpecialties(specs);
    }

    loadTeacherSpecs();
    return () => {
      active = false;
    };
  }, [role, user]);

  function isRecipeInTeacherCategory(recipeItem) {
    if (role !== 'teacher') return false;
    if (teacherSpecialties.length === 0) return false;
    const rKey = toCategoryKey(
      recipeItem?.dish_type || recipeItem?.category_name
    );
    return teacherSpecialties.some((s) => toCategoryKey(s) === rKey);
  }

  function canModifyRecipe(recipeItem) {
    if (role === 'admin') return true;
    if (role === 'teacher') return isRecipeInTeacherCategory(recipeItem);
    return false;
  }

  useEffect(() => {
    if (role !== 'student') {
      setCompletedRecipeIds([]);
      return;
    }
    try {
      const ids = new Set();
      const userEmail = String(user?.email || '').toLowerCase().trim();

      const rawCompleted = window.localStorage.getItem(
        'niskala_completed_recipes'
      );
      if (rawCompleted) {
        const parsed = JSON.parse(rawCompleted);
        if (Array.isArray(parsed)) {
          parsed.forEach((item) => {
            const itemEmail = String(item?.student_email || '')
              .toLowerCase()
              .trim();
            if (
              item?.completed !== false &&
              (!userEmail || !itemEmail || itemEmail === userEmail)
            ) {
              ids.add(String(item.recipe_id));
            }
          });
        }
      }

      const rawProgress = window.localStorage.getItem(
        'niskala_student_progress'
      );
      if (rawProgress) {
        const parsedProg = JSON.parse(rawProgress);
        if (Array.isArray(parsedProg)) {
          parsedProg.forEach((id) => ids.add(String(id)));
        }
      }

      setCompletedRecipeIds(Array.from(ids));
    } catch {
      setCompletedRecipeIds([]);
    }
  }, [role, user]);

  useEffect(() => {
    let active = true;

    async function loadRecipes() {
      let apiRecipes = [];
      try {
        const res = await fetch('/api/recipes', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          apiRecipes = Array.isArray(data?.recipes)
            ? data.recipes
            : Array.isArray(data)
              ? data
              : [];
        }
      } catch {
      }

      try {
        let customRecipes = [];
        const rawCustom = window.localStorage.getItem(LOCAL_RECIPES_STORAGE_KEY);
        if (rawCustom) {
          const parsedCustom = JSON.parse(rawCustom);
          if (Array.isArray(parsedCustom)) customRecipes = parsedCustom;
        }

        let editedMap = {};
        const rawEdited = window.localStorage.getItem(EDITED_RECIPES_STORAGE_KEY);
        if (rawEdited) {
          const parsedEdited = JSON.parse(rawEdited);
          if (parsedEdited && typeof parsedEdited === 'object') {
            editedMap = parsedEdited;
          }
        }

        let deletedIds = [];
        const rawDeleted = window.localStorage.getItem(DELETED_RECIPES_STORAGE_KEY);
        if (rawDeleted) {
          const parsedDeleted = JSON.parse(rawDeleted);
          if (Array.isArray(parsedDeleted)) {
            deletedIds = parsedDeleted.map((id) => String(id));
          }
        }
        const deletedSet = new Set(deletedIds);

        const combined = [...apiRecipes];
        customRecipes.forEach((cr) => {
          const exists = combined.some(
            (r) =>
              String(r.id) === String(cr.id) ||
              String(r.title || '').toLowerCase() ===
                String(cr.title || '').toLowerCase()
          );
          if (!exists) combined.push(cr);
        });

        const mergedEdited = combined.map((r) => {
          const override = editedMap[String(r.id)];
          return override ? { ...r, ...override } : r;
        });

        const visible = mergedEdited.filter(
          (r) => !deletedSet.has(String(r.id))
        );
        if (active) setRecipes(visible);
      } catch {
        if (active) setRecipes(apiRecipes);
      }
    }

    loadRecipes();
    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set();
    recipes.forEach((r) => {
      const cat = String(r.category_name || r.dish_type || '').trim();
      if (cat) set.add(cat);
    });
    return ['all', ...Array.from(set)];
  }, [recipes]);

  const categoryOptions = useMemo(
    () => categories.filter((cat) => cat !== 'all'),
    [categories]
  );

  const filteredRecipes = useMemo(() => {
    const q = String(searchQuery || '').toLowerCase().trim();
    return recipes.filter((r) => {
      if (isTeacherScope && role === 'teacher') {
        if (teacherSpecialties.length === 0) return false;
        const rKey = toCategoryKey(r.dish_type || r.category_name);
        const allowed = teacherSpecialties.some(
          (s) => toCategoryKey(s) === rKey
        );
        if (!allowed) return false;
      }
      const cat = String(r.category_name || r.dish_type || '').trim();
      const matchCat = selectedCategory === 'all' || cat === selectedCategory;
      const matchSearch =
        !q ||
        String(r.title || '').toLowerCase().includes(q) ||
        String(r.key_spice || '').toLowerCase().includes(q) ||
        cat.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [
    recipes,
    searchQuery,
    selectedCategory,
    isTeacherScope,
    role,
    teacherSpecialties,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRecipes.length / ITEMS_PER_PAGE)
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedRecipes = useMemo(() => {
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRecipes.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredRecipes, currentPage]);

  function handleChangePage(nextPage) {
    const bounded = Math.min(Math.max(1, nextPage), totalPages);
    setCurrentPage(bounded);
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
    }
  }

  function handleOpenRecipeAction(recipeItem) {
    if (!recipeItem) return;
    router.push(`/recipes/${recipeItem.id}`);
  }

  async function handleDeleteRecipe(recipeItem) {
    if (!canModifyRecipe(recipeItem) || !recipeItem) return;
    const idStr = String(recipeItem.id);
    const recipeTitle = recipeItem.title || `Resep #${idStr}`;

    setRecipes((prev) => prev.filter((item) => String(item.id) !== idStr));

    try {
      const rawCustom = window.localStorage.getItem(LOCAL_RECIPES_STORAGE_KEY);
      if (rawCustom) {
        const parsedCustom = JSON.parse(rawCustom);
        if (Array.isArray(parsedCustom)) {
          const nextCustom = parsedCustom.filter(
            (item) => String(item.id) !== idStr
          );
          window.localStorage.setItem(
            LOCAL_RECIPES_STORAGE_KEY,
            JSON.stringify(nextCustom)
          );
        }
      }

      const rawDeleted = window.localStorage.getItem(DELETED_RECIPES_STORAGE_KEY);
      const parsedDeleted = rawDeleted ? JSON.parse(rawDeleted) : [];
      const nextDeleted = Array.from(
        new Set([...(Array.isArray(parsedDeleted) ? parsedDeleted : []), idStr])
      );
      window.localStorage.setItem(
        DELETED_RECIPES_STORAGE_KEY,
        JSON.stringify(nextDeleted)
      );
    } catch {
    }

    try {
      await fetch(`/api/recipes/${encodeURIComponent(idStr)}`, {
        method: 'DELETE',
      });
    } catch {
    }

    setStatusMessage(`Resep "${recipeTitle}" dihapus.`);
  }

  return (
    <div className="min-h-screen bg-[#f4f6f3] px-4 py-8 text-[#1e2923] sm:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-2xl border border-[#e3eae1] bg-white p-6 text-center shadow-2xs">
          <p className="text-xs font-bold tracking-wider text-[#557153] uppercase">
            KATALOG RESEP NISKALA RASA
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#1a2820] sm:text-3xl">
            Daftar Resep Kuliner
          </h1>
        </header>

        {statusMessage && (
          <div className="rounded-xl border border-[#cfe0cc] bg-[#eef5ed] px-4 py-3 text-sm text-[#2e4933]">
            {statusMessage}
          </div>
        )}

        {/* Bilah Pencarian & Filter Kategori */}
        <section className="rounded-2xl border border-[#e3eae1] bg-white p-5 shadow-2xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul resep atau bahan kunci..."
              className="w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-sm text-[#1e2923] outline-none focus:border-[#557153] sm:max-w-md"
            />

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-[#557153] text-white'
                    : 'border border-[#d6dfd3] bg-[#f8faf7] text-[#3b4f42] hover:bg-[#eef3ec]'
                }`}
              >
                Semua Kategori
              </button>

              <div className="relative">
                <select
                  aria-label="Pilih kategori resep"
                  value={selectedCategory === 'all' ? '' : selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(e.target.value || 'all')
                  }
                  className={`cursor-pointer appearance-none rounded-full border py-2 pr-9 pl-4 text-xs font-semibold outline-none transition-colors ${
                    selectedCategory !== 'all'
                      ? 'border-[#557153] bg-[#557153] text-white'
                      : 'border-[#d6dfd3] bg-[#f8faf7] text-[#3b4f42] hover:bg-[#eef3ec]'
                  }`}
                >
                  <option value="" className="bg-white text-[#1e2923]">
                    Pilih Kategori...
                  </option>
                  {categoryOptions.map((cat) => (
                    <option
                      key={cat}
                      value={cat}
                      className="bg-white text-[#1e2923]"
                    >
                      {cat}
                    </option>
                  ))}
                </select>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-[10px] ${
                    selectedCategory !== 'all'
                      ? 'text-white'
                      : 'text-[#3b4f42]'
                  }`}
                >
                  ▼
                </span>
              </div>
            </div>
          </div>
        </section>

        {paginatedRecipes.length === 0 ? (
          <div className="rounded-2xl border border-[#e3eae1] bg-white p-8 text-center text-sm text-[#5d6f63]">
            Tidak ada resep yang cocok dengan pencarian atau kategori yang dipilih.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedRecipes.map((r) => {
              const photoSrc = getRecipePhotoSrc(r);
              const plainSummary =
                String(r.summary || '').trim() ||
                'Deskripsi singkat hidangan Nusantara dalam katalog Niskala Rasa.';

              return (
                <ScrollRevealCard key={r.id}>
                  <article className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-[#e3eae1] bg-white shadow-2xs transition-shadow hover:shadow-sm">
                    <div>
                      <div className="relative h-44 w-full overflow-hidden border-b border-[#edf2ec] bg-[#eef3ec]">
                        <img
                          src={photoSrc}
                          alt={r.title || 'Foto Resep'}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      <div className="p-5 pb-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] font-bold tracking-wider text-[#557153] uppercase">
                            {r.category_name || r.dish_type || 'Resep Kuliner'}
                          </p>
                          {role === 'student' &&
                            completedRecipeIds.includes(String(r.id)) && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                                ✓ Selesai Dipelajari
                              </span>
                            )}
                        </div>
                        <h2 className="mt-1 text-base font-bold text-[#1a2820]">
                          {r.title}
                        </h2>
                        <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-[#5d6f63]">
                          {plainSummary}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 px-5 pt-2 pb-5">
                      <button
                        type="button"
                        onClick={() => handleOpenRecipeAction(r)}
                        className="rounded-full bg-[#557153] px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#465e44]"
                      >
                        Lihat Detail
                      </button>

                      {role === 'teacher' &&
                        isRecipeInTeacherCategory(r) && (
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/dashboard/teacher/recipes/${r.id}/edit`)
                            }
                            className="rounded-full border border-[#d6dfd3] bg-white px-3 py-1.5 text-xs font-semibold text-[#2d4034] transition-colors hover:bg-[#eef3ec]"
                          >
                            Edit Materi
                          </button>
                        )}

                      {canModifyRecipe(r) && (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteRecipe(r)}
                          className="rounded-full border border-[#e0c6c6] bg-white px-3 py-1.5 text-xs font-semibold text-[#7a3e3e] transition-colors hover:bg-[#fdf3f3]"
                        >
                          Hapus Resep
                        </button>
                      )}
                    </div>
                  </article>
                </ScrollRevealCard>
              );
            })}
          </div>
        )}

        {filteredRecipes.length > 0 && (
          <nav
            aria-label="Navigasi halaman katalog resep"
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e3eae1] bg-white px-5 py-4 shadow-2xs"
          >
            <p className="text-xs text-[#5d6f63]">
              Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredRecipes.length)}{' '}
              dari {filteredRecipes.length} resep
            </p>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => handleChangePage(currentPage - 1)}
                className="rounded-xl border border-[#d6dfd3] bg-[#f8faf7] px-3 py-1.5 text-xs font-semibold text-[#2d4034] transition-colors hover:bg-[#eef3ec] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Sebelumnya
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                (pageNum) => {
                  const isCurrent = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handleChangePage(pageNum)}
                      className={`h-8 min-w-8 rounded-xl px-2.5 text-xs font-semibold transition-colors ${
                        isCurrent
                          ? 'bg-[#557153] text-white'
                          : 'border border-[#d6dfd3] bg-[#f8faf7] text-[#3b4f42] hover:bg-[#eef3ec]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => handleChangePage(currentPage + 1)}
                className="rounded-xl border border-[#d6dfd3] bg-[#f8faf7] px-3 py-1.5 text-xs font-semibold text-[#2d4034] transition-colors hover:bg-[#eef3ec] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Berikutnya
              </button>
            </div>
          </nav>
        )}
      </div>

      {confirmDeleteRecipe && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a2820]/45 p-4 backdrop-blur-[1px]"
          onClick={() => setConfirmDeleteRecipe(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-[#e3eae1] bg-white p-6 text-center shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-[#1a2820]">
              Konfirmasi Hapus Resep
            </h3>
            <p className="text-xs leading-relaxed text-[#5d6f63]">
              Apakah Anda yakin ingin menghapus resep{' '}
              <strong className="text-[#1a2820]">
                {confirmDeleteRecipe.title}
              </strong>
              ? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setConfirmDeleteRecipe(null)}
                className="rounded-xl border border-[#d6dfd3] bg-white px-4 py-2 text-xs font-semibold text-[#3b4f42] hover:bg-[#eef3ec]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  const target = confirmDeleteRecipe;
                  setConfirmDeleteRecipe(null);
                  await handleDeleteRecipe(target);
                }}
                className="rounded-xl bg-[#a43b3b] px-5 py-2 text-xs font-semibold text-white hover:bg-[#8a2f2f]"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}