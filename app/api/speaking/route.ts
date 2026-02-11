import { NextResponse } from 'next/server'
import speakingData from '@/data/speakingData.json'

export const dynamic = 'force-static'

interface SpeakingEvent {
  eventName: string
  location?: string
  date?: string
  url?: string | null
  status?: 'upcoming' | 'past'
}

interface SpeakingTalk {
  id: string
  title: string
  tags: string[]
  conferenceUrl?: string | null
  videoUrl?: string | null
  slidesUrl?: string | null
  events: SpeakingEvent[]
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') // 'upcoming' or 'past'
  const limit = searchParams.get('limit')

  let talks = speakingData.talks as SpeakingTalk[]

  // Filter by status if provided
  if (status === 'upcoming') {
    talks = talks.filter((talk) => talk.events.some((event) => event.status === 'upcoming'))
  } else if (status === 'past') {
    talks = talks.filter((talk) => talk.events.every((event) => event.status === 'past'))
  }

  const latestEventTime = (talk: SpeakingTalk) =>
    Math.max(...talk.events.map((event) => new Date(event.date || 0).getTime()))

  // Sort talks by most recent event date
  const sortedTalks = [...talks].sort((a, b) => {
    return latestEventTime(b) - latestEventTime(a)
  })

  // Limit results if specified
  const result = limit ? sortedTalks.slice(0, parseInt(limit)) : sortedTalks

  const entries = result
    .flatMap((talk) =>
      talk.events
        .filter(
          (event): event is SpeakingEvent & { date: string } =>
            typeof event.date === 'string' && event.date.length > 0
        )
        .map((event) => ({
          talkId: talk.id,
          title: talk.title,
          topic: talk.tags,
          event: event.eventName,
          date: event.date,
          city: event.location || null,
          status: event.status,
          link: talk.conferenceUrl || event.url || talk.videoUrl || talk.slidesUrl || null,
        }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return NextResponse.json({
    talks: result,
    entries,
    count: result.length,
    entryCount: entries.length,
    total: speakingData.talks.length,
  })
}
