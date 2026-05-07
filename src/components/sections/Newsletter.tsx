"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, ArrowRight, CheckCircle2, Gift, Zap, Bell } from "lucide-react"

const PERKS = [
  { icon: Gift,   text: "10% de desconto na 1ª compra" },
  { icon: Zap,    text: "Acesso antecipado a lançamentos" },
  { icon: Bell,   text: "Conteúdo exclusivo de saúde" },
]

export function Newsletter() {
  const [email, setEmail]     = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]    = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 900)
  }

  return (
    <section className="py-24 bg-brand-800 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 line-grid opacity-30" />

      {/* Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-brand-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-brand-700/20 blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Mail size={26} className="text-white" />
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-brand-300 text-xs font-700 uppercase tracking-[3px]">
              Newsletter METALAB
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-600 text-white leading-[1.1]">
              Conteúdo que cuida<br />da sua saúde
            </h2>
            <p className="text-brand-200/80 text-lg leading-relaxed max-w-lg mx-auto">
              Receba artigos científicos, novidades de produtos e ofertas exclusivas
              diretamente na sua caixa de entrada.
            </p>
          </div>

          {/* Perks */}
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {PERKS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-brand-200">
                <Icon size={15} className="text-brand-400" />
                <span>{text}</span>
              </div>
            ))}
          </div>

          {/* Form */}
          {!submitted ? (
            <motion.form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <div className="flex-1 relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com.br"
                  required
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm outline-none focus:border-white/50 focus:bg-white/15 transition-all duration-200"
                  aria-label="Seu endereço de e-mail"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="group shrink-0 flex items-center justify-center gap-2 bg-white text-brand-700 font-700 px-6 py-3.5 rounded-xl hover:bg-brand-50 transition-all duration-200 disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-brand-400 border-t-brand-700 animate-spin" />
                ) : (
                  <>
                    Assinar
                    <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-3 py-4"
            >
              <CheckCircle2 size={40} className="text-brand-300" />
              <p className="text-white font-600 text-lg">Você está inscrito!</p>
              <p className="text-brand-300/70 text-sm">
                Seu código de 10% de desconto chegará em breve.
              </p>
            </motion.div>
          )}

          <p className="text-brand-400/60 text-xs">
            Sem spam. Cancele quando quiser. Seus dados são protegidos conforme a LGPD.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
