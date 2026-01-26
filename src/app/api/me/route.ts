// src/app/api/me/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCookie, getCookies, setCookie, deleteCookie, hasCookie } from "cookies-next/server";

export async function GET(req: NextRequest) {
  try {
    const cookies = await getCookies();

    const fastifyRes = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/me`, {
      method: "GET",
      // headers: {
      //     "Content-Type": "application/json",
      // Cookie: [ `accessToken=${process.env.acct};`, `refreshToken=${rft}` ].join("; "), // injeta manualmente
      // },
    });

    if (!fastifyRes.ok) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const data = await fastifyRes.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Erro ao buscar usuário" }, { status: 500 });
  }
}
