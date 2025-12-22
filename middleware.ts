import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Si no hay token, redirigir a login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/customers/:path*",
    "/repos/:path*",
    "/environments/:path*",
    "/applications/:path*",
    "/admin/:path*",
    "/api/customers/:path*",
    "/api/installedapps/:path*",
    "/api/environments/:path*",
    "/api/github/:path*",
    "/api/users/:path*",
  ],
};
