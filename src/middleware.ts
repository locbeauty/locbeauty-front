import { NextRequest } from "next/server";
import { ROUTES } from "./utils/routes";

export function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    if (pathname === "/") {
        const newUrl = new URL(ROUTES.LOGIN, request.nextUrl.origin);
        return Response.redirect(newUrl);
    }
}
