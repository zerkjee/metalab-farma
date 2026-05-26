import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Trocas e Devoluções',
  description: 'Política de trocas, devoluções e reembolsos da Metalab Store conforme o Código de Defesa do Consumidor.',
  robots: { index: true, follow: true },
}

export default function TrocasEDevolucoes() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fafafa]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Trocas e Devoluções</h1>
          <p className="text-sm text-gray-500 mb-10">Última atualização: 20 de maio de 2026</p>

          {/* Destaque CDC */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-10">
            <p className="text-sm text-blue-800 font-medium">
              Conforme o <strong>Código de Defesa do Consumidor (art. 49)</strong>, você tem direito ao
              arrependimento em até <strong>7 dias corridos</strong> após o recebimento do produto, sem
              necessidade de justificativa, para compras feitas fora do estabelecimento comercial (internet).
            </p>
          </div>

          <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Direito de arrependimento (7 dias)</h2>
              <p>
                Você pode cancelar sua compra em até <strong>7 dias corridos</strong> após o recebimento,
                desde que o produto esteja:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Com lacre original intacto (sem sinais de abertura ou uso).</li>
                <li>Na embalagem original, sem danos.</li>
                <li>Com nota fiscal ou comprovante de compra.</li>
              </ul>
              <p className="mt-2 text-sm text-gray-500">
                Por questões de segurança alimentar, <strong>não aceitamos devoluções de produtos abertos</strong>,
                exceto nos casos de defeito ou divergência com o pedido.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Produto com defeito ou divergente</h2>
              <p>Aceitamos troca ou devolução quando:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>O produto chegou danificado ou com embalagem violada.</li>
                <li>O produto recebido é diferente do pedido (item errado, sabor, tamanho).</li>
                <li>O produto está dentro do prazo de validade mas apresenta defeito de fabricação.</li>
                <li>O produto está com validade vencida no momento do recebimento.</li>
              </ul>
              <p className="mt-2">
                Nesses casos, o frete de devolução é por nossa conta.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Como solicitar</h2>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Envie um e-mail para{' '}
                  <a href="mailto:mlmetalab@gmail.com" className="text-[#60a5fa] hover:underline">
                    mlmetalab@gmail.com
                  </a>{' '}
                  com o assunto <strong>&quot;Solicitação de Devolução — Pedido #XXXXX&quot;</strong>.
                </li>
                <li>Informe o número do pedido, o motivo e, se possível, fotos do produto.</li>
                <li>Nossa equipe responderá em até <strong>2 dias úteis</strong> com as instruções de envio.</li>
                <li>Após recebermos e avaliarmos o produto, processamos o reembolso em até 5 dias úteis.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Reembolso</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>PIX:</strong> estorno em até 5 dias úteis após a aprovação da devolução.</li>
                <li>O valor reembolsado inclui o frete pago, nos casos em que a devolução é por nossa responsabilidade.</li>
                <li>Para arrependimento (7 dias), o frete de devolução pode ser descontado do reembolso, conforme legislação.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. O que não é aceito para devolução</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Produtos abertos, exceto em caso de defeito comprovado.</li>
                <li>Produtos com prazo de validade expirado no momento da devolução (se válido na entrega).</li>
                <li>Solicitações fora do prazo de 7 dias (exceto defeito oculto, conforme CDC art. 26).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Contato</h2>
              <p>
                Dúvidas? Fale conosco:{' '}
                <a href="mailto:mlmetalab@gmail.com" className="text-[#60a5fa] hover:underline">
                  mlmetalab@gmail.com
                </a>
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
