import Image from 'next/image'
import { FlaskConical, Zap, Shield, CheckCircle, ChevronDown } from 'lucide-react'

interface Props {
  imagemUrl?: string | null
}

export default function DermatroxProductPage({ imagemUrl }: Props) {
  return (
    <div className="bg-[#121628]">

      {/* ── LINHA PREMIUM BADGE ── */}
      <div className="py-2.5 bg-gradient-to-r from-[#222A46] via-[#79BDE3] to-[#222A46]">
        <p className="text-center text-[10px] font-black uppercase tracking-[0.45em] text-white/75">
          Linha Clínica Maxma · Protocolo Estético Premium
        </p>
      </div>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-[#121628] via-[#1A2036] to-[#121628]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#79BDE3]/8 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#C9903A]/6 blur-[100px]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#79BDE3]/15 border border-[#79BDE3]/25 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#79BDE3] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#93CEEC]">
                  Toxina Botulínica · Suplemento Adjuvante
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] mb-6">
                Prolongue o<br />
                <span className="text-[#C9903A]">
                  Efeito do Botox
                </span>
              </h1>

              <p className="text-white/55 text-lg leading-relaxed mb-10 max-w-lg">
                Dermatrox é o único suplemento com Sinactaze (Fitase 9.000 UI) e Citrato de Zinco formulado para potencializar e prolongar o efeito da toxina botulínica. Ciência molecular aplicada à estética.
              </p>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: '9.000', unit: 'UI', label: 'Sinactaze' },
                  { value: '90', unit: 'mg', label: 'Zinco Citrato' },
                  { value: '10', unit: 'caps', label: 'Por Embalagem' },
                ].map((s) => (
                  <div key={s.label} className="text-center p-4 rounded-2xl bg-white/[0.04] border border-white/[0.07]">
                    <p className="font-display text-xl font-black text-white leading-tight">
                      {s.value}<span className="text-xs text-[#C9903A] ml-1">{s.unit}</span>
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-white/35 mt-1.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {imagemUrl && (
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-radial from-[#79BDE3]/25 to-transparent blur-3xl scale-125" />
                  <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[380px] lg:h-[380px]">
                    <Image
                      src={imagemUrl}
                      alt="Dermatrox"
                      fill
                      sizes="(max-width: 640px) 256px, (max-width: 1024px) 320px, 380px"
                      className="object-contain"
                      style={{ filter: 'drop-shadow(0 30px 70px rgba(92,168,209,0.45))' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── MECANISMO DE AÇÃO ── */}
      <section className="py-20 border-y border-white/[0.06]" style={{ background: 'linear-gradient(135deg,#1A2036 0%,#1A2036 50%,#1A2036 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#79BDE3] mb-3">Mecanismo de Ação</p>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white">Como Dermatrox Prolonga o Botox</h2>
            <p className="text-white/45 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
              Três ações moleculares sinérgicas que atuam diretamente no metabolismo da toxina botulínica
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: FlaskConical,
                color: '#79BDE3',
                title: 'Fitase Hidrolisa o Fitato',
                desc: 'A Sinactaze (Fitase 9.000 UI) catalisa a hidrólise do ácido fítico da dieta, que normalmente forma complexos insolúveis com o zinco, bloqueando sua absorção intestinal.',
              },
              {
                step: '02',
                icon: Zap,
                color: '#C9903A',
                title: 'Zinco Fica Biodisponível',
                desc: 'Com o fitato hidrolisado, o Citrato de Zinco 90mg é absorvido com eficiência máxima, elevando os níveis séricos e tissulares de zinco livre no organismo.',
              },
              {
                step: '03',
                icon: Shield,
                color: '#3B9B5D',
                title: 'Botox Dura Mais',
                desc: 'A toxina botulínica tipo A é uma zinc-endopeptidase. Zinco tissular elevado modula as metaloproteases que degradam a toxina, prolongando sua duração de ação.',
              },
            ].map((item) => (
              <div key={item.step} className="relative p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.14] transition-colors overflow-hidden">
                <div
                  className="absolute -top-3 -left-1 text-[88px] font-black leading-none select-none pointer-events-none"
                  style={{ color: `${item.color}12` }}
                >
                  {item.step}
                </div>
                <div className="relative">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ backgroundColor: `${item.color}1a`, border: `1px solid ${item.color}35` }}
                  >
                    <item.icon size={22} style={{ color: item.color }} />
                  </div>
                  <h3 className="font-display text-white font-black text-lg mb-2">{item.title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PESQUISA CIENTÍFICA ── */}
      <section className="py-20 bg-[#121628]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#C9903A] mb-3">Evidências Científicas</p>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white">O Que a Ciência Comprova</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                accent: '#79BDE3',
                title: 'Fitase aumenta absorção de zinco em até 50%',
                body: 'Estudos publicados no Journal of Trace Elements documentaram que a adição de fitase à dieta aumentou a biodisponibilidade do zinco em até 50% em comparação à dieta sem a enzima, demonstrando o impacto crítico da hidrólise do fitato na absorção mineral.',
                source: 'Sandström et al. — J Trace Elem Electrolytes Health Dis, 1989',
              },
              {
                accent: '#C9903A',
                title: 'Toxina botulínica tipo A é uma zinc-endopeptidase',
                body: 'A toxina botulínica tipo A (BoNT/A) é classificada como zinc-endopeptidase: o zinco atua como cofator essencial em seu sítio catalítico ativo. A disponibilidade de zinco no microambiente neuronal influencia diretamente a atividade e a longevidade da toxina no tecido.',
                source: 'Huang W et al. — J Am Acad Dermatol, 2000;43(2):249-59',
              },
              {
                accent: '#79BDE3',
                title: 'Zinco modula metaloproteases tissulares (MMPs)',
                body: 'As MMPs (matrix metalloproteinases) são enzimas zinc-dependentes presentes no tecido muscular. Estudos demonstram que a suplementação de zinco modula a atividade dessas enzimas proteolíticas, impactando a taxa de degradação da cadeia leve da toxina botulínica.',
                source: 'Nagase & Woessner — J Biol Chem, 1999;274(31):21491-4',
              },
              {
                accent: '#C9903A',
                title: 'Deficiência de zinco é prevalente na população ocidental',
                body: 'Dietas ricas em cereais, leguminosas e grãos integrais são também ricas em ácido fítico, que reduz em 40-70% a absorção do zinco consumido. Estima-se que até 17% da população global tenha ingestão insuficiente de zinco, tornando a suplementação com fitase clinicamente relevante.',
                source: 'Gibson RS — J Nutr, 2006;136(6 Suppl):1932S-5S',
              },
            ].map((card, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
                <div className="w-1.5 h-10 rounded-full mb-5" style={{ backgroundColor: card.accent }} />
                <h3 className="font-display text-white font-black text-base mb-3 leading-snug">{card.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-5">{card.body}</p>
                <p className="text-[10px] text-white/25 font-semibold uppercase tracking-wider border-t border-white/[0.06] pt-4">
                  {card.source}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center text-[10px] text-white/20 mt-8">
            Informações de caráter científico e educativo. Suplemento alimentar não é medicamento e não possui indicação terapêutica.
          </p>
        </div>
      </section>

      {/* ── PARA QUEM É ── */}
      <section
        className="py-20 border-y border-white/[0.06]"
        style={{ background: 'linear-gradient(135deg,#1A2036 0%,#222A46 50%,#1A2036 100%)' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#79BDE3] mb-3">Indicação</p>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white">Dermatrox Foi Criado Para</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: '◈',
                title: 'Pacientes de Toxina Botulínica',
                desc: 'Para quem realiza aplicações regulares de botox e quer maximizar cada sessão, reduzindo a frequência de retornos ao consultório.',
              },
              {
                icon: '⬡',
                title: 'Quem Quer Prolongar Resultados',
                desc: 'Para quem busca estender o efeito entre uma aplicação e outra, otimizando o investimento no tratamento estético.',
              },
              {
                icon: '◉',
                title: 'Pré e Pós-Procedimento',
                desc: 'Protocolo de 5 dias: iniciar 4 dias antes da aplicação e manter 1 dia após, para máxima biodisponibilidade de zinco durante o tratamento.',
              },
              {
                icon: '✦',
                title: 'Indicação Médica e Nutricional',
                desc: 'Pacientes que recebem orientação de médicos, enfermeiros aplicadores ou nutricionistas para suplementação adjuvante a procedimentos estéticos.',
              },
              {
                icon: '◇',
                title: 'Uso Adulto ≥ 19 Anos',
                desc: 'Formulado exclusivamente para adultos maiores de 19 anos, mediante orientação de profissional de saúde habilitado.',
              },
              {
                icon: '◈',
                title: 'Dieta Rica em Fitato',
                desc: 'Pessoas com alimentação baseada em cereais integrais, grãos e leguminosas têm absorção de zinco naturalmente reduzida pelo fitato — Dermatrox corrige isso.',
              },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                <span className="text-2xl text-[#C9903A] mb-3 block">{item.icon}</span>
                <h3 className="font-display text-white font-bold text-sm mb-2">{item.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROTOCOLO DE USO ── */}
      <section className="py-20 bg-[#121628]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#C9903A] mb-3">Protocolo Clínico</p>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white">Como Usar Dermatrox</h2>
            <p className="text-white/45 mt-4 text-sm">
              1 cápsula pela manhã + 1 cápsula à noite · Com ou sem alimentos · 2 cápsulas/dia
            </p>
          </div>

          <div className="relative pl-14">
            <div className="absolute left-5 top-3 bottom-3 w-px bg-gradient-to-b from-[#79BDE3] via-[#C9903A] to-transparent" />

            {[
              {
                day: 'D−4',
                label: 'Início do protocolo',
                color: '#79BDE3',
                desc: 'Iniciar 2 cápsulas/dia (manhã + noite). Os níveis de zinco começam a ser elevados, preparando o metabolismo para a chegada da toxina.',
              },
              {
                day: 'D−3 a D−1',
                label: 'Período de saturação',
                color: '#79BDE3',
                desc: 'Manter 2 cápsulas/dia. O zinco tissular atinge concentrações otimizadas. A fitase continua liberando zinco quelado da dieta.',
              },
              {
                day: 'D0',
                label: 'Dia da aplicação',
                color: '#C9903A',
                desc: '1 cápsula pela manhã antes do procedimento. Zinco sérico e tissular no nível ótimo para maximizar a longevidade do botox no tecido-alvo.',
              },
              {
                day: 'D+1',
                label: 'Pós-procedimento',
                color: '#5A6690',
                desc: 'Última tomada. 1 cápsula para manutenção dos níveis de zinco durante as primeiras horas de ação da toxina no músculo alvo. Protocolo concluído.',
              },
            ].map((step, i) => (
              <div key={i} className="relative flex gap-6 pb-10 last:pb-0">
                <div
                  className="absolute -left-14 w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shrink-0 z-10 border border-white/10"
                  style={{ backgroundColor: step.color, color: 'white' }}
                >
                  {i + 1}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-xs font-black uppercase tracking-wider text-[#C9903A]">{step.day}</span>
                    <span className="text-white font-bold text-sm">{step.label}</span>
                  </div>
                  <p className="text-white/45 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-5 rounded-2xl bg-[#79BDE3]/10 border border-[#79BDE3]/20">
            <p className="text-sm text-white/65 leading-relaxed">
              <span className="text-[#C9903A] font-bold">Importante: </span>
              Dermatrox é um suplemento alimentar para uso adulto (≥19 anos). Consulte seu médico ou profissional de saúde antes de iniciar o uso. Não é medicamento e não possui indicação terapêutica.
            </p>
          </div>
        </div>
      </section>

      {/* ── COMPOSIÇÃO ATIVA ── */}
      <section
        className="py-20 border-t border-white/[0.06]"
        style={{ background: 'linear-gradient(180deg,#1A2036 0%,#121628 100%)' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#79BDE3] mb-3">Formulação</p>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white">Composição Ativa</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {[
              {
                icon: FlaskConical,
                color: '#79BDE3',
                name: 'Sinactaze',
                dose: 'Fitase · 9.000 UI por cápsula',
                desc: 'A Sinactaze é uma fitase de alta potência que catalisa a hidrólise do ácido fítico (IP6) presente nos alimentos. O ácido fítico é o principal antinutriente que quela o zinco intestinal, formando complexos insolúveis não absorvíveis. Sem a fitase, boa parte do zinco ingerido é simplesmente excretada.',
                bullets: [
                  'Hidrolisa fitato com eficiência em pH fisiológico (5,5–7,5)',
                  'Libera todo o zinco quelado pela dieta',
                  'Aumenta biodisponibilidade mineral em até 50%',
                  '9.000 UI — dose clinicamente ativa e segura',
                ],
              },
              {
                icon: Zap,
                color: '#C9903A',
                name: 'Citrato de Zinco',
                dose: '90mg por cápsula',
                desc: 'O Citrato de Zinco é uma das formas queladas de zinco de maior biodisponibilidade. Com a ação simultânea da Sinactaze eliminando o fitato, sua absorção é potencializada — os níveis tissulares de zinco livre são elevados de forma eficiente e sustentada ao longo do dia.',
                bullets: [
                  'Forma quelada — superior ao óxido de zinco em absorção',
                  'Cofator de mais de 300 enzimas no organismo',
                  'Essencial para imunidade, cicatrização e metabolismo',
                  'Sinergia máxima com a Sinactaze na mesma cápsula',
                ],
              },
            ].map((item) => (
              <div key={item.name} className="p-7 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <div className="flex items-start gap-4 mb-5">
                  <div
                    className="w-13 h-13 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${item.color}1a`, border: `1px solid ${item.color}35` }}
                  >
                    <item.icon size={24} style={{ color: item.color }} />
                  </div>
                  <div>
                    <h3 className="font-display text-white font-black text-xl">{item.name}</h3>
                    <p className="text-sm font-semibold mt-0.5" style={{ color: item.color }}>{item.dose}</p>
                  </div>
                </div>
                <p className="text-white/50 text-sm leading-relaxed mb-5">{item.desc}</p>
                <ul className="space-y-2">
                  {item.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-xs text-white/40">
                      <CheckCircle size={13} className="shrink-0 mt-0.5" style={{ color: item.color }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
            <p className="text-xs text-white/30">
              Sem glúten · Sem açúcar · 10 cápsulas de 400mg · Fabricado por Metalab Comércio Indústria Farmacêutica
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-[#121628] border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#C9903A] mb-3">Dúvidas</p>
            <h2 className="font-display text-3xl font-black text-white">Perguntas Frequentes</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Dermatrox realmente prolonga o efeito do botox?',
                a: 'A formulação de Dermatrox é baseada no mecanismo molecular da toxina botulínica como zinc-endopeptidase e na comprovada relação entre disponibilidade de zinco e atividade de metaloproteases tissulares. A fitase aumenta a biodisponibilidade do zinco, que modula as enzimas responsáveis pela degradação da toxina. Os resultados podem variar individualmente. Consulte sempre seu médico ou enfermeiro aplicador.',
              },
              {
                q: 'Posso usar com qualquer tipo de toxina botulínica?',
                a: 'O protocolo foi desenvolvido para uso adjuvante com toxinas botulínicas tipo A (as mais utilizadas em procedimentos estéticos faciais — Botox, Dysport, Xeomin, Nabota). Informe sempre seu aplicador sobre o uso do suplemento antes do procedimento.',
              },
              {
                q: 'Preciso iniciar exatamente 4 dias antes?',
                a: 'O protocolo de 4 dias pré-procedimento é o recomendado para que os níveis tissulares de zinco estejam otimizados no momento da aplicação. Iniciar 3 a 5 dias antes também é aceitável. O mais importante é que o zinco esteja elevado no dia do procedimento e no D+1.',
              },
              {
                q: 'Pode ser usado por gestantes ou lactantes?',
                a: 'Não. Dermatrox é indicado exclusivamente para adultos ≥19 anos e não deve ser utilizado por gestantes, lactantes, crianças ou adolescentes. Consulte um médico antes de iniciar.',
              },
              {
                q: 'Tem interação com outros suplementos ou medicamentos?',
                a: 'Zinco em doses elevadas pode competir com a absorção de cobre e ferro. Evite tomar simultaneamente com suplementos de ferro ou cobre sem orientação. Relate sempre todos os suplementos e medicamentos em uso ao seu médico ou nutricionista.',
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] open:border-[#79BDE3]/30 cursor-pointer"
              >
                <summary className="flex items-center justify-between gap-4 list-none text-white font-semibold text-sm select-none">
                  {faq.q}
                  <ChevronDown size={16} className="shrink-0 text-white/35 group-open:rotate-180 transition-transform duration-200" />
                </summary>
                <p className="mt-4 text-white/45 text-sm leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
