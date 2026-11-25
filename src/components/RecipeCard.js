'use client';

const CATEGORY_BADGES = {
  berkuah: 'Makanan Berkuah',
  tidak_berkuah: 'Makanan Tidak Berkuah',
  camilan_kering: 'Camilan Kering',
  minuman: 'Minuman',
  camilan_basah: 'Camilan Basah',
};

export default function RecipeCard({ recipe, isLoggedIn, onSelect }) {
  return (
    <article className="group bg-white rounded-2xl border border-stone-200 p-5 flex flex-col justify-between transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl hover:shadow-[#4D6B4A]/15 hover:border-[#8FA88B]">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EEF3EB] text-[#3C553A] group-hover:bg-[#DCE5D5] transition-colors">
            {CATEGORY_BADGES[recipe.dish_type] || recipe.dish_type}
          </span>
          {recipe.portion_estimate && (
            <span className="text-[11px] text-stone-500">{recipe.portion_estimate}</span>
          )}
        </div>

        <h2 className="text-lg font-bold text-stone-900 mb-2 group-hover:text-[#3C553A] transition-colors">
          {recipe.title}
        </h2>
        <p className="text-sm text-stone-600 mb-4 leading-relaxed">{recipe.summary}</p>
      </div>

      <button
        type="button"
        onClick={() => onSelect(recipe)}
        className="w-full py-2.5 px-4 rounded-full bg-[#4D6B4A] text-white text-xs font-semibold hover:bg-[#3C553A] transition"
      >
        {isLoggedIn ? 'Lihat Resep & Cara Memasak' : 'Daftar Murid untuk Lihat Resep'}
      </button>
    </article>
  );
}