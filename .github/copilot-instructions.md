# Copilot Instructions — jkdev.me

This repo powers `https://jkdev.me`, a Next.js + Contentlayer/Pliny blog and portfolio site.

Read `AGENTS.md` for the full project contract: SEO requirements, quality bar, testing gates, and endpoint contracts.

## Skills / Workflows

This repo supports four content workflows. When the user asks you to perform one of these tasks, follow the corresponding instructions below.

---

### 1. Research a Topic (`/research`)

**Trigger**: User asks to research a topic, explore a repo, or draft notes for a blog post.

**What to do**:

1. Research the topic using available tools (web, codebase, existing drafts)
2. Check `.draft/TODO.md` and `.draft/RESEARCH.md` to avoid duplicating work
3. Create a directory in `.draft/<topic-slug>/` with:
   - `post.md` — outline, key points, source links
   - `research.md` — verified facts with source URLs, competitive landscape
   - `suggestions.md` — title options, angle, audience, priority rating
4. Update `.draft/TODO.md` with the new draft entry
5. Present findings and ask for feedback

**See**: `.claude/commands/research.md` for full instructions.

---

### 2. Write a Post from a Draft (`/draft-to-post`)

**Trigger**: User asks to turn an existing draft into a publishable blog post.

**What to do**:

1. Find and read all files in the matching `.draft/<name>/` directory
2. Verify research is still current (check version numbers, links)
3. Write `data/blog/<slug>.mdx` with required frontmatter and content structure
4. **Set `draft: true`** — never publish without explicit user approval
5. Present the post for review; iterate on feedback
6. Only set `draft: false` and commit when user says to publish
7. Run `yarn build` before committing

**See**: `.claude/commands/draft-to-post.md` for full instructions.

---

### 3. Write a Post from Scratch (`/blog`)

**Trigger**: User asks to write a blog post on a topic with no existing draft.

**What to do**:

1. Clarify the request if vague (topic, angle, scope, audience)
2. Quick-research: check existing posts, fetch key facts
3. Save research notes in `.draft/<topic-slug>/research.md`
4. Write `data/blog/<slug>.mdx` with required frontmatter and content structure
5. **Set `draft: true`** — never publish without explicit user approval
6. Present the post for review; iterate on feedback
7. Only set `draft: false` and commit when user says to publish
8. Run `yarn build` before committing

**See**: `.claude/commands/blog.md` for full instructions.

---

### 4. Update Speaking Page (`/speaking`)

**Trigger**: User asks to add a talk, update an event, or modify speaking data.

**What to do**:

1. Read `data/speakingData.json`
2. Add/update talks following the schema (see `.claude/commands/speaking.md`)
3. Set `status` based on event date vs today
4. Validate JSON structure and field requirements
5. Run `yarn build` to verify

**Automation scripts** (for bulk updates):

```bash
yarn speaking:fetch        # Fetch from Sessionize
yarn speaking:extract-mvp  # Extract from MVP profile
yarn speaking:merge        # Merge sources
yarn speaking:build        # Full pipeline
```

**See**: `.claude/commands/speaking.md` for full instructions.

---

## Blog Post Frontmatter Template

```yaml
---
title: 'Specific, searchable title'
date: 'YYYY-MM-DD'
tags:
  - Tag1
  - Tag2
draft: true
summary: '1-2 sentences: what problem does this solve?'
tldr: '1 sentence: key action/command/decision'
images:
  - /static/images/twitter-card.png
authors:
  - default
layout: PostSimple
---
```

**Existing tags** (prefer these): serilog, angular, net-core, blazor, ef-core, cognitive-services, ai, mlnet, ml, azure, debugging, windows11, xamarin, maui, android

## Content Quality Rules

- Start with the outcome in the first 5 lines
- Use `##` headings; keep paragraphs to 2-4 sentences
- Code blocks must have language identifiers
- Lead with the solution when it's a single command
- Follow: Context → Problem → Solution → Pitfalls → References

## Testing Gate

```bash
yarn build
SEO_SITE=https://jkdev.me yarn test:seo
```
