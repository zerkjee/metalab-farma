import Link from 'next/link';
import Image from 'next/image';

export default function EstiloDeVidaBanner() {
  return (
    <section className="relative w-full overflow-hidden bg-[#eeeeee] pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pt-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">

          {/* Marca d'água — logo Metalab gigante, atrás do card */}
          <div
            aria-hidden
            className="pointer-events-none select-none opacity-[0.12] flex justify-center lg:justify-start mb-[-32px] sm:mb-[-56px] lg:mb-[-72px]"
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
              className="w-40 sm:w-56 h-auto object-contain drop-shadow-xl"
            />
          </div>

          {/* Card branco */}
          <div className="relative bg-white rounded-[2rem] shadow-sm px-6 pt-16 pb-10 sm:px-10 sm:pt-20 sm:pb-14 lg:pt-14 lg:pb-14 lg:pr-[340px]">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0f2756] uppercase leading-[1.1] max-w-lg">
              A Metalab cuida de você
            </h2>
            <p className="mt-6 text-gray-500 leading-relaxed max-w-md text-sm sm:text-base">
              A Metalab tem como objetivo levar para casa de todos os seus consumidores
              produtos que entreguem os resultados desejados. A Metalab desenvolve e
              comercializa produtos para ajudar você a se cuidar e criar uma nova relação
              com a sua saúde.
            </p>
            <Link
              href="#inovitann"
              className="mt-8 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #0f2756, #1e50a8)' }}
            >
              Ver produtos
            </Link>

            {/* Cientista no desktop — vazando por cima da borda do card, alinhado à direita */}
            <div className="hidden lg:block absolute -top-6 right-6 w-64 xl:w-72">
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
