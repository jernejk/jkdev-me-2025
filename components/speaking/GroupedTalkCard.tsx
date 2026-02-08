'use client'

import { useState } from 'react'
import Link from '@/components/Link'
import Image from 'next/image'

interface Event {
  eventName: string
  location: string
  date: string
  url: string
  status: 'upcoming' | 'past'
}

interface GroupedTalkCardProps {
  title: string
  description: string
  events: Event[]
  tags: string[]
  videoUrl?: string | null
  slidesUrl?: string | null
  githubUrl?: string | null
  conferenceUrl?: string | null
}

export default function GroupedTalkCard({
  title,
  description,
  events,
  tags,
  videoUrl,
  slidesUrl,
  githubUrl,
  conferenceUrl,
}: GroupedTalkCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const getFirstSentence = (text: string) => {
    const match = text.match(/^[^.!?]+[.!?]/)
    return match ? match[0] : text.split(' ').slice(0, 15).join(' ') + '...'
  }

  const firstSentence = getFirstSentence(description)

  // Sort events by date (most recent first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Get domain for favicon
  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return domain
    } catch (e) {
      return ''
    }
  }

  return (
    <div className="group hover:border-primary-500 dark:hover:border-primary-400 relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
      <div className="flex gap-4">
        {/* Icon Column */}
        <div className="flex shrink-0 flex-col items-center gap-2 pt-1">
          <div className="bg-primary-100 dark:bg-primary-900/30 flex h-10 w-10 items-center justify-center rounded-md text-lg">
            🗣️
          </div>
          <div className="text-center text-[10px] font-medium text-gray-500">
            {events.length} events
          </div>
        </div>

        {/* Content Column */}
        <div className="min-w-0 flex-1">
          {/* Only show title if it's not just "Speaking at [EVENT]" or "Presented at [EVENT]" */}
          {!title.match(/^(Speaking at|Presented at)/i) && (
            <h3 className="mb-1 text-xl leading-snug font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {conferenceUrl ? (
                <Link
                  href={conferenceUrl}
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {title}
                </Link>
              ) : (
                title
              )}
            </h3>
          )}

          <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="line-clamp-2">{isExpanded ? description : firstSentence}</span>
            {description.length > firstSentence.length && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 ml-1 inline-flex items-center gap-0.5 text-xs font-medium"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>

          {/* Events List */}
          <div className="mb-4 space-y-2 rounded-md bg-gray-50 p-3 dark:bg-gray-800/50">
            {sortedEvents.map((event, index) => {
              const eventDomain = event.url ? getDomain(event.url) : ''
              const faviconUrl = eventDomain
                ? `https://www.google.com/s2/favicons?domain=${eventDomain}&sz=32`
                : null

              return (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {faviconUrl ? (
                    <Image
                      src={faviconUrl}
                      alt=""
                      width={16}
                      height={16}
                      className="h-4 w-4 rounded-sm object-contain opacity-70"
                      unoptimized
                    />
                  ) : (
                    <span className="h-4 w-4 text-center opacity-70">📍</span>
                  )}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {event.eventName}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500 dark:text-gray-400">{formatDate(event.date)}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500 dark:text-gray-400">{event.location}</span>
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3 text-xs">
              {videoUrl && (
                <Link
                  href={videoUrl}
                  className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                >
                  <span className="text-[10px]">▶</span> Watch Video
                </Link>
              )}
              {slidesUrl && (
                <Link
                  href={slidesUrl}
                  className="hover:text-primary-600 dark:hover:text-primary-400 font-medium text-gray-600 dark:text-gray-400"
                >
                  Slides
                </Link>
              )}
              {githubUrl && (
                <Link
                  href={githubUrl}
                  className="hover:text-primary-600 dark:hover:text-primary-400 font-medium text-gray-600 dark:text-gray-400"
                >
                  Code
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
