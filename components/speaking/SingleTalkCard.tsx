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

interface SingleTalkCardProps {
  title: string
  description: string
  event: Event
  tags: string[]
  videoUrl?: string | null
  slidesUrl?: string | null
  githubUrl?: string | null
  conferenceUrl?: string | null
}

export default function SingleTalkCard({
  title,
  description,
  event,
  tags,
  videoUrl,
  slidesUrl,
  githubUrl,
  conferenceUrl,
}: SingleTalkCardProps) {
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

  // Get domain for favicon
  const getDomain = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return domain
    } catch (e) {
      return ''
    }
  }

  // Determine best URL for favicon (prefer conferenceUrl, avoid Eventbrite if possible)
  const getBestUrlForIcon = () => {
    const isEventbrite = (url: string) => url && url.includes('eventbrite')

    if (conferenceUrl && !isEventbrite(conferenceUrl)) return conferenceUrl
    if (event.url && !isEventbrite(event.url)) return event.url
    return conferenceUrl || event.url
  }

  const iconUrl = getBestUrlForIcon()
  const eventDomain = iconUrl ? getDomain(iconUrl) : ''
  const faviconUrl = eventDomain
    ? `https://www.google.com/s2/favicons?domain=${eventDomain}&sz=64`
    : null

  return (
    <div className="group hover:border-primary-500 dark:hover:border-primary-400 relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
      <div className="flex gap-4">
        {/* Icon Column */}
        <div className="flex shrink-0 flex-col items-center gap-2 pt-1">
          {faviconUrl ? (
            <div className="relative h-10 w-10 overflow-hidden rounded-md bg-gray-50 p-1 shadow-sm dark:bg-gray-800">
              <Image
                src={faviconUrl}
                alt={event.eventName}
                width={40}
                height={40}
                className="h-full w-full object-contain"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-lg dark:bg-gray-800">
              🎤
            </div>
          )}
        </div>

        {/* Content Column */}
        <div className="min-w-0 flex-1">
          {/* Only show title if it's not just "Speaking at [EVENT]" or "Presented at [EVENT]" */}
          {!title.match(/^(Speaking at|Presented at)/i) && (
            <h3 className="mb-1 text-xl leading-snug font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {conferenceUrl || event.url ? (
                <Link
                  href={conferenceUrl || event.url}
                  className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                >
                  {title}
                </Link>
              ) : (
                title
              )}
            </h3>
          )}

          <div className="mb-2 flex flex-wrap items-center gap-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">{event.eventName}</span>
            <span>•</span>
            <span>{formatDate(event.date)}</span>
            <span>•</span>
            <span>{event.location}</span>
          </div>

          <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="line-clamp-2">{isExpanded ? description : firstSentence}</span>
            {description.length > firstSentence.length && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 ml-1 text-xs font-medium"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
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
