import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { cookies } from "next/headers";
import pool from "@/lib/db";
import LogoutButton from "@/components/LogoutButton";
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
        "Akademi spice blending dan masterclass kuliner",
};

export default async function RootLayout({ children }) {
    const cookieStore = await cookies();
    const userId = cookieStore.get("niskala_user_id")?.value;

    let user = null;
    if (userId) {
        const { rows } = await pool.query(
            "SELECT id, username, role, teacher_status FROM users WHERE id = $1",
            [Number(userId)]
        );
        user = rows[0] || null;
    }

    let activeRole = "guest";
    if (user?.role === "admin") activeRole = "admin";
    else if (user?.role === "teacher" && user?.teacher_status === "approved") {
        activeRole = "teacher";
    } else if (user) {
        activeRole = "student";
    }

    return (
        <html lang="id">
            <body
                className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-neutral-50 text-neutral-900 antialiased`}
            >
                <header className="sticky top-0 z-20 border-b border-emerald-950/10 bg-white/95 backdrop-blur">
                    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3.5">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-base font-bold tracking-tight text-emerald-900"
                        >
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-700" />
                            <span>Niskala Rasa</span>
                        </Link>

                        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-neutral-700">
                            <Link href="/" className="transition hover:text-emerald-700">
                                Beranda
                            </Link>
                            <Link href="/recipes" className="transition hover:text-emerald-700">
                                Katalog Resep
                            </Link>

                            {activeRole === "student" && (
                                <Link href="/dashboard" className="font-semibold text-emerald-700">
                                    Ruang Belajar
                                </Link>
                            )}
                            {activeRole === "teacher" && (
                                <Link href="/teacher" className="font-semibold text-emerald-700">
                                    Panel Spice Master
                                </Link>
                            )}
                            {activeRole === "admin" && (
                                <Link href="/admin" className="font-semibold text-emerald-700">
                                    Panel Admin
                                </Link>
                            )}

                            {user ? (
                                <div className="flex items-center gap-2 border-l pl-4">
                                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold capitalize text-emerald-800">
                                        {user.username} ({activeRole})
                                    </span>
                                    <LogoutButton />
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
                                >
                                    Masuk / Daftar
                                </Link>
                            )}
                        </nav>
                    </div>
                </header>

                <div className="min-h-[calc(100vh-120px)]">{children}</div>

                <footer className="border-t bg-white">
                    <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-4 py-5 text-xs text-neutral-500 sm:flex-row">
                        <span>Niskala Rasa — The Alchemy of Spices &amp; Taste</span>
                        <span>Kurikulum ICE Spice Blending &amp; Masterclasses · Studio Makassar &amp; Daring</span>
                    </div>
                </footer>
            </body>
        </html>
    );
}
