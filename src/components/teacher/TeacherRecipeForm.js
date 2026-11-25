'use client';

export default function TeacherRecipeForm({ form, setForm, onSubmit, saving }) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl border border-[#DCE4D7] p-6 sm:p-8 shadow-2xs space-y-4"
    >
      <h2 className="text-xl font-extrabold text-[#2B3E29]">Tambah Materi Resep</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Judul resep"
          className="px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
        />
        <select
          value={form.dish_type}
          onChange={(e) => setForm({ ...form, dish_type: e.target.value })}
          className="px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm"
        >
          <option value="berkuah">Makanan Berkuah</option>
          <option value="tidak_berkuah">Makanan Tidak Berkuah</option>
          <option value="camilan_kering">Camilan Kering</option>
          <option value="camilan_basah">Camilan Basah</option>
          <option value="minuman">Minuman</option>
        </select>
        <input
          type="text"
          value={form.key_spice}
          onChange={(e) => setForm({ ...form, key_spice: e.target.value })}
          placeholder="Rempah utama (mis. Adas, Kapulaga)"
          className="px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
        />
        <input
          type="text"
          value={form.video_url}
          onChange={(e) => setForm({ ...form, video_url: e.target.value })}
          placeholder="URL video (opsional)"
          className="px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
        />
      </div>

      <textarea
        rows={3}
        required
        value={form.summary}
        onChange={(e) => setForm({ ...form, summary: e.target.value })}
        placeholder="Ringkasan & teknik pengolahan..."
        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
      />

      <button
        type="submit"
        disabled={saving}
        className="px-5 py-2.5 rounded-full bg-[#4D6B4A] hover:bg-[#3C553A] text-white text-sm font-bold transition disabled:opacity-50"
      >
        {saving ? 'Menyimpan...' : 'Simpan Resep'}
      </button>
    </form>
  );
}
