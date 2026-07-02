import Link from 'next/link';
import Image from 'next/image';

export default function FlebogenolBanner() {
  return (
    <section className="relative w-full aspect-[1600/685] overflow-hidden bg-white">
      <Link href="/produtos/flebogenol-30-comprimidos" aria-label="Conheça o Flebogenol" className="block absolute inset-0">
        <Image
          src="/banners/flebogenol.jpg"
          alt="Flebogenol — suplemento alimentar em comprimido, disponível em 30 e 60 comprimidos"
          fill
          sizes="100vw"
          className="object-contain"
        />
      </Link>
    </section>
  );
}
