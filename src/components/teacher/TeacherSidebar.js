'use client';

export default function TeacherSidebar({ user, activeTab, onSelectTab, counts, onLogout }) {
  const menus = [
    { key: 'profile', label: 'Profil' },
    { key: 'home', label: 'Home', badge: counts.home },
    { key: 'recipes', label: 'Kelola Resep', badge: counts.recipes },
    { key: 'students', label: 'Daftar Murid', badge: counts.students },
  ];

  return (
    <aside className="w-full lg:w-64 lg:sticky lg:top-0 lg:h-screen overflow-y-auto bg-[#EEF2EA] border-b lg:border-b-0 lg:border-r border-[#DCE4D7] p-6 flex flex-col justify-between shrink-0 z-20">
      <div className="space-y-6">
        <div>
          <span className="text-lg font-extrabold text-[#2B3E29] block leading-none">Niskala Rasa</span>
          <span className="text-xs font-medium text-[#4D6B4A]">Ruang Pengajar</span>
        </div>

        <div className="flex flex-col items-center text-center pb-5 border-b border-[#DCE4D7]">
          <div className="w-16 h-16 rounded-full bg-[#2F3E2E] text-white text-xl font-bold flex items-center justify-center ring-4 ring-white">
            {user?.full_name?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <h2 className="text-sm font-bold text-[#2B3E29] mt-3 line-clamp-1">{user?.full_name}</h2>
          <p className="text-xs text-[#4D6B4A] mt-0.5">{user?.specialization || 'Makanan Berkuah'}</p>
        </div>

        <nav className="space-y-1.5">
          {menus.map((m) => {
            const active = activeTab === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => onSelectTab(m.key)}
                className={
                  active
                    ? 'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white text-[#2B3E29] font-bold text-sm border border-[#DCE4D7] shadow-2xs transition'
                    : 'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-stone-600 hover:bg-white/60 text-sm font-medium transition'
                }
              >
                <span>{m.label}</span>
                {typeof m.badge === 'number' && (
                  <span className="text-xs font-bold text-[#4D6B4A]">{m.badge}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="mt-6 w-full py-2.5 px-4 rounded-xl bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-700 border border-[#DCE4D7] text-xs font-semibold transition"
      >
        Keluar Akun
      </button>
    </aside>
  );
}