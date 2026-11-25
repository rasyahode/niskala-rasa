'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const LOCAL_RECIPES_STORAGE_KEY = 'niskala_teacher_custom_recipes';
const EDITED_RECIPES_STORAGE_KEY = 'niskala_edited_recipes';

function readCookieUser() {
  if (typeof window === 'undefined') return null;
  try {
    const cookieStr = document.cookie || '';
    const found = cookieStr
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('niskala_user='));
    if (found) {
      const raw = decodeURIComponent(found.split('=').slice(1).join('='));
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.email || parsed.role)) return parsed;
    }
  } catch {
    // Abaikan error cookie
  }
  try {
    const rawLocal = window.localStorage.getItem('niskala_user');
    if (rawLocal) {
      const parsed = JSON.parse(rawLocal);
      if (parsed && (parsed.email || parsed.role)) return parsed;
    }
  } catch {
    // Abaikan error storage
  }
  return null;
}

export default function TeacherEditRecipePage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = String(params?.id || '');

  const [teacherSpecialties, setTeacherSpecialties] = useState([
    'Makanan Berkuah',
  ]);
  const [loading, setLoading] = useState(Boolean(recipeId));
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [form, setForm] = useState({
    title: '',
    category_name: 'Makanan Berkuah',
    key_spice: '',
    portion_estimate: '',
    dominant_taste: '',
    image_url: '',
    video_url: '',
    summary: '',
    spice_technique: '',
    ingredients: '',
    instructions: '',
  });

  useEffect(() => {
    const activeUser = readCookieUser();

    let active = true;

    async function loadData() {
      // 1. Sinkronkan kategori ampu pengajar
      const fallbackSpec =
        activeUser?.specialty || activeUser?.specialization || 'Makanan Berkuah';
      let resolvedSpec = fallbackSpec;
      try {
        const resUsers = await fetch('/api/users', { cache: 'no-store' });
        if (resUsers.ok) {
          const dataUsers = await resUsers.json();
          const list = Array.isArray(dataUsers?.users) ? dataUsers.users : [];
          const me = list.find(
            (u) =>
              (activeUser?.id && String(u.id) === String(activeUser.id)) ||
              (activeUser?.email &&
                String(u.email || '').toLowerCase().trim() ===
                  String(activeUser.email || '').toLowerCase().trim())
          );
          if (me?.specialty) {
            resolvedSpec = me.specialty;
          }
        }
      } catch {
        // Gunakan fallback
      }

      const specList = String(resolvedSpec || 'Makanan Berkuah')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const finalSpecs = specList.length > 0 ? specList : ['Makanan Berkuah'];
      if (active) setTeacherSpecialties(finalSpecs);

      // 2. Muat data resep berdasarkan ID
      let found = null;
      try {
        const resOne = await fetch(
          `/api/recipes/${encodeURIComponent(recipeId)}`,
          { cache: 'no-store' }
        );
        if (resOne.ok) {
          const dOne = await resOne.json();
          found = dOne?.recipe || (dOne?.id ? dOne : null);
        }
      } catch {
        // Fallback ke daftar resep
      }

      if (!found) {
        try {
          const resList = await fetch('/api/recipes', { cache: 'no-store' });
          if (resList.ok) {
            const dList = await resList.json();
            const arr = Array.isArray(dList?.recipes)
              ? dList.recipes
              : Array.isArray(dList)
                ? dList
                : [];
            found = arr.find((r) => String(r.id) === recipeId) || null;
          }
        } catch {
          // Abaikan
        }
      }

      try {
        const rawCustom = window.localStorage.getItem(LOCAL_RECIPES_STORAGE_KEY);
        if (rawCustom) {
          const parsedCustom = JSON.parse(rawCustom);
          if (Array.isArray(parsedCustom)) {
            const match = parsedCustom.find(
              (r) => String(r.id) === recipeId
            );
            if (match) found = { ...(found || {}), ...match };
          }
        }
        const rawEdited = window.localStorage.getItem(
          EDITED_RECIPES_STORAGE_KEY
        );
        if (rawEdited) {
          const parsedEdited = JSON.parse(rawEdited);
          if (parsedEdited && typeof parsedEdited === 'object') {
            const override = parsedEdited[recipeId];
            if (override) found = { ...(found || {}), ...override };
          }
        }
      } catch {
        // Abaikan error storage
      }

      if (active) {
        if (found) {
          setForm({
            title: found.title || '',
            category_name:
              found.category_name || found.dish_type || finalSpecs[0],
            key_spice: found.key_spice || '',
            portion_estimate: found.portion_estimate || '',
            dominant_taste: found.dominant_taste || '',
            image_url: found.image_url || '',
            video_url: found.video_url || '',
            summary: found.summary || '',
            spice_technique: found.spice_technique || '',
            ingredients: found.ingredients || '',
            instructions: found.instructions || '',
          });
        } else {
          setErrorMsg('Materi resep tidak ditemukan.');
        }
        setLoading(false);
      }
    }

    if (recipeId) {
      loadData();
    }

    return () => {
      active = false;
    };
  }, [recipeId]);

  async function handleSubmit(e) {
    e.preventDefault();
    const requiredFields = [
      form.title,
      form.key_spice,
      form.portion_estimate,
      form.dominant_taste,
      form.spice_technique,
      form.image_url,
      form.video_url,
      form.summary,
      form.ingredients,
      form.instructions,
    ];
    if (requiredFields.some((val) => !String(val || '').trim())) {
      setErrorMsg(
        'Semua kolom materi resep wajib diisi sebelum menyimpan perubahan.'
      );
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    const lockedCategory = teacherSpecialties.includes(form.category_name)
      ? form.category_name
      : teacherSpecialties[0];

    const updatedPayload = {
      id: recipeId,
      title: form.title.trim(),
      category_name: lockedCategory,
      dish_type: lockedCategory,
      key_spice: form.key_spice.trim() || 'Rempah Nusantara',
      portion_estimate: form.portion_estimate.trim(),
      dominant_taste: form.dominant_taste.trim(),
      image_url: form.image_url.trim(),
      video_url: form.video_url.trim(),
      summary:
        form.summary.trim() ||
        'Resep kurasi pengajar Niskala Rasa untuk materi praktik kelas.',
      spice_technique: form.spice_technique.trim(),
      ingredients: form.ingredients.trim(),
      instructions: form.instructions.trim(),
    };

    try {
      const rawEdited = window.localStorage.getItem(EDITED_RECIPES_STORAGE_KEY);
      const editedMap = rawEdited ? JSON.parse(rawEdited) : {};
      editedMap[String(recipeId)] = updatedPayload;
      window.localStorage.setItem(
        EDITED_RECIPES_STORAGE_KEY,
        JSON.stringify(editedMap)
      );

      const rawCustom = window.localStorage.getItem(LOCAL_RECIPES_STORAGE_KEY);
      if (rawCustom) {
        const parsedCustom = JSON.parse(rawCustom);
        if (Array.isArray(parsedCustom)) {
          window.localStorage.setItem(
            LOCAL_RECIPES_STORAGE_KEY,
            JSON.stringify(
              parsedCustom.map((r) =>
                String(r.id) === String(recipeId)
                  ? { ...r, ...updatedPayload }
                  : r
              )
            )
          );
        }
      }
    } catch {
      // Abaikan error storage
    }

    try {
      const res = await fetch('/api/recipes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 403 && errData?.error) {
          setErrorMsg(errData.error);
          setSaving(false);
          return;
        }
      }
    } catch {
      // Abaikan bila offline
    }

    setSaving(false);
    setSuccessMsg('Materi resep berhasil diperbarui dan disimpan.');
    setTimeout(() => {
      router.push('/dashboard/teacher?tab=recipes');
    }, 600);
  }

  return (
    <div className="min-h-screen bg-[#f4f6f3] text-[#1e2923] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold tracking-wider text-[#557153] uppercase">
              PORTAL PENGAJAR · EDIT MATERI
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#1a2820]">
              Edit Materi Resep
            </h1>
          </div>
          <Link
            href="/dashboard/teacher?tab=recipes"
            className="rounded-full border border-[#d6dfd3] bg-white px-4 py-2 text-xs font-semibold text-[#2d4034] transition-colors hover:bg-[#eef3ec]"
          >
            Kembali ke Kelola Materi Resep
          </Link>
        </div>

        {errorMsg && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3.5 text-xs font-medium text-rose-800">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="rounded-2xl border border-[#cfe0cc] bg-[#eef5ed] px-5 py-3.5 text-xs font-medium text-[#2e4933]">
            {successMsg}
          </div>
        )}

        <section className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8">
          {loading ? (
            <p className="text-xs text-[#5d6f63]">Memuat data materi resep...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#3b4f42]">
                    Nama Hidangan / Resep
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Nama hidangan / resep..."
                    className="mt-1.5 w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs outline-none focus:border-[#557153]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3b4f42]">
                    Kategori Kelas (Sesuai Kategori Ampu)
                  </label>
                  {teacherSpecialties.length > 1 ? (
                    <select
                      value={form.category_name}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          category_name: e.target.value,
                        }))
                      }
                      className="mt-1.5 w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs outline-none focus:border-[#557153]"
                    >
                      {teacherSpecialties.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="mt-1.5 w-full rounded-xl border border-[#d6dfd3] bg-[#f4f7f3] px-4 py-2.5 text-xs font-semibold text-[#2d4034]">
                      {teacherSpecialties[0]}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3b4f42]">
                    Bumbu / Bahan Kunci <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.key_spice}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        key_spice: e.target.value,
                      }))
                    }
                    placeholder="Contoh: Kluwek, Lengkuas, Serai"
                    className="mt-1.5 w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs outline-none focus:border-[#557153]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3b4f42]">
                    Estimasi Porsi <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.portion_estimate}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        portion_estimate: e.target.value,
                      }))
                    }
                    placeholder="Contoh: 4 Porsi"
                    className="mt-1.5 w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs outline-none focus:border-[#557153]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3b4f42]">
                    Rasa Dominan <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.dominant_taste}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        dominant_taste: e.target.value,
                      }))
                    }
                    placeholder="Contoh: Gurih, Pedas Hangat"
                    className="mt-1.5 w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs outline-none focus:border-[#557153]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3b4f42]">
                    Teknik Pengolahan Rempah <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.spice_technique}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        spice_technique: e.target.value,
                      }))
                    }
                    placeholder="Contoh: Sangrai lalu haluskan, memarkan serai"
                    className="mt-1.5 w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs outline-none focus:border-[#557153]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3b4f42]">
                    Link Gambar Hidangan (URL) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={form.image_url}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        image_url: e.target.value,
                      }))
                    }
                    placeholder="https://..."
                    className="mt-1.5 w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs outline-none focus:border-[#557153]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3b4f42]">
                    Link Video Pembelajaran (YouTube / MP4) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={form.video_url}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        video_url: e.target.value,
                      }))
                    }
                    placeholder="https://youtu.be/..."
                    className="mt-1.5 w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs outline-none focus:border-[#557153]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3b4f42]">
                  Ringkasan Materi Resep <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={form.summary}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, summary: e.target.value }))
                  }
                  placeholder="Ringkasan singkat mengenai hidangan ini..."
                  className="mt-1.5 w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs outline-none focus:border-[#557153]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3b4f42]">
                  Daftar Bahan-Bahan <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={form.ingredients}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      ingredients: e.target.value,
                    }))
                  }
                  placeholder="Tuliskan bahan-bahan (pisahkan dengan baris baru atau koma)..."
                  className="mt-1.5 w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs outline-none focus:border-[#557153]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3b4f42]">
                  Langkah-Langkah Memasak <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  value={form.instructions}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      instructions: e.target.value,
                    }))
                  }
                  placeholder="Tuliskan tahapan memasak secara berurutan..."
                  className="mt-1.5 w-full rounded-xl border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs outline-none focus:border-[#557153]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#edf2ec] pt-5">
                <Link
                  href="/dashboard/teacher?tab=recipes"
                  className="rounded-full border border-[#d6dfd3] bg-white px-5 py-2.5 text-xs font-semibold text-[#3b4f42] hover:bg-[#eef3ec]"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-[#4e674c] px-6 py-2.5 text-xs font-semibold text-white hover:bg-[#3f553d] disabled:opacity-60"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
