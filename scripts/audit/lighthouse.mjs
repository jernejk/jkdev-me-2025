import { getSeoSite, run } from './_util.mjs'

const site = getSeoSite(process.argv)

async function main() {
  // This is intentionally not part of `yarn test:seo` by default:
  // It can be slower/flakier (network + perf variance), but it’s great for periodic benchmarking.
  const outDir = process.env.SEO_LH_OUT || '.tmp/unlighthouse'
  const reporter = process.env.SEO_LH_REPORTER || 'jsonExpanded'
  const samples = process.env.SEO_LH_SAMPLES || '2'
  const budget = process.env.SEO_LH_BUDGET || '' // 1-100; empty = don’t fail the run

  const args = [
    'exec',
    'unlighthouse-ci',
    '--site',
    site.toString(),
    '--output-path',
    outDir,
    '--reporter',
    reporter,
    '--samples',
    samples,
  ]

  if (budget) args.push('--budget', budget)

  await run('yarn', args)
}

try {
  await main()
} catch (err) {
  console.error(err?.stderr || err)
  process.exit(1)
}
