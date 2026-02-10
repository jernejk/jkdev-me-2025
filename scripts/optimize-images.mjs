import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readdir, stat, rename, copyFile, unlink } from 'node:fs/promises'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const repoRoot = path.resolve(__dirname, '..')

const DEFAULT_DIRS = ['public/content/images', 'public/static/images']
const DEFAULT_MIN_BYTES = 300 * 1024

function parseArgs(argv) {
  const args = {
    dirs: [...DEFAULT_DIRS],
    minBytes: DEFAULT_MIN_BYTES,
    dryRun: false,
    backup: false,
  }

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--dry-run') args.dryRun = true
    else if (a === '--backup') args.backup = true
    else if (a === '--min-bytes') args.minBytes = Number(argv[++i] || DEFAULT_MIN_BYTES)
    else if (a === '--dir') args.dirs.push(argv[++i])
  }
  args.dirs = [...new Set(args.dirs.filter(Boolean))]
  return args
}

async function* walk(dirAbs) {
  const entries = await readdir(dirAbs, { withFileTypes: true })
  for (const e of entries) {
    const p = path.join(dirAbs, e.name)
    if (e.isDirectory()) yield* walk(p)
    else yield p
  }
}

function isImage(p) {
  const ext = path.extname(p).toLowerCase()
  return ext === '.jpg' || ext === '.jpeg' || ext === '.png'
}

function jpegOptions(inputBytes) {
  // Aggressive enough to shrink multi-megabyte camera photos; conservative on smaller images.
  if (inputBytes > 8 * 1024 * 1024) return { quality: 72 }
  if (inputBytes > 3 * 1024 * 1024) return { quality: 78 }
  return { quality: 82 }
}

function pngOptions(inputBytes) {
  // sharp PNG compression isn’t as good as oxipng, but it’s safe and available.
  // Keep it lossless; crank compression level for larger PNGs.
  const compressionLevel = inputBytes > 700 * 1024 ? 9 : 6
  return { compressionLevel, adaptiveFiltering: true }
}

async function optimizeOne(fileAbs, { minBytes, dryRun, backup }) {
  const st = await stat(fileAbs)
  if (!st.isFile() || st.size < minBytes) return { skipped: true }
  if (!isImage(fileAbs)) return { skipped: true }

  const ext = path.extname(fileAbs).toLowerCase()
  const inputBytes = st.size

  const tmpAbs = `${fileAbs}.opt.tmp`
  const backupAbs = `${fileAbs}.bak`

  let pipeline = sharp(fileAbs, { failOn: 'none' }).rotate()

  if (ext === '.jpg' || ext === '.jpeg') {
    pipeline = pipeline.jpeg({
      mozjpeg: true,
      progressive: true,
      ...jpegOptions(inputBytes),
    })
  } else if (ext === '.png') {
    pipeline = pipeline.png(pngOptions(inputBytes))
  }

  const buf = await pipeline.toBuffer()
  const outputBytes = buf.byteLength

  // Only replace if we actually win by a meaningful amount.
  const minSavings = Math.max(8 * 1024, Math.floor(inputBytes * 0.03))
  const savedBytes = inputBytes - outputBytes

  if (savedBytes < minSavings) return { skipped: true, inputBytes, outputBytes }

  if (dryRun) {
    return { optimized: true, dryRun: true, inputBytes, outputBytes }
  }

  // Write the tmp file via sharp buffer -> file by copying to a tmp and rename.
  // (writeFile is fine too; this keeps it simple and atomic-ish on rename.)
  await sharp(buf).toFile(tmpAbs)

  if (backup) {
    await copyFile(fileAbs, backupAbs)
  }

  await rename(tmpAbs, fileAbs)
  return { optimized: true, inputBytes, outputBytes }
}

async function main() {
  const { dirs, minBytes, dryRun, backup } = parseArgs(process.argv)
  const dirsAbs = dirs.map((d) => path.resolve(repoRoot, d))

  let optimized = 0
  let skipped = 0
  let inputTotal = 0
  let outputTotal = 0

  for (const dirAbs of dirsAbs) {
    for await (const fileAbs of walk(dirAbs)) {
      const res = await optimizeOne(fileAbs, { minBytes, dryRun, backup })
      if (res?.optimized) {
        optimized++
        inputTotal += res.inputBytes
        outputTotal += res.outputBytes
      } else {
        skipped++
      }
    }
  }

  const saved = inputTotal - outputTotal
  const pct = inputTotal > 0 ? ((saved / inputTotal) * 100).toFixed(1) : '0.0'

  console.log(
    JSON.stringify(
      {
        dryRun,
        optimized,
        skipped,
        inputBytes: inputTotal,
        outputBytes: outputTotal,
        savedBytes: saved,
        savedPct: Number(pct),
      },
      null,
      2
    )
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
