'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const LOCAL_RECIPES_STORAGE_KEY = 'niskala_teacher_custom_recipes';
const EDITED_RECIPES_STORAGE_KEY = 'niskala_edited_recipes';
const DELETED_RECIPES_STORAGE_KEY = 'niskala_deleted_recipes';

function resolveRecipeIdFromBrowser() {
  if (typeof window === 'undefined') return '1';
  try {
    const parts = String(window.location.pathname || '')
      .split('/')
      .filter(Boolean);
    const idx = parts.findIndex((p) => p === 'recipes');
    if (idx !== -1 && parts[idx + 1]) {
      return decodeURIComponent(parts[idx + 1]);
    }
    return parts[parts.length - 1] || '1';
  } catch {
    return '1';
  }
}

function parseListItems(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item).trim()).filter(Boolean);
  }
  return String(raw)
    .split(/\r?\n|,(?![^(]*\))/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseYouTubeEmbedUrl(rawUrl) {
  const clean = String(rawUrl || '').trim();
  if (!clean) return '';

  try {
    const u = new URL(clean);
    const host = u.hostname.replace(/^www\./, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\/+/, '').split('/')[0];
      return id ? `https://www.youtube.com/embed/${id}` : '';
    }

    if (host.endsWith('youtube.com')) {
      const vParam = u.searchParams.get('v');
      if (vParam) {
        return `https://www.youtube.com/embed/${vParam}`;
      }
      const segments = u.pathname.split('/').filter(Boolean);
      const embedIdx = segments.findIndex(
        (s) => s === 'embed' || s === 'shorts' || s === 'live'
      );
      if (embedIdx !== -1 && segments[embedIdx + 1]) {
        return `https://www.youtube.com/embed/${segments[embedIdx + 1]}`;
      }
    }
  } catch {
    // Fallback regex
  }

  const match = clean.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : '';
}

function isDirectVideoFileUrl(rawUrl) {
  const clean = String(rawUrl || '').trim().toLowerCase();
  if (!clean) return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/.test(clean);
}

export default function RecipeDetailPage() {
  const router = useRouter();
  const [recipeId, setRecipeId] = useState('1');
  const [user, setUser] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatNotice, setChatNotice] = useState('');

  useEffect(() => {
    setRecipeId(resolveRecipeIdFromBrowser());
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('niskala_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.email || parsed.role)) {
          setUser(parsed);
          return;
        }
      }

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

  const currentRole = String(user?.role || 'guest').toLowerCase().trim();
  const isTeacher = currentRole === 'teacher';
  const isStudent = currentRole === 'student';
  const isAdmin = currentRole === 'admin';
  const isGuest = !user || currentRole === 'guest' || currentRole === 'public';
  const canWatchVideo = Boolean(user && (isStudent || isTeacher || isAdmin));
  const canManageRecipe = isTeacher || isAdmin;

  const displayName =
    user?.full_name ||
    user?.name ||
    (isTeacher
      ? 'Raka Pratama Wijaya Kusuma Putra'
      : isStudent
        ? 'Putri Lestari Kusuma Wardani'
        : 'Pengunjung');
  const displayEmail =
    user?.email || (isTeacher ? 'raka@gmail.com' : 'putri@gmail.com');

  const feedbackStorageKey = useMemo(
    () => `niskala_recipe_feedback_${recipeId}`,
    [recipeId]
  );

  useEffect(() => {
    let active = true;

    async function loadDetail() {
      setLoading(true);
      let foundRecipe = null;

      try {
        const res = await fetch(`/api/recipes/${encodeURIComponent(recipeId)}`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          foundRecipe = data?.recipe || (data?.id ? data : null);
        }
      } catch {
        // Fallback ke daftar lokal/API
      }

      if (!foundRecipe) {
        try {
          const listRes = await fetch('/api/recipes', { cache: 'no-store' });
          if (listRes.ok) {
            const listData = await listRes.json();
            const arr = Array.isArray(listData?.recipes)
              ? listData.recipes
              : Array.isArray(listData)
                ? listData
                : [];
            foundRecipe =
              arr.find((item) => String(item.id) === recipeId) || null;
          }
        } catch {
          // Abaikan error
        }
      }

      try {
        const rawCustom = window.localStorage.getItem(LOCAL_RECIPES_STORAGE_KEY);
        if (rawCustom) {
          const parsedCustom = JSON.parse(rawCustom);
          if (Array.isArray(parsedCustom)) {
            const customMatch = parsedCustom.find(
              (item) => String(item.id) === recipeId
            );
            if (customMatch) {
              foundRecipe = { ...(foundRecipe || {}), ...customMatch };
            }
          }
        }

        const rawEdited = window.localStorage.getItem(EDITED_RECIPES_STORAGE_KEY);
        if (rawEdited) {
          const parsedEdited = JSON.parse(rawEdited);
          if (parsedEdited && typeof parsedEdited === 'object') {
            const override = parsedEdited[recipeId];
            if (override) {
              foundRecipe = { ...(foundRecipe || {}), ...override };
            }
          }
        }
      } catch {
        // Abaikan error storage
      }

      if (active) {
        setRecipe(foundRecipe);
        setLoading(false);
      }

      try {
        const doneRaw = window.localStorage.getItem('niskala_completed_recipes');
        if (doneRaw && active) {
          const parsedDone = JSON.parse(doneRaw);
          if (Array.isArray(parsedDone)) {
            const matched = parsedDone.find(
              (d) => String(d.recipe_id) === recipeId && d.completed
            );
            setIsCompleted(Boolean(matched));
          }
        }

        const msgRaw = window.localStorage.getItem(feedbackStorageKey);
        if (msgRaw && active) {
          const parsedMsg = JSON.parse(msgRaw);
          if (Array.isArray(parsedMsg)) {
            setMessages(parsedMsg);
          }
        }
      } catch {
        // Abaikan error storage
      }
    }

    loadDetail();
    return () => {
      active = false;
    };
  }, [recipeId, feedbackStorageKey]);

  function handleToggleCompleted() {
    const nextState = !isCompleted;
    setIsCompleted(nextState);

    try {
      const raw = window.localStorage.getItem('niskala_completed_recipes');
      const parsed = raw ? JSON.parse(raw) : [];
      const arr = Array.isArray(parsed) ? parsed : [];
      const filtered = arr.filter((d) => String(d.recipe_id) !== recipeId);

      if (nextState) {
        filtered.push({
          recipe_id: recipeId,
          recipe_title: recipe?.title || `Resep #${recipeId}`,
          student_name: displayName,
          student_email: displayEmail,
          completed: true,
          updated_at: new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        });
      }

      window.localStorage.setItem(
        'niskala_completed_recipes',
        JSON.stringify(filtered)
      );
      setChatNotice(
        nextState
          ? 'Materi resep ditandai selesai.'
          : 'Tanda selesai pada materi resep dibatalkan.'
      );
    } catch {
      // Abaikan error storage
    }
  }

  function handleSendMessage(e) {
    e.preventDefault();
    const clean = String(chatInput || '').trim();
    if (!clean) return;

    const senderRole = isTeacher ? 'teacher' : 'student';
    const newMsg = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      recipe_id: recipeId,
      recipe_title: recipe?.title || `Resep #${recipeId}`,
      student_name: isStudent ? displayName : 'Putri Lestari Kusuma Wardani',
      student_email: isStudent ? displayEmail : 'putri@gmail.com',
      sender_role: senderRole,
      sender_name: displayName,
      message: clean,
      created_at: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    setChatInput('');
    setChatNotice('Pesan berhasil dikirim.');

    try {
      window.localStorage.setItem(feedbackStorageKey, JSON.stringify(updated));
    } catch {
      // Abaikan error storage
    }
  }

  function handleDeleteOwnMessage(targetMsg) {
    if (!targetMsg) return;
    const isOwnTeacher = isTeacher && targetMsg.sender_role === 'teacher';
    const isOwnStudent = !isTeacher && targetMsg.sender_role !== 'teacher';
    if (!isOwnTeacher && !isOwnStudent) return;

    const updated = messages.filter(
      (msg) => String(msg.id) !== String(targetMsg.id)
    );
    setMessages(updated);
    setChatNotice('Pesan Anda dihapus.');

    try {
      window.localStorage.setItem(feedbackStorageKey, JSON.stringify(updated));
    } catch {
      // Abaikan error storage
    }
  }

  async function handleDeleteCurrentRecipe() {
    const titleToDelete = recipe?.title || `Resep #${recipeId}`;

    try {
      const rawCustom = window.localStorage.getItem(LOCAL_RECIPES_STORAGE_KEY);
      if (rawCustom) {
        const parsedCustom = JSON.parse(rawCustom);
        if (Array.isArray(parsedCustom)) {
          const nextCustom = parsedCustom.filter(
            (item) => String(item.id) !== recipeId
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
        new Set([...(Array.isArray(parsedDeleted) ? parsedDeleted : []), recipeId])
      );
      window.localStorage.setItem(
        DELETED_RECIPES_STORAGE_KEY,
        JSON.stringify(nextDeleted)
      );
    } catch {
      // Abaikan error storage
    }

    try {
      await fetch(`/api/recipes/${encodeURIComponent(recipeId)}`, {
        method: 'DELETE',
      });
    } catch {
      // Abaikan bila endpoint DELETE belum tersedia
    }

    setChatNotice(`Resep "${titleToDelete}" dihapus.`);
    router.push('/recipes');
  }

  const rawVideoUrl = String(
    recipe?.video_url || recipe?.videoUrl || recipe?.video || ''
  ).trim();
  const youtubeEmbedUrl = parseYouTubeEmbedUrl(rawVideoUrl);
  const isDirectVideo = isDirectVideoFileUrl(rawVideoUrl);

  const ingredientsList = parseListItems(recipe?.ingredients);
  const stepsList = parseListItems(recipe?.steps);

  const dashboardHref =
    currentRole === 'teacher'
      ? '/dashboard/teacher'
      : currentRole === 'student'
        ? '/dashboard/student'
        : '/recipes';

  return (
    <div className="min-h-screen bg-[#f4f6f3] px-4 py-8 text-[#1e2923] sm:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {!isGuest && (
              <Link
                href={dashboardHref}
                className="rounded-xl border border-[#d6dfd3] bg-white px-4 py-2 text-xs font-semibold text-[#2d4034] transition-colors hover:bg-[#eef3ec]"
              >
                Kembali ke Dashboard
              </Link>
            )}
            <Link
              href="/recipes"
              className="rounded-xl border border-[#d6dfd3] bg-white px-4 py-2 text-xs font-semibold text-[#2d4034] transition-colors hover:bg-[#eef3ec]"
            >
              Daftar Resep
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isStudent && (
              <button
                type="button"
                onClick={handleToggleCompleted}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                  isCompleted
                    ? 'bg-[#eef5ed] text-[#2e4933] ring-1 ring-[#cfe0cc]'
                    : 'bg-[#557153] text-white hover:bg-[#465e44]'
                }`}
              >
                {isCompleted ? 'Selesai Dipelajari' : 'Tandai Selesai'}
              </button>
            )}

            {canManageRecipe && (
              <button
                type="button"
                onClick={handleDeleteCurrentRecipe}
                className="rounded-xl border border-[#e0c6c6] bg-white px-4 py-2 text-xs font-semibold text-[#7a3e3e] transition-colors hover:bg-[#fdf3f3]"
              >
                Hapus Resep
              </button>
            )}
          </div>
        </div>

        {chatNotice && (
          <div className="rounded-xl border border-[#cfe0cc] bg-[#eef5ed] px-4 py-3 text-sm text-[#2e4933]">
            {chatNotice}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-[#e3eae1] bg-white p-8 text-sm text-[#5d6f63]">
            Memuat materi resep...
          </div>
        ) : !recipe ? (
          <div className="rounded-2xl border border-[#e3eae1] bg-white p-8 text-sm text-[#5d6f63]">
            Resep tidak ditemukan.
          </div>
        ) : (
          <>
            <section className="overflow-hidden rounded-2xl border border-[#e3eae1] bg-white shadow-2xs">
              <div className="h-56 w-full overflow-hidden border-b border-[#edf2ec] bg-[#eef3ec] sm:h-72">
                <img
                  src={
                    recipe.image_url ||
                    recipe.imageUrl ||
                    recipe.image ||
                    `/images/recipes/${encodeURIComponent(recipe.title || '')}.jpg`
                  }
                  alt={recipe.title || 'Foto Resep'}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const img = e.currentTarget;
                    const encodedTitle = encodeURIComponent(recipe.title || '');
                    if (!img.dataset.triedPng) {
                      img.dataset.triedPng = '1';
                      img.src = `/images/recipes/${encodedTitle}.png`;
                      return;
                    }
                    if (!img.dataset.triedJpg) {
                      img.dataset.triedJpg = '1';
                      img.src = `/images/recipes/${encodedTitle}.jpg`;
                      return;
                    }
                    img.style.display = 'none';
                  }}
                />
              </div>

              <div className="p-6 sm:p-7">
                <p className="text-xs font-bold tracking-wider text-[#557153] uppercase">
                  {recipe.category_name || recipe.dish_type || 'Resep Kuliner'}
                </p>
                <h1 className="mt-1 text-2xl font-bold text-[#1a2820]">
                  {recipe.title}
                </h1>
                {recipe.key_spice && (
                  <p className="mt-2 text-xs font-semibold text-[#475b4d]">
                    Bahan Kunci: {recipe.key_spice}
                  </p>
                )}
                {recipe.summary && (
                  <p className="mt-3 text-sm leading-relaxed text-[#43564a]">
                    {recipe.summary}
                  </p>
                )}
              </div>
            </section>

            <section
              id="video-pembelajaran"
              className="rounded-2xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-7"
            >
              <h2 className="mb-3 text-lg font-bold text-[#1a2820]">
                Video Pembelajaran
              </h2>

              {!canWatchVideo ? (
                <div className="rounded-2xl border border-[#d6dfd3] bg-[#f8faf7] p-6 text-center">
                  <p className="text-[11px] font-bold tracking-wider text-[#557153] uppercase">
                    Akses Video Khusus Murid
                  </p>
                  <h3 className="mt-1.5 text-base font-bold text-[#1a2820]">
                    Masuk sebagai Murid untuk Menonton Video
                  </h3>
                  <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-[#56685c]">
                    Anda masih dapat melihat gambar makanan dan informasi resep
                    sebagai pengunjung. Namun untuk menonton video pembelajaran,
                    Anda harus masuk sebagai Murid. Jika belum pernah masuk
                    sebagai Murid, silakan daftar akun terlebih dahulu.
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <Link
                      href="/login"
                      className="rounded-xl bg-[#557153] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#465e44]"
                    >
                      Masuk sebagai Murid
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-xl border border-[#557153] bg-white px-5 py-2.5 text-xs font-semibold text-[#3b5239] transition-colors hover:bg-[#eef5ed]"
                    >
                      Daftar Murid Baru
                    </Link>
                  </div>
                </div>
              ) : !rawVideoUrl ? (
                <div className="rounded-xl border border-[#e3eae1] bg-[#f8faf7] p-4 text-sm text-[#56685c]">
                  Video pembelajaran belum tersedia untuk resep ini.
                </div>
              ) : youtubeEmbedUrl ? (
                <div className="aspect-video w-full overflow-hidden rounded-xl border border-[#e3eae1] bg-[#131a15]">
                  <iframe
                    src={youtubeEmbedUrl}
                    title={`Video ${recipe.title}`}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : isDirectVideo ? (
                <video
                  controls
                  src={rawVideoUrl}
                  className="aspect-video w-full rounded-xl border border-[#e3eae1] bg-[#131a15]"
                >
                  Browser Anda tidak mendukung pemutar video HTML5.
                </video>
              ) : (
                <div className="rounded-xl border border-[#e3eae1] bg-[#f8faf7] p-4 text-sm">
                  <p className="text-[#43564a]">
                    Tautan video tersedia pada materi ini:
                  </p>
                  <a
                    href={rawVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-block font-semibold text-[#3f5d42] underline"
                  >
                    {rawVideoUrl}
                  </a>
                </div>
              )}
            </section>

            {ingredientsList.length > 0 && (
              <section className="rounded-2xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-7">
                <h2 className="mb-3 text-lg font-bold text-[#1a2820]">
                  Takaran Bahan & Bumbu
                </h2>
                <ul className="list-disc space-y-1.5 pl-5 text-sm text-[#2d3d33]">
                  {ingredientsList.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </section>
            )}

            {stepsList.length > 0 && (
              <section className="rounded-2xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-7">
                <h2 className="mb-3 text-lg font-bold text-[#1a2820]">
                  Langkah Memasak
                </h2>
                <ol className="list-decimal space-y-2 pl-5 text-sm text-[#2d3d33]">
                  {stepsList.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ol>
              </section>
            )}

            <section className="rounded-2xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-7">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-[#1a2820]">
                  Diskusi & Feedback Resep
                </h2>
                <p className="text-xs text-[#5d6f63]">
                  Anda hanya dapat menghapus pesan yang Anda kirim sendiri.
                </p>
              </div>

              <div className="mb-4 max-h-80 space-y-3 overflow-y-auto rounded-2xl border border-[#e6ece4] bg-[#f8faf7] p-4">
                {messages.length === 0 ? (
                  <p className="py-4 text-center text-sm text-[#607266]">
                    Belum ada pesan pada resep ini.
                  </p>
                ) : (
                  messages.map((msg) => {
                    const msgFromTeacher = msg.sender_role === 'teacher';
                    const canDeleteOwn =
                      (isTeacher && msgFromTeacher) ||
                      (!isTeacher && !msgFromTeacher);

                    return (
                      <div
                        key={msg.id}
                        className={`rounded-2xl p-3.5 text-sm ${
                          msgFromTeacher
                            ? 'mr-auto max-w-[85%] border border-[#cfe0cc] bg-[#eef5ed]'
                            : 'ml-auto max-w-[85%] border border-[#e3eae1] bg-white'
                        }`}
                      >
                        <div className="mb-1 flex items-center justify-between gap-4 text-[11px] font-semibold text-[#56685c]">
                          <span>{msg.sender_name}</span>
                          <div className="flex items-center gap-2">
                            <span>{msg.created_at}</span>
                            {canDeleteOwn && (
                              <button
                                type="button"
                                onClick={() => handleDeleteOwnMessage(msg)}
                                className="text-[11px] font-semibold text-[#7a3e3e] hover:underline"
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="leading-relaxed text-[#1e2923]">
                          {msg.message}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              <form
                onSubmit={handleSendMessage}
                className="flex flex-col gap-2.5 sm:flex-row"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Tulis pesan atau feedback..."
                  className="flex-1 rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-sm text-[#1e2923] outline-none focus:border-[#557153]"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-[#557153] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#465e44]"
                >
                  Kirim
                </button>
              </form>
            </section>
          </>
        )}
      </div>
    </div>
  );
}