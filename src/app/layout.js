import './globals.css';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Navbar from '@/components/Navbar';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
});

export const metadata = {
  title: 'Niskala Rasa — Kursus Kuliner & Rempah Nusantara',
  description:
    'Platform pembelajaran kuliner tradisional, teknik pengolahan bumbu, dan kelas kursus interaktif.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <body className="min-h-screen bg-[#F5F7F3] text-stone-800 font-sans antialiased selection:bg-[#DCE4D7] selection:text-[#2B3E29]">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
