'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

const navItems = [
  { label: 'Início', href: '/' },
  { label: 'Produtos', href: '/#produtos' },
  { label: 'Avaliações', href: '/avaliacoes' },
  { label: 'VIP', href: '/vip', highlight: true },
  { label: 'Contato', href: '#' },
];

const adminAccess = {
  label: 'Admin',
  href: '/admin',
  title: 'Painel administrativo',
};

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isAdminActive = pathname?.startsWith(adminAccess.href);
  const { hydrated, totals, toggleCart } = useCart();
  const cartCount = hydrated ? totals.itemCount : 0;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black tracking-tight text-gray-900">METALAB</span>
              <span className="text-lg font-semibold text-[#6b21a8]">Store</span>
            </div>
          </Link>

          {/* Nav desktop */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) =>
              item.highlight ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative text-sm font-bold px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #6b21a8, #7c3aed)', color: '#fff' }}
                >
                  {item.label} ✦
                </Link>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative text-sm font-medium text-gray-600 hover:text-[#6b21a8] transition-colors duration-200 group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#6b21a8] transition-all duration-300 group-hover:w-full" />
                </Link>
              )
            )}
          </div>

          {/* Carrinho + hamburger */}
          <div className="flex items-center gap-4">
            <Link
              href={adminAccess.href}
              title={adminAccess.title}
              aria-label={adminAccess.title}
              aria-current={isAdminActive ? 'page' : undefined}
              className={`group relative hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 active:scale-95 ${
                isAdminActive
                  ? 'border-[#6b21a8]/30 bg-[#6b21a8]/10 text-[#6b21a8] shadow-sm'
                  : 'border-gray-200 bg-white/80 text-gray-500 hover:border-[#6b21a8]/30 hover:bg-[#6b21a8]/5 hover:text-[#6b21a8] hover:shadow-sm'
              }`}
            >
              <Settings className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" strokeWidth={1.8} />
              <span className="pointer-events-none absolute right-0 top-12 whitespace-nowrap rounded-md bg-gray-950 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0.5 group-hover:opacity-100">
                {adminAccess.label}
              </span>
            </Link>

            <button
              onClick={toggleCart}
              className="relative p-2 text-gray-600 hover:text-[#6b21a8] transition-colors"
              aria-label={`Abrir carrinho com ${cartCount} itens`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m10 0l2-9m-12 9h16m-16 0a2 2 0 11-4 0 2 2 0 014 0zm16 0a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#6b21a8] px-1.5 text-[10px] font-black text-white shadow-md">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
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
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-medium transition-colors px-2 ${
                  item.highlight ? 'text-[#6b21a8] font-bold' : 'text-gray-700 hover:text-[#6b21a8]'
                }`}
              >
                {item.label}{item.highlight ? ' ✦' : ''}
              </Link>
            ))}
            <Link
              href={adminAccess.href}
              onClick={() => setMenuOpen(false)}
              aria-current={isAdminActive ? 'page' : undefined}
              className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium transition-all duration-200 active:scale-[0.99] ${
                isAdminActive
                  ? 'bg-[#6b21a8]/10 text-[#6b21a8]'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-[#6b21a8]'
              }`}
            >
              <Settings className="h-4 w-4" strokeWidth={1.8} />
              {adminAccess.label}
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
