#!/usr/bin/env node
/**
 * Generate image metadata with blur placeholders for all blog images
 * This creates a JSON file with image dimensions and base64 blur placeholders
 * that can be used by Next.js Image component for progressive loading
 */
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPlaiceholder } from 'plaiceholder'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

const PUBLIC_DIR = path.join(root, 'public')
const IMAGES_DIR = path.join(PUBLIC_DIR, 'content', 'images')
const OUTPUT_FILE = path.join(root, 'lib', 'image-metadata.json')

async function getImageMetadata(imagePath) {
  try {
    const buffer = await fs.readFile(imagePath)

    // Get dimensions
    const metadata = await sharp(buffer).metadata()

    // Generate blur placeholder
    const { base64 } = await getPlaiceholder(buffer, { size: 10 })

    return {
      width: metadata.width,
      height: metadata.height,
      blurDataURL: base64,
    }
  } catch (error) {
    console.error(`Error processing ${imagePath}:`, error.message)
    return null
  }
}

async function findAllImages(dir, baseDir = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const images = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      images.push(...(await findAllImages(fullPath, baseDir)))
    } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(entry.name)) {
      // Get relative path from public dir
      const relativePath = '/' + path.relative(PUBLIC_DIR, fullPath).replace(/\\/g, '/')
      images.push({ path: relativePath, fullPath })
    }
  }

  return images
}

async function main() {
  console.log('🖼️  Generating image metadata with blur placeholders...\n')

  // Find all images
  const images = await findAllImages(IMAGES_DIR)
  console.log(`Found ${images.length} images\n`)

  const metadata = {}
  let processed = 0
  let failed = 0

  for (const { path: imgPath, fullPath } of images) {
    process.stdout.write(`Processing (${processed + 1}/${images.length}): ${imgPath}...`)

    const data = await getImageMetadata(fullPath)
    if (data) {
      metadata[imgPath] = data
      processed++
      console.log(' ✅')
    } else {
      failed++
      console.log(' ❌')
    }
  }

  // Ensure data directory exists
  await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true })

  // Write metadata file
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(metadata, null, 2), 'utf8')

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 Summary:')
  console.log(`   ✅ Processed: ${processed}`)
  if (failed > 0) {
    console.log(`   ❌ Failed:    ${failed}`)
  }
  console.log(`   📄 Output:    ${OUTPUT_FILE}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('🎉 Done! Image metadata generated successfully.')
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
