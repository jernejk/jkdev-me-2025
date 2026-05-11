import { genPageMetadata } from 'app/seo'
import Image from 'next/image'

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
          <em>Last updated: May 2026</em>
        </p>

        <h2>Current Focus</h2>
        <ul>
          <li>
            Preparing upcoming talks and workshops: AI agents in Notion at Build Club Brisbane,
            testing .NET agents with MAF + AgentEval at AgentCamp, and an EF Core performance
            deep-dive at the Brisbane .NET User Group.
          </li>
          <li>
            Building practical .NET and AI experiments, with a focus on offline/local model usage.
          </li>
          <li>
            Improving content workflows for tutorials: faster drafting from notes, cleaner editing,
            stronger technical depth.
          </li>
          <li>
            Crazy agentic experiments that I might write about if they work, or do a talk on if
            they're successful.
          </li>
          <li>Learning to build custom agent harnesses.</li>
          <li>
            Created a familiar Codex pet —{' '}
            <a href="https://petdex.crafter.run/pets/jk">petdex.crafter.run/pets/jk</a>.
            <Image
              src="/static/images/codex-pet-wave.gif"
              alt="Animated Codex pet waving"
              width={144}
              height={176}
              unoptimized
              className="not-prose mt-2 block h-[60px] w-[49px] [image-rendering:pixelated]"
            />
          </li>
        </ul>

        <h2>Upcoming Events</h2>
        <ul>
          <li>
            Hosting{' '}
            <a href="https://luma.com/0dd4m7we">
              Brisbane Build Club — Building Real AI Agents in Notion
            </a>{' '}
            (May 18, 2026) at The Precinct, Fortitude Valley.
          </li>
          <li>
            Speaking at the{' '}
            <a href="https://www.meetup.com/brisbane-net-user-group/">Brisbane .NET User Group</a>{' '}
            (June 4, 2026): <em>EF Core Bench Lab — A Peek into the Black Box</em>.
          </li>
          <li>
            Organiser for <a href="https://aihackday.com/sydney/">AI Hack Day Sydney</a> (July 11,
            2026): a free community hack day for developers building with AI.
          </li>
          <li>
            Organiser for <a href="https://aihackday.com/brisbane/">AI Hack Day Brisbane</a> (August
            1, 2026) at SSW Brisbane: a free community hack day for developers building with AI.
          </li>
        </ul>

        <h2>Recent</h2>
        <ul>
          <li>
            Ran a workshop at{' '}
            <a href="https://agentcamp.city/brisbane/">AgentCamp 2026 Brisbane Edition</a> (May 9,
            2026) at QUT Gardens Point:{' '}
            <em>From Vibe-Coded to Prod-Ready — Testing Your .NET Agents with MAF + AgentEval</em>.
          </li>
          <li>
            Hosted{' '}
            <a href="https://luma.com/yo5jatjk">Brisbane Build Club — Optimising Vibe Coding</a>{' '}
            (April 20, 2026) at Launch Event Space, Fortitude Valley: a night of vibe-coding talks
            and live walkthroughs for builders shipping full-stack AI apps.
          </li>
          <li>
            Attended the <a href="https://summit.microsoft.com/">Microsoft MVP Summit 2026</a>{' '}
            (March 24-26) at the Microsoft Redmond Campus: deep technical sessions, direct time with
            Microsoft product teams, and catching up with MVPs from around the world.
          </li>
          <li>
            Was one of the industry judges at the{' '}
            <a href="https://www.linkedin.com/feed/update/urn:li:activity:7449996174003970048/">
              QUT AI &amp; ML Society 2026 Hackathon
            </a>
            , QUT's biggest standalone student club hackathon to date, with 115+ students across 20
            teams from QUT and UQ.
          </li>
        </ul>

        <h2>Community</h2>
        <ul>
          <li>
            City Lead for{' '}
            <a href="https://www.meetup.com/build-club-brisbane/">Build Club Brisbane</a> —
            organizing workshops and talks on AI, MCP, and developer tooling.
          </li>
          <li>
            Running the Brisbane Full Stack User Group and speaking regularly at local meetups and
            conferences.
          </li>
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
