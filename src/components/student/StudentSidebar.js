'use client';

export default function StudentSidebar({ user, activeTab, onSelectTab, counts, onLogout }) {
  const menus = [
    { key: 'classes', label: 'Kelas Kursus', badge: counts.classes },
    { key: 'recipes', label: 'Materi Resep', badge: counts.recipes },
    { key: 'profile', label: 'Profil Saya' },
  ];

  return (
    <aside className="w-full md:w-64 md:sticky md:top-0 md:h-screen overflow-y-auto bg-[#EEF2EA] border-b md:border-b-0 md:border-r border-[#DCE4D7] p-6 flex flex-col justify-between shrink-0 z-20">
      <div className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-wider font-bold text-[#4D6B4A]">Portal Murid</p>
          <h2 className="text-lg font-extrabold text-[#2B3E29] mt-1 truncate">{user?.full_name}</h2>
          <p className="text-xs text-stone-600 truncate">{user?.email}</p>
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
                    : 'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-stone-600 hover:bg-white/60 hover:text-[#2B3E29] font-medium text-sm transition'
                }
              >
                <span>{m.label}</span>
                {typeof m.badge === 'number' && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#E6EDE2] text-[#2B3E29]">
                    {m.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="mt-6 w-full py-2.5 px-4 rounded-xl bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-700 border border-[#DCE4D7] hover:border-rose-200 text-xs sm:text-sm font-semibold transition"
      >
        Keluar Akun
      </button>
    </aside>
  );
}
