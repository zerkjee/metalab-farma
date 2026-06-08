'use client';

import { useState, useEffect } from 'react';
import { Settings, User, LogOut, Package } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/context/CartContext';
import SearchBar from '@/components/SearchBar';

const navItems = [
  { label: 'Início', href: '/' },
  { label: 'Produtos', href: '/produtos' },
  { label: 'Avaliações', href: '/avaliacoes' },
  { label: 'VIP', href: '/vip', highlight: true },
  { label: 'Contato', href: '/#contato' },
];

const adminAccess = {
  label: 'Admin',
  href: '/admin',
  title: 'Painel administrativo',
};

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);
  const pathname = usePathname();
  const isAdminActive = pathname?.startsWith(adminAccess.href);
  const { hydrated, totals, toggleCart } = useCart();
  const cartCount = hydrated ? totals.itemCount : 0;
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const userInitial = session?.user?.name?.[0]?.toUpperCase() ?? '?';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      {/* Faixa institucional — confiança e qualidade */}
      <div className="hidden md:block bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between">
          <p className="text-[11px] text-gray-400 font-medium tracking-wide">
            Referência em Suplementação Alimentar · Confiança, Precisão, Excelência
          </p>
          <div className="flex items-center gap-5 text-[11px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Produto lacrado · Nota fiscal
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-[#60a5fa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Envio em até 2 dias úteis
            </span>
          </div>
        </div>
      </div>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black tracking-[0.05em] text-gray-900">METALAB</span>
              <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#0f2756] leading-tight">Suplementos</span>
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
                  style={{ background: 'linear-gradient(135deg, #0f2756, #1e50a8)', color: '#fff' }}
                >
                  {item.label} ✦
                </Link>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative text-sm font-medium text-gray-600 hover:text-[#0f2756] transition-colors duration-200 group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0f2756] transition-all duration-300 group-hover:w-full" />
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
                  ? 'border-[#0f2756]/30 bg-[#0f2756]/10 text-[#0f2756] shadow-sm'
                  : 'border-gray-200 bg-white/80 text-gray-500 hover:border-[#0f2756]/30 hover:bg-[#0f2756]/5 hover:text-[#0f2756] hover:shadow-sm'
              }`}
            >
              <Settings className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" strokeWidth={1.8} />
              <span className="pointer-events-none absolute right-0 top-12 whitespace-nowrap rounded-md bg-gray-950 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0.5 group-hover:opacity-100">
                {adminAccess.label}
              </span>
            </Link>

            {isLoggedIn ? (
              <div className="relative group hidden md:block">
                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-[#0f2756]/10 text-[#0f2756] text-sm font-black hover:bg-[#0f2756]/20 transition-all">
                  {userInitial}
                </button>
                <div className="pointer-events-none absolute right-0 top-12 w-44 rounded-2xl border border-gray-100 bg-white shadow-xl opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-all z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-900 truncate">{session?.user?.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{session?.user?.email}</p>
                  </div>
                  <Link href="/pedidos"
                    className="flex w-full items-center gap-2 px-4 py-3 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                    <Package size={14} /> Meus pedidos
                  </Link>
                  <button onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex w-full items-center gap-2 px-4 py-3 text-xs text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100">
                    <LogOut size={14} /> Sair
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/login" className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-semibold text-gray-700 hover:border-[#0f2756]/30 hover:text-[#0f2756] transition-all">
                <User size={14} /> Entrar
              </Link>
            )}

            <button
              onClick={toggleCart}
              className="relative p-2.5 text-gray-600 hover:text-[#0f2756] transition-colors"
              aria-label={`Abrir carrinho com ${cartCount} itens`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m10 0l2-9m-12 9h16m-16 0a2 2 0 11-4 0 2 2 0 014 0zm16 0a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0f2756] px-1.5 text-[10px] font-black text-white shadow-md">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            {/* Hamburger mobile */}
            <button
              className="md:hidden p-2.5 text-gray-600"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Busca — desktop */}
        <div className="hidden md:flex justify-center pb-3">
          <SearchBar />
        </div>

        {/* Nav mobile */}
        {menuOpen && (
          <div id="mobile-nav" className="md:hidden border-t border-gray-100 py-4 flex flex-col gap-4">
            <SearchBar compact onNavigate={() => setMenuOpen(false)} />
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-medium transition-colors px-2 ${
                  item.highlight ? 'text-[#0f2756] font-bold' : 'text-gray-700 hover:text-[#0f2756]'
                }`}
              >
                {item.label}{item.highlight ? ' ✦' : ''}
              </Link>
            ))}
            <Link
              href={adminAccess.href}
              onClick={() => setMenuOpen(false)}
              aria-current={isAdminActive ? 'page' : undefined}
              className={`flex items-center gap-2 rounded-lg px-2 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.99] ${
                isAdminActive
                  ? 'bg-[#0f2756]/10 text-[#0f2756]'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-[#0f2756]'
              }`}
            >
              <Settings className="h-4 w-4" strokeWidth={1.8} />
              {adminAccess.label}
            </Link>
            {isLoggedIn ? (
              <>
                <Link href="/pedidos" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-2 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#0f2756] transition-all">
                  <Package className="h-4 w-4" strokeWidth={1.8} />
                  Meus pedidos
                </Link>
                <button
                  onClick={() => { setMenuOpen(false); void signOut({ callbackUrl: '/' }); }}
                  className="flex items-center gap-2 rounded-lg px-2 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.8} />
                  Sair ({session?.user?.name?.split(' ')[0]})
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-2 py-3 text-sm font-semibold text-[#0f2756] hover:bg-blue-50 transition-all">
                <User className="h-4 w-4" strokeWidth={1.8} />
                Entrar / Criar conta
              </Link>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
