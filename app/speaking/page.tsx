import UpcomingTalkCard from '@/components/speaking/UpcomingTalkCard'
import SingleTalkCard from '@/components/speaking/SingleTalkCard'
import GroupedTalkCard from '@/components/speaking/GroupedTalkCard'
import speakingData from '@/data/speakingData.json'
import { genPageMetadata } from 'app/seo'

interface Event {
  eventName: string
  location?: string
  date: string
  dateEnd?: string
  url?: string
  online?: boolean
  status: 'upcoming' | 'past'
}

interface Talk {
  id: string
  title: string
  description: string
  type: string
  groupName: string | null
  events: Event[]
  tags: string[]
  videoUrl: string | null
  slidesUrl: string | null
  githubUrl: string | null
  conferenceUrl: string | null
}

export const metadata = genPageMetadata({
  title: 'Speaking',
  description:
    'Past and upcoming conference talks and user group sessions on .NET, EF Core performance, Azure, and AI.',
})

export default function Speaking() {
  const talks = (speakingData.talks as Talk[]).sort(
    (a, b) =>
      new Date(b.events[0]?.date || 0).getTime() - new Date(a.events[0]?.date || 0).getTime()
  )

  // Separate upcoming and past talks
  const upcomingTalks: Talk[] = []
  const pastTalks: Talk[] = []

  talks.forEach((talk) => {
    const upcomingEvents = talk.events.filter((event) => event.status === 'upcoming')
    const pastEvents = talk.events.filter((event) => event.status === 'past')

    if (upcomingEvents.length > 0) {
      // Create a new talk object for each upcoming event to display individually
      upcomingEvents.forEach((event) => {
        upcomingTalks.push({
          ...talk,
          events: [event],
        })
      })
    }

    if (pastEvents.length > 0) {
      pastTalks.push({
        ...talk,
        events: pastEvents,
      })
    }
  })

  // Group past talks by year for cleaner scanning and machine extraction.
  const groupedPastTalks = pastTalks.reduce((acc, talk) => {
    const date = new Date(talk.events[0].date)
    const year = String(date.getFullYear())

    if (!acc[year]) {
      acc[year] = []
    }
    acc[year].push(talk)
    return acc
  }, {})

  // Sort years descending.
  const sortedYears = Object.keys(groupedPastTalks).sort((a, b) => Number(b) - Number(a))
  const speakingEventsJsonLd = talks
    .flatMap((talk) =>
      talk.events
        .filter((event) => Boolean(event.date))
        .map((event) => ({
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: talk.title,
          description: talk.description,
          startDate: event.date,
          eventStatus:
            event.status === 'upcoming'
              ? 'https://schema.org/EventScheduled'
              : 'https://schema.org/EventCompleted',
          eventAttendanceMode: event.online
            ? 'https://schema.org/OnlineEventAttendanceMode'
            : 'https://schema.org/OfflineEventAttendanceMode',
          location: event.online
            ? {
                '@type': 'VirtualLocation',
                url: event.url || talk.conferenceUrl || undefined,
              }
            : {
                '@type': 'Place',
                name: event.eventName,
                address: event.location || undefined,
              },
          organizer: {
            '@type': 'Person',
            name: 'Jernej Kavka',
            url: 'https://jkdev.me/about',
          },
          keywords: talk.tags.join(', '),
          url: talk.conferenceUrl || event.url || talk.videoUrl || talk.slidesUrl || undefined,
        }))
    )
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(speakingEventsJsonLd) }}
        />
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            Speaking
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            I love sharing my knowledge and experience with the community. Here are some of the
            talks I've given.
          </p>
        </div>

        <div className="container py-12">
          {/* Upcoming Talks Section */}
          {upcomingTalks.length > 0 && (
            <section className="mb-16" aria-labelledby="upcoming-talks-heading">
              <h2 className="mb-8 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-gray-100">
                <span id="upcoming-talks-heading">Upcoming Talks</span>
              </h2>
              <div className="grid gap-8">
                {upcomingTalks.map((talk, index) => (
                  <article key={`${talk.title}-${index}`} aria-label={talk.title}>
                    <UpcomingTalkCard talk={talk} />
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Past Talks Section */}
          <section aria-labelledby="past-talks-heading">
            <h2
              id="past-talks-heading"
              className="mb-8 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-gray-100"
            >
              Past Talks
            </h2>

            <div className="space-y-12">
              {sortedYears.map((year) => (
                <section key={year} aria-labelledby={`talk-year-${year}`}>
                  <h3
                    id={`talk-year-${year}`}
                    className="mb-6 text-xl font-semibold text-gray-800 dark:text-gray-200"
                  >
                    {year}
                  </h3>
                  <div className="mx-auto flex max-w-4xl flex-col gap-6">
                    {groupedPastTalks[year].map((talk) => {
                      // If there's a group name and multiple events, use GroupedTalkCard
                      if (talk.groupName && talk.events.length > 1) {
                        return (
                          <article key={talk.title} aria-label={talk.title}>
                            <GroupedTalkCard
                              title={talk.title}
                              description={talk.description}
                              events={talk.events}
                              tags={talk.tags}
                              videoUrl={talk.videoUrl}
                              slidesUrl={talk.slidesUrl}
                              githubUrl={talk.githubUrl}
                              conferenceUrl={talk.conferenceUrl}
                            />
                          </article>
                        )
                      }

                      // Otherwise use SingleTalkCard
                      const event = talk.events[0]
                      return (
                        <article key={talk.title} aria-label={talk.title}>
                          <SingleTalkCard
                            title={talk.title}
                            description={talk.description}
                            event={event}
                            tags={talk.tags}
                            videoUrl={talk.videoUrl}
                            slidesUrl={talk.slidesUrl}
                            githubUrl={talk.githubUrl}
                            conferenceUrl={talk.conferenceUrl}
                          />
                        </article>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
