import Image from 'next/image'
import Link from 'next/link'
import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: 'A Very Merry Waaagh!',
  description: 'A Christmas painting project featuring my Warhammer 40,000 Orks.',
})

const paintIdeas = [
  { name: 'Boss Green', colour: '#9bb94f', use: 'Olive skin with bright yellow-green highlights.' },
  {
    name: 'Red Goes Festive',
    colour: '#c95242',
    use: 'Santa red on one scrap-metal shoulder plate.',
  },
  { name: 'Questionable Snow', colour: '#e5dfc7', use: 'Off-white snow over a muddy base.' },
]

export default function ChristmasWaaagh() {
  return (
    <article className="space-y-10 py-8 sm:space-y-12 sm:py-12">
      <Link
        href="/projects"
        className="text-primary-600 dark:text-primary-400 text-sm font-semibold hover:underline"
      >
        ← All projects
      </Link>

      <header className="overflow-hidden rounded-3xl border border-stone-700 bg-[#1b2420] text-[#fff0d1]">
        <div className="grid items-center md:grid-cols-[1.08fr_1fr]">
          <div className="space-y-5 px-6 pt-8 pb-4 sm:px-9 sm:pt-10 md:pb-10">
            <p className="font-mono text-xs font-bold tracking-[0.18em] text-[#b4ca73] uppercase">
              Christmas at the paint bench
            </p>
            <h1 className="text-4xl leading-none font-black tracking-tight sm:text-5xl">
              A Very Merry Waaagh!
            </h1>
            <p className="text-xl leading-snug font-semibold text-[#ecd6a8]">
              In the grimdark future, there is only{' '}
              <strong className="text-[#c2df73]">WAAAGH!</strong>
            </p>
          </div>
          <Image
            src="/static/images/projects/christmas-waaagh.svg"
            alt=""
            width={544}
            height={306}
            unoptimized
            priority
            className="h-auto w-full"
          />
        </div>
      </header>

      <section aria-labelledby="paint-bench" className="max-w-prose space-y-3">
        <h2 id="paint-bench" className="text-2xl font-bold">
          Abominable Intelligence is forbidden
        </h2>
        <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
          I spend a lot of time building with AI. In Warhammer 40,000 that would get me in trouble
          with the Imperium. Luckily, the Orks on my painting bench only need a brush, some green
          paint, and a very loose interpretation of Christmas.
        </p>
      </section>

      <section aria-labelledby="paint-plan" className="space-y-4">
        <h2 id="paint-plan" className="text-2xl font-bold">
          The Christmas paint plan
        </h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {paintIdeas.map(({ name, colour, use }) => (
            <li key={name} className="rounded-xl border border-stone-200 p-4 dark:border-stone-700">
              <span
                aria-hidden="true"
                className="mb-3 block h-3 w-10 rounded-full"
                style={{ backgroundColor: colour }}
              />
              <p className="font-semibold">{name}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{use}</p>
            </li>
          ))}
        </ul>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Mini photos to come once the boyz are painted.
        </p>
      </section>

      <footer className="border-t border-stone-200 pt-4 text-xs text-gray-600 dark:border-stone-700 dark:text-gray-400">
        An unofficial Warhammer 40,000 fan project.
      </footer>
    </article>
  )
}
