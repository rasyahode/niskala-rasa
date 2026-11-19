import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Niskala Rasa — The Alchemy of Spices & Taste",
    description:
        "Platform pembelajaran kuliner hibrida (online & Studio Makassar), ensiklopedia rempah, pemetaan dominan rasa, dan katalog resep Nusantara serta dunia.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="id">
            <body
                className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-neutral-50 text-neutral-900 antialiased`}
            >
                <header className="sticky top-0 z-20 border-b border-emerald-950/10 bg-white/95 backdrop-blur">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-base font-bold tracking-tight text-emerald-900"
                        >
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-700" />
                            <span>Niskala Rasa</span>
                        </Link>

                        <nav className="flex items-center gap-5 text-sm font-medium text-neutral-700">
                            <Link href="/" className="transition hover:text-emerald-700">
                                Beranda
                            </Link>
                            <Link href="/recipes" className="transition hover:text-emerald-700">
                                Katalog Resep
                            </Link>
                        </nav>
                    </div>
                </header>

                <div className="min-h-[calc(100vh-120px)]">{children}</div>

                <footer className="border-t bg-white">
                    <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-4 py-5 text-xs text-neutral-500 sm:flex-row">
                        <span>Niskala Rasa — The Alchemy of Spices &amp; Taste</span>
                        <span>Kurikulum ICE Masterclass · Studio Makassar &amp; Daring</span>
                    </div>
                </footer>
            </body>
        </html>
    );
}
