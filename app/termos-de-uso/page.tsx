import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Leia os termos e condições de uso da Metalab Store.',
  robots: { index: true, follow: true },
}

export default function TermosDeUso() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fafafa]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Termos de Uso</h1>
          <p className="text-sm text-gray-500 mb-10">Última atualização: 20 de maio de 2026</p>

          <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Aceitação</h2>
              <p>
                Ao acessar ou usar a <strong>Metalab Store</strong> (metalab-farma.vercel.app), você concorda com
                estes Termos de Uso. Se não concordar, não utilize o site.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Cadastro e conta</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Você deve ter no mínimo 18 anos para criar uma conta.</li>
                <li>As informações de cadastro devem ser verídicas e atualizadas.</li>
                <li>Você é responsável pela confidencialidade de sua senha.</li>
                <li>Notifique-nos imediatamente em caso de acesso não autorizado à sua conta.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Produtos e preços</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Todos os produtos são suplementos alimentares, não medicamentos.</li>
                <li>Os preços estão em reais (BRL) e incluem os impostos aplicáveis.</li>
                <li>Nos reservamos o direito de corrigir erros de preço antes da confirmação do pedido.</li>
                <li>A disponibilidade de estoque é informativa e pode variar.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Compras e pagamento</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Aceitamos pagamento via PIX.</li>
                <li>O pedido é confirmado somente após a confirmação do pagamento.</li>
                <li>Pedidos com PIX não pago em 2 horas são automaticamente cancelados.</li>
                <li>O processamento de pagamentos é realizado pelo Mercado Pago.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Entrega</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>O prazo de entrega é estimado e pode variar conforme a transportadora.</li>
                <li>O frete é calculado com base no CEP de destino via Melhor Envio.</li>
                <li>Não nos responsabilizamos por atrasos causados por greves, desastres naturais ou situações alheias ao nosso controle.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Uso proibido</h2>
              <p>É proibido usar o site para:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Atividades ilegais ou fraudulentas.</li>
                <li>Enviar spam ou conteúdo malicioso.</li>
                <li>Tentar acessar áreas restritas sem autorização.</li>
                <li>Scraping ou coleta automatizada de dados sem permissão.</li>
                <li>Revenda comercial dos produtos sem autorização expressa.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Propriedade intelectual</h2>
              <p>
                Todo o conteúdo do site — textos, imagens, logotipos, design e código — é propriedade da
                Metalab Store e protegido por direitos autorais. É vedada a reprodução sem autorização prévia
                por escrito.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Aviso sobre suplementos</h2>
              <p>
                Os suplementos alimentares vendidos neste site <strong>não são medicamentos</strong> e não
                têm indicação terapêutica. Não substituem uma alimentação equilibrada e acompanhamento
                médico ou nutricional. Consulte um profissional de saúde antes de iniciar qualquer
                suplementação.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Limitação de responsabilidade</h2>
              <p>
                A Metalab Store não se responsabiliza por danos indiretos, incidentais ou consequentes
                decorrentes do uso dos produtos ou do site, exceto nos casos previstos no Código de Defesa
                do Consumidor (Lei nº 8.078/1990).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">10. Alterações nos termos</h2>
              <p>
                Podemos atualizar estes termos a qualquer momento. Notificaremos mudanças relevantes por
                e-mail ou aviso no site. O uso continuado após a publicação das alterações implica aceitação.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">11. Lei aplicável e foro</h2>
              <p>
                Estes termos são regidos pelas leis brasileiras. Eventuais conflitos serão resolvidos pelo
                foro da comarca da sede da Metalab, com renúncia a qualquer outro.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">12. Contato</h2>
              <p>
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
