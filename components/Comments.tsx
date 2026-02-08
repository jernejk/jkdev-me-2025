'use client'

import { Comments as CommentsComponent } from 'pliny/comments'
import { useState } from 'react'
import siteMetadata from '@/data/siteMetadata'

export default function Comments({ slug }: { slug: string }) {
  const [loadComments, setLoadComments] = useState(false)
  const repoUrl = siteMetadata.siteRepo?.replace(/\.git$/, '') || ''
  const githubDiscussionsUrl = repoUrl ? `${repoUrl}/discussions` : ''

  if (!siteMetadata.comments?.provider) {
    return null
  }

  const hasGiscusConfig =
    siteMetadata.comments.provider !== 'giscus' ||
    Boolean(
      siteMetadata.comments.giscusConfig?.repo &&
        siteMetadata.comments.giscusConfig?.repositoryId &&
        siteMetadata.comments.giscusConfig?.category &&
        siteMetadata.comments.giscusConfig?.categoryId
    )

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
    <>
      {loadComments ? (
        <CommentsComponent commentsConfig={siteMetadata.comments} slug={slug} />
      ) : (
        <button
          onClick={() => setLoadComments(true)}
          className="rounded-md border border-cyan-400/40 bg-cyan-50 px-3 py-1.5 text-sm font-medium text-cyan-800 transition-colors hover:bg-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-200 dark:hover:bg-cyan-900/35"
        >
          Load GitHub Comments
        </button>
      )}
    </>
  )
}
