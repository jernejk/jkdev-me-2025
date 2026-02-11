import { NextResponse } from 'next/server'

const goneHeaders = {
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Cache-Control': 'public, max-age=0, s-maxage=3600',
}

export function GET() {
  return new NextResponse('Gone', {
    status: 410,
    headers: goneHeaders,
  })
}

export function HEAD() {
  return new NextResponse(null, {
    status: 410,
    headers: goneHeaders,
  })
}
