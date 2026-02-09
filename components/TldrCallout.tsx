type TldrCalloutProps = {
  tldr?: string
}

export default function TldrCallout({ tldr }: TldrCalloutProps) {
  if (!tldr) return null

  return (
    <aside className="my-6 rounded-lg border border-cyan-300/70 bg-cyan-50/70 p-4 dark:border-cyan-700/70 dark:bg-cyan-950/30">
      <h2 className="text-sm font-semibold tracking-wide text-cyan-900 uppercase dark:text-cyan-200">
        TL;DR
      </h2>
      <p className="mt-2 text-sm leading-6 text-cyan-950 dark:text-cyan-100">{tldr}</p>
    </aside>
  )
}
