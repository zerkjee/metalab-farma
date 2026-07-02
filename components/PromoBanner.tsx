import Link from 'next/link';
import Image from 'next/image';

export default function PromoBanner() {
  return (
    <section className="relative w-full aspect-[1718/916] overflow-hidden bg-white">
      <Link href="#inovitann" aria-label="Ver linha Inovitann Clinical" className="block absolute inset-0">
        <Image
          src="/banners/inovitann-clinical-promo-1.jpg"
          alt="Linha Inovitann Clinical — fórmulas de qualidade, padrão farmacêutico"
          fill
          priority
          sizes="100vw"
          className="object-contain"
        />
      </Link>
    </section>
  );
}
