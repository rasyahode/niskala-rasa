'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function readActiveUserFromBrowser() {
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
      if (parsed && (parsed.email || parsed.role)) {
        const role = String(parsed.role || 'guest').toLowerCase().trim();
        if (role !== 'guest' && role !== 'public') {
          return parsed;
        }
      }
    }
  } catch {
    // Abaikan error parsing cookie
  }

  try {
    const storageKeys = ['niskala_user', 'user', 'currentUser', 'niskala_auth'];
    for (const key of storageKeys) {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const candidate = parsed?.user || parsed;
      if (candidate && (candidate.email || candidate.role)) {
        const role = String(candidate.role || 'guest').toLowerCase().trim();
        if (role !== 'guest' && role !== 'public') {
          return candidate;
        }
      }
    }
  } catch {
    // Abaikan error storage
  }

  return null;
}

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(readActiveUserFromBrowser());
  }, [pathname]);

  async function handleLogout() {
    setUser(null);

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Abaikan bila endpoint logout tidak tersedia
    }

    const cookiesToClear = [
      'niskala_user',
      'niskala_token',
      'token',
      'session',
      'auth_token',
    ];
    cookiesToClear.forEach((name) => {
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

  const role = String(user?.role || 'guest').toLowerCase().trim();
  const isLoggedIn = Boolean(user && role !== 'guest' && role !== 'public');

  const dashboardHref =
    role === 'admin'
      ? '/dashboard/admin'
      : role === 'teacher'
        ? '/dashboard/teacher'
        : '/dashboard/student';

  const dashboardLabel =
    role === 'admin'
      ? 'Dashboard Admin'
      : role === 'teacher'
        ? 'Dashboard Pengajar'
        : 'Ruang Belajar';

  const isHomeActive = pathname === '/';
  const isRecipesActive =
    pathname === '/recipes' || pathname?.startsWith('/recipes/');
  const isDashboardActive =
    pathname === dashboardHref || pathname?.startsWith('/dashboard/');

  return (
    <header className="sticky top-0 z-40 border-b border-[#e3eae1] bg-white/95 backdrop-blur-xs">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/images/logo niskala rasa.jpg"
            alt="Logo Niskala Rasa"
            className="h-8 w-8 rounded-full border border-[#d6dfd3] object-cover"
          />
          <span className="text-base font-bold tracking-tight text-[#1a2820]">
            Niskala Rasa
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#3b4f42]">
          <Link
            href="/"
            className={`py-1 transition-colors hover:text-[#557153] ${
              isHomeActive
                ? 'border-b-2 border-[#557153] text-[#1a2820]'
                : ''
            }`}
          >
            Beranda
          </Link>
          <Link
            href="/recipes"
            className={`py-1 transition-colors hover:text-[#557153] ${
              isRecipesActive
                ? 'border-b-2 border-[#557153] text-[#1a2820]'
                : ''
            }`}
          >
            Katalog Resep
          </Link>

          {isLoggedIn ? (
            <>
              <Link
                href={dashboardHref}
                className={`py-1 transition-colors hover:text-[#557153] ${
                  isDashboardActive
                    ? 'border-b-2 border-[#557153] text-[#1a2820]'
                    : ''
                }`}
              >
                {dashboardLabel}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-[#d6dfd3] bg-[#f8faf7] px-3.5 py-1.5 text-xs font-semibold text-[#2d4034] transition-colors hover:bg-[#eef3ec]"
              >
                Keluar
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-[#557153] px-4 py-2 text-white transition-colors hover:bg-[#465e44]"
            >
              Masuk / Daftar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}