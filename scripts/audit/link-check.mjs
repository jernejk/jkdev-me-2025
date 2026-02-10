import { EventEmitter } from 'node:events'
import { check } from 'linkinator'
import { getSeoSite, hostForRegex, writeJson } from './_util.mjs'

const site = getSeoSite(process.argv)
const outFile = process.env.SEO_LINK_REPORT || 'test-results/seo/linkinator.json'

async function main() {
  // Avoid noisy warnings when crawling lots of URLs.
  EventEmitter.defaultMaxListeners = 50

  const host = hostForRegex(site)
  const skip = [
    // Skip external absolute URLs (keep this stable; external links are flaky and not “your” regressions).
    `^https?:\\/\\/(?!${host})`,
    '^\\/\\/(?!' + host + ')', // protocol-relative external
    '^mailto:',
    '^tel:',
    '^javascript:',
    '/_next/', // ignore Next.js build artifacts; focus on human/SEO URLs
  ]

  const result = await check({
    path: site.toString(),
    recurse: true,
    timeout: Number(process.env.SEO_LINK_TIMEOUT_MS || 30_000),
    concurrency: Number(process.env.SEO_LINK_CONCURRENCY || 20),
    retryErrors: true,
    retryErrorsCount: 2,
    linksToSkip: skip,
    // Don’t fail the run due to expected redirects, but still follow them.
    redirects: 'allow',
  })

  const broken = (result.links || []).filter((l) => l.state === 'BROKEN')

  await writeJson(outFile, {
    site: site.toString(),
    checkedAt: new Date().toISOString(),
    skip,
    passed: result.passed,
    brokenCount: broken.length,
    broken,
    linkCount: result.links?.length || 0,
  })

  if (broken.length > 0) process.exit(13)
}

try {
  // Keep the event loop alive while linkinator crawls (Node can otherwise exit early with
  // "Detected unsettled top-level await" depending on runtime/network conditions).
  const keepAlive = setInterval(() => {}, 1000)
  await main()
  clearInterval(keepAlive)
} catch (err) {
  console.error(err)
  process.exit(1)
}
