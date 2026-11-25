'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const RECIPE_SLIDES = [
  {
    src: '/images/recipes/Gulai%20Kambing%20Bumbu%20Adas.png',
    caption: 'Gulai Kambing Bumbu Adas',
  },
  {
    src: '/images/recipes/Rawon%20Daging%20Sapi%20Khas%20Jawa%20Timur.jpg',
    caption: 'Rawon Daging Sapi Khas Jawa Timur',
  },
  {
    src: '/images/recipes/Soto%20Ayam%20Kuah%20Kuning%20Segar.jpg',
    caption: 'Soto Ayam Kuah Kuning Segar',
  },
  {
    src: '/images/recipes/Klepon%20Ketan%20Pandan%20Gula%20Merah.png',
    caption: 'Klepon Ketan Pandan Gula Merah',
  },
];

export default function HeroSlideshow() {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % RECIPE_SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[430px] flex items-center justify-center overflow-hidden rounded-3xl mx-4 sm:mx-8 mt-4 shadow-sm">
      {RECIPE_SLIDES.map((slide, idx) => (
        <img
          key={slide.src}
          src={slide.src}
          alt={slide.caption}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            idx === activeIdx ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-stone-950/60" />

      <div className="relative z-10 max-w-2xl text-center px-6 py-12 text-white space-y-4">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-[#E6EDE2]">
          {RECIPE_SLIDES[activeIdx]?.caption}
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          Belajar Kuliner & Rempah Nusantara
        </h1>
        <p className="text-sm sm:text-base text-stone-200 leading-relaxed">
          Kuasai teknik pengolahan, takaran bumbu, dan kelas pilihan bersama pengajar Niskala Rasa.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="px-6 py-2.5 rounded-full bg-[#4D6B4A] hover:bg-[#3C553A] text-white text-sm font-bold transition"
          >
            Daftar Sekarang
          </Link>
          <Link
            href="/login"
            className="px-6 py-2.5 rounded-full bg-white/15 hover:bg-white/25 text-white text-sm font-semibold transition"
          >
            Masuk Akun
          </Link>
        </div>

        <div className="pt-3 flex items-center justify-center gap-2">
          {RECIPE_SLIDES.map((s, i) => (
            <button
              key={s.src}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setActiveIdx(i)}
              className={`h-2 rounded-full transition-all ${
                i === activeIdx ? 'w-6 bg-white' : 'w-2 bg-white/45'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
