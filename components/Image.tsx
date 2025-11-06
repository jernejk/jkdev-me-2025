import NextImage, { ImageProps } from 'next/image'
import imageMetadata from '@/lib/image-metadata.json'

const basePath = process.env.BASE_PATH

interface ImageMetadata {
  width: number
  height: number
  blurDataURL: string
}

const metadata = imageMetadata as Record<string, ImageMetadata>

const Image = ({ src, alt, ...rest }: ImageProps) => {
  const imagePath = typeof src === 'string' ? src : ''
  const imageData = metadata[imagePath]

  // If we have metadata (dimensions + blur), use it for progressive loading
  if (imageData) {
    return (
      <NextImage
        src={`${basePath || ''}${imagePath}`}
        alt={alt || ''}
        width={imageData.width}
        height={imageData.height}
        placeholder="blur"
        blurDataURL={imageData.blurDataURL}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        {...rest}
      />
    )
  }

  // Fallback for images without metadata
  return <NextImage src={`${basePath || ''}${imagePath}`} alt={alt || ''} {...rest} />
}

export default Image
