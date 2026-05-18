import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_URL ?? 'https://metalab-farma.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/checkout', '/pedidos', '/dev', '/login', '/registro'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
