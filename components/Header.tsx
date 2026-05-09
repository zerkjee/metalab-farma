'use client';

import { useState } from 'react';

const navItems = [
  { label: 'Início', href: '/' },
  { label: 'Produtos', href: '/#produtos' },
  { label: 'Avaliações', href: '/avaliacoes' },
  { label: 'VIP', href: '/vip', highlight: true },
  { label: 'Contato', href: '#' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black tracking-tight text-gray-900">METALAB</span>
              <span className="text-lg font-semibold text-[#6b21a8]">Store</span>
            </div>
          </a>

          {/* Nav desktop */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) =>
              item.highlight ? (
                <a
                  key={item.label}
                  href={item.href}
                  className="relative text-sm font-bold px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)', color: '#fff' }}
                >
                  {item.label} ✦
                </a>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="relative text-sm font-medium text-gray-600 hover:text-[#6b21a8] transition-colors duration-200 group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#6b21a8] transition-all duration-300 group-hover:w-full" />
                </a>
              )
            )}
          </div>

          {/* Carrinho + hamburger */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-600 hover:text-[#6b21a8] transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m10 0l2-9m-12 9h16m-16 0a2 2 0 11-4 0 2 2 0 014 0zm16 0a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>

            {/* Hamburger mobile */}
            <button
              className="md:hidden p-2 text-gray-600"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Nav mobile */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-medium transition-colors px-2 ${
                  item.highlight ? 'text-[#6b21a8] font-bold' : 'text-gray-700 hover:text-[#6b21a8]'
                }`}
              >
                {item.label}{item.highlight ? ' ✦' : ''}
              </a>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
