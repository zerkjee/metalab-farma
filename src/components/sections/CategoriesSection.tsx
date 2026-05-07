"use client"

import { motion } from "framer-motion"
import { categories } from "@/data/categories"
import { CategoryCard } from "@/components/ui/CategoryCard"

export function CategoriesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-12"
        >
          <div>
            <span className="text-xs font-700 uppercase tracking-[3px] text-brand-500 block mb-3">
              Linhas de produtos
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-600 text-gray-900 leading-[1.1]">
              Explore por<br />categoria
            </h2>
          </div>
          <a
            href="#produtos"
            className="shrink-0 text-sm font-600 text-brand-600 hover:text-brand-700 underline-offset-4 hover:underline transition-all"
          >
            Ver todos os produtos →
          </a>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id} category={cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
