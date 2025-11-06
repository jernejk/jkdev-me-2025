# Image Optimization Setup

This project uses Next.js Image optimization with progressive loading and blur placeholders for optimal performance and user experience.

## Features

✅ **Progressive Loading** - Images load with blur-up placeholders  
✅ **Automatic Format Conversion** - WebP/AVIF generation  
✅ **Responsive Images** - Multiple resolutions via srcset  
✅ **Lazy Loading** - Images load as they enter viewport  
✅ **Automatic Optimization** - Next.js optimizes all images at build time

## How It Works

### 1. Markdown Images → Next.js Image Component

The custom remark plugin (`lib/remark-img-to-next-image.mjs`) automatically converts:

```markdown
![Alt text](/content/images/2020/01/photo.jpg)
```

Into:

```jsx
<Image src="/content/images/2020/01/photo.jpg" alt="Alt text" />
```

### 2. Blur Placeholders

The `generate-image-metadata.mjs` script:
- Scans all images in `public/content/images/`
- Generates tiny blur placeholders (base64 data URLs)
- Extracts image dimensions
- Outputs to `data/image-metadata.json`

### 3. Enhanced Image Component

The `components/Image.tsx` component:
- Reads metadata from `image-metadata.json`
- Applies blur placeholders automatically
- Provides responsive `sizes` attribute
- Falls back gracefully for images without metadata

## Scripts

### Generate Image Metadata

Run this after adding new images:

```bash
yarn images:metadata
# or
node scripts/generate-image-metadata.mjs
```

This creates/updates `data/image-metadata.json` with:
- Image dimensions (width/height)
- Base64 blur placeholders
- For all images in `public/content/images/`

### Download Blog Images

Download images from jkdev.me:

```bash
yarn images:download
# or
./scripts/download-images.sh
```

This:
- Scans MDX files for image references
- Downloads from jkdev.me to `public/content/images/`
- Preserves directory structure
- Skips existing images
- Shows progress and summary

## Workflow

### For Migrated Content

1. **Download images** from old blog:
   ```bash
   yarn images:download
   ```

2. **Generate metadata** for blur placeholders:
   ```bash
   yarn images:metadata
   ```

3. **Build** the site:
   ```bash
   yarn build
   ```

### For New Images

1. **Add image** to `public/content/images/YYYY/MM/`
   - Follow the date-based structure
   - Use descriptive filenames

2. **Reference in MDX** using standard markdown:
   ```markdown
   ![Description](/content/images/2024/01/my-image.jpg)
   ```

3. **Generate metadata** before building:
   ```bash
   yarn images:metadata
   ```

## Image Sizes & Responsive Loading

The Image component uses responsive `sizes`:

```typescript
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
```

This tells the browser:
- **Mobile (≤768px)**: Use 100% viewport width
- **Tablet (≤1200px)**: Use 50% viewport width  
- **Desktop (>1200px)**: Use 33% viewport width

Next.js automatically generates multiple image sizes and the browser downloads the most appropriate one.

## File Structure

```
├── components/
│   └── Image.tsx                    # Enhanced Image component
├── data/
│   └── image-metadata.json          # Generated blur placeholders & dimensions
├── lib/
│   └── remark-img-to-next-image.mjs # Converts markdown images to <Image>
├── public/
│   └── content/
│       └── images/                  # Blog images organized by date
│           ├── 2018/
│           ├── 2019/
│           ├── 2020/
│           └── ...
├── scripts/
│   ├── download-images.sh           # Download images from jkdev.me
│   └── generate-image-metadata.mjs  # Generate blur placeholders
└── contentlayer.config.ts           # Includes remarkImgToNextImage plugin
```

## Benefits

### Performance
- **Faster perceived load time** with blur placeholders
- **Reduced bandwidth** with automatic format conversion
- **Optimized delivery** with responsive images
- **Lazy loading** saves initial page load

### User Experience
- **Progressive enhancement** - images appear smoothly
- **No layout shift** - dimensions known upfront
- **Mobile optimized** - appropriate image sizes

### Developer Experience
- **Zero config per image** - just use markdown syntax
- **Automatic optimization** - works out of the box
- **Type-safe** - TypeScript support

## Troubleshooting

### Images not showing blur placeholder

1. Check `data/image-metadata.json` exists
2. Verify image path matches exactly (case-sensitive)
3. Regenerate metadata: `yarn images:metadata`

### New images not optimized

Run `yarn images:metadata` after adding new images to `public/content/images/`

### Build errors with images

- Ensure all image paths in MDX files are valid
- Check that referenced images exist in `public/content/images/`
- Verify `image-metadata.json` is valid JSON

## Advanced Configuration

### Customize responsive sizes

Edit `components/Image.tsx`:

```typescript
sizes="your-custom-sizes-here"
```

### Change blur placeholder quality

Edit `scripts/generate-image-metadata.mjs`:

```javascript
const { base64 } = await getPlaiceholder(buffer, { 
  size: 10  // Increase for more detail (10-64)
})
```

### Exclude images from optimization

In `lib/remark-img-to-next-image.mjs`, add conditions:

```javascript
// Skip external images
if (node.url.startsWith('http')) return

// Skip specific paths
if (node.url.includes('/static/')) return
```

## Resources

- [Next.js Image Documentation](https://nextjs.org/docs/app/api-reference/components/image)
- [Plaiceholder Documentation](https://plaiceholder.co/)
- [Sharp Documentation](https://sharp.pixelplumbing.com/)
