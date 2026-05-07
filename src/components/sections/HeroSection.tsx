"use client"

import { motion } from "framer-motion"
import { ArrowRight, ShieldCheck, Microscope, BadgeCheck } from "lucide-react"

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "ANVISA Notificado" },
  { icon: Microscope,  label: "BPF Certificado"  },
  { icon: BadgeCheck,  label: "ISO 22000"         },
]

const STATS = [
  { value: "50k+",  label: "Clientes ativos" },
  { value: "98%",   label: "Satisfação"       },
  { value: "100%",  label: "Laudos disponíveis" },
]

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
}

const fadeUp = {
  initial:  { opacity: 0, y: 28 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
}

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative min-h-[90vh] flex items-center overflow-hidden bg-white"
    >
      {/* Dot grid bg */}
      <div className="absolute inset-0 dot-grid opacity-60 pointer-events-none" />

      {/* Gradient blobs */}
      <div className="absolute top-0 right-0 w-[55%] h-full pointer-events-none">
        <div
          className="absolute top-0 right-0 w-full h-full rounded-bl-[120px]"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at 80% 30%, rgba(107,91,240,0.08) 0%, transparent 60%), radial-gradient(ellipse 50% 60% at 100% 80%, rgba(107,91,240,0.05) 0%, transparent 50%)",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left column ── */}
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="flex flex-col gap-7 max-w-xl"
          >
            {/* Trust pill */}
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 text-brand-700 text-xs font-700 px-3.5 py-2 rounded-full">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse-glow" />
                Qualidade Laboratorial Certificada
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div variants={fadeUp}>
              <h1 className="font-display text-5xl md:text-6xl lg:text-[64px] font-600 leading-[1.04] tracking-tight text-gray-900">
                Sua saúde merece{" "}
                <em className="not-italic text-brand-500">o melhor</em>
                .
              </h1>
            </motion.div>

            {/* Subheadline */}
            <motion.p
              variants={fadeUp}
              className="text-lg text-gray-500 leading-relaxed"
            >
              Suplementos desenvolvidos com rigor científico, matérias-primas
              certificadas e transparência total em cada lote. Da fórmula à sua
              casa, sem compromissos.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex items-center gap-3 flex-wrap">
              <a
                href="#produtos"
                className="group inline-flex items-center gap-2.5 bg-brand-500 hover:bg-brand-600 text-white font-600 px-6 py-3.5 rounded-2xl shadow-md hover:shadow-lg  transition-all duration-300 hover:-translate-y-0.5"
              >
                Explorar produtos
                <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform duration-200" />
              </a>
              <a
                href="#sobre"
                className="inline-flex items-center gap-2 border border-gray-200 hover:border-brand-300 text-gray-700 hover:text-brand-700 font-600 px-6 py-3.5 rounded-2xl hover:bg-brand-50 transition-all duration-300"
              >
                Nossa história
              </a>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-5 flex-wrap pt-2"
            >
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-gray-500">
                  <Icon size={15} className="text-brand-500 shrink-0" />
                  <span className="font-500">{label}</span>
                </div>
              ))}
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-8 pt-2 border-t border-gray-100"
            >
              {STATS.map(({ value, label }, i) => (
                <div key={label} className="flex items-center gap-6">
                  <div>
                    <p className="font-display text-2xl font-700 text-brand-700">{value}</p>
                    <p className="text-xs text-gray-400 font-500 mt-0.5">{label}</p>
                  </div>
                  {i < STATS.length - 1 && (
                    <div className="w-px h-8 bg-gray-200" />
                  )}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right column: Hero visual ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex justify-center items-center"
          >
            <div className="relative w-[420px] h-[420px]">

              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-brand-200/60 animate-spin-slower" />

              {/* Mid ring */}
              <div className="absolute inset-8 rounded-full border border-brand-200/40 animate-spin-slow" />

              {/* Main card */}
              <div className="absolute inset-12 rounded-[40px] bg-white border border-gray-100 shadow-2xl shadow-gray-200/60 flex flex-col items-center justify-center gap-4">
                {/* Molecule SVG */}
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-brand-200/50 animate-spin-slow" />
                  <div className="absolute inset-4 rounded-full border border-brand-300/40 animate-spin-slower" />
                  <div className="w-8 h-8 rounded-full bg-brand-500 shadow-lg animate-pulse-glow" />

                  {/* Nodes */}
                  {[0, 72, 144, 216, 288].map((deg, i) => (
                    <div
                      key={i}
                      className="absolute w-3 h-3 rounded-full"
                      style={{
                        background: i % 2 === 0 ? "#6b5bf0" : "#b8a9ff",
                        top: "50%",
                        left: "50%",
                        transform: `rotate(${deg}deg) translateX(46px) translateY(-50%)`,
                        marginTop: -6,
                        marginLeft: -6,
                      }}
                    />
                  ))}
                </div>

                <div className="text-center px-4">
                  <p className="font-display text-lg font-600 text-gray-900">Formulação Avançada</p>
                  <p className="text-xs text-gray-400 tracking-widest uppercase mt-1">
                    Pureza &amp; Precisão
                  </p>
                </div>

                {/* Mini metrics */}
                <div className="flex items-center gap-4 text-center px-4 pt-2 border-t border-gray-100 w-full justify-center">
                  <div>
                    <p className="font-display text-base font-700 text-brand-600">99.8%</p>
                    <p className="text-[10px] text-gray-400">Pureza</p>
                  </div>
                  <div className="w-px h-6 bg-gray-100" />
                  <div>
                    <p className="font-display text-base font-700 text-brand-600">GMP</p>
                    <p className="text-[10px] text-gray-400">Certificado</p>
                  </div>
                  <div className="w-px h-6 bg-gray-100" />
                  <div>
                    <p className="font-display text-base font-700 text-brand-600">3rd</p>
                    <p className="text-[10px] text-gray-400">Party tested</p>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <motion.div
                className="absolute -left-8 top-1/2 -translate-y-1/2 bg-white rounded-2xl border border-gray-100 shadow-lg px-4 py-3 flex items-center gap-3"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center">
                  <ShieldCheck size={16} className="text-brand-500" />
                </div>
                <div>
                  <p className="text-xs font-700 text-gray-800">ANVISA</p>
                  <p className="text-[10px] text-gray-400">Notificado</p>
                </div>
              </motion.div>

              <motion.div
                className="absolute -right-6 top-1/3 bg-white rounded-2xl border border-gray-100 shadow-lg px-4 py-3 flex items-center gap-3"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                  <BadgeCheck size={16} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-xs font-700 text-gray-800">98%</p>
                  <p className="text-[10px] text-gray-400">Satisfação</p>
                </div>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
