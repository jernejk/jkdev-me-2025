import { allBlogs } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'

const MAX_RECENT_POSTS = 20
const MAX_EXCERPT_LENGTH = 900

type LlmPost = {
  title: string
  url: string
  date: string
  summary: string
  tags: string[]
  excerpt: string
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function stripMarkdown(value: string): string {
  const withoutCodeBlocks = value.replace(/```[\s\S]*?```/g, ' ')
  const withoutInlineCode = withoutCodeBlocks.replace(/`[^`]*`/g, ' ')
  const withoutImages = withoutInlineCode.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
  const withoutLinks = withoutImages.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
  const withoutHeadings = withoutLinks.replace(/^#{1,6}\s+/gm, '')
  const withoutFormatting = withoutHeadings.replace(/[*_~>#-]/g, ' ')
  return normalizeWhitespace(withoutFormatting)
}

function truncate(value: string, length: number): string {
  if (value.length <= length) {
    return value
  }

  return `${value.slice(0, length - 1).trim()}…`
}

function toAbsoluteUrl(path: string): string {
  return `${siteMetadata.siteUrl}/${path.replace(/^\/+/, '')}`
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

      return {
        title: post.title,
        url: toAbsoluteUrl(post.path),
        date: new Date(post.date).toISOString(),
        summary: normalizeWhitespace(post.summary || ''),
        tags: post.tags || [],
        excerpt,
      }
    })
}

export function buildLlmsTxt(): string {
  const posts = getLlmPosts(12)
  const lines = [
    `# ${siteMetadata.title}`,
    '',
    `Site: ${siteMetadata.siteUrl}`,
    `Author: ${siteMetadata.author}`,
    `Description: ${siteMetadata.description}`,
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
    '',
    '## Recent posts',
    ...posts.map((post) => `- ${post.title} (${post.date.slice(0, 10)}): ${post.url}`),
  ]

  return `${lines.join('\n')}\n`
}

export function buildLlmsFullTxt(): string {
  const posts = getLlmPosts()
  const header = [
    `# ${siteMetadata.title}`,
    '',
    `Site: ${siteMetadata.siteUrl}`,
    `Description: ${siteMetadata.description}`,
    '',
    '## Content policy',
    '- Use canonical URLs when citing posts.',
    '- Prefer recent posts when answering time-sensitive questions.',
    '- Summaries and excerpts are provided for retrieval; verify final claims against the linked article.',
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
    `Excerpt: ${post.excerpt || 'No excerpt available.'}`,
  ])

  return `${[...header, ...postBlocks].join('\n')}\n`
}

export function buildLlmsJson() {
  const posts = getLlmPosts()

  return {
    version: 1,
    title: siteMetadata.title,
    site: siteMetadata.siteUrl,
    author: siteMetadata.author,
    description: siteMetadata.description,
    generatedAt: new Date().toISOString(),
    resources: {
      sitemap: `${siteMetadata.siteUrl}/sitemap.xml`,
      rss: `${siteMetadata.siteUrl}/feed.xml`,
      llmsTxt: `${siteMetadata.siteUrl}/llms.txt`,
      llmsFullTxt: `${siteMetadata.siteUrl}/llms-full.txt`,
    },
    posts,
  }
}
