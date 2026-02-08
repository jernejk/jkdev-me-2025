import communityData from '@/data/communityData'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: 'Community',
  description: 'Communities and groups I help run or am part of.',
})

export default function Community() {
  return (
    <div className="space-y-8 pt-6 pb-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
          Community
        </h1>
        <p className="max-w-3xl text-lg leading-7 text-gray-600 dark:text-gray-400">
          Groups I contribute to in Brisbane and beyond.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {communityData.map((community) => (
          <article
            key={community.name}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              <a
                href={community.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-cyan-700 dark:hover:text-cyan-300"
              >
                {community.name}
              </a>
            </h2>
            <p className="mt-1 text-sm font-semibold text-cyan-700 dark:text-cyan-300">
              {community.role}
            </p>
            <p className="mt-3 text-gray-600 dark:text-gray-400">{community.description}</p>
            <div className="mt-4 flex gap-4 text-sm font-semibold">
              <a
                href={community.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-700 hover:text-cyan-600 dark:text-cyan-300 dark:hover:text-cyan-200"
              >
                Website
              </a>
              {community.meetupUrl && (
                <a
                  href={community.meetupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-700 hover:text-cyan-600 dark:text-cyan-300 dark:hover:text-cyan-200"
                >
                  Meetup
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
