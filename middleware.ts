import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });

  // Si no hay token, redirigir a la página principal (login) con callbackUrl
  if (!token) {
    const url = new URL("/", request.url);
    // Preservar la URL original para redirigir después del login
    url.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/customers/:path*",
    "/repos/:path*",
    "/environments/:path*",
    "/applications/:path*",
    "/deployments/:path*",
    "/admin/:path*",
    "/api/customers/:path*",
    "/api/installedapps/:path*",
    "/api/environments/:path*",
    "/api/github/:path*",
    "/api/users/:path*",
  ],
};
