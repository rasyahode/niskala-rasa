'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const ENROLLMENTS_STORAGE_KEY = 'niskala_enrollments';
const PROGRESS_STORAGE_KEY = 'niskala_student_progress';
const CHAT_STORAGE_KEY = 'niskala_feedback_messages';

function StudentDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams?.get('tab') || 'classes';

  const [user, setUser] = useState(null);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [completedRecipeIds, setCompletedRecipeIds] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

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

  useEffect(() => {
    let active = true;

    async function loadStudentData() {
      const allClassesMap = new Map();
      try {
        const resCls = await fetch('/api/classes', { cache: 'no-store' });
        if (resCls.ok) {
          const dataCls = await resCls.json();
          const list = Array.isArray(dataCls?.classes)
            ? dataCls.classes
            : Array.isArray(dataCls)
              ? dataCls
              : [];
          list.forEach((c) => {
            allClassesMap.set(String(c.id), c);
            if (c.title) {
              allClassesMap.set(String(c.title).toLowerCase().trim(), c);
            }
          });
        }
      } catch {
        // Abaikan bila API gagal
      }

      const mergedMap = new Map();
      const currentEmail = String(user?.email || '').toLowerCase().trim();

      try {
        const resEnroll = await fetch('/api/enrollments', { cache: 'no-store' });
        if (resEnroll.ok) {
          const dataEnroll = await resEnroll.json();
          const list = Array.isArray(dataEnroll?.enrollments)
            ? dataEnroll.enrollments
            : Array.isArray(dataEnroll)
              ? dataEnroll
              : [];

          list.forEach((item) => {
            const ownerEmail = String(
              item?.student_email ?? item?.email ?? ''
            )
              .toLowerCase()
              .trim();
            if (!currentEmail || !ownerEmail || ownerEmail === currentEmail) {
              const cid = String(
                item?.class_id ?? item?.classId ?? item?.id ?? ''
              );
              const ref =
                allClassesMap.get(cid) ||
                allClassesMap.get(
                  String(item?.class_title ?? item?.title ?? '')
                    .toLowerCase()
                    .trim()
                ) ||
                {};
              const title =
                item?.class_title ||
                item?.title ||
                ref?.title ||
                'Kelas Kuliner Nusantara';
              const key = String(title).toLowerCase().trim();
              if (!mergedMap.has(key)) {
                mergedMap.set(key, {
                  id: cid || key,
                  title,
                  category_name:
                    item?.category_name ||
                    ref?.category_name ||
                    ref?.dish_type ||
                    'KELAS KULINER',
                  teacher_name:
                    item?.teacher_name ||
                    ref?.teacher_name ||
                    'Raka Pratama Wijaya Kusuma Putra',
                });
              }
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
          list.forEach((item) => {
            const ownerEmail = String(
              item?.student_email ?? item?.email ?? ''
            )
              .toLowerCase()
              .trim();
            if (!currentEmail || !ownerEmail || ownerEmail === currentEmail) {
              const cid = String(item?.class_id ?? item?.classId ?? '');
              const ref =
                allClassesMap.get(cid) ||
                allClassesMap.get(
                  String(item?.class_title ?? item?.title ?? '')
                    .toLowerCase()
                    .trim()
                ) ||
                {};
              const title =
                item?.class_title ||
                item?.title ||
                ref?.title ||
                'Kelas Kuliner Nusantara';
              const key = String(title).toLowerCase().trim();
              if (!mergedMap.has(key)) {
                mergedMap.set(key, {
                  id: cid || key,
                  title,
                  category_name:
                    item?.category_name ||
                    ref?.category_name ||
                    ref?.dish_type ||
                    'KELAS KULINER',
                  teacher_name:
                    item?.teacher_name ||
                    ref?.teacher_name ||
                    'Raka Pratama Wijaya Kusuma Putra',
                });
              }
            }
          });
        }
      } catch {
        // Abaikan error storage
      }

      if (active) {
        setEnrolledClasses(Array.from(mergedMap.values()));
      }

      try {
        const resRec = await fetch('/api/recipes', { cache: 'no-store' });
        if (resRec.ok) {
          const dataRec = await resRec.json();
          const listRec = Array.isArray(dataRec?.recipes)
            ? dataRec.recipes
            : Array.isArray(dataRec)
              ? dataRec
              : [];
          if (active) setRecipes(listRec);
        }
      } catch {
        // Abaikan bila API gagal
      }

      try {
        const ids = new Set();
        const userEmail = String(user?.email || '').toLowerCase().trim();

        const rawCompleted = window.localStorage.getItem(
          'niskala_completed_recipes'
        );
        if (rawCompleted) {
          const parsedCompleted = JSON.parse(rawCompleted);
          if (Array.isArray(parsedCompleted)) {
            parsedCompleted.forEach((item) => {
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

        const rawProg = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
        if (rawProg) {
          const parsedProg = JSON.parse(rawProg);
          if (Array.isArray(parsedProg)) {
            parsedProg.forEach((id) => ids.add(String(id)));
          }
        }

        if (active) {
          setCompletedRecipeIds(Array.from(ids));
        }
      } catch {
        // Abaikan error storage
      }

      try {
        const rawChat = window.localStorage.getItem(CHAT_STORAGE_KEY);
        if (rawChat) {
          const parsedChat = JSON.parse(rawChat);
          if (Array.isArray(parsedChat) && active) {
            setChatMessages(parsedChat);
          }
        }
      } catch {
        // Abaikan error storage
      }
    }

    loadStudentData();
    return () => {
      active = false;
    };
  }, [user]);

  const studentName =
    user?.name || user?.full_name || 'Putri Lestari Kusuma Wardani';
  const studentEmail = user?.email || 'putri@gmail.com';
  const initialLetter = String(studentName).charAt(0).toUpperCase() || 'P';

  const enrolledCategories = useMemo(() => {
    const set = new Set();
    enrolledClasses.forEach((c) => {
      const cat = String(c?.category_name || '').toLowerCase().trim();
      if (cat) set.add(cat);
    });
    return set;
  }, [enrolledClasses]);

  const classRecipes = useMemo(() => {
    if (enrolledCategories.size === 0) return recipes.slice(0, 12);
    const matched = recipes.filter((r) => {
      const rCat = String(r?.category_name || r?.dish_type || '')
        .toLowerCase()
        .trim();
      return Array.from(enrolledCategories).some(
        (c) => rCat.includes(c) || c.includes(rCat)
      );
    });
    return matched.length > 0 ? matched : recipes.slice(0, 12);
  }, [recipes, enrolledCategories]);

  function handleSendChat(e) {
    e.preventDefault();
    if (isPendingApproval) return;
    const text = chatInput.trim();
    if (!text) return;

    const next = [
      ...chatMessages,
      {
        id: Date.now(),
        sender: studentName,
        role: 'student',
        text,
        created_at: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ];
    setChatMessages(next);
    setChatInput('');
    try {
      window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Abaikan error storage
    }
  }

  async function handleLogout() {
    setUser(null);

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Abaikan bila endpoint logout tidak tersedia
    }

    [
      'niskala_user',
      'niskala_token',
      'token',
      'session',
      'auth_token',
    ].forEach((name) => {
      document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      document.cookie = `${name}=; Path=/; Max-Age=0;`;
    });

    try {
      window.localStorage.removeItem('niskala_user');
      window.localStorage.removeItem('user');
      window.localStorage.removeItem('currentUser');
      window.localStorage.removeItem('niskala_auth');
      window.sessionStorage.clear();
    } catch {
      // Abaikan error storage
    }

    window.location.href = '/login';
  }

  const navItems = [
    { key: 'profile', label: 'Profil' },
    { key: 'classes', label: 'Kelas Saya' },
    { key: 'recipes', label: 'Materi Resep' },
    { key: 'progress', label: 'Progres Belajar' },
    { key: 'chat', label: 'Chat & Feedback Guru' },
  ];

  const isRejected =
    user &&
    String(user.role || '').toLowerCase() !== 'admin' &&
    String(user.status || '').toLowerCase() === 'rejected';

  const isPendingApproval =
    user &&
    String(user.role || '').toLowerCase() !== 'admin' &&
    !isRejected &&
    (String(user.status || '').toLowerCase() === 'pending' ||
      user.is_approved === false);

  if (isRejected) {
    return (
      <div className="min-h-screen bg-[#f4f6f3] flex items-center justify-center px-4">
        <div className="max-w-md w-full rounded-3xl border border-[#e3eae1] bg-white p-8 text-center shadow-2xs space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-700 font-bold text-lg border border-rose-200">
            !
          </div>
          <h1 className="text-xl font-bold text-[#1a2820]">
            Pendaftaran Akun Ditolak
          </h1>
          <p className="text-xs leading-relaxed text-[#5d6f63]">
            Maaf, pendaftaran akun Anda tidak disetujui oleh Administrator.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-xl bg-[#4e674c] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#3f553d]"
          >
            Keluar & Kembali ke Halaman Masuk
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f3] text-[#1e2923]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-10 lg:py-10">
        {/* Sidebar Portal Murid (Sticky) */}
        <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-68 lg:self-start">
          <div className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs">
            <div className="flex items-center gap-3 pb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef3ec] text-xs font-bold text-[#465e44]">
                NR
              </div>
              <div>
                <p className="text-sm font-bold text-[#1a2820]">Niskala Rasa</p>
                <p className="text-[10px] font-bold tracking-wider text-[#557153] uppercase">
                  PORTAL MURID
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e3eae1] bg-[#f8faf7] p-4 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#4e674c] text-sm font-bold text-white">
                {initialLetter}
              </div>
              <p className="mt-2.5 truncate text-xs font-bold text-[#1a2820]">
                {studentName}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-[#5d6f63]">
                {studentEmail}
              </p>
              <p className="mt-2.5 inline-block rounded-full bg-[#eef3ec] px-3 py-1 text-[11px] font-semibold text-[#3f553d]">
                Halo, {String(studentName).trim().split(/\s+/)[0]}!
              </p>
            </div>

            <nav className="mt-5 space-y-1.5">
              {navItems.map((item) => {
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      router.push(`/dashboard/student?tab=${item.key}`)
                    }
                    className={`w-full rounded-xl px-4 py-2.5 text-left text-xs font-semibold transition-colors ${
                      isActive
                        ? 'border border-[#dce5d9] bg-[#f4f7f3] text-[#1a2820] shadow-2xs'
                        : 'text-[#3b4f42] hover:bg-[#f8faf7]'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 border-t border-[#edf2ec] pt-4">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#2d4034] transition-colors hover:bg-[#f4f7f3]"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1f2922] text-[10px] font-bold text-white">
                  N
                </span>
                Keluar Akun
              </button>
            </div>
          </div>
        </aside>

        {/* Konten Utama */}
        <main className="flex-1 space-y-7">
          <section className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8">
            <h1 className="text-2xl font-bold text-[#1a2820]">
              Dashboard Murid
            </h1>
            <p className="mt-1.5 text-xs text-[#5d6f63]">
              Selamat datang, {studentName}.
            </p>
          </section>

          {isPendingApproval && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-xs font-medium text-amber-900">
              <strong>Menunggu Persetujuan Admin:</strong> Akun murid Anda sedang
              ditinjau. Anda hanya dapat melihat halaman ini dan belum dapat
              mengikuti kelas, membuka materi, atau mengirim pesan sampai akun
              disetujui.
            </div>
          )}

          {activeTab === 'profile' && (
            <section className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8">
              <h2 className="text-lg font-bold text-[#1a2820]">Profil Murid</h2>
              <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#e3eae1] bg-[#f9fbf8] p-5">
                  <p className="text-[11px] font-bold text-[#557153] uppercase">
                    Nama Lengkap
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-[#1a2820]">
                    {studentName}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#e3eae1] bg-[#f9fbf8] p-5">
                  <p className="text-[11px] font-bold text-[#557153] uppercase">
                    Email Terdaftar
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-[#1a2820]">
                    {studentEmail}
                  </p>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'classes' && (
            <section className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#1a2820]">
                    Kelas Terdaftar ({enrolledClasses.length})
                  </h2>
                  <p className="mt-1 text-xs text-[#5d6f63]">
                    Kelas kuliner yang sedang Anda ikuti.
                  </p>
                </div>

                {!isPendingApproval && (
                  <Link
                    href="/classes"
                    className="rounded-full bg-[#4e674c] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#3f553d]"
                  >
                    Jelajahi Kelas
                  </Link>
                )}
              </div>

              {enrolledClasses.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-[#e3eae1] bg-[#f9fbf8] p-6 text-xs text-[#5d6f63]">
                  Anda belum terdaftar di kelas mana pun. Klik{' '}
                  <strong>Jelajahi Kelas</strong> untuk memilih kelas.
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                  {enrolledClasses.map((cls) => (
                    <div
                      key={cls.id}
                      className="rounded-2xl border border-[#e3eae1] bg-[#fafbf9] p-6 transition-colors hover:border-[#cfdcd0]"
                    >
                      <p className="text-[11px] font-bold tracking-wider text-[#557153] uppercase">
                        {cls.category_name}
                      </p>
                      <h3 className="mt-1.5 text-base font-bold text-[#1a2820]">
                        {cls.title}
                      </h3>
                      <p className="mt-1.5 text-xs text-[#5d6f63]">
                        Pengajar: {cls.teacher_name}
                      </p>
                      <div className="mt-5">
                        <Link
                          href="/recipes"
                          className="inline-block rounded-full border border-[#d6dfd3] bg-white px-4 py-2 text-xs font-semibold text-[#2d4034] transition-colors hover:bg-[#eef3ec]"
                        >
                          Buka Materi Resep
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'recipes' && (
            <section className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#1a2820]">
                    Materi Resep Kelas ({classRecipes.length})
                  </h2>
                  <p className="mt-1 text-xs text-[#5d6f63]">
                    Daftar resep praktik sesuai kelas yang Anda ikuti.
                  </p>
                </div>
                <Link
                  href="/recipes"
                  className="rounded-full bg-[#4e674c] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3f553d]"
                >
                  Semua Katalog Resep
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {classRecipes.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-col justify-between rounded-2xl border border-[#e3eae1] bg-[#fafbf9] p-5"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] font-bold text-[#557153] uppercase">
                          {r.category_name || r.dish_type}
                        </p>
                        {completedRecipeIds.includes(String(r.id)) && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                            ✓ Selesai Dipelajari
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1.5 text-sm font-bold text-[#1a2820]">
                        {r.title}
                      </h3>
                    </div>
                    {!isPendingApproval && (
                      <div className="mt-4">
                        <Link
                          href={`/recipes/${r.id}`}
                          className="inline-block rounded-full bg-[#4e674c] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3f553d]"
                        >
                          Pelajari Resep
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'progress' && (
            <section className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8">
              <h2 className="text-lg font-bold text-[#1a2820]">
                Progres Belajar
              </h2>
              <p className="mt-1 text-xs text-[#5d6f63]">
                Ringkasan keikutsertaan kelas dan penyelesaian praktik resep.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#e3eae1] bg-[#f9fbf8] p-6">
                  <p className="text-xs font-semibold text-[#5d6f63]">
                    Kelas Aktif Diikuti
                  </p>
                  <p className="mt-1.5 text-2xl font-bold text-[#1a2820]">
                    {enrolledClasses.length} Kelas
                  </p>
                </div>
                <div className="rounded-2xl border border-[#e3eae1] bg-[#f9fbf8] p-6">
                  <p className="text-xs font-semibold text-[#5d6f63]">
                    Resep Selesai Dipelajari
                  </p>
                  <p className="mt-1.5 text-2xl font-bold text-[#1a2820]">
                    {completedRecipeIds.length} Resep
                  </p>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'chat' && (
            <section className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8">
              <h2 className="text-lg font-bold text-[#1a2820]">
                Chat & Feedback Guru
              </h2>
              <p className="mt-1 text-xs text-[#5d6f63]">
                Diskusikan hasil praktik masakan Anda bersama pengajar kelas.
              </p>

              <div className="mt-5 max-h-72 space-y-3 overflow-y-auto rounded-2xl border border-[#e3eae1] bg-[#f9fbf8] p-5">
                {chatMessages.length === 0 ? (
                  <p className="text-xs text-[#5d6f63]">
                    Belum ada pesan diskusi. Kirim pertanyaan atau catatan
                    praktik Anda di bawah.
                  </p>
                ) : (
                  chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="rounded-xl border border-[#e3eae1] bg-white p-3.5 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold text-[#2d4034]">
                        <span>{msg.sender}</span>
                        <span className="text-[10px] text-[#7a8a7f]">
                          {msg.created_at}
                        </span>
                      </div>
                      <p className="mt-1 text-[#1e2923]">{msg.text}</p>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={handleSendChat}
                className={`mt-5 flex gap-3 ${
                  isPendingApproval ? 'pointer-events-none opacity-55' : ''
                }`}
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Tulis pesan untuk guru pengajar..."
                  className="flex-1 rounded-full border border-[#d6dfd3] bg-[#fafbfa] px-4 py-2.5 text-xs outline-none focus:border-[#557153]"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[#4e674c] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#3f553d]"
                >
                  Kirim
                </button>
              </form>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f4f6f3] p-8 text-xs text-[#5d6f63]">
          Memuat Dashboard Murid...
        </div>
      }
    >
      <StudentDashboardContent />
    </Suspense>
  );
}