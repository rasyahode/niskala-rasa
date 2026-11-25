'use client';

export default function AdminUsersAndClasses({
  activeNav,
  pendingUsers = [],
  classesList = [],
  teachersList = [],
  studentsList = [],
  newClass,
  setNewClass,
  onVerify,
  onCreateClass,
  onAskDeleteClass,
  onAskDeleteUser,
}) {
  if (activeNav === 'verifications') {
    return (
      <section className="bg-white rounded-2xl border border-[#DCE4D7] p-6 sm:p-8 shadow-2xs space-y-5">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-stone-900">
            Verifikasi Pendaftaran Anggota ({pendingUsers.length} Menunggu)
          </h3>
          <p className="text-sm text-stone-600 mt-0.5">
            Tinjau dan setujui pendaftaran akun baru untuk Murid maupun Pengajar.
          </p>
        </div>

        {pendingUsers.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#F5F7F3] border border-[#DCE4D7] text-center">
            <p className="text-sm font-semibold text-stone-600">
              Tidak ada pengajuan pendaftaran akun baru yang menunggu verifikasi saat ini.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((pUser) => (
              <div
                key={pUser.id}
                className="p-5 rounded-2xl bg-[#F5F7F3] border border-[#DCE4D7] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-stone-900">{pUser.full_name}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E6EDE2] text-[#2B3E29] uppercase">
                      {pUser.role}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600">{pUser.email}</p>
                  {pUser.role === 'teacher' && (
                    <div className="pt-2 space-y-1 text-xs sm:text-sm text-stone-700 bg-white p-3.5 rounded-xl border border-[#DCE4D7] mt-2">
                      <p><strong>Spesialisasi:</strong> {pUser.specialization || '-'}</p>
                      <p><strong>Sertifikasi Koki:</strong> {pUser.certification_info || '-'}</p>
                      <p><strong>Ringkasan CV:</strong> {pUser.cv_summary || '-'}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onVerify(pUser.id, 'approve')}
                    className="px-4 py-2 rounded-full bg-[#4D6B4A] hover:bg-[#3C553A] text-white text-xs sm:text-sm font-bold transition"
                  >
                    Setujui
                  </button>
                  <button
                    type="button"
                    onClick={() => onVerify(pUser.id, 'reject')}
                    className="px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs sm:text-sm font-bold transition"
                  >
                    Tolak
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  }

  if (activeNav === 'classes') {
    return (
      <section className="bg-white rounded-2xl border border-[#DCE4D7] p-6 sm:p-8 shadow-2xs space-y-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-stone-900">
            Kategori Kelas Kursus ({classesList.length})
          </h3>
          <p className="text-sm text-stone-600 mt-0.5">
            Kelola kategori kelas kuliner dan tetapkan pengajar yang mengampu.
          </p>
        </div>

        <form
          onSubmit={onCreateClass}
          className="p-5 rounded-2xl bg-[#F5F7F3] border border-[#DCE4D7] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3"
        >
          <input
            type="text"
            required
            value={newClass.title}
            onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
            placeholder="Nama Kelas..."
            className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-sm"
          />
          <input
            type="text"
            required
            value={newClass.category_name}
            onChange={(e) => setNewClass({ ...newClass, category_name: e.target.value })}
            placeholder="Kategori..."
            className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-sm"
          />
          <input
            type="text"
            value={newClass.description}
            onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
            placeholder="Deskripsi singkat..."
            className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-sm"
          />
          <select
            value={newClass.teacher_id}
            onChange={(e) => setNewClass({ ...newClass, teacher_id: e.target.value })}
            className="px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-sm"
          >
            <option value="">Pilih Pengajar...</option>
            {teachersList.map((t) => (
              <option key={t.id} value={t.id}>{t.full_name}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={newClass.total_lessons}
              onChange={(e) => setNewClass({ ...newClass, total_lessons: e.target.value })}
              className="w-20 px-3 py-2 rounded-xl border border-stone-300 bg-white text-sm"
            />
            <button
              type="submit"
              className="flex-1 py-2 px-4 rounded-xl bg-[#4D6B4A] hover:bg-[#3C553A] text-white text-sm font-bold transition"
            >
              Tambah
            </button>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-xs uppercase text-stone-500 bg-[#F5F7F3]">
                <th className="py-3.5 px-4 rounded-tl-xl">Nama Kelas</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Pengajar</th>
                <th className="py-3.5 px-4">Materi</th>
                <th className="py-3.5 px-4 rounded-tr-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {classesList.map((cls) => (
                <tr key={cls.id} className="hover:bg-[#F5F7F3]">
                  <td className="py-3.5 px-4 font-bold text-stone-900">{cls.title}</td>
                  <td className="py-3.5 px-4 text-stone-700">{cls.category_name}</td>
                  <td className="py-3.5 px-4 text-stone-600">{cls.teacher_name || '-'}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#2B3E29]">{cls.total_lessons} Modul</td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => onAskDeleteClass(cls)}
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
      </section>
    );
  }

  const isTeachers = activeNav === 'teachers';
  const list = isTeachers ? teachersList : studentsList;

  return (
    <section className="bg-white rounded-2xl border border-[#DCE4D7] p-6 sm:p-8 shadow-2xs space-y-5">
      <div>
        <h3 className="text-xl sm:text-2xl font-bold text-stone-900">
          {isTeachers ? `Daftar Pengajar (${list.length})` : `Daftar Murid (${list.length})`}
        </h3>
        <p className="text-sm text-stone-600 mt-0.5">
          {isTeachers
            ? 'Pengajar yang terdaftar dan kategori spesialisasi masing-masing.'
            : 'Peserta didik aktif pada platform kursus kuliner.'}
        </p>
      </div>

      {list.length === 0 ? (
        <p className="text-sm text-stone-500">
          {isTeachers ? 'Belum ada data pengajar terdaftar.' : 'Belum ada data murid terdaftar.'}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-xs uppercase text-stone-500 bg-[#F5F7F3]">
                <th className="py-3.5 px-4 rounded-tl-xl">Nama</th>
                <th className="py-3.5 px-4">Email</th>
                {isTeachers && <th className="py-3.5 px-4">Spesialisasi</th>}
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 rounded-tr-xl">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {list.map((item) => (
                <tr key={item.id} className="hover:bg-[#F5F7F3]">
                  <td className="py-3.5 px-4 font-bold text-stone-900">{item.full_name}</td>
                  <td className="py-3.5 px-4 text-stone-600">{item.email}</td>
                  {isTeachers && <td className="py-3.5 px-4 text-stone-700">{item.specialization || '-'}</td>}
                  <td className="py-3.5 px-4">
                    <span className="px-3 py-1 rounded-full bg-[#EEF3EB] text-[#2B3E29] text-xs font-bold">
                      {item.status || 'approved'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => onAskDeleteUser(item, isTeachers ? 'Pengajar' : 'Murid')}
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
      )}
    </section>
  );
}
