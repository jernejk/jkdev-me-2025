import { genPageMetadata } from 'app/seo'

export const metadata = genPageMetadata({
  title: 'Now',
  description: 'What I am currently focused on.',
})

export default function Now() {
  return (
    <div className="space-y-8 pt-6 pb-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
          Now
        </h1>
        <p className="max-w-3xl text-lg leading-7 text-gray-600 dark:text-gray-400">
          What I am currently focused on. Inspired by nownownow.com.
        </p>
      </div>

      <div className="prose dark:prose-invert max-w-none">
        <p>
          <em>Last updated: February 2026</em>
        </p>

        <h2>Current Focus</h2>
        <ul>
          <li>
            Preparing and refining talks around EF Core performance and developer workflows for
            local and conference events.
          </li>
          <li>
            Building practical .NET and AI experiments, with a focus on offline/local model usage.
          </li>
          <li>
            Improving content workflows for tutorials: faster drafting from notes, cleaner editing,
            stronger technical depth.
          </li>
        </ul>

        <h2>Community</h2>
        <ul>
          <li>Co-organizing AI Hack Day and Global AI Podcast initiatives.</li>
          <li>Active across Brisbane developer and AI communities.</li>
        </ul>

        <h2>Work</h2>
        <p>
          Solution Architect at SSW Consulting in Brisbane, focused on .NET, EF Core, Azure, and
          AI-enabled developer tooling.
        </p>
      </div>
    </div>
  )
}
