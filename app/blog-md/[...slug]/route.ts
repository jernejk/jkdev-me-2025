import { allBlogs } from 'contentlayer/generated'
import siteMetadata from '@/data/siteMetadata'

export const dynamic = 'force-static'

function toAbsoluteUrl(path: string) {
  return `${siteMetadata.siteUrl}/${path.replace(/^\/+/, '')}`
}

export async function GET(_: Request, ctx: { params: Promise<{ slug: string[] }> }) {
  const params = await ctx.params
  const slug = decodeURI(params.slug.join('/'))
  const post = allBlogs.find((p) => p.slug === slug)

  if (!post || post.draft) {
    return new Response('Not found', { status: 404 })
  }

  const url = toAbsoluteUrl(post.path)
  const tags = (post.tags || []).join(', ')
  const lines = [
    `# ${post.title}`,
    '',
    `URL: ${url}`,
    `Published: ${new Date(post.date).toISOString()}`,
    `Updated: ${new Date(post.lastmod || post.date).toISOString()}`,
    tags ? `Tags: ${tags}` : 'Tags: none',
    '',
    post.summary ? `Summary: ${post.summary}` : '',
    post.tldr ? `TL;DR: ${post.tldr}` : '',
    '',
    '---',
    '',
    // MDX is still very readable for most crawlers/LLMs; code fences/links preserved.
    post.body?.raw || '',
    '',
  ].filter(Boolean)

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
