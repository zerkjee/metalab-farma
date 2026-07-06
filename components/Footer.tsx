import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const nav: Record<string, { label: string; href: string }[]> = {
    Produtos: [
      { label: 'Suplementos', href: '/#produtos' },
      { label: 'Vitaminas', href: '/#produtos' },
      { label: 'Minerais', href: '/#produtos' },
      { label: 'Fitoterápicos', href: '/#produtos' },
    ],
    Institucional: [
      { label: 'Sobre a Metalab', href: '/sobre' },
      { label: 'Qualidade', href: '/qualidade' },
      { label: 'Certificações', href: '/certificacoes' },
      { label: 'Contato', href: '/#contato' },
    ],
    Atendimento: [
      { label: 'Política de Privacidade', href: '/politica-de-privacidade' },
      { label: 'Termos de Uso', href: '/termos-de-uso' },
      { label: 'Trocas e Devoluções', href: '/trocas-e-devolucoes' },
      { label: 'Fale Conosco', href: '/#contato' },
    ],
  };

  return (
    <footer id="contato" className="bg-navy text-on-navy">

      {/* Faixa de confiança */}
      <div className="border-b border-navy-400 bg-navy-600/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-success-subtle/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-on-navy">Compra Segura</p>
                <p className="text-[11px] text-on-navy/60">Pagamento criptografado</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-brand/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-on-navy">Lacrado de Fábrica</p>
                <p className="text-[11px] text-on-navy/60">Procedência garantida</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-brand/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-on-navy">Nota Fiscal</p>
                <p className="text-[11px] text-on-navy/60">Emitida em toda compra</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-gold/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-on-navy">Troca Garantida</p>
                <p className="text-[11px] text-on-navy/60">7 dias após o recebimento</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Logo + tagline + contato */}
          <div className="lg:col-span-2">
            <Image
              src="/brand/metalab-logo-horizontal.png"
              alt="Metalab Suplementos"
              width={1154}
              height={178}
              className="h-8 w-auto mb-3 brightness-0 invert"
            />
            <p className="text-sm text-brand font-medium mb-4">Compromisso com a vida</p>
            <p className="text-xs text-on-navy/60 leading-relaxed mb-5">
              Suplementos alimentares com tecnologia, cuidado e confiança em cada fórmula.
              Produtos para complementar sua rotina alimentar com qualidade e procedência garantida.
            </p>

            <div className="space-y-2 mb-6">
              <a href="mailto:contato@metalab.com.br"
                className="flex items-center gap-2 text-xs text-on-navy/60 hover:text-brand transition-colors">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                contato@metalab.com.br
              </a>
            </div>

            {/* Métodos de pagamento */}
            <div>
              <p className="text-[11px] font-bold text-on-navy/70 uppercase tracking-wider mb-2">Formas de Pagamento</p>
              <div className="flex flex-wrap gap-2">
                {/* PIX */}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-navy-600 border border-navy-400">
                  <svg className="w-4 h-4 text-success" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.614 7.161l-3.3-3.3a2.25 2.25 0 00-3.182 0L1.75 7.243a2.25 2.25 0 000 3.182l3.382 3.382a2.25 2.25 0 003.182 0l3.3-3.3a.75.75 0 011.06 1.061l-3.3 3.3a3.75 3.75 0 01-5.304 0L.688 11.486a3.75 3.75 0 010-5.304l3.382-3.383a3.75 3.75 0 015.304 0l3.3 3.3a.75.75 0 11-1.06 1.062zM12.386 16.839l3.3 3.3a3.75 3.75 0 005.304 0l3.382-3.382a3.75 3.75 0 000-5.304l-3.382-3.382a3.75 3.75 0 00-5.304 0l-3.3 3.3a.75.75 0 11-1.06-1.061l3.3-3.3a5.25 5.25 0 017.425 0l3.382 3.382a5.25 5.25 0 010 7.425l-3.382 3.382a5.25 5.25 0 01-7.425 0l-3.3-3.3a.75.75 0 011.06-1.06z" />
                  </svg>
                  <span className="text-[11px] font-bold text-on-navy/80">PIX</span>
                </div>
                {/* Visa */}
                <div className="flex items-center px-2.5 py-1.5 rounded-md bg-navy-600 border border-navy-400">
                  <span className="text-[11px] font-black text-brand tracking-tight">VISA</span>
                </div>
                {/* Mastercard */}
                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-navy-600 border border-navy-400">
                  <div className="flex">
                    <div className="w-3.5 h-3.5 rounded-full bg-danger opacity-90" />
                    <div className="w-3.5 h-3.5 rounded-full bg-gold opacity-90 -ml-1.5" />
                  </div>
                  <span className="text-[10px] font-bold text-on-navy/80 ml-1">MC</span>
                </div>
                {/* Boleto */}
                <div className="flex items-center px-2.5 py-1.5 rounded-md bg-navy-600 border border-navy-400">
                  <span className="text-[11px] font-bold text-on-navy/70">Boleto</span>
                </div>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(nav).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-black text-on-navy mb-4 uppercase tracking-widest">{section}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-on-navy/60 hover:text-brand transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer legal */}
      <div className="border-t border-navy-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-navy-600/60 border border-navy-400/80">
            <svg className="w-4 h-4 text-on-navy/50 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-on-navy/60 leading-relaxed">
              Este site comercializa exclusivamente suplementos alimentares. Os produtos aqui vendidos não são medicamentos e não substituem alimentos ou uma dieta equilibrada. Não possuem indicação terapêutica e não se destinam ao diagnóstico, tratamento, cura ou prevenção de doenças. Leia o rótulo com atenção antes de consumir. Consulte um profissional de saúde habilitado.
            </p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-navy-700 bg-navy-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-on-navy/50">© 2026 Metalab Store. Todos os direitos reservados.</p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-on-navy/50">Site seguro SSL</span>
            </div>
            <span className="text-navy-400">·</span>
            <span className="text-xs text-on-navy/50">Powered by Metalab</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
