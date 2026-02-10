import Image from 'next/image'

export default function BrandLogo() {
  return (
    <Image
      src="/static/images/jk-logo.png"
      alt="JK logo"
      width={72}
      height={44}
      data-testid="brand-logo"
      className="h-11 w-auto dark:hue-rotate-180 dark:invert"
      priority
    />
  )
}
