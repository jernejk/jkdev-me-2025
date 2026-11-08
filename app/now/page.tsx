import Image from '@/components/Image'
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
          <em>Last updated: November 8, 2026</em>
        </p>

        <h2>Current Focus</h2>
        <ul>
          <li>Big news coming after November 16. Stay tuned!</li>
          <li>Working on ADE (Agentic Developer Environment).</li>
          <li>
            Opened <a href="https://jernejk.github.io/jk-arcade/">JK&apos;s Arcade</a>: the small
            browser games I build with AI coding tools, in one app you can install on your phone.
            Newest is <a href="https://jernejk.github.io/jk-arcade/nap-patch/">Nap Patch</a>, a cosy
            logic puzzle: tuck sleepy bush critters into a patchwork quilt, one per patch, row and
            column, and no bumping. Piece by Pixel and Tumbleverse are in there too. Builds are on{' '}
            <a href="https://github.com/jernejk/jk-arcade">GitHub</a>.
          </li>
          <li>
            Released <a href="https://github.com/jernejk/talk-deck-template">talk-deck-template</a>:
            AI-first talk decks in plain HTML. A coding agent builds the slides, QA checks every
            one, and it all runs offline.
          </li>
          <li>
            Improving <a href="https://github.com/jernejk/efcore-bench-lab">EF Core Bench Lab</a>{' '}
            for my DDD Brisbane talk.
          </li>
          <li>Helping out with Codex Community Brisbane, the local Codex user group.</li>
        </ul>
        <figure>
          <Image
            src="/static/images/now/talk-deck-scooter.jpg"
            alt="A pixel-art rider on an e-scooter crossing Brisbane at dusk while a checklist ticks off a tighter slide title, a refreshed demo fallback, QA and a deploy"
            width={1920}
            height={1080}
            sizes="(max-width: 1100px) 100vw, 1100px"
          />
          <figcaption>
            Still tweaking on the way to the venue: a slide made with the template. Rider and city
            generated with gpt-image-2. Browse every pattern in the{' '}
            <a href="https://talk-deck-template.surge.sh">live gallery</a>.
          </figcaption>
        </figure>

        <figure>
          <div className="grid gap-4 sm:grid-cols-2">
            <a href="https://jernejk.github.io/jk-arcade/piece-by-pixel/#gull-harbor@master">
              <Image
                src="/static/images/now/arcade-piece-by-pixel.jpg"
                alt="Piece by Pixel on the Master tier: a pixel-art harbour with dark silhouettes where the lighthouse and cliffs are missing, and a tray of turned pieces"
                width={1280}
                height={800}
                sizes="(max-width: 640px) 100vw, 550px"
              />
            </a>
            <a href="https://jernejk.github.io/jk-arcade/tumbleverse/">
              <Image
                src="/static/images/now/arcade-tumbleverse.jpg"
                alt="Tumbleverse's menu: five game-mode cards, Knockdown, Sandbox, Zen, Bridge Breaker and Cosmos, in front of a castle and planets"
                width={1280}
                height={800}
                sizes="(max-width: 640px) 100vw, 550px"
              />
            </a>
          </div>
          <figcaption>
            Piece by Pixel, rebuilding a pixel-art harbour on the Master tier, and Tumbleverse, a
            physics toy with five modes. Both play in the{' '}
            <a href="https://jernejk.github.io/jk-arcade/">live arcade</a>, where{' '}
            <a href="https://jernejk.github.io/jk-arcade/nap-patch/">Nap Patch</a> is the newest.
          </figcaption>
        </figure>

        <h2>Upcoming Events</h2>
        <ul>
          <li>
            <a href="https://www.dddbrisbane.com">DDD Brisbane 2026</a> —{' '}
            <em>The Case of the Innocent LINQ Query: An EF Core Performance Investigation</em>{' '}
            (December 5, 2026) at QUT Gardens Point. The LINQ query looks fine and the SQL is fast,
            yet the page is still slow: following one request end to end to catch N+1 queries,
            row-multiplying Includes, over-fetching and missing indexes.
          </li>
        </ul>
        <p>
          For future speaking invitations and user-group sessions,{' '}
          <a href="https://www.linkedin.com/in/jernejkavka/">get in touch</a>.
        </p>

        <h2>Recent</h2>
        <ul>
          <li>
            <a href="https://luma.com/qveldpfr">Ship, Then Sell It: Build Club Brisbane x AdaL</a> —
            October 22, 2026 at The Precinct (assisted organisation). A hands-on evening on turning
            side projects into a product demo and a launch post.
          </li>
          <li>
            <a href="https://luma.com/mojp4yl6">DevDay Exchange Community: Brisbane</a> — October
            20, 2026 at The Precinct. A project showcase at the Codex Community Brisbane evening
            unpacking OpenAI DevDay 2026.{' '}
            <a href="https://devday-pantry-20261020.surge.sh">Slides</a>.
          </li>
          <li>
            <a href="https://www.meetup.com/coding-night-anz-local/events/315972680/">
              GitHub Copilot Dev Days Brisbane
            </a>{' '}
            — September 24, 2026 (mentor). A hands-on workshop on agent-driven development with the
            GitHub Copilot app, from picking up issues to merging pull requests.
          </li>
          <li>
            <a href="https://luma.com/waqcl0zy">Codex Community Meetup – Brisbane</a> —{' '}
            <em>How to make a custom b-day gift with Codex?</em> (September 14, 2026) at The
            Precinct. Turning an idea into a real gift over two weekends with image generation,
            Codex computer use and the cardstock and pens I had.{' '}
            <a href="https://penny-gift-story-20260914.surge.sh">Interactive slides</a>.
          </li>
          <li>
            <a href="https://www.meetup.com/ai-builders-brisbane-ai-experts-engineers-ai-agents/events/316112128">
              Global AI Construct Brisbane
            </a>{' '}
            — <em>Small Models, Sharp Jobs — Build a Local Agent That Proves Its Work</em>, a
            90-minute hands-on workshop (August 31, 2026) at the Microsoft Brisbane office. Building
            a .NET agent that runs entirely offline on small open-weight models: the model fills a
            typed filter, C# validates and clamps it before it touches the data, and deterministic
            gates reject invented record IDs, malformed JSON and low confidence before anything
            reaches the final answer. Built on Microsoft Agent Framework and .NET 10. Six
            progressive labs, so you can keep going at home.{' '}
            <a href="https://small-models-sharp-jobs-workshop-20260829.surge.sh/slides/">Slides</a>{' '}
            and <a href="https://github.com/jernejk/small-models-sharp-jobs">code</a> are public.
          </li>
          <li>
            <a href="https://aihackday.com/brisbane/">AI Hack Day Brisbane</a> — August 1, 2026 at
            SSW Brisbane (co-organiser).
          </li>
          <li>
            <a href="https://aihackday.com/sydney/">AI Hack Day Sydney</a> — July 11, 2026 at SSW
            Sydney (co-organiser).
          </li>
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
