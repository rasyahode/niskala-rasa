'use client';

export default function StudentClassesSection({
  classes,
  enrolledIds,
  joiningId,
  onJoinClass,
  onOpenRecipes,
}) {
  return (
    <section className="bg-white rounded-2xl border border-[#DCE4D7] p-6 sm:p-8 shadow-2xs space-y-5">
      <div>
        <h2 className="text-xl font-extrabold text-[#2B3E29]">Kelas Kursus Tersedia ({classes.length})</h2>
        <p className="text-sm text-stone-600 mt-0.5">
          Bergabung ke kelas untuk mengikuti pembelajaran dan membuka materi resep.
        </p>
      </div>

      {classes.length === 0 ? (
        <p className="text-sm text-stone-500">Belum ada kelas tersedia saat ini.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((cls) => {
            const isEnrolled = enrolledIds.includes(Number(cls.id));
            const count = Number(cls.student_count ?? cls.enrolled_count ?? cls.students_count ?? 0);

            return (
              <div
                key={cls.id}
                className="p-5 rounded-2xl bg-[#F5F7F3] border border-[#DCE4D7] flex flex-col justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#4D6B4A]">{cls.category_name || 'Kelas'}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E6EDE2] text-[#2B3E29]">
                      {count} Murid
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-stone-900">{cls.title}</h3>
                  <p className="text-xs text-stone-600 line-clamp-2">{cls.description || '-'}</p>
                  <p className="text-xs text-stone-500">Pengajar: {cls.teacher_name || '-'}</p>
                </div>

                <div className="flex items-center gap-2">
                  {isEnrolled ? (
                    <button
                      type="button"
                      onClick={onOpenRecipes}
                      className="px-4 py-2 rounded-full bg-[#2B3E29] hover:bg-[#1E2C1D] text-white text-xs font-bold transition"
                    >
                      Terdaftar • Lihat Resep
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={joiningId === cls.id}
                      onClick={() => onJoinClass(cls)}
                      className="px-4 py-2 rounded-full bg-[#4D6B4A] hover:bg-[#3C553A] text-white text-xs font-bold transition disabled:opacity-50"
                    >
                      {joiningId === cls.id ? 'Bergabung...' : 'Gabung Kelas'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
