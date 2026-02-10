import siteMetadata from '@/data/siteMetadata'

export const dynamic = 'force-static'

export function GET() {
  const md = [
    `# ${siteMetadata.title}`,
    '',
    `Site: ${siteMetadata.siteUrl}`,
    `Author: ${siteMetadata.author}`,
    '',
    '## Start here',
    `- About: ${siteMetadata.siteUrl}/about`,
    `- Blog index: ${siteMetadata.siteUrl}/blog`,
    `- Speaking: ${siteMetadata.siteUrl}/speaking`,
    `- Projects: ${siteMetadata.siteUrl}/projects`,
    `- Now: ${siteMetadata.siteUrl}/now`,
    '',
    '## Machine-readable resources',
    `- Sitemap: ${siteMetadata.siteUrl}/sitemap.xml`,
    `- RSS: ${siteMetadata.siteUrl}/feed.xml`,
    `- LLM index (JSON): ${siteMetadata.siteUrl}/llms.json`,
    `- LLM index (text): ${siteMetadata.siteUrl}/llms.txt`,
    `- LLM full dump (text): ${siteMetadata.siteUrl}/llms-full.txt`,
    '',
    'Tip: Most blog posts also have a Markdown mirror at `/blog-md/<slug>`.',
    '',
  ].join('\n')

  return new Response(md, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
