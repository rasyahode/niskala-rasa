import Link from "next/link";

const COURSE_FORMATS = [
    {
        title: "Basic",
        badge: "Jenjang Guru",
        desc: "Dasar pengenalan rempah khas Indonesia, aroma, dan teknik sangrai atau infusi awal.",
        href: "/spices",
        cta: "Pelajari Rempah",
    },
    {
        title: "Intermediate",
        badge: "Jenjang Guru",
        desc: "Penerapan rempah Indonesia pada resep khas Indonesia maupun resep luar negeri terpilih.",
        href: "/recipes",
        cta: "Jelajahi Resep",
    },
    {
        title: "Advanced",
        badge: "Jenjang Guru",
        desc: "Pengaturan suhu, waktu sangrai, dan keseimbangan rasa manis, asam, pedas, serta pahit.",
        href: "/sessions",
        cta: "Lihat Sesi Kelas",
    },
    {
        title: "Professional",
        badge: "Jenjang Guru",
        desc: "Standar profesi pengajar dengan verifikasi CV dan lisensi keprofesionalan oleh Admin.",
        href: "/login",
        cta: "Daftar / Masuk",
    },
];

const UPCOMING_SESSIONS = [
    {
        day: "Sesi Daring",
        title: "Teknik Sangrai Kayu Manis Kerinci & Kapulaga untuk Resep Luar Negeri",
        focus: "Rasa Manis & Aromatik · Instruktur Terverifikasi",
    },
    {
        day: "Studio Makassar",
        title: "Praktik Langsung Pengolahan Rempah Khas Indonesia & Coto Makassar",
        focus: "Tatap Muka Makassar · Rempah Nusantara",
    },
    {
        day: "Sesi Daring",
        title: "Mengolah Andaliman & Pala Banda Tanpa Menghilangkan Karakter Aslinya",
        focus: "Rasa Asam & Pahit · Seleksi Resep",
    },
];

export default function HomePage() {
    return (
        <main className="mx-auto max-w-4xl px-4 py-10 space-y-12">
            <section className="space-y-5 text-center border-b pb-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
                    Niskala Rasa Cooking Course
                </p>
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                    Kursus Pengolahan Rempah Khas Indonesia
                </h1>

                <div className="mx-auto overflow-hidden rounded-xl border border-neutral-200 bg-emerald-950 text-white">
                    <div className="flex flex-col items-center justify-center px-6 py-12 text-center space-y-2 bg-gradient-to-br from-emerald-900 via-emerald-800 to-stone-800">
                        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                            Rempah Khas Indonesia · Resep Indonesia &amp; Seleksi Luar Negeri
                        </span>
                        <p className="max-w-xl text-base font-semibold sm:text-lg">
                            Mempertahankan resep khas Indonesia serta menyeleksi dan merekomendasikan resep luar
                            negeri yang memakai rempah khas asal Indonesia.
                        </p>
                    </div>
                </div>

                <div className="mx-auto max-w-2xl space-y-3 text-left text-sm leading-relaxed text-neutral-700">
                    <p>
                        Di <strong>Niskala Rasa</strong>, fokus pembelajaran diarahkan pada pengolahan{" "}
                        <strong>rempah khas Indonesia</strong> dapat bergabung melalui kelas daring maupun praktik langsung di{" "}
                        <strong>Makassar</strong>. Resep yang tersedia tetap mempertahankan{" "}
                        <strong>resep khas Indonesia</strong> dan menyeleksi{" "}
                        <strong>resep luar negeri yang menggunakan rempah khas Indonesia</strong>.
                    </p>
                    <p>
                        Peran <strong>Guest</strong>, <strong>Student</strong>, dan <strong>Admin</strong> tetap
                        berjalan seperti biasa, sementara <strong>Teacher</strong> dibagi ke empat jenjang (
                        <strong>Basic</strong>, <strong>Intermediate</strong>, <strong>Advanced</strong>, dan{" "}
                        <strong>Professional</strong>) dengan kewajiban melampirkan <strong>CV</strong> dan{" "}
                        <strong>lisensi keprofesionalan</strong> saat pendaftaran.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 pt-2">
                    <Link
                        href="/recipes"
                        className="rounded-lg bg-emerald-700 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800"
                    >
                        Browse Semua Resep
                    </Link>
                    <Link
                        href="/login"
                        className="rounded-lg border border-emerald-700 px-5 py-2.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                    >
                        Daftar Sebagai Teacher
                    </Link>
                </div>
            </section>

            <section className="space-y-5">
                <div className="text-center space-y-1">
                    <h2 className="text-2xl font-bold text-neutral-900">Empat Jenjang Pengajar</h2>
                    <p className="text-xs text-neutral-600">
                        Struktur pengajaran bertahap dengan verifikasi CV dan lisensi keprofesionalan.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {COURSE_FORMATS.map((item) => (
                        <div
                            key={item.title}
                            className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-4 space-y-4"
                        >
                        <div className="space-y-2">
                            <span className="inline-block rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                                {item.badge}
                            </span>
                            <h3 className="text-base font-bold text-neutral-900">{item.title}</h3>
                            <p className="text-xs leading-relaxed text-neutral-600">{item.desc}</p>
                        </div>

                        <Link
                            href={item.href}
                            className="text-xs font-semibold text-emerald-700 hover:underline"
                        >
                            {item.cta} →
                        </Link>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-4 border-t pt-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-neutral-900">Agenda Kelas &amp; Praktik</h2>
                    <Link href="/sessions" className="text-xs font-semibold text-emerald-700 hover:underline">
                        Lihat Jadwal Lengkap →
                    </Link>
                </div>

                <div className="divide-y rounded-xl border border-neutral-200 bg-white">
                    {UPCOMING_SESSIONS.map((sesi) => (
                        <div
                            key={sesi.title}
                            className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                        <div>
                            <span className="text-xs font-semibold text-emerald-700">{sesi.day}</span>
                            <h3 className="text-sm font-bold text-neutral-900">{sesi.title}</h3>
                        </div>
                            <span className="text-xs text-neutral-500">{sesi.focus}</span>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}

