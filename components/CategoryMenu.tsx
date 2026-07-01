'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Categoria { id: string; nome: string; slug: string; totalProdutos: number }

export default function CategoryMenu() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    let alive = true;
    fetch('/api/categorias')
      .then((r) => r.json())
      .then((d) => { if (alive && Array.isArray(d.categorias)) setCategorias(d.categorias); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  if (categorias.length === 0) return null;

  return (
    <nav className="border-t border-gray-100">
      <div className="flex gap-1 overflow-x-auto px-4 py-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {categorias.map((cat) => (
          <Link
            key={cat.id}
            href={`/categoria/${cat.slug}`}
            className="flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:text-[#0f2756] hover:bg-gray-50 transition-colors"
          >
            {cat.nome}
          </Link>
        ))}
      </div>
    </nav>
  );
}
