'use client';

import { useRouter } from 'next/navigation';

export default function AdminSidebar({
  user,
  activeTab,
  onSelectTab,
  counts = {
    verifications: 0,
    classes: 0,
    teachers: 0,
    students: 0,
    recipes: 0,
  },
}) {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem('niskala_user');
    router.replace('/login');
  }

  const navItems = [
    { key: 'verifications', label: 'Verifikasi Pendaftaran', badge: `${counts.verifications}` },
    { key: 'classes', label: 'Kategori Kelas Kursus', badge: `${counts.classes}` },
    { key: 'teachers', label: 'Daftar Pengajar', badge: `${counts.teachers}` },
    { key: 'students', label: 'Daftar Murid', badge: `${counts.students}` },
    { key: 'recipes', label: 'Semua Materi Resep', badge: `${counts.recipes}` },
  ];

  return (
    <aside className="w-full md:w-72 md:sticky md:top-0 md:h-screen overflow-y-auto bg-[#4D6B4A] text-white flex flex-col justify-between py-8 pl-5 pr-0 shrink-0 shadow-lg z-20">
      <div>
        <div className="pr-5 mb-8">
          <p className="text-xs uppercase tracking-widest text-[#DCE5D5] font-semibold">
            Administrator Sistem
          </p>
          <h1 className="text-2xl font-bold mt-1">Niskala Rasa</h1>
          <p className="text-sm text-[#E6EDE2]/90 mt-1 truncate">{user?.full_name}</p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectTab(item.key)}
                className={
                  isActive
                    ? 'w-full flex items-center justify-between px-4 py-3.5 rounded-l-3xl bg-[#F5F7F3] text-[#2B3E29] font-bold text-base transition-all shadow-xs'
                    : 'w-full flex items-center justify-between px-4 py-3.5 rounded-l-3xl text-[#E6EDE2] hover:bg-white/10 font-medium text-base transition-all'
                }
              >
                <span>{item.label}</span>
                <span
                  className={
                    isActive
                      ? 'px-2.5 py-0.5 rounded-full text-xs bg-[#4D6B4A] text-white'
                      : 'px-2.5 py-0.5 rounded-full text-xs bg-white/15 text-white'
                  }
                >
                  {item.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="pr-5 pt-6">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-3 rounded-full bg-white/15 hover:bg-rose-600/80 text-white text-sm font-semibold transition"
        >
          Keluar Akun
        </button>
      </div>
    </aside>
  );
}