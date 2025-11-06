# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Next.js 15 blog built with the Tailwind Next.js Starter Blog template. It uses:
- **Framework**: Next.js 15 (App Router with React Server Components)
- **Styling**: Tailwind CSS v4
- **Content**: Contentlayer2 for MDX content management
- **Package Manager**: Yarn 3.6.1 (Berry)

## Common Commands

### Development
```bash
yarn dev              # Start development server at http://localhost:3000
yarn start            # Alternative dev command
```

### Building & Serving
```bash
yarn build            # Build for production (includes RSS feed generation)
yarn serve            # Start production server

# Static export (for GitHub Pages, S3, etc.)
EXPORT=1 UNOPTIMIZED=1 yarn build
# With base path:
EXPORT=1 UNOPTIMIZED=1 BASE_PATH=/myblog yarn build
```

### Code Quality
```bash
yarn lint             # Run ESLint with auto-fix on app, components, layouts, scripts
yarn prepare          # Set up Husky git hooks (runs automatically after install)
```

### Analysis
```bash
yarn analyze          # Build with bundle analyzer enabled
```

## Architecture Overview

### Content Management
- **Contentlayer2** processes MDX files from `data/blog/` and `data/authors/`
- Content is defined as document types (`Blog`, `Authors`) in `contentlayer.config.ts`
- Computed fields include: reading time, slug, table of contents (TOC), structured data
- On build, generates:
  - Tag counts → `app/tag-data.json`
  - Search index → `public/search.json` (for Kbar)
  - RSS feed → via `scripts/rss.mjs`

### Directory Structure
```
app/                  # Next.js 15 App Router pages
├── layout.tsx        # Root layout with theme, analytics, search
├── page.tsx          # Homepage
├── blog/             # Blog post pages
├── tags/             # Tag listing pages
├── projects/         # Projects page
└── about/            # About page

components/           # Reusable React components
├── MDXComponents.tsx # Custom MDX component mappings
├── Header.tsx        # Site header with navigation
├── Footer.tsx        # Site footer
└── ...

layouts/              # Blog post layout templates
├── PostLayout.tsx    # Default 2-column with meta/author
├── PostSimple.tsx    # Simplified single column
├── PostBanner.tsx    # With banner image
├── ListLayout.tsx    # Blog listing (v1 style with search)
└── ListLayoutWithTags.tsx  # Blog listing (v2 style with tag sidebar)

data/
├── blog/             # MDX blog posts
├── authors/          # MDX author profiles
├── siteMetadata.js   # Site configuration (IMPORTANT: modify for customization)
├── headerNavLinks.ts # Navigation menu items
└── projectsData.ts   # Project cards data

public/static/        # Static assets (images, favicons)
```

### Key Configuration Files

**`data/siteMetadata.js`** - Central configuration:
- Site metadata (title, description, author)
- Social links
- Analytics setup (Umami, Plausible, Google Analytics, etc.)
- Comments (Giscus, Utterances, Disqus)
- Newsletter (Mailchimp, Buttondown, ConvertKit, etc.)
- Search provider (Kbar or Algolia)

**`contentlayer.config.ts`** - Content processing:
- Document type definitions
- MDX plugin configuration (remark/rehype)
- Computed fields logic
- Post-processing hooks

**`next.config.js`** - Next.js configuration:
- Content Security Policy headers
- Image optimization settings
- Bundle analyzer setup
- SVG webpack loader

**`tsconfig.json`** - Path aliases:
- `@/components/*` → `components/*`
- `@/data/*` → `data/*`
- `@/layouts/*` → `layouts/*`
- `@/css/*` → `css/*`

### MDX & Content

Blog posts use frontmatter with these fields:
```yaml
title: (required)
date: (required)
tags: (optional, array)
lastmod: (optional)
draft: (optional, boolean)
summary: (optional)
images: (optional, array)
authors: (optional, array matching files in data/authors/)
layout: (optional: PostLayout, PostSimple, or PostBanner)
canonicalUrl: (optional)
```

Custom MDX components available in posts (see `components/MDXComponents.tsx`):
- `<Image>` - Optimized next/image wrapper
- `<TOCInline>` - Inline table of contents
- `<Pre>` - Enhanced code blocks with copy button
- `<BlogNewsletterForm>` - Newsletter signup
- `<a>` - Custom link component with external link handling
- `<table>` - Custom table wrapper

### Styling

**Tailwind CSS v4** with custom configuration:
- Uses `@tailwindcss/postcss` plugin
- Prettier integration via `prettier-plugin-tailwindcss`
- Syntax highlighting via `rehype-prism-plus` (styles in `css/prism.css`)
- Light/dark theme support via `next-themes`

**Code style**:
- Prettier: no semicolons, single quotes, 100 char line width
- ESLint: TypeScript, React, Next.js, a11y rules
- Git hooks: lint-staged runs on commit

### Deployment

**GitHub Pages** (configured in `.github/workflows/pages.yml`):
- Auto-deploys on push to `main`
- Builds with `EXPORT=1 UNOPTIMIZED=1`
- Node 20, Yarn cache

**Other platforms**:
- Vercel: Deploy directly (recommended)
- Netlify: Uses Next.js runtime
- Static hosting: Use export build commands above

## Development Patterns

### Adding a Blog Post
1. Create MDX file in `data/blog/` (or subdirectory for nested routes)
2. Add frontmatter (minimum: title, date)
3. Contentlayer auto-generates types and processes on save
4. Post appears at `/blog/[slug]`

### Adding Custom MDX Components
1. Create component in `components/`
2. Add to `components/MDXComponents.tsx` export
3. Use directly in MDX files

### Modifying Navigation
Edit `data/headerNavLinks.ts` - array of `{ href, title }` objects

### Changing Site Metadata
Edit `data/siteMetadata.js` - affects SEO, social cards, analytics, etc.

### Analytics & Comments
Configure in `data/siteMetadata.js` and set env variables in `.env` (see `.env.example`)
Update CSP in `next.config.js` if adding new external services

### Search Configuration
- **Kbar** (default): Local search, auto-generates index
- **Algolia**: Requires configuration in `siteMetadata.js`

## Important Notes

- **Package Manager**: Always use `yarn`, not `npm` or `pnpm` (Yarn Berry config in `.yarnrc.yml`)
- **Content Changes**: Contentlayer rebuilds on file changes in dev mode
- **Environment Variables**: Copy `.env.example` to `.env.local` for local development
- **TypeScript**: Strict mode disabled (`strict: false` in tsconfig), but null checks enabled
- **MDX Processing**: Plugins in `contentlayer.config.ts` handle:
  - Math expressions (KaTeX)
  - GitHub Flavored Markdown
  - Code titles
  - Citations/bibliography
  - Image optimization
  - Autolink headings
