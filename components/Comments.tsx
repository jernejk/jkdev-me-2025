'use client'

import { Comments as CommentsComponent } from 'pliny/comments'
import { useEffect, useRef, useState } from 'react'
import siteMetadata from '@/data/siteMetadata'

export default function Comments({ slug }: { slug: string }) {
  const [loadComments, setLoadComments] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const repoUrl = siteMetadata.siteRepo?.replace(/\.git$/, '') || ''
  const githubDiscussionsUrl = repoUrl ? `${repoUrl}/discussions` : ''

  const comments = siteMetadata.comments
  const isEnabled = Boolean(comments?.provider)
  const isGiscus = comments?.provider === 'giscus'
  const giscusConfig = isGiscus ? comments.giscusConfig : undefined
  const hasGiscusConfig =
    !isGiscus ||
    Boolean(
      giscusConfig?.repo &&
        giscusConfig?.repositoryId &&
        giscusConfig?.category &&
        giscusConfig?.categoryId
    )

  useEffect(() => {
    if (!isEnabled) return
    if (!hasGiscusConfig) return

    // Auto-load when the comment block scrolls into view (no click required).
    // giscus itself is configured with iframe `loading="lazy"`, so this avoids doing any work
    // until the user is near the end of the post.
    if (loadComments) return

    // If user navigated directly to the comment anchor, load immediately.
    if (typeof window !== 'undefined' && window.location.hash === '#comment') {
      setLoadComments(true)
      return
    }

    const el = containerRef.current
    if (!el) return

    if (!('IntersectionObserver' in window)) {
      setLoadComments(true)
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setLoadComments(true)
            io.disconnect()
            return
          }
        }
      },
      // Start loading a bit before the user reaches the block.
      { root: null, rootMargin: '600px 0px', threshold: 0.01 }
    )

    io.observe(el)
    return () => io.disconnect()
  }, [hasGiscusConfig, isEnabled, loadComments])

  if (!isEnabled) {
    return null
  }

  if (!hasGiscusConfig) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-left dark:border-gray-700 dark:bg-gray-900/60">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">GitHub Comments</p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Comments are powered by GitHub Discussions. The discussion integration is not configured
          yet.
        </p>
        {githubDiscussionsUrl && (
          <a
            href={githubDiscussionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex rounded-md border border-cyan-400/40 px-3 py-1.5 text-sm font-medium text-cyan-700 transition-colors hover:bg-cyan-50 dark:text-cyan-300 dark:hover:bg-cyan-900/20"
          >
            Open GitHub Discussions
          </a>
        )}
      </div>
    )
  }

  return (
    <div ref={containerRef}>
      {loadComments ? (
        <CommentsComponent commentsConfig={comments!} slug={slug} />
      ) : (
        <div className="text-sm text-gray-500 dark:text-gray-400">Loading comments…</div>
      )}
    </div>
  )
}
