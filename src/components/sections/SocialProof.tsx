"use client"

import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"
import { testimonials } from "@/data/testimonials"
import { AnimatedCounter } from "@/components/ui/AnimatedCounter"

const METRICS = [
  { value: 50000, suffix: "+", label: "Clientes ativos",       prefix: "" },
  { value: 98,    suffix: "%", label: "Índice de satisfação",  prefix: "" },
  { value: 500,   suffix: "+", label: "Laudos publicados",     prefix: "" },
  { value: 12,    suffix: "+", label: "Anos de expertise",     prefix: "" },
]

export function SocialProof() {
  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-20">

        {/* Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {METRICS.map(({ value, suffix, label, prefix }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-white rounded-2xl border border-border p-8 text-center"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <p className="font-display text-4xl md:text-5xl font-700 text-brand-700 mb-2">
                <AnimatedCounter end={value} prefix={prefix} suffix={suffix} />
              </p>
              <p className="text-sm text-gray-500 font-500">{label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="text-xs font-700 uppercase tracking-[3px] text-brand-500 block mb-4">
            O que nossos clientes dizem
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-600 text-gray-900 leading-[1.1]">
            Confiança que<br />se constrói todo dia
          </h2>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-2xl border border-border p-7 flex flex-col gap-5 relative"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              {/* Quote icon */}
              <Quote size={20} className="text-brand-200 absolute top-6 right-6" />

              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-sm text-gray-600 leading-relaxed flex-1">"{t.content}"</p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                  <span className="text-xs font-700 text-brand-700">{t.avatar}</span>
                </div>
                <div>
                  <p className="text-sm font-700 text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-[10px] font-600 text-brand-600 bg-brand-50 border border-brand-100 px-2 py-1 rounded-full">
                    {t.product}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
