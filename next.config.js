const { withContentlayer } = require('next-contentlayer2')
const fs = require('fs')
const path = require('path')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// You might need to insert additional domains in script-src if you are using external services
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' giscus.app analytics.umami.is cloud.umami.is;
  style-src 'self' 'unsafe-inline';
  img-src * blob: data:;
  media-src *.s3.amazonaws.com;
  connect-src *;
  font-src 'self';
  frame-src giscus.app
`

const securityHeaders = [
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\n/g, ''),
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
]

const output = process.env.EXPORT ? 'export' : undefined
const basePath = process.env.BASE_PATH || undefined
const unoptimized = process.env.UNOPTIMIZED ? true : undefined

/**
 * @type {import('next/dist/next-server/server/config').NextConfig}
 **/
module.exports = () => {
  const plugins = [withContentlayer, withBundleAnalyzer]

  const legacyBlogRedirects = fs
    .readdirSync(path.join(process.cwd(), 'data', 'blog'))
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''))
    .map((slug) => ({
      source: `/${slug}`,
      destination: `/blog/${slug}`,
      permanent: true,
    }))

  return plugins.reduce((acc, next) => next(acc), {
    output,
    basePath,
    reactStrictMode: true,
    trailingSlash: false,
    // Avoid Next.js picking an incorrect tracing root when other lockfiles exist outside this repo.
    outputFileTracingRoot: path.join(__dirname),
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
    eslint: {
      dirs: ['app', 'components', 'layouts', 'scripts'],
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'picsum.photos',
        },
      ],
      unoptimized,
    },
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: securityHeaders,
        },
      ]
    },
    async redirects() {
      return [
        ...legacyBlogRedirects,
        // Legacy RSS/feed endpoints (Ghost used `/rss/`).
        { source: '/rss', destination: '/feed.xml', permanent: true },
        { source: '/rss/', destination: '/feed.xml', permanent: true },
        { source: '/feed', destination: '/feed.xml', permanent: true },
        { source: '/feed/', destination: '/feed.xml', permanent: true },
        { source: '/rss.xml', destination: '/feed.xml', permanent: true },
        { source: '/atom.xml', destination: '/feed.xml', permanent: true },

        // Legacy Ghost patterns.
        { source: '/page/:page', destination: '/blog', permanent: true },
        { source: '/page/:page/', destination: '/blog', permanent: true },
        { source: '/tag/:slug/page/:page', destination: '/tags/:slug', permanent: true },
        { source: '/tag/:slug/page/:page/', destination: '/tags/:slug', permanent: true },
        { source: '/tag/:slug/rss', destination: '/tags/:slug/feed.xml', permanent: true },
        { source: '/tag/:slug/rss/', destination: '/tags/:slug/feed.xml', permanent: true },

        // Legacy tag slugs that don't match current tag slugification.
        { source: '/tag/ml-net', destination: '/tags/mlnet', permanent: true },
        { source: '/tag/ml-net/', destination: '/tags/mlnet', permanent: true },
        { source: '/tags/ml-net', destination: '/tags/mlnet', permanent: true },
        { source: '/tags/ml-net/', destination: '/tags/mlnet', permanent: true },

        // Old tag exists but has no posts on the legacy site.
        { source: '/tag/getting-started', destination: '/tags', permanent: true },
        { source: '/tag/getting-started/', destination: '/tags', permanent: true },

        { source: '/author/jk', destination: '/about', permanent: true },
        { source: '/author/jk/:path*', destination: '/about', permanent: true },
        { source: '/author/:slug', destination: '/about', permanent: true },
        { source: '/author/:slug/:path*', destination: '/about', permanent: true },
        { source: '/about-me', destination: '/about', permanent: true },
        { source: '/about-me-test', destination: '/about', permanent: true },
        { source: '/about-me-test/', destination: '/about', permanent: true },
        { source: '/about-me-test/:path*', destination: '/about', permanent: true },
        { source: '/brisbane-ai-ug', destination: '/community', permanent: true },
        { source: '/brisbane-ai-ug/', destination: '/community', permanent: true },
        { source: '/brisbane-ai-ug/:path*', destination: '/community', permanent: true },
        { source: '/cognitive-studio', destination: '/projects', permanent: true },
        { source: '/cognitive-studio/', destination: '/projects', permanent: true },
        { source: '/cognitive-studio/:path*', destination: '/projects', permanent: true },
        { source: '/:slug/amp', destination: '/blog/:slug', permanent: true },
        { source: '/blog/:slug/amp', destination: '/blog/:slug', permanent: true },
        { source: '/tag/:slug', destination: '/tags/:slug', permanent: true },
      ]
    },
    webpack: (config, options) => {
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      })

      return config
    },
  })
}
