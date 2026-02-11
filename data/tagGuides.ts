import type { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog } from 'contentlayer/generated'

type TagGuideConfig = {
  intro: string
  startHereSlug?: string
  advancedSlug?: string
}

export type TagGuide = {
  intro: string
  startHere?: { title: string; href: string }
  advancedFollowUp?: { title: string; href: string }
}

const TAG_GUIDES: Record<string, TagGuideConfig> = {
  'net-core': {
    intro:
      '.NET Core posts focused on practical architecture, diagnostics, and production-ready patterns for real projects.',
    startHereSlug: 'asp-net-core-serilog',
    advancedSlug: 'ef-core-tags',
  },
  'ef-core': {
    intro:
      'EF Core articles on query performance, troubleshooting, and maintainable data-access approaches.',
    startHereSlug: 'ef-core-tags',
    advancedSlug: 'ef-core-unit-tests',
  },
  serilog: {
    intro:
      'Logging and observability guides using Serilog across ASP.NET and front-end diagnostics workflows.',
    startHereSlug: 'asp-net-core-serilog',
    advancedSlug: 'angular-to-seq',
  },
  ai: {
    intro:
      'Applied AI posts for developers, with practical integration examples rather than abstract theory.',
    startHereSlug: 'getting-started-with-form-recognizer',
    advancedSlug: 'machine-learning-that-is-actually-easy',
  },
}

function toLink(post?: CoreContent<Blog>) {
  if (!post) return undefined
  return {
    title: post.title,
    href: `/${post.path}`,
  }
}

export function buildTagGuide(tagSlug: string, posts: CoreContent<Blog>[]): TagGuide {
  const preset = TAG_GUIDES[tagSlug]
  if (preset) {
    const start = posts.find((p) => p.slug === preset.startHereSlug) ?? posts[0]
    const advanced =
      posts.find((p) => p.slug === preset.advancedSlug) ??
      posts.find((p) => p.slug !== start?.slug) ??
      posts[1]

    return {
      intro: preset.intro,
      startHere: toLink(start),
      advancedFollowUp: toLink(advanced),
    }
  }

  const start = posts[0]
  const advanced = posts.find((p) => p.slug !== start?.slug) ?? posts[1]
  return {
    intro:
      'Posts grouped by this topic, ordered by recency. Start with the first link for the quickest overview, then continue to the follow-up for deeper implementation details.',
    startHere: toLink(start),
    advancedFollowUp: toLink(advanced),
  }
}

