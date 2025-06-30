import { NextRequest, NextResponse } from "next/server";
import { ROUTES } from "./utils/routes";

export async function middleware(req: NextRequest) {

    const pathname = req.nextUrl.pathname;

    const accessToken = req.cookies.get("accessToken")?.value;

    if(![ "/", "/login" ].includes(pathname) && !accessToken) {
        const newUrl = new URL(ROUTES.LOGIN, req.nextUrl.origin);
        return NextResponse.redirect(newUrl);
    }

    if (pathname === "/" && !accessToken) {
        const newUrl = new URL(ROUTES.LOGIN, req.nextUrl.origin);
        return NextResponse.redirect(newUrl);
    }

    if ([ "/", "/login" ].includes(pathname) && accessToken) {
        const newUrl = new URL(ROUTES.DASHBOARD, req.nextUrl.origin);
        return NextResponse.redirect(newUrl);
    }
}

export const config = {
    matcher: [ "/", "/login", "/dashboard" ], // limita as rotas que o middleware vai interceptar
};
