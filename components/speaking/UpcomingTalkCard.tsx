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

interface UpcomingTalkCardProps {
  title: string
  description: string
  event: Event
  tags: string[]
  videoUrl?: string | null
  slidesUrl?: string | null
  githubUrl?: string | null
  conferenceUrl?: string | null
}

export default function UpcomingTalkCard({
  title,
  description,
  event,
  tags,
  videoUrl,
  slidesUrl,
  githubUrl,
  conferenceUrl,
}: UpcomingTalkCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const getCountdown = (dateString: string) => {
    const eventDate = new Date(dateString)
    const now = new Date()
    const diffTime = eventDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return null
    if (diffDays === 0) return 'Today!'
    if (diffDays === 1) return 'Tomorrow!'
    if (diffDays <= 7) return `in ${diffDays} days`
    if (diffDays <= 30) {
      const weeks = Math.floor(diffDays / 7)
      return `in ${weeks} week${weeks > 1 ? 's' : ''}`
    }
    const months = Math.floor(diffDays / 30)
    return `in ${months} month${months > 1 ? 's' : ''}`
  }

  const getFirstSentence = (text: string) => {
    const match = text.match(/^[^.!?]+[.!?]/)
    return match ? match[0] : text.split(' ').slice(0, 15).join(' ') + '...'
  }

  const countdown = getCountdown(event.date)
  const firstSentence = getFirstSentence(description)

  return (
    <div className="rounded-lg border border-green-500 bg-green-50 p-6 dark:border-green-700 dark:bg-green-900/20">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full bg-green-200 px-3 py-1 text-sm font-semibold text-green-800 dark:bg-green-800 dark:text-green-100">
          Upcoming
        </span>
        {countdown && (
          <span className="rounded-full bg-green-600 px-3 py-1 text-sm font-bold text-white dark:bg-green-500">
            🗓️ {countdown}
          </span>
        )}
      </div>
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
      <div className="mb-4 rounded-lg bg-green-100 p-3 dark:bg-green-800/30">
        <p className="text-xl font-bold text-green-900 dark:text-green-100">{event.eventName}</p>
        <p className="text-lg font-semibold text-green-800 dark:text-green-200">
          📅 {formatDate(event.date)}
        </p>
        <p className="text-sm text-green-700 dark:text-green-300">📍 {event.location}</p>
      </div>
      <div className="mb-3">
        <p className="prose max-w-none text-gray-600 dark:text-gray-400">
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
      <div className="mb-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded bg-green-200 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-700 dark:text-green-100"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {conferenceUrl && (
          <Link
            href={conferenceUrl}
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 font-medium"
          >
            🎤 Conference →
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
      </div>
    </div>
  )
}
