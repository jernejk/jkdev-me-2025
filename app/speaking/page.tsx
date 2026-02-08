import siteMetadata from '@/data/siteMetadata'
import UpcomingTalkCard from '@/components/speaking/UpcomingTalkCard'
import SingleTalkCard from '@/components/speaking/SingleTalkCard'
import GroupedTalkCard from '@/components/speaking/GroupedTalkCard'
import speakingData from '@/data/speakingData.json'

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

export const metadata = {
  title: 'Speaking - JK',
  description: 'My past and upcoming talks.',
}

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

  // Group past talks by month
  const groupedPastTalks = pastTalks.reduce((acc, talk) => {
    const date = new Date(talk.events[0].date)
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' })

    if (!acc[monthYear]) {
      acc[monthYear] = []
    }
    acc[monthYear].push(talk)
    return acc
  }, {})

  // Sort months descending
  const sortedMonths = Object.keys(groupedPastTalks).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
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
            <div className="mb-16">
              <h2 className="mb-8 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-gray-100">
                Upcoming Talks
              </h2>
              <div className="grid gap-8">
                {upcomingTalks.map((talk, index) => (
                  <UpcomingTalkCard key={`${talk.title}-${index}`} talk={talk} />
                ))}
              </div>
            </div>
          )}

          {/* Past Talks Section */}
          <div>
            <h2 className="mb-8 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl dark:text-gray-100">
              Past Talks
            </h2>

            <div className="space-y-12">
              {sortedMonths.map((month) => (
                <div key={month}>
                  <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-gray-200">
                    {month}
                  </h3>
                  <div className="mx-auto flex max-w-4xl flex-col gap-6">
                    {groupedPastTalks[month].map((talk) => {
                      // If there's a group name and multiple events, use GroupedTalkCard
                      if (talk.groupName && talk.events.length > 1) {
                        return (
                          <GroupedTalkCard
                            key={talk.title}
                            title={talk.title}
                            description={talk.description}
                            events={talk.events}
                            tags={talk.tags}
                            videoUrl={talk.videoUrl}
                            slidesUrl={talk.slidesUrl}
                            githubUrl={talk.githubUrl}
                            conferenceUrl={talk.conferenceUrl}
                          />
                        )
                      }

                      // Otherwise use SingleTalkCard
                      const event = talk.events[0]
                      return (
                        <SingleTalkCard
                          key={talk.title}
                          title={talk.title}
                          description={talk.description}
                          event={event}
                          tags={talk.tags}
                          videoUrl={talk.videoUrl}
                          slidesUrl={talk.slidesUrl}
                          githubUrl={talk.githubUrl}
                          conferenceUrl={talk.conferenceUrl}
                        />
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
