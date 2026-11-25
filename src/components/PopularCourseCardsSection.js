'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const DEFAULT_TITLES_BY_CATEGORY = {
  'Makanan Berkuah': 'Kelas Dasar & Olahan Makanan Berkuah',
  'Makanan Tidak Berkuah': 'Kelas Olahan Lauk Kering, Tumis & Bakar',
  'Camilan Kering': 'Kelas Kue Kering & Camilan Renyah',
  'Camilan Basah': 'Kelas Kue Tradisional & Camilan Basah',
  Minuman: 'Kelas Racikan Minuman & Sajian Segar',
};

// Sesuai Dataset Akun Awal Pengguna: Admin Utama bukan pengajar
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

function formatCourseTitle(cls) {
  const raw = String(cls?.title || '')
    .replace(/\s*&\s*Rempah\s*(Nusantara|Tradisional)?/gi, '')
    .replace(/\bRempah\s+(Nusantara|Tradisional)\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (raw) return raw;
  return (
    DEFAULT_TITLES_BY_CATEGORY[cls?.category_name] ||
    `Kelas ${cls?.category_name || 'Kuliner'}`
  );
}

function resolveTeacherName(cls) {
  const rawName = String(cls?.teacher_name || '').trim();
  const isAdminName = /admin/i.test(rawName);
  if (rawName && !isAdminName) return rawName;
  return OFFICIAL_TEACHER_BY_CATEGORY[cls?.category_name] || 'Instruktur Niskala Rasa';
}

export default function PopularCourseCardsSection() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [isGuest, setIsGuest] = useState(true);

  async function loadCourseCatalog() {
    const saved = localStorage.getItem('niskala_user');
    setIsGuest(!saved);

    const [clsRes, recRes] = await Promise.all([
      fetch('/api/classes', { cache: 'no-store' }),
      fetch('/api/recipes?dish_type=all&auth=true', { cache: 'no-store' }).catch(() => null),
    ]);

    const rawCls = clsRes.ok ? await clsRes.json() : [];
    const list = Array.isArray(rawCls) ? rawCls : rawCls?.classes || [];

    const rawRec = recRes && recRes.ok ? await recRes.json() : [];
    const recipes = Array.isArray(rawRec) ? rawRec : rawRec?.recipes || [];

    const countByDishType = {};
    const countByClassId = {};
    for (const r of recipes) {
      const dt = String(r.dish_type || '').toLowerCase().trim();
      if (dt) countByDishType[dt] = (countByDishType[dt] || 0) + 1;

      const cid = String(r.class_id ?? r.classId ?? '');
      if (cid) countByClassId[cid] = (countByClassId[cid] || 0) + 1;
    }

    const mapped = list.map((cls) => {
      const cat = cls?.category_name || '';
      const dishTypeKey = DISH_TYPE_BY_CATEGORY[cat] || String(cls?.dish_type || '').toLowerCase();
      const recipeCountFromDb =
        (countByClassId[String(cls?.id)] || 0) + (countByDishType[dishTypeKey] || 0);
      const rawLessons = Number(cls?.total_lessons ?? cls?.lessons_count ?? 0);
      const finalLessons = rawLessons > 0 ? rawLessons : recipeCountFromDb;

      return {
        ...cls,
        displayTitle: formatCourseTitle(cls),
        displayTeacher: resolveTeacherName(cls),
        lessonTotal: finalLessons,
      };
    });

    setCourses(mapped);
  }

  useEffect(() => {
    loadCourseCatalog();
    const refresh = () => loadCourseCatalog();
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  function handleSelectCourse(cls) {
    if (isGuest) {
      router.push('/login');
      return;
    }
    router.push(`/dashboard/student?class=${cls.id}`);
  }

  return (
    <section id="kelas-kursus" className="max-w-6xl mx-auto px-4 sm:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#EEF2EA] text-[#4D6B4A] mb-2">
            Program Pembelajaran
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2B3E29]">
            Kelas Kursus yang Kami Miliki
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Daftar kelas aktif yang tersedia di Niskala Rasa.
          </p>
        </div>

        {isGuest && (
          <span className="text-xs font-semibold text-[#4D6B4A]">
            Tamu dapat melihat daftar kelas; detail materi khusus anggota
          </span>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#DCE4D7] p-8 text-center text-sm text-stone-600">
          Belum ada kelas kursus yang tersedia saat ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((cls) => (
            <article
              key={cls.id}
              className="bg-white rounded-2xl border border-[#DCE4D7] p-6 flex flex-col justify-between space-y-5 shadow-2xs"
            >
              <div className="space-y-2.5">
                <div>
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-[#F5F7F3] border border-[#DCE4D7] text-xs font-bold text-[#4D6B4A]">
                    {cls.category_name || 'Kelas Kuliner'}
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-[#2B3E29] leading-snug">
                  {cls.displayTitle}
                </h3>

                <div className="text-xs text-stone-500 space-y-0.5">
                  <p>
                    Pengajar:{' '}
                    <strong className="text-stone-700">{cls.displayTeacher}</strong>
                  </p>
                  <p>
                    Jumlah Materi:{' '}
                    <strong className="text-stone-700">{cls.lessonTotal} Modul</strong>
                  </p>
                </div>

                <p className="text-xs text-stone-600 pt-1">
                  {isGuest
                    ? 'Masuk sebagai murid untuk membuka rincian silabus, takaran bahan, dan video materi.'
                    : cls.description || 'Klik tombol di bawah untuk membuka detail kelas.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSelectCourse(cls)}
                className="w-full py-2.5 px-4 rounded-full bg-[#4D6B4A] hover:bg-[#3C553A] text-white text-xs font-bold transition"
              >
                {isGuest ? 'Masuk untuk Lihat Detail Kelas' : 'Buka Detail Kelas'}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
