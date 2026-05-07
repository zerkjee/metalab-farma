"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { products } from "@/data/products"
import { ProductCard } from "@/components/ui/ProductCard"

export function FeaturedProducts() {
  const featured = products.slice(0, 8)

  return (
    <section id="produtos" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-12"
        >
          <div>
            <span className="text-xs font-700 uppercase tracking-[3px] text-brand-500 block mb-3">
              Linha METALAB
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-600 text-gray-900 leading-[1.1]">
              Produtos em<br />destaque
            </h2>
          </div>

          <a
            href="#"
            className="group shrink-0 inline-flex items-center gap-2 text-sm font-600 text-brand-600 hover:text-brand-700 transition-colors"
          >
            Ver catálogo completo
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>

        {/* Filter tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-2 flex-wrap mb-10"
        >
          {["Todos", "Vitaminas", "Minerais", "Ômegas", "Proteínas", "Adaptógenos"].map((tab, i) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-full text-sm font-600 transition-all duration-200 border ${
                i === 0
                  ? "bg-brand-500 text-white border-brand-500 shadow-sm"
                  : "bg-white text-gray-600 border-border hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </motion.div>

        {/* Product grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {featured.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mt-14"
        >
          <a
            href="#"
            className="group inline-flex items-center gap-3 bg-brand-500 hover:bg-brand-600 text-white font-600 text-base px-8 py-4 rounded-2xl shadow-md hover:shadow-lg  transition-all duration-300 hover:-translate-y-0.5"
          >
            Ver todos os produtos
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-200" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
