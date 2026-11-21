import Link from "next/link";

const TEACHER_LEVELS = [
    {
        level: "Basic",
        desc: "Pengenalan rempah khas Indonesia dan teknik pengolahan dasar.",
    },
    {
        level: "Intermediate",
        desc: "Penerapan rempah Indonesia ke resep luar negeri serta masakan Nusantara.",
    },
    {
        level: "Advanced",
        desc: "Pengaturan panas sangrai, infusi, dan keseimbangan rasa rempah.",
    },
    {
        level: "Professional",
        desc: "Kurasi standar profesi, pengembangan resep, dan bimbingan praktik.",
    },
];

export default function HomePage() {
    return (
        <main className="mx-auto max-w-5xl px-4 py-12 space-y-10">
            <section className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Niskala Rasa · Kursus Pengolahan Rempah Khas Indonesia
                </p>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
                    Pengolahan Rempah Indonesia &amp; Seleksi Resep Berempah Indonesia
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-neutral-600">
                    Platform pembelajaran rempah khas asal Indonesia yang mempertahankan resep khas
                    Indonesia serta menyeleksi dan merekomendasikan resep luar negeri yang menggunakan rempah
                    khas Indonesia, dengan sesi daring maupun Studio Makassar.
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                    <Link
                        href="/spices"
                        className="rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800"
                    >
                        Rempah Khas Indonesia
                    </Link>
                    <Link
                        href="/recipes"
                        className="rounded-lg border border-emerald-700 px-4 py-2.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                    >
                        Katalog Resep
                    </Link>
                    <Link
                        href="/sessions"
                        className="rounded-lg border border-neutral-200 px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                    >
                        Jadwal Kelas
                    </Link>
                    <Link
                        href="/login"
                        className="rounded-lg border border-neutral-200 px-4 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                    >
                        Masuk / Daftar Guru
                    </Link>
                </div>
            </section>

            <section className="space-y-4">
                <div>
                    <h2 className="text-lg font-bold text-neutral-900">
                        Empat Jenjang Pengajar (Teacher)
                    </h2>
                    <p className="text-xs text-neutral-600">
                        Setiap pendaftar Teacher melengkapi jenjang, Curriculum Vitae (CV), dan lisensi
                        keprofesionalan untuk diverifikasi Admin.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {TEACHER_LEVELS.map((item) => (
                        <div
                            key={item.level}
                            className="rounded-xl border border-neutral-200 bg-white p-4 space-y-1.5"
                        >
                            <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                                {item.level}
                            </span>
                            <p className="text-xs leading-relaxed text-neutral-600">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
