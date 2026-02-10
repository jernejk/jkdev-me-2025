import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdir } from 'node:fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const outPath = path.resolve(__dirname, '..', 'public', 'static', 'images', 'twitter-card.png')
await mkdir(path.dirname(outPath), { recursive: true })

const W = 1200
const H = 630

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <radialGradient id="glow1" cx="20%" cy="20%" r="55%">
      <stop offset="0%" stop-color="rgba(6,182,212,0.30)"/>
      <stop offset="60%" stop-color="rgba(6,182,212,0.0)"/>
    </radialGradient>
    <radialGradient id="glow2" cx="85%" cy="80%" r="55%">
      <stop offset="0%" stop-color="rgba(14,165,233,0.24)"/>
      <stop offset="60%" stop-color="rgba(14,165,233,0.0)"/>
    </radialGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="rgba(0,0,0,0.35)"/>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow1)"/>
  <rect width="${W}" height="${H}" fill="url(#glow2)"/>

  <g filter="url(#softShadow)">
    <rect x="64" y="86" width="${W - 128}" height="${H - 172}" rx="28" fill="rgba(2,6,23,0.72)" stroke="rgba(34,211,238,0.22)" stroke-width="2"/>
  </g>

  <g font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" fill="#e2e8f0">
    <text x="116" y="210" font-size="56" font-weight="800" letter-spacing="-0.5">Jernej Kavka (JK)</text>
    <text x="116" y="270" font-size="28" font-weight="600" fill="rgba(103,232,249,0.92)">Microsoft AI MVP • .NET • AI • Speaking</text>
    <text x="116" y="330" font-size="26" font-weight="500" fill="rgba(226,232,240,0.86)">
      I build with .NET and AI, speak at conferences, and organize developer communities.
    </text>
  </g>

  <g>
    <circle cx="170" cy="470" r="56" fill="rgba(6,182,212,0.10)" stroke="rgba(34,211,238,0.55)" stroke-width="2"/>
    <text x="170" y="490" text-anchor="middle"
      font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
      font-size="44" font-weight="900" fill="rgba(34,211,238,0.92)">JK</text>
    <text x="260" y="482"
      font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial"
      font-size="24" font-weight="600" fill="rgba(148,163,184,0.95)">jkdev.me</text>
  </g>
</svg>`

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(outPath)

console.log(`Generated: ${outPath}`)
