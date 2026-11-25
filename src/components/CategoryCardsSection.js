'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function CategoryCardsSection({ categories = [] }) {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-[#E6EDE2]/80 border-y border-[#D4E0CD] py-16 px-6 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        <div
          className={`text-center max-w-xl mx-auto mb-12 transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">
            Kategori Kelas Memasak
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {categories.map((cat, index) => (
            <article
              key={cat.slug}
              style={{
                transitionDelay: isVisible ? `${index * 110}ms` : '0ms',
              }}
              className={`group bg-white rounded-2xl p-5 border border-stone-200/80 flex flex-col justify-between
                transition-all duration-500 ease-out
                hover:-translate-y-2.5 hover:shadow-xl hover:shadow-[#4D6B4A]/15 hover:border-[#8FA88B]
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
              `}
            >
              <div>
                <span className="inline-block px-2.5 py-1 rounded-full bg-[#EEF3EB] text-[#3C553A] text-[11px] font-semibold mb-3 transition-colors duration-300 group-hover:bg-[#DCE5D5]">
                  {cat.count}
                </span>
                <h3 className="text-base font-bold text-stone-900 mb-2 transition-colors duration-300 group-hover:text-[#3C553A]">
                  {cat.title}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">{cat.summary}</p>
              </div>

              <Link
                href={`/recipes?dish_type=${cat.slug}`}
                className="mt-6 inline-flex items-center justify-center w-full py-2.5 px-3 rounded-full bg-[#4D6B4A] text-white text-xs font-semibold transition-all duration-300 group-hover:bg-[#3C553A] group-hover:shadow-md"
              >
                Lihat Daftar Resep
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}