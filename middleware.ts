import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Hard-remove legacy test path so search engines drop it quickly.
  if (pathname === '/about-me-test' || pathname.startsWith('/about-me-test/')) {
    return new NextResponse('Gone', {
      status: 410,
      headers: {
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}

