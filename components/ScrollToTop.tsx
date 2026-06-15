'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Garante que toda navegação entre rotas comece no TOPO da nova página.
 *
 * Por que existe: o body-scroll-lock do CartDrawer restaura `window.scrollTo(0, scrollY)`
 * ao fechar (ex.: clique em "Continuar para checkout"), reposicionando a página nova na
 * rolagem antiga — fazendo o /checkout abrir "lá embaixo". Como no React TODOS os cleanups
 * rodam antes de TODOS os effects, este effect (disparado pela troca de pathname) roda
 * depois do restore do drawer e reafirma o topo.
 *
 * - `behavior: 'instant'` ignora o `scroll-behavior: smooth` global (sem animação na troca).
 * - Não interfere em âncoras internas (#secao): se há hash na URL, não mexe no scroll.
 *
 * Montado uma única vez no root layout — cobre todas as rotas.
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Respeita navegação para âncoras (#produtos, #qualidade, etc.).
    if (window.location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
