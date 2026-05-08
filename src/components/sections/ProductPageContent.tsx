"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ShoppingCart, ChevronRight, Shield, Truck, Award, RotateCcw, Minus, Plus, Check } from "lucide-react"

import { type Product } from "@/data/products"
import { testimonials } from "@/data/testimonials"
import { PRODUCT_ICONS } from "@/lib/product-icons"
import { ProductCard } from "@/components/ui/ProductCard"
import { ProductBadge } from "@/components/ui/Badge"
import { StarRating } from "@/components/ui/StarRating"

const TRUST_ITEMS = [
  { Icon: Truck,      label: "Frete grátis acima de R$ 199" },
  { Icon: Shield,     label: "ANVISA Notificado" },
  { Icon: Award,      label: "BPF Certificado" },
  { Icon: RotateCcw,  label: "Garantia de 30 dias" },
]

interface Props {
  product: Product
  relatedProducts: Product[]
}

export function ProductPageContent({ product, relatedProducts }: Props) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
  const icon = PRODUCT_ICONS[product.category.toLowerCase()] ?? PRODUCT_ICONS.vitaminas
  const productTestimonials = testimonials.filter((t) => t.product === product.name)

  function handleAdd() {
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
          <nav aria-label="Localização" className="flex items-center gap-1.5 text-sm text-gray-400">
            <a href="/" className="hover:text-brand-600 transition-colors">Início</a>
            <ChevronRight size={13} />
            <span>{product.category}</span>
            <ChevronRight size={13} />
            <span className="text-gray-700 font-500 truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-3xl overflow-hidden flex items-center justify-center min-h-[360px] lg:min-h-[500px]"
            style={{ background: `linear-gradient(135deg, ${product.color}12 0%, ${product.color}05 100%)` }}
          >
            <div className="absolute inset-0 dot-grid opacity-30" />
            <div
              className="relative z-10 animate-float"
              style={{ color: product.color, width: 200, height: 240 }}
            >
              {icon}
            </div>
            <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-2 z-10">
              <span className="glass-card text-xs font-600 text-gray-700 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Shield size={11} className="text-brand-500" />
                ANVISA Notificado
              </span>
              <span className="glass-card text-xs font-600 text-gray-700 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <Award size={11} className="text-brand-500" />
                BPF Certificado
              </span>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-700 uppercase tracking-widest" style={{ color: product.color }}>
                {product.category}
              </span>
              {product.badge && <ProductBadge variant={product.badge} />}
            </div>

            <h1 className="font-display text-3xl lg:text-[42px] font-700 text-gray-900 leading-tight mb-4">
              {product.name}
            </h1>

            <StarRating rating={product.rating} reviewCount={product.reviewCount} size="md" className="mb-5" />

            <div className="h-px bg-border mb-5" />

            {/* Price */}
            <div className="mb-6">
              <p className="text-sm text-gray-400 line-through leading-none mb-1.5">
                R$ {product.originalPrice.toFixed(2).replace(".", ",")}
              </p>
              <div className="flex items-end gap-3">
                <p className="font-display text-4xl font-700 text-gray-900 leading-none">
                  R$ {product.price.toFixed(2).replace(".", ",")}
                </p>
                {discount > 0 && (
                  <span className="mb-0.5 bg-red-50 text-red-600 text-sm font-700 px-2.5 py-1 rounded-lg border border-red-100">
                    -{discount}%
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">ou em até 3× sem juros no cartão</p>
            </div>

            {/* Quantity + cart */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center rounded-xl border border-border overflow-hidden shrink-0">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 flex items-center justify-center text-gray-500 hover:bg-surface hover:text-gray-900 transition-colors"
                  aria-label="Diminuir quantidade"
                >
                  <Minus size={14} />
                </button>
                <span className="w-11 text-center text-sm font-600 text-gray-900 select-none">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="w-11 h-11 flex items-center justify-center text-gray-500 hover:bg-surface hover:text-gray-900 transition-colors"
                  aria-label="Aumentar quantidade"
                >
                  <Plus size={14} />
                </button>
              </div>

              <motion.button
                onClick={handleAdd}
                whileTap={{ scale: 0.97 }}
                className="flex-1 h-11 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-600 rounded-xl transition-all duration-200 shadow-sm"
              >
                <ShoppingCart size={16} />
                {added ? "Adicionado!" : "Adicionar ao Carrinho"}
              </motion.button>
            </div>

            <button className="w-full h-11 flex items-center justify-center bg-navy-900 hover:bg-navy-800 text-white text-sm font-600 rounded-xl transition-colors duration-200 mb-6">
              Comprar agora
            </button>

            {/* Trust grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {TRUST_ITEMS.map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-gray-600 bg-surface rounded-lg px-3 py-2.5 border border-border">
                  <Icon size={13} className="text-brand-500 shrink-0" />
                  <span className="font-500">{label}</span>
                </div>
              ))}
            </div>

            {/* Specs */}
            {(product.capsules ?? product.weight) && (
              <div className="px-4 py-3 bg-surface rounded-xl border border-border">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-600 mb-0.5">Apresentação</p>
                <p className="text-sm text-gray-700 font-500">{product.capsules ?? product.weight}</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Highlights strip */}
      {product.highlights && product.highlights.length > 0 && (
        <section className="border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-wrap gap-3 justify-center">
              {product.highlights.map((h, i) => (
                <motion.div
                  key={h}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-500"
                  style={{
                    borderColor: `${product.color}35`,
                    background: `${product.color}08`,
                    color: product.color,
                  }}
                >
                  <Check size={13} />
                  {h}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Benefits */}
      {product.benefits && product.benefits.length > 0 && (
        <section className="border-t border-border bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <h2 className="font-display text-2xl font-600 text-gray-900 mb-6">Benefícios principais</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {product.benefits.map((benefit, i) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-4 p-4 bg-white rounded-xl border border-border"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white text-sm font-700"
                    style={{ background: product.color }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-700 font-500 leading-relaxed pt-0.5">{benefit}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Key Ingredients */}
      {product.keyIngredients && product.keyIngredients.length > 0 && (
        <section className="border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <h2 className="font-display text-2xl font-600 text-gray-900 mb-6">Ingredientes ativos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {product.keyIngredients.map((ing, i) => (
                <motion.div
                  key={ing.name}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="p-5 bg-white rounded-2xl border border-border"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-600 mb-1.5">Ingrediente</p>
                  <p className="font-display text-lg font-600 text-gray-900 mb-1">{ing.name}</p>
                  <p className="text-2xl font-700 mb-3 leading-none" style={{ color: product.color }}>
                    {ing.amount}
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed">{ing.benefit}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Usage */}
      {product.usage && (
        <section className="border-t border-border bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <h2 className="font-display text-2xl font-600 text-gray-900 mb-4">Como usar</h2>
            <div
              className="max-w-xl p-5 bg-white rounded-2xl border-l-4 border border-border"
              style={{ borderLeftColor: product.color, boxShadow: "var(--shadow-card)" }}
            >
              <p className="text-sm text-gray-700 leading-relaxed">{product.usage}</p>
            </div>
          </div>
        </section>
      )}

      {/* About */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <h2 className="font-display text-2xl font-600 text-gray-900 mb-4">Sobre este produto</h2>
          <p className="text-gray-600 leading-relaxed max-w-2xl">{product.description}</p>
        </div>
      </section>

      {/* Testimonials */}
      {productTestimonials.length > 0 && (
        <section className="border-t border-border bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <h2 className="font-display text-2xl font-600 text-gray-900 mb-6">O que dizem os clientes</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {productTestimonials.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white rounded-2xl border border-border p-6"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <StarRating rating={t.rating} size="sm" className="mb-3" />
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">"{t.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 text-xs font-700 flex items-center justify-center shrink-0">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-600 text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-border bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <h2 className="font-display text-2xl font-600 text-gray-900 mb-6">Você também pode gostar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
