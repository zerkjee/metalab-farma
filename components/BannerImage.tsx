'use client'

import Image from 'next/image'
import { useState } from 'react'

/**
 * Thumbnail do banner (CampaignBanners). Como o imagemUrl é gerenciado pelo
 * admin/seed, a imagem pode apontar para um arquivo inexistente. Em vez de
 * renderizar o "quadro de imagem quebrada", o componente se esconde por
 * completo no onError — o card cai graciosamente para só texto + CTA.
 */
export default function BannerImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false)
  if (failed) return null

  return (
    <div className="flex items-center justify-center pl-1">
      <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-2 backdrop-blur transition-transform duration-300 group-hover:scale-105">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="96px"
          className="object-contain rounded-xl p-1"
          onError={() => setFailed(true)}
        />
      </div>
    </div>
  )
}
