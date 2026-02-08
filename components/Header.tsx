import siteMetadata from '@/data/siteMetadata'
import headerNavLinks from '@/data/headerNavLinks'
import Link from './Link'
import MobileNav from './MobileNav'
import ThemeSwitch from './ThemeSwitch'
import SearchButton from './SearchButton'
import Image from 'next/image'

const Header = () => {
  let headerClass =
    'flex items-center w-full justify-between py-6 border-b border-gray-200/70 dark:border-cyan-500/30'
  if (siteMetadata.stickyNav) {
    headerClass +=
      ' sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/70 supports-[backdrop-filter]:dark:bg-gray-950/60'
  }

  return (
    <header className={headerClass}>
      <Link href="/" aria-label={siteMetadata.headerTitle}>
        <div className="flex items-center justify-between">
          <div className="mr-3">
            <Image src="/static/images/jk-logo.png" alt="JK" width={60} height={34} priority />
          </div>
        </div>
      </Link>
      <div className="flex items-center space-x-4 leading-5 sm:-mr-6 sm:space-x-6">
        <div className="no-scrollbar hidden max-w-40 items-center gap-x-3 overflow-x-auto sm:flex md:max-w-80 lg:max-w-none">
          {headerNavLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="m-1 rounded-md px-2 py-1 text-sm font-medium text-gray-700 transition-colors hover:text-cyan-600 dark:text-gray-200 dark:hover:text-cyan-300"
            >
              {link.title}
            </Link>
          ))}
        </div>
        <SearchButton />
        <ThemeSwitch />
        <MobileNav />
      </div>
    </header>
  )
}

export default Header
