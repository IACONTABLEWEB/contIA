import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('contia_token');
  const rutaProtegida =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/empresas') ||
    request.nextUrl.pathname.startsWith('/balances') ||
    request.nextUrl.pathname.startsWith('/resultado');

  if (rutaProtegida && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/empresas/:path*', '/balances/:path*', '/resultado/:path*'],
};
