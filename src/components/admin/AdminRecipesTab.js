'use client';

import ScrollRevealItem from '@/components/ScrollRevealItem';
import RecipeThumbnail from '@/components/RecipeThumbnail';

export default function AdminRecipesTab({
  recipes = [],
  search = '',
  setSearch,
  filter = 'all',
  setFilter,
  onOpenVideo,
  onAskDeleteRecipe,
}) {
  const filtered = recipes.filter((r) => {
    const matchType = filter === 'all' || r.dish_type === filter;
    const q = search.trim().toLowerCase();
    const matchQuery =
      !q ||
      String(r.title || '').toLowerCase().includes(q) ||
      String(r.key_spice || '').toLowerCase().includes(q);
    return matchType && matchQuery;
  });

  return (
    <div className="space-y-5">
      <div className="bg-white p-5 rounded-2xl border border-[#DCE4D7] flex flex-col sm:flex-row gap-3 shadow-2xs">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari judul atau rempah resep..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-[#4D6B4A]"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-sm font-semibold text-stone-700"
        >
          <option value="all">Semua Kategori</option>
          <option value="berkuah">Makanan Berkuah</option>
          <option value="tidak_berkuah">Makanan Tidak Berkuah</option>
          <option value="camilan_kering">Camilan Kering</option>
          <option value="camilan_basah">Camilan Basah</option>
          <option value="minuman">Minuman</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#DCE4D7] p-8 text-center">
          <p className="text-sm font-semibold text-stone-600">
            Tidak ada materi resep yang sesuai dengan filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((lesson, idx) => (
            <ScrollRevealItem key={lesson.id} delay={(idx % 3) * 50}>
              <article className="bg-white rounded-2xl border border-[#DCE4D7] overflow-hidden flex flex-col justify-between h-full shadow-2xs">
                <div>
                  <RecipeThumbnail recipe={lesson} />
                  <div className="p-5">
                    <h4 className="text-base font-bold text-stone-900">{lesson.title}</h4>
                    <p className="text-xs text-stone-600 mt-1.5 line-clamp-2">{lesson.summary}</p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenVideo(lesson)}
                    className="px-3.5 py-2 rounded-full bg-[#4D6B4A] hover:bg-[#3C553A] text-white text-xs font-bold transition"
                  >
                    Lihat Video
                  </button>
                  <button
                    type="button"
                    onClick={() => onAskDeleteRecipe(lesson)}
                    className="px-3.5 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition"
                  >
                    Hapus
                  </button>
                </div>
              </article>
            </ScrollRevealItem>
          ))}
        </div>
      )}
    </div>
  );
}
