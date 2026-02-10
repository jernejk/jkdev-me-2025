import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from 'pliny/utils/formatDate'

interface Talk {
  title: string
  description: string
  events: {
    eventName: string
    location?: string
    date: string
    url?: string | null
  }[]
  tags: string[]
  conferenceUrl?: string | null
}

interface UpcomingTalkCardProps {
  talk: Talk
  compact?: boolean
}

export default function UpcomingTalkCard({ talk, compact = false }: UpcomingTalkCardProps) {
  const { title, description, events, tags, conferenceUrl } = talk
  const event = events && events.length > 0 ? events[0] : null

  if (!event) return null

  // Determine best URL for favicon (prefer conferenceUrl, avoid Eventbrite if possible)
  const getBestUrlForIcon = () => {
    const isEventbrite = (url: string) => url && url.includes('eventbrite')

    if (conferenceUrl && !isEventbrite(conferenceUrl)) return conferenceUrl
    if (event.url && !isEventbrite(event.url)) return event.url
    return conferenceUrl || event.url
  }

  const iconUrl = getBestUrlForIcon()

  // Helper to get domain from URL
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname
    } catch (e) {
      return ''
    }
  }

  const eventDomain = iconUrl ? getDomain(iconUrl) : ''
  const faviconUrl = eventDomain
    ? `https://www.google.com/s2/favicons?domain=${eventDomain}&sz=64`
    : null

  return (
    <div
      className={`group relative overflow-hidden ${
        compact
          ? 'rounded-lg border border-cyan-600/30 bg-gradient-to-br from-white to-cyan-50/40 dark:border-cyan-400/30 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-950'
          : 'rounded-xl bg-gradient-to-br from-white to-gray-50 p-1 shadow-md transition-all hover:shadow-lg dark:from-gray-800 dark:to-gray-900'
      }`}
    >
      {!compact && (
        <div className="bg-primary-500/5 group-hover:bg-primary-500/10 absolute -top-12 -right-12 h-40 w-40 rounded-full blur-3xl transition-all"></div>
      )}

      <div
        className={`relative h-full ${compact ? 'bg-transparent p-3' : 'rounded-lg bg-white p-4 dark:bg-gray-900'}`}
      >
        <div className={`flex ${compact ? 'gap-3' : 'flex-col gap-4 sm:flex-row'}`}>
          {/* Left side: Event Info & Icon */}
          <div
            className={`flex shrink-0 flex-col items-center justify-center gap-2 ${compact ? 'w-16' : 'sm:w-24 sm:border-r sm:border-gray-100 sm:pr-4 dark:sm:border-gray-800'}`}
          >
            {faviconUrl ? (
              <div
                className={`relative overflow-hidden rounded-md bg-white p-1 ring-1 shadow-sm ring-cyan-200/80 dark:bg-gray-800 dark:ring-cyan-500/20 ${compact ? 'h-10 w-10' : 'h-12 w-12'}`}
              >
                <Image
                  src={faviconUrl}
                  alt={event.eventName}
                  width={compact ? 40 : 48}
                  height={compact ? 40 : 48}
                  className="h-full w-full object-contain"
                  unoptimized
                />
              </div>
            ) : (
              <div
                className={`bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center rounded-md text-cyan-800 dark:text-cyan-200 ${compact ? 'h-10 w-10 text-base' : 'h-12 w-12 text-xl'}`}
              >
                🎤
              </div>
            )}

            <div className="text-center">
              <div
                className={`text-xs font-bold ${compact ? 'text-cyan-900 dark:text-cyan-100' : 'text-gray-900 dark:text-gray-100'}`}
              >
                {new Date(event.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
              <div
                className={`text-[10px] ${compact ? 'text-cyan-700 dark:text-slate-300' : 'text-gray-500 dark:text-gray-400'}`}
              >
                {new Date(event.date).getFullYear()}
              </div>
            </div>
          </div>

          {/* Right side: Content */}
          <div className="flex min-w-0 flex-1 flex-col justify-center">
            <h3
              className={`${compact ? 'mb-1 text-lg leading-tight font-semibold text-gray-900 dark:text-white' : 'mb-2 text-2xl leading-tight font-bold text-gray-900 dark:text-gray-100'}`}
            >
              {conferenceUrl ? (
                <Link
                  href={conferenceUrl}
                  className="transition-colors hover:text-cyan-700 dark:hover:text-cyan-300"
                >
                  {title}
                </Link>
              ) : (
                title
              )}
            </h3>

            <div
              className={`flex flex-wrap items-center gap-x-2 ${compact ? 'mb-2 text-xs text-gray-700 dark:text-slate-300' : 'mb-3 text-sm text-gray-600 dark:text-gray-400'}`}
            >
              <span
                className={`font-semibold ${compact ? 'text-gray-900 dark:text-cyan-100' : 'text-gray-800 dark:text-gray-200'}`}
              >
                {event.eventName}
              </span>
              <span
                className={
                  compact
                    ? 'text-cyan-600/50 dark:text-cyan-300/40'
                    : 'text-gray-300 dark:text-gray-600'
                }
              >
                •
              </span>
              <span>{event.location}</span>
            </div>

            {!compact && (
              <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.slice(0, compact ? 3 : tags.length).map((tag) => (
                  <span
                    key={tag}
                    className={`${compact ? 'rounded-md bg-cyan-100 px-1.5 py-0.5 text-[10px] font-medium text-cyan-900 dark:bg-cyan-500/15 dark:text-cyan-100' : 'rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
