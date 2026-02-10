const { URL } = require('url')

function getBaseUrl() {
  const raw = process.env.SEO_SITE || 'https://jkdev.me'
  const url = new URL(raw)
  // Normalize: drop trailing slash to avoid double `//` when joining.
  url.pathname = url.pathname.replace(/\/+$/, '')
  return url.toString()
}

const baseUrl = getBaseUrl()

module.exports = {
  defaults: {
    timeout: 60_000,
    standard: 'WCAG2AA',
    wait: 250,
  },
  urls: [
    `${baseUrl}/`,
    `${baseUrl}/about`,
    `${baseUrl}/blog`,
    `${baseUrl}/speaking`,
    `${baseUrl}/projects`,
    `${baseUrl}/tags`,
  ],
}
