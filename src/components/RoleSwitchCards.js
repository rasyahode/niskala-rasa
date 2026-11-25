'use client';

import Link from 'next/link';

const ROLES = [
  {
    role: 'student',
    title: 'Dashboard Murid',
    desc: 'Akses kelas kursus, gabung kelas, dan pelajari materi resep.',
    href: '/dashboard/student',
  },
  {
    role: 'teacher',
    title: 'Dashboard Pengajar',
    desc: 'Kelola materi resep, kelas diampu, dan pantau pembelajaran.',
    href: '/dashboard/teacher',
  },
  {
    role: 'admin',
    title: 'Dashboard Administrator',
    desc: 'Verifikasi akun, atur kategori kelas, pengguna, dan katalog.',
    href: '/dashboard/admin',
  },
];

export default function RoleSwitchCards({ activeRole = '' }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {ROLES.map((item) => {
        const isCurrent = activeRole === item.role;
        return (
          <div
            key={item.role}
            className="bg-white rounded-2xl border border-[#DCE4D7] p-6 flex flex-col justify-between space-y-4 shadow-2xs"
          >
            <div className="space-y-1.5">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EEF3EB] text-[#2B3E29] uppercase">
                {item.role}
              </span>
              <h2 className="text-lg font-extrabold text-[#2B3E29]">{item.title}</h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{item.desc}</p>
            </div>

            <Link
              href={item.href}
              className="inline-flex items-center justify-center py-2.5 px-4 rounded-full bg-[#4D6B4A] hover:bg-[#3C553A] text-white text-xs sm:text-sm font-bold transition"
            >
              {isCurrent ? 'Masuk ke Dashboard Anda' : 'Buka Halaman'}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
