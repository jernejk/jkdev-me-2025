import data from '@/data/pushupChallenge.json'

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(2, pct)}%` }} />
    </div>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl bg-white/60 p-3 text-center dark:bg-gray-800/60">
      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
      <div className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
        {label}
      </div>
      {sub ? <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{sub}</div> : null}
    </div>
  )
}

export default function PushupChallengeCard() {
  const { challenge, reps, kg, mostActiveDay, fundraising, fun, links } = data

  const dayMonth = mostActiveDay
    ? new Date(mostActiveDay.date + 'T00:00:00').toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
      })
    : null

  return (
    <div className="not-prose my-6 rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-amber-50 p-5 shadow-sm sm:p-6 dark:border-rose-900/40 dark:from-rose-950/30 dark:to-amber-950/20">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="!mt-0 text-xl font-bold text-gray-900 dark:text-gray-100">
          💪 The Push-Up Challenge
        </h2>
        <span className="text-sm font-medium text-rose-700 dark:text-rose-300">
          {challenge.daysLeft > 0 ? `${challenge.daysLeft} days to go` : 'challenge complete 🎉'}
        </span>
      </div>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Doing the challenge for{' '}
        <a
          href={links.challenge}
          className="font-medium !text-rose-700 hover:underline dark:!text-rose-300"
        >
          The Push for Better Foundation
        </a>{' '}
        (mental health) — but with {challenge.substitution}.
      </p>

      {/* Headline: total lifted */}
      <div className="mt-4 rounded-xl bg-white/70 p-4 dark:bg-gray-800/60">
        <div className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
          {kg.display} lifted
        </div>
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">{fun.totalLine}</div>
        <div className="mt-1 text-sm font-medium text-amber-700 dark:text-amber-300">
          {fun.tonneLine}
        </div>
      </div>

      {/* Fun stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Total curls" value={reps.total.toLocaleString('en-AU')} sub="8.5 kg each" />
        {reps.heaviestSet > 0 ? (
          <Stat
            label="Most in one go"
            value={`${reps.heaviestSet}`}
            sub={`${kg.heaviestSetDisplay}`}
          />
        ) : null}
        {mostActiveDay ? (
          <Stat
            label="Biggest day"
            value={`${mostActiveDay.reps}`}
            sub={`${dayMonth} · ${mostActiveDay.kgDisplay}`}
          />
        ) : null}
      </div>

      {/* Progress bars */}
      <div className="mt-5 space-y-4">
        {reps.progressPct !== null ? (
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Reps banked</span>
              <span className="text-gray-500 dark:text-gray-400">
                {reps.officialBanked.toLocaleString('en-AU')} /{' '}
                {reps.target.toLocaleString('en-AU')} ({reps.progressPct}%)
              </span>
            </div>
            <Bar pct={reps.progressPct} color="bg-rose-500" />
          </div>
        ) : null}
        {fundraising.progressPct !== null ? (
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Funds raised</span>
              <span className="text-gray-500 dark:text-gray-400">
                ${fundraising.raised} / ${fundraising.goal} ({fundraising.progressPct}%)
              </span>
            </div>
            <Bar pct={fundraising.progressPct} color="bg-amber-500" />
          </div>
        ) : null}
      </div>

      {/* CTA */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <a
          href={links.fundraiser}
          className="inline-flex items-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold !text-white shadow-sm transition hover:bg-rose-700"
        >
          Chip in a donation →
        </a>
        <a
          href={links.team}
          className="text-sm font-medium !text-rose-700 hover:underline dark:!text-rose-300"
        >
          Team SSW
        </a>
      </div>
      <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
        Auto-updated{' '}
        {new Date(data.updated + 'T00:00:00').toLocaleDateString('en-AU', {
          day: 'numeric',
          month: 'long',
        })}
      </p>
    </div>
  )
}
