import { genPageMetadata } from 'app/seo'
import PushupChallengeCard from './PushupChallengeCard'

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
          <em>Last updated: June 8, 2026</em>
        </p>

        <h2>Current Focus</h2>
        <ul>
          <li>
            Shipping <a href="https://github.com/jernejk/efcore-bench-lab">EF Core Bench Lab</a>:
            practical EF Core query traces, execution plans, and performance investigations.
          </li>
          <li>
            Organising AI Hack Days in Sydney and Brisbane for developers who want practical,
            hands-on AI learning.
          </li>
          <li>
            Building useful .NET + AI experiments, especially local models and agent harnesses.
          </li>
          <li>Turning notes into sharper tutorials, talks, and demos.</li>
        </ul>

        <PushupChallengeCard />

        <h2>Upcoming Events</h2>
        <ul>
          <li>
            <a href="https://aihackday.com/sydney/">AI Hack Day Sydney</a> — July 11, 2026 at SSW
            Sydney (co-organiser).
          </li>
          <li>
            <a href="https://aihackday.com/brisbane/">AI Hack Day Brisbane</a> — August 1, 2026 at
            SSW Brisbane (co-organiser).
          </li>
        </ul>

        <h2>Recent</h2>
        <ul>
          <li>
            <a href="https://www.meetup.com/en-AU/brisbane-dotnet-user-group/events/314050554/">
              Brisbane .NET User Group
            </a>{' '}
            — <em>EF Core Bench Lab — A Peek into the Black Box</em> (June 4, 2026).
          </li>
          <li>
            <a href="https://luma.com/0dd4m7we">
              Brisbane Build Club — Building Real AI Agents in Notion
            </a>{' '}
            (May 18, 2026).
          </li>
          <li>
            <a href="https://agentcamp.city/brisbane/">AgentCamp 2026 Brisbane Edition</a> —{' '}
            <em>From Vibe-Coded to Prod-Ready — Testing Your .NET Agents with MAF + AgentEval</em>{' '}
            (May 9, 2026).
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
