import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Saiba como a Metalab Store coleta, usa e protege seus dados pessoais conforme a LGPD.',
  robots: { index: true, follow: true },
}

export default function PoliticaDePrivacidade() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-surface-page">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="font-display text-3xl text-navy mb-2">Política de Privacidade</h1>
          <p className="text-sm text-ink-muted mb-10">Última atualização: 20 de maio de 2026</p>

          <div className="prose max-w-none space-y-8 text-ink-secondary leading-relaxed">

            <section>
              <h2 className="font-display text-xl text-navy mb-3">1. Quem somos</h2>
              <p>
                A <strong>Metalab Store</strong> é uma loja virtual de suplementos alimentares operada por Metalab
                (e-mail: mlmetalab@gmail.com). Esta Política descreve como tratamos seus dados pessoais em
                conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD).
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-navy mb-3">2. Dados que coletamos</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Cadastro:</strong> nome completo, e-mail, CPF, telefone e senha (armazenada com hash seguro).</li>
                <li><strong>Endereço:</strong> CEP, logradouro, número, complemento, bairro, cidade e estado — para cálculo de frete e entrega.</li>
                <li><strong>Pedidos:</strong> itens comprados, valor, forma de pagamento e status.</li>
                <li><strong>Navegação:</strong> páginas visitadas, cliques e tempo de sessão (via Google Analytics 4 e Meta Pixel, mediante consentimento).</li>
                <li><strong>Cookies:</strong> necessários para autenticação e, com consentimento, para análise e publicidade.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl text-navy mb-3">3. Para que usamos seus dados</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Processar e entregar seus pedidos.</li>
                <li>Enviar confirmações de compra e atualizações de entrega por e-mail.</li>
                <li>Calcular frete e integrar com transportadoras.</li>
                <li>Prevenir fraudes e garantir a segurança da plataforma.</li>
                <li>Melhorar a experiência de compra com base em dados agregados (mediante consentimento).</li>
                <li>Enviar comunicações promocionais, caso você tenha optado por recebê-las.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl text-navy mb-3">4. Base legal do tratamento</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Execução de contrato</strong> — para processar pedidos e enviar produtos (art. 7º, V, LGPD).</li>
                <li><strong>Obrigação legal</strong> — emissão de notas fiscais, cumprimento de obrigações tributárias (art. 7º, II).</li>
                <li><strong>Consentimento</strong> — cookies de analytics e publicidade (art. 7º, I).</li>
                <li><strong>Legítimo interesse</strong> — prevenção de fraudes e segurança (art. 7º, IX).</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl text-navy mb-3">5. Compartilhamento de dados</h2>
              <p>Compartilhamos seus dados apenas com:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Mercado Pago</strong> — processamento de pagamento PIX.</li>
                <li><strong>Melhor Envio</strong> — cálculo e geração de etiquetas de frete.</li>
                <li><strong>Resend</strong> — envio de e-mails transacionais.</li>
                <li><strong>Google Analytics</strong> e <strong>Meta</strong> — análise de tráfego e publicidade (somente com consentimento).</li>
                <li><strong>Cloudinary</strong> — armazenamento de imagens de produtos.</li>
              </ul>
              <p className="mt-2">Não vendemos seus dados a terceiros.</p>
            </section>

            <section>
              <h2 className="font-display text-xl text-navy mb-3">6. Por quanto tempo guardamos seus dados</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Dados de pedidos: 5 anos (obrigação fiscal e CDC).</li>
                <li>Dados de conta: enquanto a conta estiver ativa + 1 ano após exclusão.</li>
                <li>Logs de acesso: 6 meses (Marco Civil da Internet).</li>
                <li>Dados de analytics: conforme política do Google/Meta.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-xl text-navy mb-3">7. Seus direitos (LGPD)</h2>
              <p>Você pode, a qualquer momento:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Confirmar a existência de tratamento dos seus dados.</li>
                <li>Acessar os dados que temos sobre você.</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
                <li>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários.</li>
                <li>Revogar o consentimento para tratamento baseado nessa base legal.</li>
                <li>Solicitar a portabilidade dos seus dados.</li>
              </ul>
              <p className="mt-2">
                Para exercer qualquer direito, envie um e-mail para{' '}
                <a href="mailto:mlmetalab@gmail.com" className="text-link hover:underline">
                  mlmetalab@gmail.com
                </a>
                . Responderemos em até 15 dias úteis.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-navy mb-3">8. Cookies</h2>
              <p>Utilizamos três categorias de cookies:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Essenciais:</strong> autenticação e carrinho — necessários para o funcionamento do site.</li>
                <li><strong>Analytics:</strong> Google Analytics 4 — medem visitas e comportamento (com consentimento).</li>
                <li><strong>Publicidade:</strong> Meta Pixel — personalização de anúncios (com consentimento).</li>
              </ul>
              <p className="mt-2">
                Você pode gerenciar seu consentimento a qualquer momento pelo banner de cookies no rodapé do site.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-navy mb-3">9. Segurança</h2>
              <p>
                Adotamos medidas técnicas como HTTPS, hash de senhas (bcrypt), criptografia em trânsito,
                rate limiting e monitoramento de erros (Sentry) para proteger seus dados.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl text-navy mb-3">10. Contato</h2>
              <p>
                Dúvidas sobre esta política:{' '}
                <a href="mailto:mlmetalab@gmail.com" className="text-link hover:underline">
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
