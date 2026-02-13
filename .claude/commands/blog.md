# Write a Blog Post from Scratch

You are helping write a blog post from scratch based on the user's request, with no existing draft.

## Input

Blog post request: $ARGUMENTS

## Workflow

### 1. Understand the Request

Parse the user's request to identify:

- **Topic**: What technology, pattern, or concept to cover
- **Angle**: Tutorial, comparison, opinion, announcement, etc.
- **Audience**: Beginner, intermediate, advanced .NET/AI developers
- **Scope**: Quick tip (500 words) vs deep dive (2000+ words)

If the request is vague, ask clarifying questions before proceeding.

### 2. Quick Research

Before writing, do a fast research pass:

- Check `data/blog/` for related published posts (avoid duplicating)
- Check `.draft/` for existing research that could help
- Fetch key facts from the web: version numbers, repo links, official docs
- Identify 2-3 existing articles on the topic to understand what's already covered

### 3. Create Research Notes in `.draft/`

Create a lightweight draft directory for reference:

```
.draft/<topic-slug>/
  research.md     # Key facts, sources, competitive landscape (brief)
```

This ensures the research is preserved even if the post needs revisions later.

### 4. Write the Blog Post

Create the post as `data/blog/<slug>.mdx` with:

**Required frontmatter:**

```yaml
---
title: 'Specific, searchable title'
date: 'YYYY-MM-DD' # Today's date
tags:
  - Tag1 # 2-6 tags, prefer existing tags
  - Tag2
draft: true # ALWAYS start as draft: true
summary: "1-2 sentences answering 'what problem does this solve?'"
tldr: '1 sentence — the key action/decision/command'
images:
  - /static/images/twitter-card.png
authors:
  - default
layout: PostSimple
---
```

**Existing tags to prefer** (add new ones only when needed):
serilog, angular, net-core, blazor, ef-core, cognitive-services, ai, mlnet, ml, azure, debugging, windows11, xamarin, maui, android

**Content structure (follow AGENTS.md quality bar):**

1. **Opening** (2-3 sentences): Start with the outcome — what the reader gets
2. **Problem/Context**: Why this matters, in 1-2 short paragraphs
3. **Solution**: The core content with code blocks, commands, or steps
4. **Details/How it works**: Deeper explanation if needed
5. **Pitfalls/Gotchas**: Common mistakes or edge cases
6. **References**: Links to official docs, repos, related posts

**Style rules:**

- Use `##` headings to break sections; keep paragraphs short (2-4 sentences)
- When the solution is "run this command", include a code block in the first 5 lines
- Use fenced code blocks with language identifiers (`csharp, `bash, ```json)
- Inline links as `[text](url)` — never bare URLs in prose
- Tables for comparison data or structured information
- Practical and direct — solve the reader's problem, skip unnecessary theory
- Match the tone of existing posts: professional but conversational

### 5. Present to User for Review

After writing the post:

- Show the user the frontmatter and section outline
- Ask if they want changes to: title, structure, tone, depth, or content
- Make revisions as requested

**Do NOT change `draft: true` to `draft: false` or commit until the user explicitly says to publish.**

### 6. Publish (Only When User Approves)

When the user says the post is ready:

1. Set `draft: false` in the frontmatter
2. Set `date` to today's date (in case time has passed)
3. Run `yarn build` to verify the post builds correctly
4. If build passes, ask if the user wants to commit

## Quality Gates

- Frontmatter has all required fields: title, date, tags, summary, tldr, images, authors, layout
- `summary` answers "what problem does this solve?"
- `tldr` is actionable (includes a command, decision, or concrete step)
- Content starts with the outcome in the first 5 lines
- Code blocks have language identifiers
- All links are valid
- `draft: true` until user explicitly approves publishing
- `yarn build` passes before committing
- No duplicate content with existing published posts

## Important

- NEVER commit or set `draft: false` without explicit user approval
- ALWAYS start with `draft: true`
- Keep research notes in `.draft/` even for from-scratch posts
- Prefer existing tags over inventing new ones
