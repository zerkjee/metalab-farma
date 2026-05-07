"use client"

import { Instagram, Facebook, Linkedin, Youtube, Mail, Phone, MapPin, Shield, Award, ChevronRight } from "lucide-react"

const FOOTER_LINKS = {
  produtos: {
    title: "Produtos",
    links: ["Vitaminas", "Minerais", "Ômegas", "Proteínas", "Adaptógenos", "Ver tudo"],
  },
  empresa: {
    title: "Empresa",
    links: ["Sobre nós", "Nossa história", "Qualidade", "Sustentabilidade", "Blog"],
  },
  suporte: {
    title: "Suporte",
    links: ["FAQ", "Rastrear pedido", "Trocas e devoluções", "Política de privacidade", "Termos de uso"],
  },
}

const SOCIAL_LINKS = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Facebook,  label: "Facebook",  href: "#" },
  { icon: Linkedin,  label: "LinkedIn",  href: "#" },
  { icon: Youtube,   label: "YouTube",   href: "#" },
]

const CERTS = [
  { icon: Shield, label: "ANVISA" },
  { icon: Award,  label: "BPF" },
  { icon: Award,  label: "ISO 22000" },
]

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white" id="contato">
      {/* Top wave */}
      <div className="h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 py-16">

          {/* Brand col */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-lg">
                <span className="font-display text-2xl font-700 text-white leading-none">M</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display text-xl font-700 tracking-widest text-white">METALAB</span>
                <span className="text-[9px] font-600 tracking-[3px] text-white/40 uppercase mt-0.5">FARMA</span>
              </div>
            </div>

            <p className="text-sm text-white/60 leading-relaxed max-w-xs">
              Nutrição de precisão com rigor científico. Cada produto é desenvolvido
              com matérias-primas certificadas e processos laboratoriais de excelência.
            </p>

            {/* Contact */}
            <div className="space-y-3">
              {[
                { icon: Mail,    text: "contato@metalabfarma.com.br" },
                { icon: Phone,   text: "0800 000 0000 (Seg–Sex, 8h–18h)" },
                { icon: MapPin,  text: "São Paulo – SP, Brasil" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-sm text-white/55">
                  <Icon size={14} className="text-brand-400 shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            {/* Social */}
            <div className="flex items-center gap-2.5">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/50 hover:border-brand-400/50 hover:text-brand-400 hover:bg-brand-900/30 transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link cols */}
          {Object.values(FOOTER_LINKS).map(({ title, links }) => (
            <div key={title} className="space-y-5">
              <h4 className="text-xs font-700 uppercase tracking-widest text-white/40">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="group flex items-center gap-1.5 text-sm text-white/55 hover:text-white transition-colors duration-200"
                    >
                      <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 text-brand-400 transition-all -ml-1.5 group-hover:ml-0" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div className="border-t border-white/8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            {CERTS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-white/40 font-600">
                <Icon size={14} className="text-brand-500/70" />
                {label}
              </div>
            ))}
          </div>
          <p className="text-xs text-white/25 text-center">
            Resp. Técnico: Farm. [Nome] · CRF-SP 000000 · CNPJ: 00.000.000/0001-00
          </p>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/8 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} METALAB Farma. Todos os direitos reservados.
          </p>
          <p className="text-[11px] text-white/20 text-center max-w-lg">
            * Suplementos alimentares não são medicamentos e não substituem alimentação equilibrada.
            Consulte sempre um profissional de saúde. Proibida a venda sem registro na ANVISA.
          </p>
        </div>
      </div>
    </footer>
  )
}
