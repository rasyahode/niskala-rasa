'use client';

export default function ClassFormCard({ form, setForm, teachers, onSubmit, submitting }) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-2xl border border-[#DCE4D7] p-6 space-y-4 shadow-2xs"
    >
      <h2 className="text-lg font-bold text-[#2B3E29]">Form Kelas Kursus</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Judul kelas"
          className="px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
        />
        <input
          type="text"
          required
          value={form.category_name}
          onChange={(e) => setForm({ ...form, category_name: e.target.value })}
          placeholder="Kategori kelas"
          className="px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
        />
        <select
          value={form.teacher_id}
          onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
          className="px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm"
        >
          <option value="">Pilih Pengajar</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.full_name}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={1}
          value={form.total_lessons}
          onChange={(e) => setForm({ ...form, total_lessons: e.target.value })}
          placeholder="Jumlah modul"
          className="px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
        />
      </div>

      <textarea
        rows={3}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Deskripsi kelas..."
        className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
      />

      <button
        type="submit"
        disabled={submitting}
        className="px-5 py-2.5 rounded-full bg-[#4D6B4A] hover:bg-[#3C553A] text-white text-sm font-bold transition disabled:opacity-50"
      >
        {submitting ? 'Menyimpan...' : 'Simpan Kelas'}
      </button>
    </form>
  );
}
