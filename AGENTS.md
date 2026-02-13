# Agents Guide: SEO + AI-Friendly Content

This repo powers `https://jkdev.me` (Next.js + Contentlayer/Pliny). The main goal is to make **every page and post** easy to crawl, easy to understand for LLMs, and solid for SEO, **without changing the visual design unless explicitly requested**.

## Skills (Cross-Vendor)

This repo provides four content workflows that work across Claude Code, GitHub Copilot, and OpenAI Codex.

| Skill            | Claude Code             | Copilot / Codex                            | Purpose                                                     |
| ---------------- | ----------------------- | ------------------------------------------ | ----------------------------------------------------------- |
| **Research**     | `/research <topic>`     | Follow `.claude/commands/research.md`      | Research a topic and create a structured draft in `.draft/` |
| **Draft → Post** | `/draft-to-post <name>` | Follow `.claude/commands/draft-to-post.md` | Turn an existing `.draft/` entry into a published blog post |
| **Blog**         | `/blog <topic>`         | Follow `.claude/commands/blog.md`          | Write a blog post from scratch                              |
| **Speaking**     | `/speaking <request>`   | Follow `.claude/commands/speaking.md`      | Add/update talks in `data/speakingData.json`                |

### How Each Agent Finds Instructions

| Agent              | Primary File                      | Skill Details                                                  |
| ------------------ | --------------------------------- | -------------------------------------------------------------- |
| **Claude Code**    | `AGENTS.md`                       | `.claude/commands/*.md` (auto-registered as `/slash` commands) |
| **GitHub Copilot** | `.github/copilot-instructions.md` | References `.claude/commands/*.md`                             |
| **OpenAI Codex**   | `CODEX.md` + `AGENTS.md`          | References `.claude/commands/*.md`                             |

All skill files live in `.claude/commands/` as plain markdown — readable by any agent regardless of vendor.

### Critical Rules (All Skills)

- **Never** set `draft: false` or commit a blog post without explicit user approval.
- **Never** delete `.draft/` directories after publishing (keep for reference).
- **Always** run `yarn build` before committing content changes.
- **Always** verify facts and include source URLs when researching.
- **Prefer** existing tags over creating new ones.

### Key Paths

| Content               | Path                     |
| --------------------- | ------------------------ |
| Published blog posts  | `data/blog/*.mdx`        |
| Draft research        | `.draft/<topic-slug>/`   |
| Draft index & roadmap | `.draft/TODO.md`         |
| Speaking data         | `data/speakingData.json` |
| Site config           | `data/siteMetadata.js`   |
| Contentlayer config   | `contentlayer.config.ts` |

## North Star

- Humans: clear page intent, scannable structure, correct metadata and social previews.
- Search engines: canonical URLs, correct robots/sitemap/RSS, strong structured data.
- LLMs: machine-readable index (`/llms.*`), markdown mirrors (`/md`, `/blog-md/*`), consistent summaries + TL;DR.

## Required AI/SEO Endpoints (Must Stay Working)

These are contract endpoints used by crawlers and LLM tools:

- `/sitemap.xml`
- `/robots.txt`
- `/feed.xml`
- `/llms.txt`
- `/llms-full.txt`
- `/llms.json`
- `/md` (AI-friendly “start here” markdown index)
- `/blog-md/<slug>` (markdown mirror for blog posts)

If changing routing, metadata, or Contentlayer, verify these remain `200` on prod.

## Blog Post Quality Bar (Frontmatter + Content)

Every blog post MUST have:

- `title`: specific and searchable (avoid vague titles).
- `date` (and `lastmod` when edited later).
- `summary`: 1-2 sentences that answer “what problem does this solve?”
- `tldr`: 1 sentence that answers “what should I do?” (often includes the key command or decision).
- `tags`: 2-6 tags (prefer existing tags when possible).
- `images` (optional but strongly recommended):
  - Include at least 1 social card / hero image for better previews.
  - Use a real asset path (avoid broken `siteMetadata.socialBanner`).

Content structure guidelines:

- Start with the outcome (what the reader gets) within the first ~5 lines.
- Use headings (`##`) to break sections; keep paragraphs short.
- When a solution is “just run this”, include a code block early.
- Prefer a small “Context / Problem / Solution / Pitfalls / References” rhythm.

## Pages: Metadata + Structured Data

Every major page should have:

- `genPageMetadata({ title, description })` with a real description (not empty/boilerplate).
- Correct canonical URL behavior.

Structured data:

- Root layout injects `WebSite` + `Person` JSON-LD.
- Each blog post injects `BlogPosting` JSON-LD (from Contentlayer `structuredData`).
- When changing schema, keep it valid and stable (avoid per-request random fields).

## Social Previews (OG/Twitter)

- Ensure `siteMetadata.socialBanner` points to a **real file** in `public/static/images/`.
- The default social card is `public/static/images/twitter-card.png`.
- If it’s missing or needs regeneration, run:
  - `node scripts/generate-twitter-card.mjs`

Important: if Cloudflare is enabled, **do not** add trailing-slash redirect rules for static assets (e.g., `/static/images/*.png`) or you can create redirect loops and break crawlers and link checks.

## Comments (Giscus)

Comments must:

- Auto-load when the comments section approaches viewport (no “click to load” gating).
- Match dark mode (use `dark_dimmed` unless a better theme is explicitly chosen).

## Redirects / Legacy URLs

If changing slugs or routes:

- Add **301** redirects for legacy URLs.
- Verify the old URL returns a single 301 hop to the new canonical URL (avoid chains).
- Ensure redirects do not break RSS item links.

## Telemetry (Umami)

- Umami should be included via `siteMetadata.analytics.umamiAnalytics`.
- Keep CSP in `next.config.js` aligned with analytics and giscus domains.

## Testing: Required Gate

Before pushing changes that affect content, routing, metadata, or public assets, run:

```bash
yarn build
SEO_SITE=https://jkdev.me yarn test:seo
```

Notes:

- `yarn test:seo` runs:
  - AI readiness checks (LLMs endpoints + markdown mirrors)
  - Internal broken link crawl
  - Accessibility smoke checks
- Lighthouse crawling is intentionally separate (slower/flakier):

```bash
SEO_SITE=https://jkdev.me SEO_LH_SAMPLES=1 SEO_LH_OUT=test-results/seo/unlighthouse yarn audit:lighthouse
```

Reports land in:

- `test-results/seo/ai-benchmark.json`
- `test-results/seo/linkinator.json`
- `test-results/seo/unlighthouse/...`

## Definition Of Done For “SEO/AI Improvements”

- No layout/visual regressions unless explicitly requested.
- `/llms.txt`, `/md`, and `/blog-md/*` return correct content types and `200`.
- Blog posts have both `summary` and `tldr`.
- JSON-LD is present on home + posts and remains valid.
- `yarn build` passes.
- `SEO_SITE=... yarn test:seo` passes (or has a documented and accepted exception).
