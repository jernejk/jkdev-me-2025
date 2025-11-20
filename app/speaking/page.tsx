'use client'

import { useState } from 'react'
import speakingData from '@/data/speakingData.json'
import UpcomingTalkCard from '@/components/speaking/UpcomingTalkCard'
import SingleTalkCard from '@/components/speaking/SingleTalkCard'
import GroupedTalkCard from '@/components/speaking/GroupedTalkCard'

interface Event {
  eventName: string
  location: string
  date: string
  url: string
  status: 'upcoming' | 'past'
}

interface Talk {
  id: string
  title: string
  description: string
  type: 'talk' | 'workshop'
  groupName: string | null
  events: Event[]
  tags: string[]
  videoUrl?: string | null
  slidesUrl?: string | null
  githubUrl?: string | null
  conferenceUrl?: string | null
}

const ITEMS_PER_PAGE = 12

interface MonthGroup {
  monthYear: string
  talks: Talk[]
}

export default function Speaking() {
  const [currentPage, setCurrentPage] = useState(1)
  const talks = speakingData.talks as Talk[]

  // Separate upcoming and past talks
  const upcomingTalks = talks.filter((talk) =>
    talk.events.some((event) => event.status === 'upcoming')
  )
  const pastTalks = talks.filter((talk) => talk.events.every((event) => event.status === 'past'))

  // Sort past talks by most recent event date
  const sortedPastTalks = pastTalks.sort((a, b) => {
    const aDate = new Date(Math.max(...a.events.map((e) => new Date(e.date).getTime())))
    const bDate = new Date(Math.max(...b.events.map((e) => new Date(e.date).getTime())))
    return bDate.getTime() - aDate.getTime()
  })

  // Group past talks by month/year
  const groupTalksByMonthYear = (talks: Talk[]): MonthGroup[] => {
    const groups = new Map<string, Talk[]>()

    talks.forEach((talk) => {
      // Get the most recent event date for this talk
      const mostRecentDate = new Date(
        Math.max(...talk.events.map((e) => new Date(e.date).getTime()))
      )
      const monthYear = mostRecentDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
      })

      if (!groups.has(monthYear)) {
        groups.set(monthYear, [])
      }
      groups.get(monthYear)!.push(talk)
    })

    return Array.from(groups.entries())
      .map(([monthYear, talks]) => ({
        monthYear,
        talks,
      }))
      .sort((a, b) => {
        // Sort groups by date (most recent first)
        const aDate = new Date(a.talks[0].events[0].date)
        const bDate = new Date(b.talks[0].events[0].date)
        return bDate.getTime() - aDate.getTime()
      })
  }

  const groupedPastTalks = groupTalksByMonthYear(sortedPastTalks)

  // Paginate the month groups
  const totalPages = Math.ceil(groupedPastTalks.length / ITEMS_PER_PAGE)
  const paginatedGroups = groupedPastTalks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            Speaking
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            Conference talks, workshops, and presentations on AI, Machine Learning, .NET, and
            software development.
          </p>
        </div>

        {/* Upcoming Talks Section */}
        {upcomingTalks.length > 0 && (
          <div className="py-12">
            <h2 className="mb-8 text-2xl leading-8 font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Upcoming Talks
            </h2>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {upcomingTalks.map((talk) => {
                const upcomingEvent = talk.events.find((event) => event.status === 'upcoming')
                if (!upcomingEvent) return null

                return (
                  <UpcomingTalkCard
                    key={talk.id}
                    title={talk.title}
                    description={talk.description}
                    event={upcomingEvent}
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
        )}

        {/* Past Talks Section - Grouped by Month/Year */}
        <div className="py-12">
          <h2 className="mb-8 text-2xl leading-8 font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Past Talks
          </h2>

          {paginatedGroups.map((group) => (
            <div key={group.monthYear} className="mb-12">
              <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-gray-200">
                {group.monthYear}
              </h3>
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {group.talks.map((talk) => {
                  // If there's a group name and multiple events, use GroupedTalkCard
                  if (talk.groupName && talk.events.length > 1) {
                    return (
                      <GroupedTalkCard
                        key={talk.id}
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
                      key={talk.id}
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="hover:bg-primary-600 bg-primary-500 rounded px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:bg-gray-300 dark:disabled:bg-gray-600 dark:disabled:text-gray-400 dark:disabled:hover:bg-gray-600"
              >
                ← Previous
              </button>
              <span className="px-4 text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="hover:bg-primary-600 bg-primary-500 rounded px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 disabled:hover:bg-gray-300 dark:disabled:bg-gray-600 dark:disabled:text-gray-400 dark:disabled:hover:bg-gray-600"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
