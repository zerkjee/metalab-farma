"use client"

import { motion } from "framer-motion"
import { ShoppingCart, Eye } from "lucide-react"
import { useState } from "react"
import { type Product } from "@/data/products"
import { PRODUCT_ICONS } from "@/lib/product-icons"
import { ProductBadge } from "./Badge"
import { StarRating } from "./StarRating"
import { cn } from "@/lib/utils"

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
          <a
            href={`/produto/${product.id}`}
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-600 px-3 py-2 rounded-full shadow-sm border border-gray-100 hover:bg-white transition-all"
          >
            <Eye size={13} />
            Ver detalhes
          </a>
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
