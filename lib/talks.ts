type TalkEvent = {
  eventName: string
  location?: string
  date?: string
  dateEnd?: string
  url?: string
  online?: boolean
  status?: string
}

type Talk = {
  id: string
  title: string
  description: string
  type: string
  groupName: string | null
  events: TalkEvent[]
  tags: string[]
  videoUrl: string | null
  slidesUrl: string | null
  githubUrl: string | null
  conferenceUrl: string | null
}

const isFutureOrUpcoming = (event: TalkEvent) => {
  if (!event.date) return false
  const eventTime = new Date(event.date).getTime()
  if (Number.isNaN(eventTime)) return false

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

  return event.status === 'upcoming' || eventTime >= todayStart
}

export function findNextUpcomingTalk(talks: Talk[]) {
  const candidates = talks
    .flatMap((talk) =>
      talk.events.filter(isFutureOrUpcoming).map((event) => ({
        talk,
        event,
      }))
    )
    .sort((a, b) => new Date(a.event.date || 0).getTime() - new Date(b.event.date || 0).getTime())

  return candidates[0] || null
}
