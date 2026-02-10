import { getSeoSite, joinUrl, hostForRegex, writeJson } from './_util.mjs'

const site = getSeoSite(process.argv)
const outFile = process.env.SEO_AI_REPORT || 'test-results/seo/ai-benchmark.json'

function isInternal(url) {
  try {
    const u = new URL(url)
    return u.host === site.host
  } catch {
    return false
  }
}

async function fetchOk(url, { method = 'GET' } = {}) {
  const res = await fetch(url, {
    method,
    redirect: 'follow',
    headers: {
      // Avoid cached 404s when running against Vercel/CF.
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  })
  return res
}

function extractUrlsFromLlms(text) {
  const urls = new Set()
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    // Capture inline URLs, including `(md: https://...)` patterns.
    for (const match of trimmed.matchAll(/https?:\/\/[^\s)]+/g)) urls.add(match[0])
  }
  return [...urls]
}

function blogSlugFromUrl(url) {
  const u = new URL(url)
  const parts = u.pathname.split('/').filter(Boolean)
  if (parts[0] !== 'blog' || parts.length < 2) return null
  return parts.slice(1).join('/')
}

async function main() {
  const report = {
    site: site.toString(),
    checkedAt: new Date().toISOString(),
    checks: [],
    failures: [],
  }

  const requiredMarkdownEndpoints = [joinUrl(site, '/llms.txt'), joinUrl(site, '/md')]
  for (const url of requiredMarkdownEndpoints) {
    const res = await fetchOk(url)
    const ok = res.ok
    const ct = res.headers.get('content-type') || ''
    const body = await res.text()
    const isMarkdown =
      ct.includes('text/plain') || ct.includes('text/markdown') || body.startsWith('# ')
    report.checks.push({ type: 'endpoint', url, status: res.status, contentType: ct })
    if (!ok || !isMarkdown) {
      report.failures.push({ type: 'endpoint', url, status: res.status, contentType: ct })
    }
  }

  // Pull internal URLs from llms.txt and ensure they’re reachable (AIs tend to start here).
  const llmsRes = await fetchOk(joinUrl(site, '/llms.txt'))
  const llmsText = await llmsRes.text()
  const allUrls = extractUrlsFromLlms(llmsText).filter(isInternal)

  // Keep this bounded; the point is to catch obvious regressions, not DoS your own site.
  const maxUrls = Number(process.env.SEO_AI_MAX_URLS || 80)
  const urls = allUrls.slice(0, maxUrls)

  for (const url of urls) {
    // HEAD first (faster), fall back to GET if the server rejects HEAD.
    let res = await fetchOk(url, { method: 'HEAD' })
    if (res.status === 405 || res.status === 501) res = await fetchOk(url, { method: 'GET' })

    report.checks.push({ type: 'url', url, status: res.status })
    if (!res.ok) report.failures.push({ type: 'url', url, status: res.status })

    const slug = blogSlugFromUrl(url)
    if (!slug) continue

    const mdUrl = joinUrl(site, `/blog-md/${slug}`)
    const mdRes = await fetchOk(mdUrl)
    const md = await mdRes.text()

    const mdOk =
      mdRes.ok &&
      (mdRes.headers.get('content-type') || '').includes('text/markdown') &&
      /(^|\n)Summary: /i.test(md) &&
      /(^|\n)TL;DR: /i.test(md)

    report.checks.push({ type: 'blog-md', url: mdUrl, status: mdRes.status })
    if (!mdOk) {
      report.failures.push({
        type: 'blog-md',
        url: mdUrl,
        status: mdRes.status,
        hint: 'Expected markdown with Summary: and TL;DR: lines',
      })
    }
  }

  await writeJson(outFile, report)

  if (report.failures.length > 0) {
    const hostRe = hostForRegex(site)
    const internalFailures = report.failures.filter((f) =>
      String(f.url || '').match(new RegExp(hostRe))
    )
    console.error(
      `AI benchmark failed: ${report.failures.length} failures (${internalFailures.length} internal).`
    )
    process.exit(2)
  }
}

try {
  await main()
} catch (err) {
  console.error(err)
  process.exit(1)
}
