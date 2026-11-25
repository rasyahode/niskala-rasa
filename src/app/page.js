'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ENROLLMENTS_STORAGE_KEY = 'niskala_enrollments';
const LOCAL_CLASSES_STORAGE_KEY = 'niskala_teacher_custom_classes';

const DEFAULT_COURSE_CLASSES = [
  {
    id: 'class-camilan-basah',
    category_name: 'Camilan Basah',
    title: 'Kue Basah Kukus & Jajanan Pasar Tradisional',
    description:
      'Menguasai adonan santan, tepung beras, ketan, dan teknik pengukusan jajanan pasar Nusantara agar lembut dan harum pandan suji.',
    enrollment_count: 0,
  },
  {
    id: 'class-camilan-kering',
    category_name: 'Camilan Kering',
    title: 'Kue Kering Klasik & Camilan Renyah Tahan Lama',
    description:
      'Teknik pengovenan, penggorengan renyah, dan takaran rempah hangat untuk aneka kue kering dan camilan stoples khas Nusantara.',
    enrollment_count: 0,
  },
  {
    id: 'class-makanan-berkuah',
    category_name: 'Makanan Berkuah',
    title: 'Mastery Hidangan Berkuah & Rempah Nusantara',
    description:
      'Mendalami racikan bumbu dasar, teknik menumis rempah hingga tanak, serta keseimbangan kuah santan dan kaldu bening autentik.',
    enrollment_count: 0,
  },
  {
    id: 'class-makanan-tidak-berkuah',
    category_name: 'Makanan Tidak Berkuah',
    title: 'Olahan Lauk Kering, Tumis & Bakar Autentik',
    description:
      'Teknik ungkep, karamelisasi bumbu, penggorengan renyah, dan sambal pendamping untuk lauk harian maupun hidangan istimewa.',
    enrollment_count: 0,
  },
  {
    id: 'class-minuman',
    category_name: 'Minuman',
    title: 'Racikan Jamu & Minuman Rempah Tradisional',
    description:
      'Pengolahan rimpang segar, ekstraksi rempah kering, dan takaran gula aren untuk minuman herbal hangat maupun menyegarkan.',
    enrollment_count: 0,
  },
];

function getClassCategoryCover(classItem) {
  const text = [
    classItem?.category_name,
    classItem?.dish_type,
    classItem?.category,
    classItem?.title,
    classItem?.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (
    text.includes('camilan basah') ||
    text.includes('kue basah') ||
    text.includes('jajanan pasar')
  ) {
    return '/images/classes/cover kelas kategori camilan basah.jpg';
  }
  if (text.includes('camilan kering') || text.includes('kue kering')) {
    return '/images/classes/cover kelas kategori camilan kering.jpg';
  }
  if (
    text.includes('tidak berkuah') ||
    text.includes('lauk kering') ||
    text.includes('tumis') ||
    text.includes('bakar')
  ) {
    return '/images/classes/cover kelas kategori makanan tidak berkuah.jpg';
  }
  if (text.includes('berkuah') || text.includes('kuah')) {
    return '/images/classes/cover kelas kategori kelas makanan berkuah.jpg';
  }
  if (
    text.includes('minuman') ||
    text.includes('jamu') ||
    text.includes('wedang')
  ) {
    return '/images/classes/cover kelas kategori minuman.jpg';
  }

  return (
    classItem?.image_url ||
    classItem?.imageUrl ||
    classItem?.image ||
    '/images/classes/cover kelas kategori kelas makanan berkuah.jpg'
  );
}

function getParticipantCount(classItem, localEnrollmentCounts) {
  const idStr = String(classItem?.id ?? classItem?.class_id ?? '');
  const localExtra = Number(localEnrollmentCounts?.[idStr] || 0);

  const directCount = Number(
    classItem?.enrollment_count ??
      classItem?.enrolled_count ??
      classItem?.students_count ??
      classItem?.member_count ??
      classItem?.participants_count ??
      classItem?.total_students ??
      classItem?.joined_count ??
      0
  );

  const arrayCount = Array.isArray(classItem?.enrollments)
    ? classItem.enrollments.length
    : Array.isArray(classItem?.students)
      ? classItem.students.length
      : 0;

  const base =
    Number.isFinite(directCount) && directCount > 0 ? directCount : arrayCount;
  return Math.max(0, base + (Number.isFinite(localExtra) ? localExtra : 0));
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [localEnrollmentCounts, setLocalEnrollmentCounts] = useState({});
  const [selectedClassCategory, setSelectedClassCategory] = useState('all');

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
  const isLoggedIn = Boolean(user && role !== 'guest' && role !== 'public');

  useEffect(() => {
    let active = true;

    try {
      const rawEnroll = window.localStorage.getItem(ENROLLMENTS_STORAGE_KEY);
      if (rawEnroll) {
        const parsedEnroll = JSON.parse(rawEnroll);
        const counts = {};
        const list = Array.isArray(parsedEnroll)
          ? parsedEnroll
          : Array.isArray(parsedEnroll?.enrollments)
            ? parsedEnroll.enrollments
            : [];

        list.forEach((item) => {
          const cid = String(item?.class_id ?? item?.classId ?? item?.id ?? '');
          if (cid) {
            counts[cid] = (counts[cid] || 0) + 1;
          }
        });
        if (active) setLocalEnrollmentCounts(counts);
      }
    } catch {
      // Abaikan error storage
    }

    async function loadClasses() {
      let apiClasses = [];
      try {
        const res = await fetch('/api/classes', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          apiClasses = Array.isArray(data?.classes)
            ? data.classes
            : Array.isArray(data)
              ? data
              : [];
        }
      } catch {
        // Pertahankan state bila API tidak tersedia
      }

      let customClasses = [];
      try {
        const rawCustom = window.localStorage.getItem(LOCAL_CLASSES_STORAGE_KEY);
        if (rawCustom) {
          const parsedCustom = JSON.parse(rawCustom);
          if (Array.isArray(parsedCustom)) customClasses = parsedCustom;
        }
      } catch {
        // Abaikan error storage
      }

      const baseList =
        apiClasses.length > 0 ? [...apiClasses] : [...DEFAULT_COURSE_CLASSES];

      customClasses.forEach((cc) => {
        const exists = baseList.some(
          (item) =>
            String(item?.id) === String(cc?.id) ||
            String(item?.title || '').toLowerCase() ===
              String(cc?.title || '').toLowerCase()
        );
        if (!exists) baseList.push(cc);
      });

      if (active) setClasses(baseList);
    }

    loadClasses();
    return () => {
      active = false;
    };
  }, []);

  const popularFiveClasses = useMemo(() => {
    return [...classes]
      .sort((a, b) => {
        const countA = getParticipantCount(a, localEnrollmentCounts);
        const countB = getParticipantCount(b, localEnrollmentCounts);
        if (countB !== countA) return countB - countA;
        return String(a?.title || a?.name || '').localeCompare(
          String(b?.title || b?.name || '')
        );
      })
      .slice(0, 5);
  }, [classes, localEnrollmentCounts]);

  const classCategories = useMemo(() => {
    const set = new Set();
    classes.forEach((cls) => {
      const cat = String(
        cls?.category_name || cls?.dish_type || cls?.category || ''
      ).trim();
      if (cat) set.add(cat);
    });
    return ['all', ...Array.from(set)];
  }, [classes]);

  const filteredAllClasses = useMemo(() => {
    if (selectedClassCategory === 'all') return classes;
    return classes.filter((cls) => {
      const cat = String(
        cls?.category_name || cls?.dish_type || cls?.category || ''
      ).trim();
      return cat === selectedClassCategory;
    });
  }, [classes, selectedClassCategory]);

  function handleOpenClass(classItem) {
    if (!classItem) return;
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }
    if (classItem.recipe_id) {
      router.push(`/recipes/${classItem.recipe_id}`);
      return;
    }
    router.push(`/learning-space?classId=${encodeURIComponent(classItem.id)}`);
  }

  const dashboardHref =
    role === 'teacher'
      ? '/dashboard/teacher'
      : role === 'student'
        ? '/dashboard/student'
        : '/login';

  return (
    <div className="min-h-screen bg-[#f4f6f3] text-[#1e2923]">
      <main className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-8 sm:py-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-[#dfe7dc] bg-white p-8 shadow-2xs sm:p-12">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-7">

              <h1 className="text-3xl leading-tight font-bold tracking-tight text-[#1a2820] sm:text-4xl">
                Kuasai Teknik & Rahasia Rempah Autentik Bersama Niskala Rasa
              </h1>

              <p className="max-w-2xl text-sm leading-relaxed text-[#56685c] sm:text-base">
                Pelajari 50+ resep warisan Nusantara dari hidangan berkuah, lauk
                kering, camilan tradisional, hingga minuman rempah melalui
                kurikulum terstruktur dan pendampingan pengajar berpengalaman.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href={isLoggedIn ? dashboardHref : '/login'}
                  className="rounded-full bg-[#557153] px-6 py-3 text-xs font-semibold text-white transition-colors hover:bg-[#465e44] sm:text-sm"
                >
                  {isLoggedIn ? 'Lanjutkan Belajar' : 'Mulai Belajar Sekarang'}
                </Link>
                <Link
                  href="/recipes"
                  className="rounded-full border border-[#d6dfd3] bg-[#f8faf7] px-6 py-3 text-xs font-semibold text-[#2d4034] transition-colors hover:bg-[#eef3ec] sm:text-sm"
                >
                  Jelajahi Katalog Resep
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-[#e3eae1] bg-[#eef3ec] shadow-2xs">
                <img
                  src="/images/classes/cover kelas kategori kelas makanan berkuah.jpg"
                  alt="Hidangan Khas Nusantara Niskala Rasa"
                  className="h-64 w-full object-cover sm:h-72"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 1. Semua Kelas yang Dimiliki Kursus Ini */}
        <section
          id="daftar-kelas"
          className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-wider text-[#557153] uppercase">
                PROGRAM & KURIKULUM
              </p>
              <h2 className="mt-1 text-2xl font-bold text-[#1a2820]">
                Kelas yang Dimiliki Niskala Rasa
              </h2>
              <p className="mt-1 text-xs text-[#5d6f63]">
                Menampilkan {filteredAllClasses.length} kelas aktif yang dapat
                diikuti oleh murid
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {classCategories.length > 1 && (
                <div className="flex flex-wrap gap-1.5">
                  {classCategories.map((cat) => {
                    const active = selectedClassCategory === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedClassCategory(cat)}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                          active
                            ? 'bg-[#557153] text-white'
                            : 'border border-[#d6dfd3] bg-[#f8faf7] text-[#3b4f42] hover:bg-[#eef3ec]'
                        }`}
                      >
                        {cat === 'all' ? 'Semua Kelas' : cat}
                      </button>
                    );
                  })}
                </div>
              )}

              <Link
                href="/recipes"
                className="rounded-xl bg-[#557153] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#465e44]"
              >
                Lihat Semua Resep
              </Link>
            </div>
          </div>

          {filteredAllClasses.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-[#e3eae1] bg-[#f9fbf8] p-8 text-center text-sm text-[#5d6f63]">
              Belum ada kelas pada kategori ini.
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAllClasses.map((cls, index) => {
                const participants = getParticipantCount(
                  cls,
                  localEnrollmentCounts
                );
                const imgSrc = getClassCategoryCover(cls);
                const classTitle =
                  cls.title || cls.name || `Kelas Kuliner #${index + 1}`;
                const categoryLabel =
                  cls.category_name ||
                  cls.dish_type ||
                  cls.category ||
                  'KELAS KULINER';
                const descriptionText =
                  String(
                    cls.description || cls.summary || cls.key_spice || ''
                  ).trim() ||
                  'Kelas praktik kuliner Nusantara dengan panduan bahan, bumbu, dan teknik memasak.';
                const teacherName = String(
                  cls.teacher_name || cls.instructor || ''
                ).trim();

                return (
                  <article
                    key={`all-${cls.id ?? `${classTitle}-${index}`}`}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e3eae1] bg-white shadow-2xs transition-shadow hover:shadow-sm"
                  >
                    <div>
                      <div className="relative h-44 w-full overflow-hidden border-b border-[#edf2ec] bg-[#eef3ec]">
                        <img
                          src={imgSrc}
                          alt={classTitle}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute top-3 right-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#2d462f] shadow-2xs">
                          {participants} peserta
                        </span>
                      </div>

                      <div className="p-5 pb-2">
                        <p className="text-[11px] font-bold tracking-wider text-[#557153] uppercase">
                          {categoryLabel}
                        </p>
                        <h3 className="mt-1 text-base font-bold text-[#1a2820]">
                          {classTitle}
                        </h3>
                        {teacherName && (
                          <p className="mt-0.5 text-[11px] font-medium text-[#557153]">
                            Pengajar: {teacherName}
                          </p>
                        )}
                        <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-[#5d6f63]">
                          {descriptionText}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 pt-2 pb-5">
                      <button
                        type="button"
                        onClick={() => handleOpenClass(cls)}
                        className="w-full rounded-full border border-[#557153] bg-[#f8faf7] px-4 py-2 text-xs font-semibold text-[#2d462f] transition-colors hover:bg-[#557153] hover:text-white"
                      >
                        {isLoggedIn
                          ? 'Masuk ke Kelas'
                          : 'Masuk / Daftar untuk Ikut Kelas'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* 2. 5 Kelas Paling Populer (Potret & Berjejer Satu Baris) */}
        <section className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-wider text-[#557153] uppercase">
                KELAS UNGGULAN
              </p>
              <h2 className="mt-1 text-2xl font-bold text-[#1a2820]">
                5 Kelas Paling Populer
              </h2>
              <p className="mt-1 text-xs text-[#5d6f63]">
                Diurutkan berdasarkan jumlah peserta yang masuk ke dalam kelas
              </p>
            </div>
          </div>

          {popularFiveClasses.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-[#e3eae1] bg-[#f9fbf8] p-8 text-center text-sm text-[#5d6f63]">
              Belum ada data kelas populer yang tersedia.
            </div>
          ) : (
            <div className="mt-6 flex gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0">
              {popularFiveClasses.map((cls, index) => {
                const participants = getParticipantCount(
                  cls,
                  localEnrollmentCounts
                );
                const imgSrc = getClassCategoryCover(cls);
                const classTitle =
                  cls.title || cls.name || `Kelas Kuliner #${index + 1}`;
                const categoryLabel =
                  cls.category_name ||
                  cls.dish_type ||
                  cls.level ||
                  'KELAS KULINER';
                const descriptionText =
                  String(
                    cls.description || cls.summary || cls.key_spice || ''
                  ).trim() ||
                  'Kelas praktik kuliner Nusantara dengan panduan bahan, bumbu, dan teknik memasak.';

                return (
                  <article
                    key={`popular-${cls.id ?? `${classTitle}-${index}`}`}
                    className="group flex w-56 shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-[#e3eae1] bg-white shadow-2xs transition-shadow hover:shadow-sm lg:w-auto lg:shrink"
                  >
                    <div>
                      <div className="relative aspect-[3/4] w-full overflow-hidden border-b border-[#edf2ec] bg-[#eef3ec]">
                        <img
                          src={imgSrc}
                          alt={classTitle}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute top-2.5 left-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#2d462f] shadow-2xs">
                          #{index + 1} · {participants} peserta
                        </span>
                      </div>

                      <div className="p-4 pb-2">
                        <p className="text-[10px] font-bold tracking-wider text-[#557153] uppercase">
                          {categoryLabel}
                        </p>
                        <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-[#1a2820]">
                          {classTitle}
                        </h3>
                        <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-[#5d6f63]">
                          {descriptionText}
                        </p>
                      </div>
                    </div>

                    <div className="px-4 pt-2 pb-4">
                      <button
                        type="button"
                        onClick={() => handleOpenClass(cls)}
                        className="w-full rounded-full bg-[#557153] px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-[#465e44]"
                      >
                        {isLoggedIn
                          ? 'Masuk ke Kelas'
                          : 'Masuk untuk Ikut'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-[#e3eae1] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-xs text-[#5d6f63] sm:flex-row sm:px-8">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#557153]" />
            <span className="font-bold text-[#1a2820]">Niskala Rasa</span>
            <span>· Kursus Kuliner & Arsip Resep Nusantara</span>
          </div>

          <div className="flex flex-wrap items-center gap-5 font-medium">
            <Link href="/" className="transition-colors hover:text-[#557153]">
              Beranda
            </Link>
            <Link
              href="/recipes"
              className="transition-colors hover:text-[#557153]"
            >
              Katalog Resep
            </Link>
            <Link
              href="/login"
              className="transition-colors hover:text-[#557153]"
            >
              Masuk / Daftar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}