"use client"

import { motion } from "framer-motion"
import { ShoppingCart, Eye } from "lucide-react"
import { useState } from "react"
import { type Product } from "@/data/products"
import { ProductBadge } from "./Badge"
import { StarRating } from "./StarRating"
import { cn } from "@/lib/utils"

const PRODUCT_ICONS: Record<string, React.ReactNode> = {
  vitaminas: (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <rect x="22" y="8" width="36" height="60" rx="8" stroke="currentColor" strokeWidth="2"/>
      <rect x="30" y="4" width="20" height="10" rx="4" fill="currentColor" opacity="0.25"/>
      <line x1="28" y1="34" x2="52" y2="34" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      <line x1="28" y1="42" x2="52" y2="42" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      <line x1="28" y1="50" x2="44" y2="50" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
    </svg>
  ),
  omegas: (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <ellipse cx="40" cy="44" rx="20" ry="30" stroke="currentColor" strokeWidth="2"/>
      <ellipse cx="40" cy="44" rx="11" ry="22" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      <circle cx="40" cy="44" r="5" fill="currentColor" opacity="0.25"/>
      <path d="M28 22 Q40 12 52 22" stroke="currentColor" strokeWidth="1.5" opacity="0.4" fill="none"/>
    </svg>
  ),
  minerais: (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <rect x="16" y="26" width="48" height="46" rx="8" stroke="currentColor" strokeWidth="2"/>
      <path d="M28 26V18a12 12 0 0124 0v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="40" cy="50" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      <circle cx="40" cy="50" r="4" fill="currentColor" opacity="0.25"/>
    </svg>
  ),
  proteinas: (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <path d="M28 72V38C28 22 52 22 52 38v34" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 52h40" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      <path d="M22 62h36" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      <circle cx="40" cy="24" r="12" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
  complexos: (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <rect x="14" y="30" width="52" height="44" rx="8" stroke="currentColor" strokeWidth="2"/>
      <path d="M26 30V22a14 14 0 0128 0v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="26" y1="50" x2="54" y2="50" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      <line x1="26" y1="60" x2="54" y2="60" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
      <circle cx="40" cy="42" r="6" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
    </svg>
  ),
  adaptogenos: (
    <svg viewBox="0 0 80 80" fill="none" className="w-full h-full">
      <path d="M40 10C28 10 18 20 18 32c0 8 4 14 10 18l-4 16h32l-4-16c6-4 10-10 10-18 0-12-10-22-22-22z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M32 50c2-4 4-8 8-10 4 2 6 6 8 10" stroke="currentColor" strokeWidth="1.5" opacity="0.5" fill="none"/>
    </svg>
  ),
}

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [added, setAdded] = useState(false)
  const categoryKey = product.category.toLowerCase()
  const icon = PRODUCT_ICONS[categoryKey] || PRODUCT_ICONS.vitaminas

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

  function handleAdd() {
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className="group relative bg-white rounded-2xl border border-border overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-2xl"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Badge */}
      {product.badge && (
        <div className="absolute top-3 left-3 z-10">
          <ProductBadge variant={product.badge} />
        </div>
      )}

      {/* Discount chip */}
      {discount > 0 && (
        <div className="absolute top-3 right-3 z-10 bg-red-50 text-red-600 text-[11px] font-700 px-2 py-1 rounded-md border border-red-100">
          -{discount}%
        </div>
      )}

      {/* Image area */}
      <div
        className="relative h-52 flex items-center justify-center overflow-hidden"
        style={{ background: `${product.color}10` }}
      >
        <div
          className="w-24 h-28 transition-transform duration-500 group-hover:scale-110"
          style={{ color: product.color }}
        >
          {icon}
        </div>

        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-brand-900/0 group-hover:bg-brand-900/5 transition-colors duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
          <button className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-600 px-3 py-2 rounded-full shadow-sm border border-gray-100 hover:bg-white transition-all">
            <Eye size={13} />
            Ver detalhes
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <div>
          <span
            className="text-[11px] font-700 uppercase tracking-widest mb-1 block"
            style={{ color: product.color }}
          >
            {product.category}
          </span>
          <h3 className="font-display text-[17px] font-600 text-gray-900 leading-snug mb-1">
            {product.name}
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">{product.shortDesc}</p>
        </div>

        <StarRating rating={product.rating} reviewCount={product.reviewCount} />

        {/* Price + CTA */}
        <div className="flex items-end justify-between gap-3 mt-auto pt-3 border-t border-border">
          <div>
            <p className="text-xs text-gray-400 line-through leading-none mb-1">
              R$ {product.originalPrice.toFixed(2).replace(".", ",")}
            </p>
            <p className="font-display text-2xl font-700 text-brand-700 leading-none">
              R$ {product.price.toFixed(2).replace(".", ",")}
            </p>
          </div>

          <motion.button
            onClick={handleAdd}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-600 transition-all duration-300 shrink-0",
              added
                ? "bg-brand-100 text-brand-700 border border-brand-200"
                : "bg-brand-500 hover:bg-brand-600 text-white shadow-sm",
            )}
          >
            <ShoppingCart size={15} />
            {added ? "Adicionado" : "Comprar"}
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}
