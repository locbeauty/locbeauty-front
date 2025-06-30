import { NextRequest, NextResponse } from "next/server";
import { deleteCookie } from "cookies-next/server";

export async function GET(req: NextRequest) {
    const res = new NextResponse();

    await deleteCookie("refreshToken", { res, req });
    await deleteCookie("accessToken", { res, req });

    return res;
}
