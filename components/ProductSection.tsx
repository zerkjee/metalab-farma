'use client';

import { Product } from '@/types/product';
import ProductCard from './ProductCard';

interface ProductSectionProps {
  title: string;
  subtitle: string;
  products: Product[];
  color?: string;
}

export default function ProductSection({
  title,
  subtitle,
  products,
  color = 'var(--navy-500)',
}: ProductSectionProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-24 border-t border-line">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-semibold text-navy mb-3">
            {title}
          </h2>
          <p className="text-ink-secondary text-base max-w-2xl">
            {subtitle}
          </p>
          <div className="flex gap-2 mt-4">
            <div
              className="w-1 h-8 rounded-full"
              style={{ backgroundColor: color }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
