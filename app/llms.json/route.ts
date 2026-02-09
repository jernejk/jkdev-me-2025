import { buildLlmsJson } from '@/lib/llms'

export const dynamic = 'force-static'

export function GET() {
  return Response.json(buildLlmsJson(), {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
