"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddSpiceForm() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [latinName, setLatinName] = useState("");
    const [plantPart, setPlantPart] = useState("Rimpang");
    const [dominantTaste, setDominantTaste] = useState("manis");
    const [characteristics, setCharacteristics] = useState("");
    const [processingMethod, setProcessingMethod] = useState("");
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setMsg("");
        setErr("");
        const res = await fetch("/api/spices-recipes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "add_spice",
                name,
                latin_name: latinName,
                plant_part: plantPart,
                dominant_taste: dominantTaste,
                characteristics,
                processing_method: processingMethod,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErr(data.error || "Gagal menambah rempah.");
                return;
            }
            setMsg(data.message);
            setName("");
            setLatinName("");
            setCharacteristics("");
            setProcessingMethod("");
            router.refresh();
        }

        return (
            <section className="rounded-xl border border-emerald-200 bg-white p-5 space-y-3">
                <h2 className="text-base font-bold text-neutral-900">
                    Tambah Rempah Khas Indonesia (Teacher &amp; Admin)
                </h2>
                {msg && <p className="text-xs font-medium text-emerald-700">{msg}</p>}
                {err && <p className="text-xs font-medium text-red-600">{err}</p>}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nama rempah (misal: Bunga Lawang)"
                        className="rounded-lg border px-3 py-2 text-xs"
                    />
                    <input
                        type="text"
                        value={latinName}
                        onChange={(e) => setLatinName(e.target.value)}
                        placeholder="Nama ilmiah / Latin"
                        className="rounded-lg border px-3 py-2 text-xs"
                    />
                    <input
                        type="text"
                        value={plantPart}
                        onChange={(e) => setPlantPart(e.target.value)}
                        placeholder="Bagian tanaman (Biji, Daun, Rimpang, Buah)"
                        className="rounded-lg border px-3 py-2 text-xs"
                    />
                    <select
                        value={dominantTaste}
                        onChange={(e) => setDominantTaste(e.target.value)}
                        className="rounded-lg border bg-white px-3 py-2 text-xs"
                    >
                        <option value="manis">Rasa: Manis</option>
                        <option value="asam">Rasa: Asam</option>
                        <option value="pedas">Rasa: Pedas</option>
                        <option value="pahit">Rasa: Pahit</option>
                    </select>
                    <input
                        type="text"
                        required
                        value={characteristics}
                        onChange={(e) => setCharacteristics(e.target.value)}
                        placeholder="Karakteristik & fungsi utama rempah"
                        className="rounded-lg border px-3 py-2 text-xs sm:col-span-2"
                    />
                    <input
                        type="text"
                        required
                        value={processingMethod}
                        onChange={(e) => setProcessingMethod(e.target.value)}
                        placeholder="Cara mengolah rempah"
                        className="rounded-lg border px-3 py-2 text-xs sm:col-span-2"
                    />
                    <div className="sm:col-span-2">
                        <button
                            type="submit"
                            className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                        >
                            Simpan Rempah
                        </button>
                    </div>
                </form>
            </section>
    );
}

export function AddRecipeForm() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [originCountry, setOriginCountry] = useState("Indonesia");
    const [indonesianSpices, setIndonesianSpices] = useState("");
    const [dominantTaste, setDominantTaste] = useState("manis");
    const [summary, setSummary] = useState("");
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setMsg("");
        setErr("");
        const res = await fetch("/api/spices-recipes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "add_recipe",
                title,
                origin_country: originCountry,
                indonesian_spices: indonesianSpices,
                dominant_taste: dominantTaste,
                summary,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setErr(data.error || "Gagal menambah resep.");
                return;
            }
            setMsg(data.message);
            setTitle("");
            setIndonesianSpices("");
            setSummary("");
            router.refresh();
        }

        return (
            <section className="rounded-xl border border-emerald-200 bg-white p-5 space-y-3">
                <h2 className="text-base font-bold text-neutral-900">
                    Tambah Resep Baru (Teacher &amp; Admin)
                </h2>
                {msg && <p className="text-xs font-medium text-emerald-700">{msg}</p>}
                {err && <p className="text-xs font-medium text-red-600">{err}</p>}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Judul resep"
                        className="rounded-lg border px-3 py-2 text-xs"
                    />
                    <input
                        type="text"
                        required
                        value={originCountry}
                        onChange={(e) => setOriginCountry(e.target.value)}
                        placeholder="Negara asal (Indonesia atau negara luar)"
                        className="rounded-lg border px-3 py-2 text-xs"
                    />
                    <input
                        type="text"
                        required
                        value={indonesianSpices}
                        onChange={(e) => setIndonesianSpices(e.target.value)}
                        placeholder="Rempah Indonesia yang dipakai (pisahkan dengan koma)"
                        className="rounded-lg border px-3 py-2 text-xs"
                    />
                    <select
                        value={dominantTaste}
                        onChange={(e) => setDominantTaste(e.target.value)}
                        className="rounded-lg border bg-white px-3 py-2 text-xs"
                    >
                        <option value="manis">Rasa: Manis</option>
                        <option value="asam">Rasa: Asam</option>
                        <option value="pedas">Rasa: Pedas</option>
                        <option value="pahit">Rasa: Pahit</option>
                    </select>
                    <textarea
                        rows={2}
                        required
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="Deskripsi & langkah lengkap resep"
                        className="rounded-lg border px-3 py-2 text-xs sm:col-span-2"
                    />
                    <div className="sm:col-span-2">
                        <button
                            type="submit"
                            className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                        >
                            Simpan Resep
                        </button>
                    </div>
                </form>
            </section>
        );
}

export function DeleteItemButton({ action, id, label = "Hapus" }) {
    const router = useRouter();
    const [busy, setBusy] = useState(false);

    async function handleDelete() {
        setBusy(true);
        try {
            await fetch("/api/spices-recipes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, id }),
            });
            router.refresh();
        } finally {
        setBusy(false);
        }
    }

    return (
        <button
            type="button"
            disabled={busy}
            onClick={handleDelete}
            className="rounded bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
            {busy ? "..." : label}
        </button>
    );
}
