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
    teacher_name: 'Raka Pratama Wijaya Kusuma Putra',
  },
  {
    id: 'class-camilan-kering',
    category_name: 'Camilan Kering',
    title: 'Kue Kering Klasik & Camilan Renyah Tahan Lama',
    description:
      'Teknik pengovenan, penggorengan renyah, dan takaran rempah hangat untuk aneka kue kering dan camilan stoples khas Nusantara.',
    teacher_name: 'Dimas Aditya Nugraha Pratama Jaya',
  },
  {
    id: 'class-makanan-berkuah',
    category_name: 'Makanan Berkuah',
    title: 'Mastery Hidangan Berkuah & Rempah Nusantara',
    description:
      'Mendalami racikan bumbu dasar, teknik menumis rempah hingga tanak, serta keseimbangan kuah santan dan kaldu bening autentik.',
    teacher_name: 'Raka Pratama Wijaya Kusuma Putra',
  },
  {
    id: 'class-makanan-tidak-berkuah',
    category_name: 'Makanan Tidak Berkuah',
    title: 'Olahan Lauk Kering, Tumis & Bakar Autentik',
    description:
      'Teknik ungkep, karamelisasi bumbu, penggorengan renyah, dan sambal pendamping untuk lauk harian maupun hidangan istimewa.',
    teacher_name: 'Sari Dewi Lestari Putri Andini',
  },
  {
    id: 'class-minuman',
    category_name: 'Minuman',
    title: 'Racikan Jamu & Minuman Rempah Tradisional',
    description:
      'Pengolahan rimpang segar, ekstraksi rempah kering, dan takaran gula aren untuk minuman herbal hangat maupun menyegarkan.',
    teacher_name: 'Raka Pratama Wijaya Kusuma Putra',
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

  return '/images/classes/cover kelas kategori kelas makanan berkuah.jpg';
}

export default function ClassesCatalogPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [classes, setClasses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusMessage, setStatusMessage] = useState('');

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

    async function loadClassesAndEnrollments() {
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
        // Abaikan bila API gagal
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
          (item) => String(item?.id) === String(cc?.id)
        );
        if (!exists) baseList.push(cc);
      });

      const currentEnrolled = new Set();
      try {
        const resEnroll = await fetch('/api/enrollments', { cache: 'no-store' });
        if (resEnroll.ok) {
          const dataEnroll = await resEnroll.json();
          const list = Array.isArray(dataEnroll?.enrollments)
            ? dataEnroll.enrollments
            : Array.isArray(dataEnroll)
              ? dataEnroll
              : [];
          list.forEach((e) => {
            const ownerEmail = String(e?.student_email ?? e?.email ?? '').toLowerCase();
            const currentEmail = String(user?.email ?? '').toLowerCase();
            if (!currentEmail || !ownerEmail || ownerEmail === currentEmail) {
              const cid = String(e?.class_id ?? e?.classId ?? '');
              if (cid) currentEnrolled.add(cid);
            }
          });
        }
      } catch {
        // Abaikan bila API gagal
      }

      try {
        const rawLocal = window.localStorage.getItem(ENROLLMENTS_STORAGE_KEY);
        if (rawLocal) {
          const parsedLocal = JSON.parse(rawLocal);
          const list = Array.isArray(parsedLocal) ? parsedLocal : [];
          list.forEach((e) => {
            const ownerEmail = String(e?.student_email ?? e?.email ?? '').toLowerCase();
            const currentEmail = String(user?.email ?? '').toLowerCase();
            if (!currentEmail || !ownerEmail || ownerEmail === currentEmail) {
              const cid = String(e?.class_id ?? e?.classId ?? '');
              if (cid) currentEnrolled.add(cid);
            }
          });
        }
      } catch {
        // Abaikan error storage
      }

      if (active) {
        setClasses(baseList);
        setEnrolledIds(currentEnrolled);
      }
    }

    loadClassesAndEnrollments();
    return () => {
      active = false;
    };
  }, [user]);

  const categories = useMemo(() => {
    const set = new Set();
    classes.forEach((cls) => {
      const cat = String(cls?.category_name || cls?.dish_type || '').trim();
      if (cat) set.add(cat);
    });
    return ['all', ...Array.from(set)];
  }, [classes]);

  const filteredClasses = useMemo(() => {
    if (selectedCategory === 'all') return classes;
    return classes.filter(
      (cls) =>
        String(cls?.category_name || cls?.dish_type || '').trim() ===
        selectedCategory
    );
  }, [classes, selectedCategory]);

  async function handleEnrollOrEnter(classItem) {
    if (!classItem) return;
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    const idStr = String(classItem.id);
    if (enrolledIds.has(idStr)) {
      router.push('/dashboard/student?tab=classes');
      return;
    }

    setEnrolledIds((prev) => new Set([...prev, idStr]));

    const enrollmentRecord = {
      id: `enroll-${idStr}-${Date.now()}`,
      class_id: classItem.id,
      classId: classItem.id,
      class_title: classItem.title,
      title: classItem.title,
      category_name:
        classItem.category_name || classItem.dish_type || 'Kelas Kuliner',
      teacher_name: classItem.teacher_name || 'Pengajar Niskala Rasa',
      description: classItem.description || '',
      student_id: user?.id || user?.user_id || null,
      student_email: user?.email || '',
      email: user?.email || '',
      enrolled_at: new Date().toISOString(),
    };

    try {
      const rawLocal = window.localStorage.getItem(ENROLLMENTS_STORAGE_KEY);
      const existing = rawLocal ? JSON.parse(rawLocal) : [];
      const list = Array.isArray(existing) ? existing : [];
      const alreadySaved = list.some(
        (item) =>
          String(item?.class_id ?? item?.classId) === idStr &&
          String(item?.student_email ?? item?.email ?? '').toLowerCase() ===
            String(user?.email || '').toLowerCase()
      );
      if (!alreadySaved) {
        list.push(enrollmentRecord);
        window.localStorage.setItem(
          ENROLLMENTS_STORAGE_KEY,
          JSON.stringify(list)
        );
      }
    } catch {
      // Abaikan error storage
    }

    try {
      await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          class_id: classItem.id,
          classId: classItem.id,
          student_id: user?.id || user?.user_id,
          student_email: user?.email,
          email: user?.email,
        }),
      });
    } catch {
      // Abaikan bila endpoint POST memiliki skema berbeda
    }

    setStatusMessage(`Berhasil mendaftar ke kelas "${classItem.title}".`);
  }

  const dashboardHref =
    role === 'teacher'
      ? '/dashboard/teacher'
      : role === 'student'
        ? '/dashboard/student?tab=classes'
        : '/login';

  return (
    <div className="min-h-screen bg-[#f4f6f3] px-4 py-8 text-[#1e2923] sm:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e3eae1] bg-white p-6 shadow-2xs">
          <div>
            <p className="text-xs font-bold tracking-wider text-[#557153] uppercase">
              PROGRAM KURIKULUM NISKALA RASA
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#1a2820]">
              Jelajahi Kelas Kuliner
            </h1>
            <p className="mt-1 text-xs text-[#5d6f63]">
              Pilih kelas sesuai kategori hidangan Nusantara yang ingin Anda
              pelajari
            </p>
          </div>

          <Link
            href={dashboardHref}
            className="rounded-xl border border-[#d6dfd3] bg-[#f8faf7] px-4 py-2 text-xs font-semibold text-[#2d4034] transition-colors hover:bg-[#eef3ec]"
          >
            Kembali ke Dashboard
          </Link>
        </header>

        {statusMessage && (
          <div className="rounded-xl border border-[#cfe0cc] bg-[#eef5ed] px-4 py-3 text-sm text-[#2e4933]">
            {statusMessage}
          </div>
        )}

        <section className="rounded-2xl border border-[#e3eae1] bg-white p-5 shadow-2xs">
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
                  {cat === 'all' ? 'Semua Kelas' : cat}
                </button>
              );
            })}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.map((cls, index) => {
            const idStr = String(cls.id ?? index);
            const isEnrolled = enrolledIds.has(idStr);
            const imgSrc = getClassCategoryCover(cls);

            return (
              <article
                key={idStr}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#e3eae1] bg-white shadow-2xs transition-shadow hover:shadow-sm"
              >
                <div>
                  <div className="relative h-44 w-full overflow-hidden border-b border-[#edf2ec] bg-[#eef3ec]">
                    <img
                      src={imgSrc}
                      alt={cls.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-5 pb-2">
                    <p className="text-[11px] font-bold tracking-wider text-[#557153] uppercase">
                      {cls.category_name || cls.dish_type || 'Kelas Kuliner'}
                    </p>
                    <h2 className="mt-1 text-base font-bold text-[#1a2820]">
                      {cls.title}
                    </h2>
                    {cls.teacher_name && (
                      <p className="mt-0.5 text-[11px] font-medium text-[#557153]">
                        Pengajar: {cls.teacher_name}
                      </p>
                    )}
                    <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-[#5d6f63]">
                      {cls.description ||
                        'Kelas praktik kuliner Nusantara dengan panduan bahan, bumbu, dan teknik memasak.'}
                    </p>
                  </div>
                </div>

                <div className="px-5 pt-2 pb-5">
                  <button
                    type="button"
                    onClick={() => handleEnrollOrEnter(cls)}
                    className={`w-full rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                      isEnrolled
                        ? 'border border-[#557153] bg-[#eef5ed] text-[#2d462f]'
                        : 'bg-[#557153] text-white hover:bg-[#465e44]'
                    }`}
                  >
                    {isEnrolled
                      ? 'Sudah Terdaftar · Lihat di Dashboard'
                      : 'Daftar & Masuk Kelas'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
