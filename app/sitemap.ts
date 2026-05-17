import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600

const BASE = process.env.NEXT_PUBLIC_URL ?? 'https://metalab-farma.vercel.app'

const staticUrls: MetadataRoute.Sitemap = [
  { url: BASE,          lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
  { url: `${BASE}/vip`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const produtos = await prisma.produto.findMany({
      where: { ativo: true },
      select: { slug: true, atualizadoEm: true },
    })

    const productUrls: MetadataRoute.Sitemap = produtos.map((p) => ({
      url: `${BASE}/produtos/${p.slug}`,
      lastModified: p.atualizadoEm,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    return [...staticUrls, ...productUrls]
  } catch {
    return staticUrls
  }
}
