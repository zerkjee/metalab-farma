"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Microscope, PackageCheck, Headphones, Truck, ShieldCheck } from "lucide-react"

const BENEFITS = [
  {
    icon: Microscope,
    title: "Matérias-primas Certificadas",
    description: "Insumos selecionados com certificações internacionais — COA, GMP e GRAS — garantindo pureza comprovada em cada lote.",
    color: "#2d7a4f",
    bg: "#f0faf4",
  },
  {
    icon: CheckCircle2,
    title: "Formulação Baseada em Evidências",
    description: "Cada fórmula é desenvolvida por farmacêuticos com dosagens fundamentadas nas melhores publicações científicas disponíveis.",
    color: "#2563eb",
    bg: "#eff6ff",
  },
  {
    icon: PackageCheck,
    title: "Controle de Qualidade Rigoroso",
    description: "Análise microbiológica, físico-química e de identidade em 100% dos lotes, do recebimento à embalagem final.",
    color: "#0d9488",
    bg: "#f0fdfa",
  },
  {
    icon: ShieldCheck,
    title: "Transparência e Rastreabilidade",
    description: "Laudos de cada lote disponíveis para consulta. Rótulos claros, sem promessas não fundamentadas cientificamente.",
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    icon: Truck,
    title: "Entrega Rápida e Segura",
    description: "Logística dedicada com rastreamento em tempo real. Embalagem projetada para proteger a integridade dos produtos.",
    color: "#d97706",
    bg: "#fffbeb",
  },
  {
    icon: Headphones,
    title: "Suporte Especializado",
    description: "Equipe de farmacêuticos disponível para tirar dúvidas técnicas sobre produtos, dosagens e indicações gerais.",
    color: "#dc2626",
    bg: "#fef2f2",
  },
]

export function BenefitsSection() {
  return (
    <section id="sobre" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block text-xs font-700 uppercase tracking-[3px] text-brand-500 mb-4">
            Por que escolher METALAB
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-600 text-gray-900 leading-[1.1] mb-5">
            Compromisso com<br />a sua saúde
          </h2>
          <p className="text-gray-500 text-lg leading-relaxed">
            Cada decisão que tomamos é orientada por um propósito simples:
            entregar o melhor que a ciência da nutrição pode oferecer.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((benefit, i) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -5 }}
                className="group bg-white rounded-2xl p-7 border border-border hover:border-transparent transition-all duration-300"
                style={{
                  boxShadow: "var(--shadow-card)",
                }}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: benefit.bg, color: benefit.color }}
                >
                  <Icon size={22} />
                </div>

                <h3 className="font-display text-lg font-600 text-gray-900 mb-3 leading-snug">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
