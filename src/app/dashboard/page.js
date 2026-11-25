'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

function escapeXml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getDishTheme(title, category) {
  const hay = `${title || ''} ${category || ''}`.toLowerCase();
  if (hay.includes('gulai') || hay.includes('soto') || hay.includes('rawon') || hay.includes('kuah')) {
    return { bgStart: '#f6ead4', bgEnd: '#e6c896', accent: '#9c541e', badge: 'KUAH REMPAH' };
  }
  if (hay.includes('sayur') || hay.includes('asam') || hay.includes('bening')) {
    return { bgStart: '#e5f1e2', bgEnd: '#c6dfc2', accent: '#3d6b3b', badge: 'SAYUR SEGAR' };
  }
  if (hay.includes('ayam') || hay.includes('daging') || hay.includes('semur') || hay.includes('sapi')) {
    return { bgStart: '#f4e3d7', bgEnd: '#dfb99e', accent: '#7c3b1d', badge: 'LAUK UTAMA' };
  }
  if (hay.includes('jamu') || hay.includes('wedang') || hay.includes('bir pletok') || hay.includes('teh') || hay.includes('minuman')) {
    return { bgStart: '#f8ebd8', bgEnd: '#ebd0ad', accent: '#8a4b16', badge: 'MINUMAN TRADISIONAL' };
  }
  if (hay.includes('kue') || hay.includes('klepon') || hay.includes('kolak') || hay.includes('bubur') || hay.includes('dadar') || hay.includes('lapis') || hay.includes('puding') || hay.includes('setup')) {
    return { bgStart: '#f9e8ee', bgEnd: '#ecc9d5', accent: '#8e3b58', badge: 'KUE & SAJIAN MANIS' };
  }
  if (hay.includes('sambal')) {
    return { bgStart: '#fbe2dc', bgEnd: '#f1b9ad', accent: '#9e2a1c', badge: 'SAMBAL NUSANTARA' };
  }
  return { bgStart: '#eef3ec', bgEnd: '#d5e2d2', accent: '#557153', badge: 'KULINER NUSANTARA' };
}

function buildStyledDishFallback(recipe) {
  const title = String(recipe?.title || 'Resep Kuliner').trim();
  const category = String(recipe?.category_name || recipe?.dish_type || '').trim();
  const theme = getDishTheme(title, category);
  const shortTitle = title.length > 34 ? `${title.slice(0, 32)}…` : title;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${theme.bgStart}"/>
        <stop offset="100%" stop-color="${theme.bgEnd}"/>
      </linearGradient>
    </defs>
    <rect width="640" height="360" fill="url(#g)"/>
    <circle cx="535" cy="70" r="110" fill="#ffffff" fill-opacity="0.28"/>
    <circle cx="105" cy="310" r="130" fill="#ffffff" fill-opacity="0.22"/>
    <rect x="36" y="34" width="170" height="28" rx="14" fill="#ffffff" fill-opacity="0.85"/>
    <text x="121" y="53" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="${theme.accent}">${escapeXml(theme.badge)}</text>
    <ellipse cx="320" cy="184" rx="112" ry="52" fill="#ffffff" fill-opacity="0.9"/>
    <ellipse cx="320" cy="178" rx="86" ry="34" fill="${theme.accent}" fill-opacity="0.16"/>
    <path d="M250 184c0 36 31 60 70 60s70-24 70-60z" fill="${theme.accent}"/>
    <ellipse cx="320" cy="184" rx="70" ry="15" fill="#ffffff" fill-opacity="0.85"/>
    <rect x="36" y="274" width="568" height="56" rx="14" fill="#ffffff" fill-opacity="0.88"/>
    <text x="56" y="309" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#1a2820">${escapeXml(shortTitle)}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

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
  url: encodeURI(`/images/recipes/${fileName}`),
}));

function encodePublicAssetUrl(rawPath) {
  const clean = String(rawPath || '').trim();
  if (!clean) return '';
  if (
    clean.startsWith('http://') ||
    clean.startsWith('https://') ||
    clean.startsWith('data:')
  ) {
    return clean;
  }

  let normalized = clean.replace(/^\/?public\//i, '/');
  if (!normalized.startsWith('/')) {
    normalized = `/${normalized}`;
  }

  const baseName = normalized.split('/').pop() || '';
  const baseKey = normalizeMatchKey(baseName);
  const matchedFile = FILE_LOOKUP.find(
    (item) =>
      item.key === baseKey ||
      item.fileName.toLowerCase() === baseName.toLowerCase()
  );

  if (matchedFile) {
    return matchedFile.url;
  }

  return encodeURI(normalized);
}

function findMatchingRecipeFiles(title) {
  const targetKey = normalizeMatchKey(title);
  if (!targetKey) return [];

  const exact = FILE_LOOKUP.filter((item) => item.key === targetKey);
  if (exact.length > 0) {
    return exact.map((item) => item.url);
  }

  const targetTokens = targetKey.split(/\s+/).filter((t) => t.length > 1);
  if (targetTokens.length === 0) return [];

  return FILE_LOOKUP.map((item) => {
    const fileTokens = item.key.split(/\s+/).filter((t) => t.length > 1);
    const overlap = targetTokens.filter((tok) => fileTokens.includes(tok)).length;
    const substringBonus =
      item.key.includes(targetKey) || targetKey.includes(item.key) ? 2 : 0;
    return {
      url: item.url,
      score: overlap + substringBonus,
    };
  })
    .filter((entry) => entry.score >= 1)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.url);
}

function buildRecipeImageCandidates(recipe) {
  const candidates = [];
  const pushUnique = (src) => {
    const encoded = encodePublicAssetUrl(src);
    if (encoded && !candidates.includes(encoded)) {
      candidates.push(encoded);
    }
  };

  pushUnique(recipe?.image_url);
  pushUnique(recipe?.imageUrl);
  pushUnique(recipe?.image);

  const matchedByTitle = findMatchingRecipeFiles(recipe?.title);
  matchedByTitle.forEach((url) => pushUnique(url));

  candidates.push(buildStyledDishFallback(recipe));
  return candidates;
}

function RecipeCardImage({ recipe }) {
  const candidates = useMemo(() => buildRecipeImageCandidates(recipe), [recipe]);
  const fallbackSrc = candidates[candidates.length - 1];
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    setCandidateIndex(0);
  }, [candidates]);

  const activeSrc = candidates[candidateIndex] || fallbackSrc;

  function handleImgError() {
    setCandidateIndex((prev) => {
      const next = prev + 1;
      return next < candidates.length ? next : candidates.length - 1;
    });
  }

  return (
    <div className="relative h-44 w-full overflow-hidden border-b border-[#edf2ec] bg-[#eef3ec]">
      <img
        src={activeSrc}
        alt={recipe?.title || 'Foto Resep'}
        loading="lazy"
        onError={handleImgError}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
    </div>
  );
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
  const [guestPromptOpen, setGuestPromptOpen] = useState(false);

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

  const filteredRecipes = useMemo(() => {
    const q = String(searchQuery || '').toLowerCase().trim();
    return recipes.filter((r) => {
      const cat = String(r.category_name || r.dish_type || '').trim();
      const matchCat = selectedCategory === 'all' || cat === selectedCategory;
      const matchSearch =
        !q ||
        String(r.title || '').toLowerCase().includes(q) ||
        String(r.key_spice || '').toLowerCase().includes(q) ||
        cat.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [recipes, searchQuery, selectedCategory]);

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
    if (isGuest) {
      setGuestPromptOpen(true);
      return;
    }
    router.push(`/recipes/${recipeItem.id}`);
  }

  async function handleDeleteRecipe(recipeItem) {
    if (isGuest) {
      setGuestPromptOpen(true);
      return;
    }
    if (!recipeItem) return;
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

  const dashboardHref =
    role === 'teacher'
      ? '/dashboard/teacher'
      : role === 'student'
        ? '/dashboard/student'
        : '/login';

  return (
    <div className="min-h-screen bg-[#f4f6f3] px-4 py-8 text-[#1e2923] sm:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e3eae1] bg-white p-6 shadow-2xs">
          <div>
            <p className="text-xs font-bold tracking-wider text-[#557153] uppercase">
              Katalog Materi Niskala Rasa
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#1a2820]">
              Daftar Resep Kuliner
            </h1>
            <p className="mt-1 text-xs text-[#5d6f63]">
              Menampilkan {filteredRecipes.length} resep · Halaman {currentPage}{' '}
              dari {totalPages}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {isGuest ? (
              <Link
                href="/login"
                className="rounded-xl bg-[#557153] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#465e44]"
              >
                Masuk / Daftar untuk Akses Penuh
              </Link>
            ) : (
              <Link
                href={dashboardHref}
                className="rounded-xl border border-[#d6dfd3] bg-[#f8faf7] px-4 py-2 text-xs font-semibold text-[#2d4034] transition-colors hover:bg-[#eef3ec]"
              >
                Kembali ke Dashboard
              </Link>
            )}
          </div>
        </header>

        {statusMessage && (
          <div className="rounded-xl border border-[#cfe0cc] bg-[#eef5ed] px-4 py-3 text-sm text-[#2e4933]">
            {statusMessage}
          </div>
        )}

        <section className="rounded-2xl border border-[#e3eae1] bg-white p-5 shadow-2xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul resep atau bahan kunci..."
              className="w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2 text-sm text-[#1e2923] outline-none focus:border-[#557153] sm:max-w-sm"
            />

            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-[#557153] text-white'
                        : 'border border-[#d6dfd3] bg-[#f8faf7] text-[#3b4f42] hover:bg-[#eef3ec]'
                    }`}
                  >
                    {cat === 'all' ? 'Semua Kategori' : cat}
                  </button>
                );
              })}
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
              const plainSummary =
                String(r.summary || '').trim() ||
                'Deskripsi singkat hidangan Nusantara dalam katalog Niskala Rasa.';

              return (
                <ScrollRevealCard key={r.id}>
                  <article className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-[#e3eae1] bg-white shadow-2xs transition-shadow hover:shadow-sm">
                    <div>
                      <RecipeCardImage recipe={r} />

                      <div className="p-5 pb-2">
                        <p className="text-[11px] font-bold tracking-wider text-[#557153] uppercase">
                          {r.category_name || r.dish_type || 'Resep Kuliner'}
                        </p>
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
                        {isGuest ? 'Masuk untuk Lihat Resep' : 'Lihat Detail'}
                      </button>

                      {!isGuest && (
                        <button
                          type="button"
                          onClick={() => handleDeleteRecipe(r)}
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

      {guestPromptOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="guest-access-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#18221b]/45 p-4 backdrop-blur-[1px]"
        >
          <div className="w-full max-w-md rounded-2xl border border-[#e3eae1] bg-white p-6 shadow-lg">
            <p className="text-[11px] font-bold tracking-wider text-[#557153] uppercase">
              Akses Anggota Niskala Rasa
            </p>
            <h2
              id="guest-access-title"
              className="mt-1 text-lg font-bold text-[#1a2820]"
            >
              Masuk atau Daftar untuk Melihat Resep
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#56685c]">
              Masuk atau daftar akun terlebih dahulu untuk membuka resep lengkap,
              video panduan, dan mengikuti kelas.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setGuestPromptOpen(false)}
                className="rounded-xl border border-[#d6dfd3] bg-[#f8faf7] px-4 py-2 text-xs font-semibold text-[#334539] transition-colors hover:bg-[#eef3ec]"
              >
                Tutup
              </button>
              <Link
                href="/login"
                className="rounded-xl bg-[#557153] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#465e44]"
              >
                Masuk / Daftar
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
