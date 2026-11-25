'use client';

import { useEffect, useState } from 'react';

export default function RecipeThumbnail({ recipe, badgeOverlay = null }) {
  const cleanTitle = (recipe?.title || '').trim();
  const initialSrc = recipe?.image_url
    ? recipe.image_url
    : `/images/recipes/${encodeURIComponent(cleanTitle)}.png`;

  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const start = recipe?.image_url
      ? recipe.image_url
      : `/images/recipes/${encodeURIComponent(cleanTitle)}.png`;
    setImgSrc(start);
    setAttempt(0);
  }, [recipe?.id, recipe?.image_url, cleanTitle]);

  function handleImageError() {
    if (attempt === 0) {
      // Coba ekstensi .jpg jika .png tidak ditemukan
      setAttempt(1);
      setImgSrc(`/images/recipes/${encodeURIComponent(cleanTitle)}.jpg`);
    } else if (attempt === 1) {
      // Coba penamaan berbasis nomor id jika ada
      setAttempt(2);
      setImgSrc(`/images/recipes/recipe-${recipe?.id}.jpg`);
    } else {
      // Fallback akhir jika resep baru belum memiliki foto
      setImgSrc(
        'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80'
      );
    }
  }

  return (
    <div className="relative w-full h-44 sm:h-48 overflow-hidden bg-[#E6EDE2] border-b border-stone-100 shrink-0">
      <img
        src={imgSrc}
        alt={cleanTitle}
        loading="lazy"
        onError={handleImageError}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent pointer-events-none" />
      {badgeOverlay && <div className="absolute top-3 left-3 right-3">{badgeOverlay}</div>}
    </div>
  );
}
