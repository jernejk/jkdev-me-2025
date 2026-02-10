import { mkdir, writeFile } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import path from 'node:path'

export function getSeoSite(argv) {
  const idx = argv.indexOf('--site')
  const raw = (idx !== -1 ? argv[idx + 1] : undefined) || process.env.SEO_SITE || 'https://jkdev.me'
  let site
  try {
    site = new URL(raw)
  } catch (e) {
    throw new Error(`Invalid --site / SEO_SITE URL: ${raw}`)
  }
  // Normalize: strip trailing slash for consistent joins.
  site.pathname = site.pathname.replace(/\/+$/, '')
  return site
}

export function joinUrl(baseUrl, path) {
  const u = new URL(baseUrl.toString())
  const clean = String(path || '')
  u.pathname = `${u.pathname.replace(/\/+$/, '')}/${clean.replace(/^\/+/, '')}`
  return u.toString()
}

export function hostForRegex(siteUrl) {
  // Include port if present.
  return siteUrl.host.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export async function ensureDir(dir) {
  await mkdir(dir, { recursive: true })
}

export async function writeJson(filePath, data) {
  await ensureDir(path.dirname(filePath))
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

export function run(cmd, args, { cwd } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (d) => (stdout += d))
    child.stderr.on('data', (d) => (stderr += d))
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) return resolve({ stdout, stderr })
      const err = new Error(`${cmd} ${args.join(' ')} failed with exit code ${code}`)
      err.stdout = stdout
      err.stderr = stderr
      return reject(err)
    })
  })
}
