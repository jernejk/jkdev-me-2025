import 'css/tailwind.css'
import 'pliny/search/algolia.css'
import 'remark-github-blockquote-alert/alert.css'

import { Space_Grotesk } from 'next/font/google'
import { Analytics, AnalyticsConfig } from 'pliny/analytics'
import { SearchProvider, SearchConfig } from 'pliny/search'
import Header from '@/components/Header'
import SectionContainer from '@/components/SectionContainer'
import Footer from '@/components/Footer'
import siteMetadata from '@/data/siteMetadata'
import { ThemeProviders } from './theme-providers'
import { Metadata } from 'next'

const space_grotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.title}`,
  },
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: './',
    siteName: siteMetadata.title,
    images: [siteMetadata.socialBanner],
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: './',
    types: {
      'application/rss+xml': `${siteMetadata.siteUrl}/feed.xml`,
      'text/plain': [
        { url: `${siteMetadata.siteUrl}/llms.txt`, title: 'LLMs Text Index' },
        { url: `${siteMetadata.siteUrl}/llms-full.txt`, title: 'LLMs Full Text Index' },
      ],
      'application/json': [{ url: `${siteMetadata.siteUrl}/llms.json`, title: 'LLMs JSON Index' }],
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  twitter: {
    title: siteMetadata.title,
    card: 'summary_large_image',
    images: [siteMetadata.socialBanner],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const basePath = process.env.BASE_PATH || ''
  const schemaWebsite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteMetadata.title,
    url: siteMetadata.siteUrl,
    description: siteMetadata.description,
    inLanguage: siteMetadata.language,
  }
  const schemaPerson = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteMetadata.author,
    alternateName: ['Jernej Kavka (JK)', 'JK'],
    url: siteMetadata.siteUrl,
    image: `${siteMetadata.siteUrl}/static/images/jk-headshot.jpg`,
    jobTitle: 'Solution Architect',
    sameAs: [
      siteMetadata.github,
      siteMetadata.linkedin,
      siteMetadata.youtube,
      siteMetadata.x,
    ].filter(Boolean),
    knowsAbout: ['.NET', 'EF Core', 'Azure', 'AI', 'Performance', 'Speaking'],
  }

  return (
    <html
      lang={siteMetadata.language}
      className={`${space_grotesk.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <link
        rel="apple-touch-icon"
        sizes="76x76"
        href={`${basePath}/static/favicons/apple-touch-icon.png`}
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href={`${basePath}/static/favicons/favicon-32x32.png`}
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={`${basePath}/static/favicons/favicon-16x16.png`}
      />
      <link rel="manifest" href={`${basePath}/static/favicons/site.webmanifest`} />
      <link
        rel="mask-icon"
        href={`${basePath}/static/favicons/safari-pinned-tab.svg`}
        color="#5bbad5"
      />
      <meta name="msapplication-TileColor" content="#000000" />
      <meta name="theme-color" media="(prefers-color-scheme: light)" content="#fff" />
      <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000" />
      <link rel="alternate" type="application/rss+xml" href={`${basePath}/feed.xml`} />
      <link rel="alternate" type="text/plain" href={`${basePath}/llms.txt`} />
      <link rel="alternate" type="text/plain" href={`${basePath}/llms-full.txt`} />
      <link rel="alternate" type="application/json" href={`${basePath}/llms.json`} />
      <body className="bg-[#f6f9fc] pl-[calc(100vw-100%)] text-black antialiased dark:bg-[#020617] dark:text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([schemaWebsite, schemaPerson]) }}
        />
        <ThemeProviders>
          <Analytics analyticsConfig={siteMetadata.analytics as AnalyticsConfig} />
          <div className="pointer-events-none fixed inset-0 -z-10 hidden [background:radial-gradient(circle_at_20%_0%,rgba(6,182,212,0.18),transparent_40%),radial-gradient(circle_at_100%_80%,rgba(14,165,233,0.16),transparent_40%),linear-gradient(160deg,#0f172a_0%,#020617_100%)] dark:block" />
          <SectionContainer>
            <SearchProvider searchConfig={siteMetadata.search as SearchConfig}>
              <Header />
              <main className="mb-auto">{children}</main>
            </SearchProvider>
            <Footer />
          </SectionContainer>
        </ThemeProviders>
      </body>
    </html>
  )
}
