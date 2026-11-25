'use client';

import { useEffect } from 'react';

export default function ConfirmDeleteModal({
  open = false,
  title = 'Konfirmasi Penghapusan',
  message = 'Apakah Anda yakin ingin menghapus data ini?',
  itemLabel = '',
  warningText = 'Tindakan ini akan menghapus data secara permanen dan tidak dapat dibatalkan.',
  confirmLabel = 'Ya, Hapus Permanen',
  cancelLabel = 'Batal',
  loading = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e) {
      if (e.key === 'Escape' && !loading) {
        onCancel?.();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
      onClick={() => !loading && onCancel?.()}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white border border-[#DCE4D7] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4 flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 font-extrabold text-lg">
            !
          </div>
          <div className="space-y-1">
            <h3 id="confirm-delete-title" className="text-lg font-extrabold text-[#2B3E29]">
              {title}
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="px-6 pb-5 space-y-3">
          {itemLabel && (
            <div className="px-4 py-3 rounded-2xl bg-[#F5F7F3] border border-[#DCE4D7]">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#4D6B4A]">
                Item yang akan dihapus
              </span>
              <span className="text-sm font-bold text-stone-900 break-words">
                {itemLabel}
              </span>
            </div>
          )}

          {warningText && (
            <p className="text-xs text-rose-700 bg-rose-50/80 border border-rose-100 rounded-xl px-3.5 py-2.5 leading-relaxed">
              {warningText}
            </p>
          )}
        </div>

        <div className="px-6 py-4 bg-[#F5F7F3] border-t border-[#DCE4D7] flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="px-4 py-2 rounded-full bg-white hover:bg-stone-100 text-stone-700 border border-[#DCE4D7] text-xs sm:text-sm font-bold transition disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-xs transition disabled:opacity-50"
          >
            {loading ? 'Menghapus...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
