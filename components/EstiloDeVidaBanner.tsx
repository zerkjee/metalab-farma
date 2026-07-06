import Link from 'next/link';
import Image from 'next/image';

export default function EstiloDeVidaBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-neutral-100 pt-28 pb-16 sm:pt-36 sm:pb-24 lg:pt-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">

          {/* Marca d'água — logo Metalab, acima do card com um respiro pequeno */}
          <div
            aria-hidden
            className="pointer-events-none select-none opacity-30 flex justify-center lg:justify-start mb-2 sm:mb-3 lg:mb-4"
          >
            <Image
              src="/banners/metalab-logo-watermark.png"
              alt=""
              width={1154}
              height={178}
              className="w-[85%] sm:w-[70%] max-w-2xl h-auto"
            />
          </div>

          {/* Cientista no mobile/tablet — acima do card, vazando pra dentro dele */}
          <div className="lg:hidden flex justify-center -mb-10 sm:-mb-16 relative z-10">
            <Image
              src="/banners/estilo-vida-cientista.png"
              alt="Cientista da Metalab analisando fórmula em laboratório"
              width={740}
              height={740}
              className="w-56 sm:w-72 h-auto object-contain drop-shadow-xl"
            />
          </div>

          {/* Card branco */}
          <div className="relative bg-surface-card rounded-xl shadow-sm px-6 pt-16 pb-10 sm:px-10 sm:pt-20 sm:pb-14 lg:pt-14 lg:pb-14 lg:pr-[400px]">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-navy uppercase leading-[1.1] max-w-lg">
              A Metalab cuida de você
            </h2>
            <p className="mt-6 text-ink-secondary leading-relaxed max-w-md text-sm sm:text-base">
              A Metalab tem como objetivo levar para casa de todos os seus consumidores
              produtos que entreguem os resultados desejados. A Metalab desenvolve e
              comercializa produtos para ajudar você a se cuidar e criar uma nova relação
              com a sua saúde.
            </p>
            <Link
              href="#inovitann"
              className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-on-brand bg-brand transition-all hover:bg-brand-hover"
            >
              Ver produtos
            </Link>

            {/* Cientista no desktop — vazando por cima da borda do card, alinhado à direita */}
            <div className="hidden lg:block absolute -top-6 right-6 w-80 xl:w-96">
              <Image
                src="/banners/estilo-vida-cientista.png"
                alt="Cientista da Metalab analisando fórmula em laboratório"
                width={740}
                height={740}
                className="w-full h-auto object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
