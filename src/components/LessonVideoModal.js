'use client';

function getEmbedUrl(url = '') {
  const clean = String(url || '').trim();
  if (!clean) return '';
  const watchMatch = clean.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (watchMatch?.[1]) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  return '';
}

export default function LessonVideoModal({
  lesson,
  isDone = false,
  canMarkDone = false,
  onToggleDone,
  onClose,
}) {
  if (!lesson) return null;

  const videoUrl = lesson.video_url || lesson.videoUrl || '';
  const embedUrl = getEmbedUrl(videoUrl);
  const showDoneAction = Boolean(canMarkDone && typeof onToggleDone === 'function');

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-900/65 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-3xl border border-[#DCE4D7] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-[#EEF2EA] border-b border-[#DCE4D7] flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#4D6B4A]">
              {lesson.key_spice ? `Rempah Utama: ${lesson.key_spice}` : 'Materi Pembelajaran'}
            </p>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#2B3E29]">{lesson.title}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-full bg-white hover:bg-stone-100 text-stone-700 border border-[#DCE4D7] text-xs font-bold transition"
          >
            Tutup
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {embedUrl ? (
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-stone-900 border border-[#DCE4D7]">
              <iframe
                src={embedUrl}
                title={lesson.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : videoUrl ? (
            <video
              src={videoUrl}
              controls
              className="w-full max-h-80 rounded-2xl bg-stone-900 border border-[#DCE4D7]"
            />
          ) : (
            <div className="p-5 rounded-2xl bg-[#F5F7F3] border border-[#DCE4D7] text-xs sm:text-sm text-stone-600">
              Video belum tersedia untuk materi ini. Silakan baca ringkasan dan teknik pengolahan di bawah.
            </div>
          )}

          {lesson.summary && (
            <div className="p-4 rounded-2xl bg-[#F5F7F3] border border-[#DCE4D7] space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#4D6B4A]">
                Ringkasan Materi
              </h3>
              <p className="text-sm text-stone-700 leading-relaxed">{lesson.summary}</p>
            </div>
          )}

          {lesson.cooking_steps && (
            <div className="p-4 rounded-2xl bg-white border border-[#DCE4D7] space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#4D6B4A]">
                Langkah & Teknik
              </h3>
              <p className="text-sm text-stone-700 whitespace-pre-line leading-relaxed">
                {lesson.cooking_steps}
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-[#F5F7F3] border-t border-[#DCE4D7] flex items-center justify-between gap-3">
          {showDoneAction ? (
            <button
              type="button"
              onClick={() => onToggleDone(lesson)}
              className={
                isDone
                  ? 'px-4 py-2 rounded-full bg-[#2B3E29] text-white text-xs sm:text-sm font-bold transition'
                  : 'px-4 py-2 rounded-full bg-[#4D6B4A] hover:bg-[#3C553A] text-white text-xs sm:text-sm font-bold transition'
              }
            >
              {isDone ? 'Sudah Selesai (Mark as Done)' : 'Tandai Selesai (Mark as Done)'}
            </button>
          ) : (
            <span className="text-xs text-stone-500">Mode pratinjau materi</span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-white hover:bg-stone-100 text-[#2B3E29] border border-[#DCE4D7] text-xs sm:text-sm font-bold transition"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}