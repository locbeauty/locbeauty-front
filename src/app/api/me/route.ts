// src/app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server";

const acct = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJja3prNHA4cTcwMDAwdjdrejd2NG45aDloIiwiZW1wbG95ZWVOYW1lIjoiSm_Do28gZGEgU2lsdmEiLCJlbWFpbCI6ImpvYW9AZW1wcmVzYS5jb20iLCJyb2xlIjoiR2VyZW50ZSIsInNvdXJjZUZpbGlhbCI6eyJmaWxpYWxJZCI6ImNrbjFhMmIzYzAwMDB4eXoxMjM0NTY3ODkiLCJkZXNjcmlwdGlvbiI6IkZpbGlhbCBSZWNpZmUifSwiaWF0IjoxNzU1MzQ5NDcxLCJleHAiOjE3NTUzNTAzNzF9.jRDCqidMw8jdEUukHT2azGvQ-QWM4qzPGWq8W-q0JwY.DQKE1psxjB47NUTxGu9%2FDMna8XeYVpEdPNWDWvFkbxQ";
const rft = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJja3prNHA4cTcwMDAwdjdrejd2NG45aDloIiwiaWF0IjoxNzU1MzQ5NDcxLCJleHAiOjE3NTU5NTQyNzF9.uAd9J-TgZkOy8wOJK9HxvPkEJcv9OGd3aX1_2az9ZBM.K%2FErxIUm9EaHBX9HQda94HGacfcJWmb02ZANJnUJIdo";

export async function GET(req: NextRequest) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Cookie: [ `accessToken=${process.env.acct};`, `refreshToken=${rft}` ].join("; "), // injeta manualmente
            },
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: "Erro ao buscar usuário" }, { status: 500 });
    }
}
