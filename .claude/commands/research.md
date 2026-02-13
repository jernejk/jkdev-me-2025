# Research a Topic for a Blog Post Draft

You are helping research a topic and produce a structured draft in the `.draft/` directory.

## Input

Topic or request: $ARGUMENTS

## Workflow

### 1. Understand the Request

Determine what the user wants to research. This could be:

- A specific technology, library, or tool
- An existing repo or open-source solution
- A concept, pattern, or comparison
- A talk transcript from `.draft/_assets/transcripts/`

### 2. Research Phase

Gather information using all available tools:

- **Web research**: Fetch official docs, GitHub repos, blog posts, release notes
- **Local codebase**: Check if the user already has related code, drafts, or notes in `.draft/`
- **Existing drafts**: Read `.draft/TODO.md` and `.draft/RESEARCH.md` to avoid duplicating work
- **Existing blog posts**: Check `data/blog/` for related published content

For each claim or fact, note the source URL. Verify:

- Version numbers and release dates
- GitHub star counts and activity
- API signatures and behavior
- Competitive landscape (what else exists, what's different)

### 3. Create the Draft Directory

Create a new directory in `.draft/` using kebab-case slug format:

```
.draft/<topic-slug>/
  post.md            # Quick outline + key sources
  research.md        # Detailed findings, sources, competitive analysis
  suggestions.md     # Positioning, title options, must-include sections
```

### 4. Write `post.md` (Outline)

Include:

- **Working title** (2-3 options)
- **Problem statement**: What does the reader need?
- **Key points** to cover (bulleted)
- **Code snippets** or commands if applicable
- **Source links** (repos, docs, articles)
- **Target tags** from existing tags when possible: serilog, angular, net-core, blazor, ef-core, cognitive-services, ai, mlnet, ml, azure, debugging, windows11, xamarin, maui, android

### 5. Write `research.md`

Include:

- **Facts verified** with source URLs
- **Competitive landscape**: What other posts/tools cover this topic?
- **What's missing**: What angle hasn't been covered well?
- **Risks**: Anything that could become stale quickly?
- **Code/repo links** with star counts and last activity dates

### 6. Write `suggestions.md`

Include:

- **Recommended angle**: What makes this post unique?
- **Target audience**: Who benefits most?
- **Title options** (3-5, ranked by searchability)
- **Must-include sections**: What the post needs to be useful
- **Suggested length**: Short (500 words), medium (1000-1500), or long (2000+)
- **Priority rating** using the scale from TODO.md (1-5 stars)

### 7. Update `.draft/TODO.md`

Add the new draft to the review status table with:

- Draft name
- Status: "New — needs review"
- Suggested rating
- Recommended action

## Quality Gates

- Every factual claim has a source URL
- At least 3 title options provided
- Competitive landscape covers at least 2 existing resources
- Tags are selected from existing tags when possible
- The outline has enough detail that another agent could write the full post

## Output

Tell the user:

1. What directory was created
2. The recommended title and angle
3. Suggested priority rating
4. Any open questions that need the user's input before writing
