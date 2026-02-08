import Link from '@/components/Link'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'
import UpcomingTalkCard from '@/components/speaking/UpcomingTalkCard'
import Tag from '@/components/Tag'
import Image from 'next/image'
import SocialIcon from '@/components/social-icons'

const MAX_DISPLAY = 4

export default function Home({ posts, upcomingTalk }) {
  return (
    <div className="space-y-10 pt-6 pb-6">
      <section className="relative overflow-hidden rounded-3xl border border-cyan-500/25 bg-[radial-gradient(circle_at_20%_20%,rgba(6,182,212,0.14),transparent_45%),radial-gradient(circle_at_90%_90%,rgba(14,165,233,0.16),transparent_40%),linear-gradient(140deg,rgba(15,23,42,0.95),rgba(2,6,23,0.96))] p-6 sm:p-8">
        <div className="grid gap-6 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
          <div className="mx-auto md:mx-0">
            <div className="rounded-full border-2 border-cyan-400/70 p-1 shadow-[0_0_40px_rgba(6,182,212,0.28)]">
              <Image
                src="/static/images/jk-headshot.jpg"
                alt="Jernej Kavka"
                width={210}
                height={210}
                className="h-[210px] w-[210px] rounded-full object-cover"
                priority
              />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Jernej Kavka (JK)
            </h1>
            <p className="mt-2 text-xl text-cyan-100/85">
              Microsoft AI MVP · Solution Architect · Speaker
            </p>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-200">
              I build with .NET and AI, speak at conferences, and organize developer communities in
              Brisbane.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <SocialIcon kind="github" href={siteMetadata.github} size={6} />
              <SocialIcon kind="x" href={siteMetadata.x} size={6} />
              <SocialIcon kind="linkedin" href={siteMetadata.linkedin} size={6} />
              <SocialIcon kind="youtube" href={siteMetadata.youtube} size={6} />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_350px]">
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Latest Posts
            </h2>
            <Link
              href="/blog"
              className="text-sm font-semibold text-cyan-700 hover:text-cyan-600 dark:text-cyan-300 dark:hover:text-cyan-200"
              aria-label="All posts"
            >
              View all posts
            </Link>
          </div>

          {!posts.length && (
            <p className="rounded-xl border border-gray-200 bg-white p-4 text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
              No posts found.
            </p>
          )}

          <ul className="grid gap-4 md:grid-cols-2">
            {posts.slice(0, MAX_DISPLAY).map((post) => {
              const { slug, date, title, summary, tags } = post
              return (
                <li key={slug}>
                  <article className="h-full rounded-xl border border-gray-200/90 bg-white/95 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-cyan-400/50 hover:shadow-[0_10px_30px_rgba(8,145,178,0.16)] dark:border-gray-700/80 dark:bg-slate-900/75 dark:hover:border-cyan-400/50">
                    <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                    </div>
                    <h3 className="text-2xl leading-tight font-bold tracking-tight">
                      <Link
                        href={`/blog/${slug}`}
                        className="text-gray-900 transition-colors hover:text-cyan-700 dark:text-gray-100 dark:hover:text-cyan-300"
                      >
                        {title}
                      </Link>
                    </h3>
                    {summary && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                        {summary}
                      </p>
                    )}
                    {tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap">
                        {tags.slice(0, 3).map((tag) => (
                          <Tag key={tag} text={tag} />
                        ))}
                      </div>
                    )}
                  </article>
                </li>
              )
            })}
          </ul>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border border-gray-200/90 bg-white/95 p-4 shadow-sm dark:border-cyan-500/35 dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 dark:shadow-[0_12px_30px_rgba(8,145,178,0.18)]">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-cyan-100">
                Upcoming Talk
              </h2>
              <Link
                href="/speaking"
                className="text-xs font-semibold text-cyan-700 hover:text-cyan-600 dark:text-cyan-300 dark:hover:text-cyan-200"
                aria-label="See all speaking events"
              >
                All talks
              </Link>
            </div>
            {upcomingTalk ? (
              <UpcomingTalkCard talk={upcomingTalk} compact />
            ) : (
              <div className="rounded-lg border border-dashed border-cyan-300/70 bg-cyan-50/60 p-4 text-sm text-cyan-900 dark:border-cyan-400/40 dark:bg-transparent dark:text-slate-300">
                No upcoming talks listed right now.
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200/80 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-300">
              Quick Links
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href={siteMetadata.sessionize} className="text-cyan-700 dark:text-cyan-300">
                  Sessionize profile
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-cyan-700 dark:text-cyan-300">
                  Featured projects
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-cyan-700 dark:text-cyan-300">
                  Community work
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}
