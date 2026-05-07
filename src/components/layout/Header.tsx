"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ShoppingCart, User, Menu, X, ChevronDown, Shield, Truck, Award } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { label: "Início",      href: "#inicio" },
  { label: "Produtos",    href: "#produtos",    hasDropdown: true },
  { label: "Sobre",       href: "#sobre" },
  { label: "Qualidade",   href: "#qualidade" },
  { label: "Contato",     href: "#contato" },
]

const TOP_BAR_ITEMS = [
  { icon: Truck,    text: "Frete grátis acima de R$ 199" },
  { icon: Shield,   text: "ANVISA Notificado" },
  { icon: Award,    text: "BPF Certificado" },
]

export function Header() {
  const [scrolled, setScrolled]       = useState(false)
  const [mobileOpen, setMobileOpen]   = useState(false)
  const [cartCount]                   = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  return (
    <>
      {/* Top Bar */}
      <div className="bg-brand-800 text-white text-xs py-2.5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center md:justify-between gap-6 flex-wrap">
            {TOP_BAR_ITEMS.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 font-medium opacity-90">
                <Icon size={13} className="opacity-80 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          "sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b transition-all duration-300",
          scrolled ? "border-border shadow-sm shadow-gray-100/80" : "border-transparent",
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 lg:h-18 gap-6">

            {/* Logo */}
            <a href="#inicio" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center shadow-sm group-hover:bg-brand-600 transition-colors duration-200">
                <span className="font-display text-xl font-700 text-white leading-none">M</span>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display text-[17px] font-700 tracking-widest text-gray-900">
                  METALAB
                </span>
                <span className="text-[9px] font-600 tracking-[3px] text-gray-400 uppercase mt-0.5">
                  FARMA
                </span>
              </div>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1 ml-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="group flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-500 text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition-all duration-200"
                >
                  {link.label}
                  {link.hasDropdown && (
                    <ChevronDown size={13} className="opacity-50 group-hover:opacity-100 transition-all duration-200 group-hover:rotate-180" />
                  )}
                </a>
              ))}
            </nav>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Search */}
            <div className="hidden md:flex items-center gap-2 bg-surface rounded-full border border-border px-4 py-2 w-52 lg:w-64 group focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100 transition-all duration-200">
              <Search size={15} className="text-gray-400 shrink-0" />
              <input
                type="search"
                placeholder="Buscar produtos..."
                className="bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none w-full"
                aria-label="Buscar produtos"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                className="hidden md:flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-brand-600 hover:bg-brand-50 transition-all duration-200"
                aria-label="Minha conta"
              >
                <User size={18} />
              </button>

              <button
                className="relative flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-brand-600 hover:bg-brand-50 transition-all duration-200"
                aria-label={`Carrinho (${cartCount} itens)`}
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-brand-500 text-white text-[10px] font-700 rounded-full flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </button>

              <a
                href="#produtos"
                className="hidden md:flex items-center px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-600 rounded-xl transition-all duration-200 shadow-sm  hover:-translate-y-px"
              >
                Comprar agora
              </a>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Menu"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-2xl flex flex-col lg:hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <span className="font-display text-lg font-700 text-gray-900">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex-1 px-4 py-4 flex flex-col gap-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center px-4 py-3 rounded-xl text-gray-700 font-500 hover:bg-brand-50 hover:text-brand-700 transition-all"
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>

              <div className="p-4 border-t border-border space-y-3">
                <div className="flex items-center gap-3 p-3 bg-surface rounded-xl">
                  <Search size={16} className="text-gray-400" />
                  <input
                    type="search"
                    placeholder="Buscar produtos..."
                    className="bg-transparent text-sm outline-none w-full text-gray-700 placeholder:text-gray-400"
                  />
                </div>
                <a
                  href="#produtos"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-full py-3 bg-brand-500 text-white font-600 rounded-xl hover:bg-brand-600 transition-colors"
                >
                  Explorar Produtos
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
