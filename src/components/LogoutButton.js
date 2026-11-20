"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    async function handleLogout() {
        await fetch("/api/logout", { method: "POST" });
        router.push("/");
        router.refresh();
    }

    return (
        <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border px-2.5 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
        >
            Keluar
        </button>
    );
}
