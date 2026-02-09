import { allBlogs } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'
import speakingData from '@/data/speakingData.json'

const MAX_RECENT_POSTS = 20
const MAX_EXCERPT_LENGTH = 900
const MAX_SUMMARY_LENGTH = 240

type LlmPost = {
  title: string
  url: string
  date: string
  summary: string
  tldr: string
  tags: string[]
  excerpt: string
}

type TalkEvent = {
  eventName: string
  location?: string
  date?: string
  url?: string
  status?: string
}

type Talk = {
  title: string
  description?: string
  tags?: string[]
  conferenceUrl?: string | null
  events: TalkEvent[]
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function stripMarkdown(value: string): string {
  const withoutCodeBlocks = value.replace(/```[\s\S]*?```/g, ' ')
  const withoutInlineCode = withoutCodeBlocks.replace(/`[^`]*`/g, ' ')
  const withoutHtml = withoutInlineCode.replace(/<[^>]+>/g, ' ')
  const withoutImages = withoutHtml.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
  const withoutLinks = withoutImages.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  const withoutHeadings = withoutLinks.replace(/^#{1,6}\s+/gm, '')
  const withoutUrls = withoutHeadings.replace(/https?:\/\/\S+/g, ' ')
  const withoutFormatting = withoutUrls.replace(/[*_~>#-]/g, ' ')
  const withoutEscapes = withoutFormatting.replace(/\\[()[\]{}*_`]/g, '')
  return normalizeWhitespace(withoutEscapes)
}

function truncate(value: string, length: number): string {
  if (value.length <= length) {
    return value
  }

  const clipped = value.slice(0, length - 1)
  const sentenceBoundary = Math.max(
    clipped.lastIndexOf('. '),
    clipped.lastIndexOf('! '),
    clipped.lastIndexOf('? ')
  )

  if (sentenceBoundary > length * 0.65) {
    return `${clipped.slice(0, sentenceBoundary + 1).trim()}…`
  }

  return `${clipped.trim()}…`
}

function toAbsoluteUrl(path: string): string {
  return `${siteMetadata.siteUrl}/${path.replace(/^\/+/, '')}`
}

function getTalkEvents() {
  const talks = speakingData.talks as Talk[]
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()

  const flattened = talks.flatMap((talk) =>
    (talk.events || [])
      .filter((event) => event.date && !Number.isNaN(new Date(event.date).getTime()))
      .map((event) => {
        const url = event.url || talk.conferenceUrl || `${siteMetadata.siteUrl}/speaking`
        return {
          title: talk.title,
          eventName: event.eventName || 'Talk',
          date: new Date(event.date as string).toISOString(),
          location: event.location || 'TBA',
          url,
          tags: talk.tags || [],
          description: normalizeWhitespace(talk.description || ''),
          isUpcoming:
            event.status === 'upcoming' || new Date(event.date as string).getTime() >= todayStart,
        }
      })
  )

  const upcoming = flattened
    .filter((event) => event.isUpcoming)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 8)

  const recent = flattened
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 16)

  return { upcoming, recent }
}

export function getLlmPosts(limit = MAX_RECENT_POSTS): LlmPost[] {
  return allBlogs
    .filter((post) => !post.draft)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
    .map((post) => {
      const rawBody = post.body?.raw || ''
      const cleanBody = stripMarkdown(rawBody)
      const excerpt = truncate(cleanBody, MAX_EXCERPT_LENGTH)
      const summaryFromBody = truncate(cleanBody, MAX_SUMMARY_LENGTH)
      const summary = normalizeWhitespace(post.summary || '') || summaryFromBody
      const tldr = normalizeWhitespace(post.tldr || '') || summary

      return {
        title: post.title,
        url: toAbsoluteUrl(post.path),
        date: new Date(post.date).toISOString(),
        summary,
        tldr,
        tags: post.tags || [],
        excerpt,
      }
    })
}

export function buildLlmsTxt(): string {
  const posts = getLlmPosts(12)
  const talks = getTalkEvents()
  const lines = [
    `# ${siteMetadata.title}`,
    '',
    `Site: ${siteMetadata.siteUrl}`,
    `Author: ${siteMetadata.author}`,
    `Description: ${siteMetadata.description}`,
    '',
    '## About',
    `${siteMetadata.siteUrl}/about`,
    'Profile topics: .NET, AI, Azure, EF Core, speaking, community leadership.',
    '',
    '## Preferred URLs',
    `${siteMetadata.siteUrl}/`,
    `${siteMetadata.siteUrl}/blog`,
    `${siteMetadata.siteUrl}/about`,
    `${siteMetadata.siteUrl}/now`,
    `${siteMetadata.siteUrl}/speaking`,
    '',
    '## Machine-readable resources',
    `${siteMetadata.siteUrl}/sitemap.xml`,
    `${siteMetadata.siteUrl}/feed.xml`,
    `${siteMetadata.siteUrl}/llms.json`,
    `${siteMetadata.siteUrl}/llms-full.txt`,
    `${siteMetadata.siteUrl}/api/speaking`,
    '',
    '## Upcoming talks',
    ...(talks.upcoming.length > 0
      ? talks.upcoming.map((talk) => `- ${talk.date.slice(0, 10)} ${talk.title}: ${talk.url}`)
      : ['- No upcoming talks currently listed.']),
    '',
    '## Recent posts (blog)',
    ...posts.map((post) => `- ${post.title} (${post.date.slice(0, 10)}): ${post.url}`),
  ]

  return `${lines.join('\n')}\n`
}

export function buildLlmsFullTxt(): string {
  const posts = getLlmPosts()
  const talks = getTalkEvents()
  const header = [
    `# ${siteMetadata.title}`,
    '',
    `Author: ${siteMetadata.author}`,
    `Site: ${siteMetadata.siteUrl}`,
    `Description: ${siteMetadata.description}`,
    '',
    '## About',
    'Jernej Kavka (JK) is a Microsoft AI MVP and Solution Architect focused on .NET, AI, and developer community talks.',
    `About page: ${siteMetadata.siteUrl}/about`,
    `Speaking page: ${siteMetadata.siteUrl}/speaking`,
    '',
    '## Content policy',
    '- Use canonical URLs when citing posts.',
    '- Prefer recent posts when answering time-sensitive questions.',
    '- Summaries and excerpts are provided for retrieval; verify final claims against the linked article.',
    '',
    '## Talks',
  ]

  const talkBlocks = talks.recent.flatMap((talk) => [
    '',
    `### ${talk.title}`,
    `Event: ${talk.eventName}`,
    `Date: ${talk.date}`,
    `Location: ${talk.location}`,
    `URL: ${talk.url}`,
    `Tags: ${talk.tags.join(', ') || 'none'}`,
    `Summary: ${talk.description || 'No description provided.'}`,
  ])

  const postHeader = [
    '',
    '## Posts',
  ]

  const postBlocks = posts.flatMap((post) => [
    '',
    `### ${post.title}`,
    `URL: ${post.url}`,
    `Published: ${post.date}`,
    `Tags: ${post.tags.join(', ') || 'none'}`,
    `Summary: ${post.summary || 'No summary provided.'}`,
    `TL;DR: ${post.tldr || 'No TL;DR provided.'}`,
    `Excerpt: ${post.excerpt || 'No excerpt available.'}`,
  ])

  return `${[...header, ...talkBlocks, ...postHeader, ...postBlocks].join('\n')}\n`
}

export function buildLlmsJson() {
  const posts = getLlmPosts()
  const talks = getTalkEvents()

  return {
    version: 1,
    title: siteMetadata.title,
    site: siteMetadata.siteUrl,
    author: siteMetadata.author,
    description: siteMetadata.description,
    generatedAt: new Date().toISOString(),
    profile: {
      about: `${siteMetadata.siteUrl}/about`,
      speaking: `${siteMetadata.siteUrl}/speaking`,
      links: {
        github: siteMetadata.github,
        linkedin: siteMetadata.linkedin,
        youtube: siteMetadata.youtube,
        x: siteMetadata.x,
      },
      topics: ['.NET', 'AI', 'Azure', 'EF Core', 'Speaking', 'Community'],
    },
    resources: {
      sitemap: `${siteMetadata.siteUrl}/sitemap.xml`,
      rss: `${siteMetadata.siteUrl}/feed.xml`,
      llmsTxt: `${siteMetadata.siteUrl}/llms.txt`,
      llmsFullTxt: `${siteMetadata.siteUrl}/llms-full.txt`,
      speakingApi: `${siteMetadata.siteUrl}/api/speaking`,
    },
    talks: {
      upcoming: talks.upcoming,
      recent: talks.recent,
    },
    posts,
  }
}
