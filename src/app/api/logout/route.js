import { NextResponse } from "next/server";

export async function POST() {
    const res = NextResponse.json({ message: "Berhasil keluar" });
    res.cookies.delete("niskala_user_id");
    return res;
}