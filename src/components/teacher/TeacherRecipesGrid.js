'use client';

import RecipeThumbnail from '@/components/RecipeThumbnail';

export default function TeacherRecipesGrid({
  recipes = [],
  page = 1,
  totalPages = 1,
  onPageChange,
  onVideo,
  onEdit,
  onDelete,
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recipes.map((item) => (
          <article
            key={item.id}
            className="bg-white rounded-2xl border border-[#DCE4D7] overflow-hidden flex flex-col justify-between shadow-2xs"
          >
            <div>
              <RecipeThumbnail recipe={item} />
              <div className="p-5 space-y-1.5">
                <h3 className="text-base font-bold text-[#2B3E29]">{item.title}</h3>
                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">{item.summary}</p>
              </div>
            </div>

            <div className="px-5 pb-5 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onVideo(item)}
                className="px-4 py-1.5 rounded-full bg-[#4D6B4A] hover:bg-[#3C553A] text-white text-xs font-bold transition"
              >
                Video
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  className="px-3.5 py-1.5 rounded-full bg-[#EEF2EA] hover:bg-[#E1E8DC] text-[#2B3E29] text-xs font-semibold transition"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item)}
                  className="px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition"
                >
                  Hapus
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="bg-white rounded-2xl border border-[#DCE4D7] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-stone-600">
            Halaman <strong className="text-[#2B3E29]">{page}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="px-3 py-1.5 rounded-lg border border-[#DCE4D7] text-stone-700 disabled:opacity-40"
            >
              Sebelumnya
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onPageChange(num)}
                className={
                  num === page
                    ? 'w-7 h-7 rounded-lg bg-[#4D6B4A] text-white font-bold'
                    : 'w-7 h-7 rounded-lg border border-[#DCE4D7] text-stone-700 hover:bg-[#F5F7F3]'
                }
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="px-3 py-1.5 rounded-lg border border-[#DCE4D7] text-stone-700 disabled:opacity-40"
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
