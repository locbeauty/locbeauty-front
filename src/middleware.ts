import { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    if(pathname === "/") {
        const newUrl = new URL("/login", request.nextUrl.origin);
        return Response.redirect(newUrl);
    }
}