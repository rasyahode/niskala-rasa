'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/dashboard')) {
    return null;
  }

  return (
    <footer className="bg-[#2B3E29] text-[#E6EDE2] border-t border-[#3C553A]">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
        <div className="flex items-start gap-3">
          <img
            src="/images/logo niskala rasa.jpg"
            alt="Logo Niskala Rasa"
            className="h-10 w-10 shrink-0 rounded-xl border border-white/20 object-cover"
          />
          <div className="leading-tight">
            <p className="text-lg font-extrabold text-[#A8C9A3]">Niskala</p>
            <p className="text-lg font-extrabold text-white">Rasa</p>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-[#A8C9A3] mb-3">
            Tentang Niskala Rasa
          </h3>
          <ul className="space-y-2 text-xs text-[#DCE5D5]">
            <li>
              <Link href="/" className="hover:text-white transition">
                Beranda
              </Link>
            </li>
            <li>
              <Link href="/#tentang" className="hover:text-white transition">
                Tentang Kami
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-white transition">
                Bergabung
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold text-[#A8C9A3] mb-3">Belajar</h3>
          <ul className="space-y-2 text-xs text-[#DCE5D5]">
            <li>
              <Link href="/recipes" className="hover:text-white transition">
                Katalog Resep
              </Link>
            </li>
            <li>
              <Link href="/classes" className="hover:text-white transition">
                Jelajah Kelas
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/student"
                className="hover:text-white transition"
              >
                Ruang Belajar
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold text-[#A8C9A3] mb-3">Mengajar</h3>
          <ul className="space-y-2 text-xs text-[#DCE5D5]">
            <li>
              <Link href="/register" className="hover:text-white transition">
                Daftar Jadi Pengajar
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/teacher"
                className="hover:text-white transition"
              >
                Dashboard Pengajar
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold text-[#A8C9A3] mb-3">
            Kategori Kursus
          </h3>
          <p className="text-xs text-[#DCE5D5]/90 leading-relaxed">
            Makanan Berkuah, Tidak Berkuah, Camilan Kering, Camilan Basah, dan
            Minuman Tradisional Nusantara.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-[11px] font-medium text-[#A8C9A3]">
        © {new Date().getFullYear()} Niskala Rasa by Rasyah Azizah Ode
      </div>
    </footer>
  );
}