'use client';

export default function AboutSection() {
  const highlights = [
    {
      title: 'Kelas Kursus Terstruktur',
      desc: 'Ikuti kelas kuliner berdasarkan kategori dan tingkatan materi yang dipandu langsung oleh pengajar.',
    },
    {
      title: 'Resep & Bahan Kunci',
      desc: 'Setiap resep dilengkapi takaran bahan, bahan masakan kunci, teknik pengolahan, dan langkah memasak yang jelas untuk pembelajaran murid.',
    },
    {
      title: 'Progres Belajar Terpantau',
      desc: 'Murid dapat bergabung ke kelas, mengakses materi pembelajaran, serta menandai materi yang sudah selesai dipelajari.',
    },
  ];

  return (
    <section
      id="tentang"
      className="max-w-6xl mx-auto px-4 sm:px-8 pt-10 pb-2"
    >
      <div className="bg-white rounded-3xl border border-[#DCE4D7] p-6 sm:p-10 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <img
            src="/images/logo niskala rasa.jpg"
            alt="Logo Profil Niskala Rasa"
            className="h-20 w-20 shrink-0 rounded-2xl border border-[#DCE4D7] object-cover shadow-2xs"
          />
          <div className="max-w-3xl space-y-2.5">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#EEF2EA] text-[#4D6B4A]">
              Tentang Niskala Rasa
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2B3E29] tracking-tight leading-snug">
              Ruang Pembelajaran Kelas Kuliner & Resep Masakan Praktis
            </h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
              <strong>Niskala Rasa</strong> adalah platform kursus kuliner yang membantu murid
              mempelajari berbagai jenis hidangan mulai dari makanan berkuah, lauk tidak berkuah,
              camilan kering, camilan basah, hingga minuman. Setiap materi resep menyajikan takaran
              bahan, bahan masakan kunci, teknik dapur, dan panduan langkah demi langkah secara runtut.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {highlights.map((item) => (
            <div
              key={item.title}
              className="p-5 rounded-2xl bg-[#F5F7F3] border border-[#DCE4D7] space-y-1.5"
            >
              <h3 className="text-base font-bold text-[#2B3E29]">{item.title}</h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
