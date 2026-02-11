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

  // Keep canonical no-trailing-slash URLs for the rest of the site.
  if (
    pathname.length > 1 &&
    pathname.endsWith('/') &&
    !pathname.startsWith('/.well-known/') &&
    !pathname.match(/\.[a-zA-Z0-9]+\/$/)
  ) {
    const redirectUrl = new URL(`${pathname.slice(0, -1)}${request.nextUrl.search}`, request.url)
    return NextResponse.redirect(redirectUrl, 308)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
}
