'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

const categories = [
  {
    name: 'Kits e Combos',
    href: '#kits',
    submenu: [
      { name: 'Kit com 2 unidades', href: '#kits' },
      { name: 'Kit com 3 unidades', href: '#kits' },
      { name: 'Combos Econômicos', href: '#kits' },
    ],
  },
  {
    name: 'Articulações e Mobilidade',
    href: '#articulacoes',
    submenu: [
      { name: 'Articulice', href: '#articulacoes' },
      { name: 'Articulice Cúrcuma', href: '#articulacoes' },
      { name: 'Condroless Complex', href: '#articulacoes' },
      { name: 'Curcumina', href: '#articulacoes' },
    ],
  },
  {
    name: 'Vitaminas e Nutrição',
    href: '#vitaminas',
    submenu: [
      { name: 'B12 / Metilcobalamina', href: '#vitaminas' },
      { name: 'Visyneral Folato', href: '#vitaminas' },
      { name: 'Enzicoba', href: '#vitaminas' },
      { name: 'NAC', href: '#vitaminas' },
    ],
  },
  {
    name: 'Magnésios e Minerais',
    href: '#minerais',
    submenu: [
      { name: 'Penta Magnésio', href: '#minerais' },
      { name: 'Coenzima Q10', href: '#minerais' },
      { name: 'Minerais Essenciais', href: '#minerais' },
      { name: 'Cálcio e Ósseo', href: '#minerais' },
    ],
  },
  {
    name: 'Fibras e Rotina Alimentar',
    href: '#fibras',
    submenu: [
      { name: 'Laxtrine', href: '#fibras' },
      { name: 'Fibras Premium', href: '#fibras' },
      { name: 'Ameixa, Tamarindo e FOS', href: '#fibras' },
    ],
  },
  {
    name: 'Compostos Naturais',
    href: '#naturais',
    submenu: [
      { name: 'Flebogenol', href: '#naturais' },
      { name: 'Pinus Pinaster', href: '#naturais' },
      { name: 'Extratos Vegetais', href: '#naturais' },
    ],
  },
  {
    name: 'Outros Suplementos',
    href: '#outros',
    submenu: [
      { name: 'Todos os Produtos', href: '#outros' },
      { name: 'Novidades', href: '#outros' },
      { name: 'Mais Vendidos', href: '#outros' },
    ],
  },
];

export default function CategoryMenu() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <nav className="hidden lg:flex items-center gap-8">
      {categories.map((category) => (
        <div
          key={category.name}
          className="relative group"
          onMouseEnter={() => setOpenDropdown(category.name)}
          onMouseLeave={() => setOpenDropdown(null)}
        >
          <a
            href={category.href}
            className="flex items-center gap-1 text-gray-700 font-medium hover:text-purple-600 transition-colors py-2"
          >
            {category.name}
            <ChevronDown size={16} className="group-hover:rotate-180 transition-transform" />
          </a>

          {/* Dropdown */}
          {openDropdown === category.name && (
            <div className="absolute left-0 mt-0 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50">
              {category.submenu.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="block px-5 py-3 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors text-sm"
                >
                  {item.name}
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
