"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApproveTeacherButton({ userId }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleApprove() {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/approve-teacher", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });
            if (res.ok) {
                router.refresh();
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            type="button"
            onClick={handleApprove}
            disabled={loading}
            className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
        >
            {loading ? "Menyetujui..." : "Setujui Spice Master"}
        </button>
    );
}