"use client"

import { motion } from "framer-motion"
import { FlaskConical, Leaf, HeartHandshake, ArrowRight } from "lucide-react"

const PILLARS = [
  {
    icon: FlaskConical,
    title: "Ciência como base",
    text: "Cada formulação nasce de uma revisão criteriosa da literatura científica. Só usamos insumos com evidências de segurança e eficácia.",
  },
  {
    icon: Leaf,
    title: "Responsabilidade ambiental",
    text: "Embalagens recicláveis, processos limpos e parceiros certificados. Cuidar da saúde humana começa por cuidar do planeta.",
  },
  {
    icon: HeartHandshake,
    title: "Confiança como valor",
    text: "Transparência em tudo: laudos públicos, rótulos honestos e comunicação responsável, sem promessas que a ciência não sustenta.",
  },
]

export function InstitutionalSection() {
  return (
    <section id="qualidade" className="py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* ── Left: Visual ── */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            {/* Main card */}
            <div className="relative bg-brand-800 rounded-3xl overflow-hidden p-10 text-white">
              {/* Grid overlay */}
              <div className="absolute inset-0 line-grid opacity-50" />

              <div className="relative z-10 space-y-8">
                <div>
                  <p className="text-brand-300 text-xs font-700 uppercase tracking-[3px] mb-3">
                    Processo METALAB
                  </p>
                  <h3 className="font-display text-3xl font-600 leading-snug">
                    Cada detalhe<br />importa. Cada lote<br />é testado.
                  </h3>
                </div>

                {/* Steps */}
                {[
                  { step: "01", label: "Seleção de insumos", desc: "Fornecedores auditados com COA e GMP" },
                  { step: "02", label: "Formulação precisa",  desc: "Dosagens baseadas em evidências científicas" },
                  { step: "03", label: "Produção controlada", desc: "BPF – Boas Práticas de Fabricação ANVISA" },
                  { step: "04", label: "Laudo de análise",    desc: "Microbiológica, físico-química e identidade" },
                ].map(({ step, label, desc }) => (
                  <div key={step} className="flex items-start gap-4">
                    <span className="font-display text-2xl font-700 text-brand-400 leading-none mt-1 shrink-0 w-8">
                      {step}
                    </span>
                    <div>
                      <p className="font-600 text-white text-sm">{label}</p>
                      <p className="text-brand-300/70 text-xs mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating metric */}
            <motion.div
              className="absolute -right-6 -bottom-6 bg-white rounded-2xl shadow-xl border border-gray-100 p-5 flex items-center gap-4"
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center">
                <FlaskConical size={22} className="text-brand-500" />
              </div>
              <div>
                <p className="font-display text-2xl font-700 text-brand-700">100%</p>
                <p className="text-xs text-gray-500 font-500">Lotes com laudo</p>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right: Text ── */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-10"
          >
            <div className="space-y-5">
              <span className="text-xs font-700 uppercase tracking-[3px] text-brand-500 block">
                Nossa história
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-600 text-gray-900 leading-[1.1]">
                Nascemos para elevar o padrão da nutrição no Brasil
              </h2>
              <p className="text-gray-500 leading-relaxed text-lg">
                A METALAB Farma surgiu da inconformidade com o que o mercado de
                suplementos oferecia: produtos com promessas grandes e qualidade
                comprovada pequena. Criamos uma farmácia voltada para a nutrição
                de precisão.
              </p>
            </div>

            {/* Pillars */}
            <div className="space-y-6">
              {PILLARS.map(({ icon: Icon, title, text }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={18} className="text-brand-500" />
                  </div>
                  <div>
                    <p className="font-600 text-gray-900 mb-1">{title}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <a
              href="#qualidade"
              className="group inline-flex items-center gap-2.5 text-brand-600 font-600 hover:text-brand-700 transition-colors"
            >
              Conheça nosso processo de qualidade
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
            </a>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
