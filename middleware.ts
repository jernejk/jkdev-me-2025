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
  // Skip middleware for static assets and asset-like paths. Every excluded path
  // is one fewer edge request billed. Content routes (and /about-me-test) still
  // match, so the 410 and trailing-slash logic above keeps working.
  matcher: [
    '/((?!_next/static|_next/image|_next/data|favicon\\.ico|robots\\.txt|sitemap\\.xml|feed\\.xml|search\\.json|static/|content/|tags/.*\\.xml$).*)',
  ],
}
