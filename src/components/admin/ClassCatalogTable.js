'use client';

export default function ClassCatalogTable({ classes, onAskDelete }) {
  return (
    <div className="bg-white rounded-2xl border border-[#DCE4D7] p-6 space-y-4 shadow-2xs">
      <h2 className="text-lg font-bold text-[#2B3E29]">Daftar Kelas ({classes.length})</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-xs uppercase text-stone-500 bg-[#F5F7F3]">
              <th className="py-3 px-4 rounded-tl-xl">Judul</th>
              <th className="py-3 px-4">Kategori</th>
              <th className="py-3 px-4">Modul</th>
              <th className="py-3 px-4 rounded-tr-xl">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {classes.map((item) => (
              <tr key={item.id} className="hover:bg-[#F5F7F3]">
                <td className="py-3 px-4 font-bold text-stone-900">{item.title}</td>
                <td className="py-3 px-4 text-stone-700">{item.category_name}</td>
                <td className="py-3 px-4 text-[#2B3E29] font-semibold">{item.total_lessons}</td>
                <td className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => onAskDelete(item)}
                    className="px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
