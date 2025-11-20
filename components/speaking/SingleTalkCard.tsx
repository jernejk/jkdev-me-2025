'use client'

import { useState } from 'react'
import Link from '@/components/Link'

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
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const getFirstSentence = (text: string) => {
    const match = text.match(/^[^.!?]+[.!?]/)
    return match ? match[0] : text.split(' ').slice(0, 15).join(' ') + '...'
  }

  const firstSentence = getFirstSentence(description)

  return (
    <div className="hover:border-primary-500 dark:hover:border-primary-400 rounded-lg border border-gray-200 p-6 transition-colors dark:border-gray-700">
      <h3 className="mb-3 text-2xl leading-8 font-bold tracking-tight">
        {conferenceUrl || event.url ? (
          <Link
            href={conferenceUrl || event.url}
            className="hover:text-primary-500 dark:hover:text-primary-400 text-gray-900 dark:text-gray-100"
          >
            {title}
          </Link>
        ) : (
          <span className="text-gray-900 dark:text-gray-100">{title}</span>
        )}
      </h3>
      <div className="mb-3 text-gray-700 dark:text-gray-300">
        <p className="text-lg font-semibold">{event.eventName}</p>
        <p className="text-sm">
          {formatDate(event.date)} • {event.location}
        </p>
      </div>
      <div className="mb-3">
        <p className="prose max-w-none text-gray-500 dark:text-gray-400">
          {isExpanded ? description : firstSentence}
        </p>
        {description.length > firstSentence.length && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 mt-1 text-sm font-medium"
          >
            {isExpanded ? '↑ Show less' : '↓ Read more'}
          </button>
        )}
      </div>
      <div className="mb-3 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {videoUrl && (
          <Link
            href={videoUrl}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
          >
            📹 Video →
          </Link>
        )}
        {conferenceUrl && (
          <Link
            href={conferenceUrl}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
          >
            🎤 Conference →
          </Link>
        )}
        {slidesUrl && (
          <Link
            href={slidesUrl}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
          >
            📊 Slides →
          </Link>
        )}
        {githubUrl && (
          <Link
            href={githubUrl}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
          >
            💻 Code →
          </Link>
        )}
        {event.url && !conferenceUrl && (
          <Link
            href={event.url}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
          >
            🔗 Event Details →
          </Link>
        )}
      </div>
    </div>
  )
}
