# Write a Blog Post from an Existing Draft

You are helping turn an existing draft from `.draft/` into a publishable blog post in `data/blog/`.

## Input

Draft name or topic: $ARGUMENTS

## Workflow

### 1. Find the Draft

- Search `.draft/` for the matching draft directory or file
- If the input is ambiguous, list matching drafts and ask the user to pick one
- Read ALL supporting files: `post.md`, `proposed-draft.mdx`, `research.md`, `suggestions.md`, `notion-draft.mdx`
- Also read `.draft/TODO.md` for context on priority and action items

### 2. Review the Research

Before writing, verify the draft's research is current:

- Check that version numbers and links are still valid (use WebFetch if needed)
- Confirm GitHub repos are still active
- Note any facts that need updating

Flag any issues to the user before proceeding.

### 3. Write the Blog Post

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
- Keep it practical — readers want to solve a problem, not read theory

### 4. Present to User for Review

After writing the post:

- Show the user the frontmatter and a summary of sections
- Ask if they want changes to: title, structure, tone, depth, or content
- Make revisions as requested

**Do NOT change `draft: true` to `draft: false` or commit until the user explicitly says to publish.**

### 5. Publish (Only When User Approves)

When the user says the post is ready:

1. Set `draft: false` in the frontmatter
2. Set `date` to today's date
3. Run `yarn build` to verify the post builds correctly
4. If build passes, ask if the user wants to commit

### 6. Post-Publish Cleanup

After the user confirms the commit:

- Update `.draft/TODO.md` to mark the draft as published
- Do NOT delete the draft directory (keep for reference)

## Quality Gates

- Frontmatter has all required fields: title, date, tags, summary, tldr, images, authors, layout
- `summary` answers "what problem does this solve?"
- `tldr` is actionable (includes a command, decision, or concrete step)
- Content starts with the outcome in the first 5 lines
- Code blocks have language identifiers
- All links are valid
- `draft: true` until user explicitly approves publishing
- `yarn build` passes before committing

## Important

- NEVER commit or set `draft: false` without explicit user approval
- ALWAYS start with `draft: true`
- If the research is stale or has gaps, flag it before writing
- Prefer existing tags over new ones
