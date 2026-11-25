'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams?.get('tab') || 'overview';

  const [user, setUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [classes, setClasses] = useState([]);
  const [recipes, setRecipes] = useState([]);

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

  const adminName = user?.name || user?.full_name || 'Administrator Niskala';
  const adminEmail = user?.email || 'admin@niskalarasa.id';
  const initialLetter = String(adminName).charAt(0).toUpperCase() || 'A';

  useEffect(() => {
    let active = true;

    async function loadAdminData() {
      try {
        const resUsers = await fetch('/api/users', { cache: 'no-store' });
        if (resUsers.ok) {
          const dataUsers = await resUsers.json();
          const list = Array.isArray(dataUsers?.users)
            ? dataUsers.users
            : Array.isArray(dataUsers)
              ? dataUsers
              : [];
          if (active) setUsersList(list);
        }
      } catch {
        // Abaikan bila endpoint /api/users tidak tersedia
      }

      try {
        const resCls = await fetch('/api/classes', { cache: 'no-store' });
        if (resCls.ok) {
          const dataCls = await resCls.json();
          const list = Array.isArray(dataCls?.classes)
            ? dataCls.classes
            : Array.isArray(dataCls)
              ? dataCls
              : [];
          if (active) setClasses(list);
        }
      } catch {
        // Abaikan bila API gagal
      }

      try {
        const resRec = await fetch('/api/recipes', { cache: 'no-store' });
        if (resRec.ok) {
          const dataRec = await resRec.json();
          const list = Array.isArray(dataRec?.recipes)
            ? dataRec.recipes
            : Array.isArray(dataRec)
              ? dataRec
              : [];
          if (active) setRecipes(list);
        }
      } catch {
        // Abaikan bila API gagal
      }
    }

    loadAdminData();
    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    setUser(null);

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Abaikan bila endpoint tidak tersedia
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
    { key: 'overview', label: 'Ringkasan Sistem' },
    { key: 'users', label: 'Data Pengguna' },
    { key: 'classes', label: 'Daftar Kelas' },
    { key: 'recipes', label: 'Arsip Resep' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6f3] text-[#1e2923]">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:px-10 lg:py-10">
        {/* Sidebar Portal Admin (Sticky) */}
        <aside className="w-full shrink-0 lg:sticky lg:top-24 lg:w-68 lg:self-start">
          <div className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs">
            <div className="flex items-center gap-3 pb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eef3ec] text-xs font-bold text-[#465e44]">
                NR
              </div>
              <div>
                <p className="text-sm font-bold text-[#1a2820]">Niskala Rasa</p>
                <p className="text-[10px] font-bold tracking-wider text-[#557153] uppercase">
                  PORTAL ADMIN
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#e3eae1] bg-[#f8faf7] p-4 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#4e674c] text-sm font-bold text-white">
                {initialLetter}
              </div>
              <p className="mt-2.5 truncate text-xs font-bold text-[#1a2820]">
                {adminName}
              </p>
              <p className="mt-0.5 truncate text-[11px] text-[#5d6f63]">
                {adminEmail}
              </p>
            </div>

            <nav className="mt-5 space-y-1.5">
              {navItems.map((item) => {
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => router.push(`/admin?tab=${item.key}`)}
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
              Dashboard Administrator
            </h1>
            <p className="mt-1.5 text-xs text-[#5d6f63]">
              Selamat datang, {adminName}. Pantau seluruh aktivitas akademik
              Niskala Rasa.
            </p>
          </section>

          {activeTab === 'overview' && (
            <section className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8">
              <h2 className="text-lg font-bold text-[#1a2820]">
                Ringkasan Data Platform
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#e3eae1] bg-[#f9fbf8] p-6">
                  <p className="text-xs font-semibold text-[#5d6f63]">
                    Total Pengguna
                  </p>
                  <p className="mt-1.5 text-2xl font-bold text-[#1a2820]">
                    {usersList.length} Akun
                  </p>
                </div>
                <div className="rounded-2xl border border-[#e3eae1] bg-[#f9fbf8] p-6">
                  <p className="text-xs font-semibold text-[#5d6f63]">
                    Total Kelas Aktif
                  </p>
                  <p className="mt-1.5 text-2xl font-bold text-[#1a2820]">
                    {classes.length} Kelas
                  </p>
                </div>
                <div className="rounded-2xl border border-[#e3eae1] bg-[#f9fbf8] p-6">
                  <p className="text-xs font-semibold text-[#5d6f63]">
                    Total Koleksi Resep
                  </p>
                  <p className="mt-1.5 text-2xl font-bold text-[#1a2820]">
                    {recipes.length} Resep
                  </p>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'users' && (
            <section className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8">
              <h2 className="text-lg font-bold text-[#1a2820]">
                Daftar Pengguna ({usersList.length})
              </h2>
              {usersList.length === 0 ? (
                <p className="mt-4 text-xs text-[#5d6f63]">
                  Data pengguna dimuat dari basis data autentikasi.
                </p>
              ) : (
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {usersList.map((u, idx) => (
                    <div
                      key={u.id ?? idx}
                      className="rounded-2xl border border-[#e3eae1] bg-[#fafbf9] p-5"
                    >
                      <p className="text-[10px] font-bold text-[#557153] uppercase">
                        {u.role || 'student'}
                      </p>
                      <p className="mt-1 text-sm font-bold text-[#1a2820]">
                        {u.name || u.full_name || u.email}
                      </p>
                      <p className="mt-0.5 text-xs text-[#5d6f63]">{u.email}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'classes' && (
            <section className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8">
              <h2 className="text-lg font-bold text-[#1a2820]">
                Semua Kelas Kuliner ({classes.length})
              </h2>
              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    className="rounded-2xl border border-[#e3eae1] bg-[#fafbf9] p-6"
                  >
                    <p className="text-[11px] font-bold text-[#557153] uppercase">
                      {cls.category_name || cls.dish_type || 'Kelas Kuliner'}
                    </p>
                    <h3 className="mt-1.5 text-base font-bold text-[#1a2820]">
                      {cls.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-[#5d6f63]">
                      Pengajar: {cls.teacher_name || 'Pengajar Niskala Rasa'}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'recipes' && (
            <section className="rounded-3xl border border-[#e3eae1] bg-white p-6 shadow-2xs sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-[#1a2820]">
                  Arsip Resep Nusantara ({recipes.length})
                </h2>
                <Link
                  href="/recipes"
                  className="rounded-full bg-[#4e674c] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#3f553d]"
                >
                  Buka Katalog Resep
                </Link>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {recipes.slice(0, 10).map((r) => (
                  <div
                    key={r.id}
                    className="rounded-2xl border border-[#e3eae1] bg-[#fafbf9] p-5"
                  >
                    <p className="text-[10px] font-bold text-[#557153] uppercase">
                      {r.category_name || r.dish_type}
                    </p>
                    <h3 className="mt-1 text-sm font-bold text-[#1a2820]">
                      {r.title}
                    </h3>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f4f6f3] p-8 text-xs text-[#5d6f63]">
          Memuat Dashboard Admin...
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}