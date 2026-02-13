# Codex Agent Instructions — jkdev.me

This repo powers `https://jkdev.me`, a Next.js + Contentlayer/Pliny blog and portfolio site.

Read `AGENTS.md` for the full project contract: SEO requirements, quality bar, testing gates, and endpoint contracts.

## Skills / Workflows

This repo supports four content workflows. When the user asks you to perform one of these tasks, follow the corresponding instructions.

### Skill Reference Files

Detailed instructions for each skill are in `.claude/commands/` (these are plain markdown files readable by any agent):

| Skill             | File                                | Trigger                                              |
| ----------------- | ----------------------------------- | ---------------------------------------------------- |
| **Research**      | `.claude/commands/research.md`      | "research X", "draft notes on X", "explore repo X"   |
| **Draft to Post** | `.claude/commands/draft-to-post.md` | "publish the draft on X", "turn draft X into a post" |
| **Blog**          | `.claude/commands/blog.md`          | "write a blog post about X"                          |
| **Speaking**      | `.claude/commands/speaking.md`      | "add talk X", "update speaking page"                 |

Read the relevant file for detailed step-by-step instructions before starting the workflow.

---

## Quick Reference

### Blog Post Frontmatter (Required)

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

### Existing Tags (Prefer These)

serilog, angular, net-core, blazor, ef-core, cognitive-services, ai, mlnet, ml, azure, debugging, windows11, xamarin, maui, android

### Content Structure

1. Opening: Start with the outcome (what the reader gets)
2. Problem/Context: Why this matters
3. Solution: Code blocks, commands, steps
4. Pitfalls: Common mistakes or edge cases
5. References: Official docs, repos, related posts

### Key Paths

| Content         | Path                       |
| --------------- | -------------------------- |
| Published posts | `data/blog/*.mdx`          |
| Draft research  | `.draft/<topic-slug>/`     |
| Draft index     | `.draft/TODO.md`           |
| Speaking data   | `data/speakingData.json`   |
| Authors         | `data/authors/default.mdx` |
| Site config     | `data/siteMetadata.js`     |

### Critical Rules

- **Never** set `draft: false` or commit a post without explicit user approval
- **Never** delete draft directories after publishing (keep for reference)
- **Always** run `yarn build` before committing content changes
- **Always** verify facts and include source URLs in research
- **Prefer** existing tags over creating new ones

### Testing

```bash
yarn build
SEO_SITE=https://jkdev.me yarn test:seo
```

### Speaking Data Scripts

```bash
yarn speaking:fetch        # Fetch from Sessionize
yarn speaking:extract-mvp  # Extract from MVP profile
yarn speaking:merge        # Merge sources
yarn speaking:build        # Full pipeline
```
