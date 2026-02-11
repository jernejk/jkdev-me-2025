import Link from './Link'
import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'

export default function Footer() {
  return (
    <footer>
      <div className="mt-14 border-t border-gray-200/70 pt-8 dark:border-cyan-500/20">
        <div className="mb-4 flex items-center justify-center space-x-4">
          <SocialIcon kind="github" href={siteMetadata.github} size={6} />
          <SocialIcon kind="x" href={siteMetadata.x} size={6} />
          <SocialIcon kind="linkedin" href={siteMetadata.linkedin} size={6} />
          <SocialIcon kind="youtube" href={siteMetadata.youtube} size={6} />
          <Link
            href="/llms.txt"
            aria-label="LLMs index"
            className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-gray-600 dark:text-gray-200 dark:hover:border-cyan-400 dark:hover:text-cyan-300"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M7 2a2 2 0 0 0-2 2v16l4-2 3 2 3-2 4 2V4a2 2 0 0 0-2-2H7zm0 2h10v12.764l-2-1-3 2-3-2-2 1V4z" />
            </svg>
            LLMs
          </Link>
        </div>
        <div className="mb-2 flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div>{siteMetadata.author}</div>
          <div>•</div>
          <div>{`© ${new Date().getFullYear()}`}</div>
        </div>
        <div className="mb-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link href="/">jkdev.me</Link>
          {' • '}
          <Link href={siteMetadata.siteRepo}>Source</Link>
          {' • '}
          <span>Built with Next.js</span>
        </div>
        <div className="pb-2">
          <div className="flex items-center justify-center space-x-4">
            <SocialIcon kind="sessionize" href={siteMetadata.sessionize} size={6} />
            <SocialIcon kind="ssw" href={siteMetadata.ssw} size={6} />
            <SocialIcon kind="mvp" href={siteMetadata.mvp} size={6} />
          </div>
        </div>
      </div>
    </footer>
  )
}
