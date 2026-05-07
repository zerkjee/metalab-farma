"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { type Category } from "@/data/categories"

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  vitaminas: (
    <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
      <rect x="14" y="6" width="20" height="36" rx="5" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="18" y="3" width="12" height="6" rx="3" fill="currentColor" opacity="0.3"/>
      <line x1="18" y1="22" x2="30" y2="22" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
      <line x1="18" y1="28" x2="30" y2="28" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
    </svg>
  ),
  minerais: (
    <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
      <rect x="10" y="18" width="28" height="26" rx="5" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M16 18v-5a8 8 0 0116 0v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="24" cy="30" r="6" stroke="currentColor" strokeWidth="1.3" opacity="0.5"/>
      <circle cx="24" cy="30" r="2.5" fill="currentColor" opacity="0.3"/>
    </svg>
  ),
  omegas: (
    <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
      <ellipse cx="24" cy="26" rx="12" ry="18" stroke="currentColor" strokeWidth="1.8"/>
      <ellipse cx="24" cy="26" rx="6" ry="12" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
      <circle cx="24" cy="26" r="3" fill="currentColor" opacity="0.3"/>
      <path d="M16 14 Q24 8 32 14" stroke="currentColor" strokeWidth="1.3" opacity="0.4" fill="none"/>
    </svg>
  ),
  proteinas: (
    <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
      <path d="M18 42V26c0-9 12-9 12 0v16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M12 32h24" stroke="currentColor" strokeWidth="1.3" opacity="0.4"/>
      <circle cx="24" cy="18" r="7" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  ),
  adaptogenos: (
    <svg viewBox="0 0 48 48" fill="none" className="w-8 h-8">
      <path d="M24 6C16 6 10 12 10 20c0 5 2.5 9 6.5 11.5L14 40h20l-2.5-8.5C35.5 29 38 25 38 20c0-8-6-14-14-14z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M20 30c1-2.5 2.5-5 4-6 1.5 1 3 3.5 4 6" stroke="currentColor" strokeWidth="1.3" opacity="0.5" fill="none"/>
    </svg>
  ),
}

interface CategoryCardProps {
  category: Category
  index?: number
}

export function CategoryCard({ category, index = 0 }: CategoryCardProps) {
  const icon = CATEGORY_ICONS[category.id] || CATEGORY_ICONS.vitaminas

  return (
    <motion.a
      href={`#${category.id}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="group relative block rounded-2xl p-6 border border-border bg-white overflow-hidden cursor-pointer"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Hover bg fill */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: category.bgColor }}
      />

      <div className="relative flex flex-col gap-4">
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
          style={{ background: category.bgColor, color: category.color }}
        >
          {icon}
        </div>

        {/* Text */}
        <div>
          <h3 className="font-display text-lg font-600 text-gray-900 mb-1">{category.name}</h3>
          <p className="text-sm text-gray-500 leading-relaxed">{category.description}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-600 text-gray-400 uppercase tracking-wide">
            {category.productCount} produtos
          </span>
          <span
            className="flex items-center gap-1 text-xs font-600 transition-colors duration-200 group-hover:gap-2"
            style={{ color: category.color }}
          >
            Ver todos <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </motion.a>
  )
}
