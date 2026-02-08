import { NextResponse } from 'next/server'
import speakingData from '@/data/speakingData.json'

export const dynamic = 'force-static'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') // 'upcoming' or 'past'
  const limit = searchParams.get('limit')

  let talks = speakingData.talks

  // Filter by status if provided
  if (status === 'upcoming') {
    talks = talks.filter((talk) => talk.events.some((event) => event.status === 'upcoming'))
  } else if (status === 'past') {
    talks = talks.filter((talk) => talk.events.every((event) => event.status === 'past'))
  }

  // Sort talks by most recent event date
  const sortedTalks = [...talks].sort((a, b) => {
    const aDate = new Date(Math.max(...a.events.map((e) => new Date(e.date).getTime())))
    const bDate = new Date(Math.max(...b.events.map((e) => new Date(e.date).getTime())))
    return bDate.getTime() - aDate.getTime()
  })

  // Limit results if specified
  const result = limit ? sortedTalks.slice(0, parseInt(limit)) : sortedTalks

  return NextResponse.json({
    talks: result,
    count: result.length,
    total: speakingData.talks.length,
  })
}
