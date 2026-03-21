// app/api/signin/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const fastifyRes = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      credentials: "include",
    });

    const rawSetCookie = fastifyRes.headers.get("set-cookie");

    if(fastifyRes.status === 500) {
      return NextResponse.json({ error: "Network error" }, { status: 500 });
    }

    if (!rawSetCookie) {
      return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });

    // Divide os cookies (usa regex para quebrar corretamente)
    const cookieParts = rawSetCookie.split(/,(?=\s*\w+=)/); // quebra onde há ", " seguido de nome de cookie

    for (const cookie of cookieParts) {
      response.headers.append("set-cookie", cookie);
    }

    return response;
  } catch {
    return NextResponse.json({ error: "Network error" }, { status: 500 });
  }
}
