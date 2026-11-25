'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LearningSpaceRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('niskala_user');
    if (!saved) {
      router.replace('/login');
      return;
    }

    const user = JSON.parse(saved);
    if (user.role === 'admin') {
      router.replace('/dashboard/admin');
    } else if (user.role === 'teacher') {
      router.replace('/dashboard/teacher');
    } else {
      router.replace('/dashboard/student');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#F5F7F3] flex items-center justify-center text-sm text-[#3C553A] font-medium">
      Memuat ruang belajar Niskala Rasa...
    </div>
  );
}