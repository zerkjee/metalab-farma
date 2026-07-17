import Image, { type ImageProps } from 'next/image'
import { hasEmbeddedWhiteProductBackground } from '@/lib/product-image-presentation'

type ProductImageProps = Omit<ImageProps, 'fill' | 'height' | 'width'> & {
  frameClassName?: string
  imageClassName?: string
}

export default function ProductImage({
  frameClassName = 'w-full',
  imageClassName = '',
  src,
  alt,
  style,
  ...imageProps
}: ProductImageProps) {
  const imageUrl = typeof src === 'string' ? src : undefined
  const hasEmbeddedWhiteBackground = hasEmbeddedWhiteProductBackground(imageUrl)

  return (
    <span
      className={`relative block aspect-square ${hasEmbeddedWhiteBackground ? 'bg-white' : ''} ${frameClassName}`}
      data-product-image-treatment={hasEmbeddedWhiteBackground ? 'background-only' : 'native'}
    >
      <Image
        {...imageProps}
        src={src}
        alt={alt}
        fill
        className={`object-contain ${imageClassName}`}
        style={style}
      />
    </span>
  )
}
