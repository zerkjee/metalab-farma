import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { products } from "@/data/products"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { ProductPageContent } from "@/components/sections/ProductPageContent"

type Props = { params: Promise<{ id: string }> }

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const product = products.find((p) => p.id === id)
  if (!product) return {}
  return {
    title: product.name,
    description: product.description,
  }
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params
  const product = products.find((p) => p.id === id)
  if (!product) notFound()

  const sameCat = products.filter((p) => p.id !== product.id && p.category === product.category)
  const related = sameCat.length >= 2
    ? sameCat.slice(0, 3)
    : products.filter((p) => p.id !== product.id).slice(0, 3)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        <ProductPageContent product={product} relatedProducts={related} />
      </main>
      <Footer />
    </>
  )
}
