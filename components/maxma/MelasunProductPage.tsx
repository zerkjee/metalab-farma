import Image from 'next/image'
import { Sun, Droplets, Leaf, CheckCircle, ChevronDown } from 'lucide-react'

interface Props {
  imagemUrl?: string | null
}

export default function MelasunProductPage({ imagemUrl }: Props) {
  return (
    <div className="bg-[#121628]">

      {/* ── LINHA PREMIUM BADGE ── */}
      <div className="py-2.5 bg-gradient-to-r from-[#A5762E] via-[#C9903A] to-[#A5762E]">
        <p className="text-center text-[10px] font-black uppercase tracking-[0.45em] text-white/75">
          Linha Dermatológica Maxma · Tratamento de Hiperpigmentação
        </p>
      </div>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-[#121628] via-[#1A2036] to-[#121628]" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#C9903A]/8 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#A5762E]/6 blur-[100px]" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C9903A]/15 border border-[#C9903A]/25 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9903A] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E0AC55]">
                  Melasma · Manchas · Hiperpigmentação
                </span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] mb-6">
                Clareia o Melasma<br />
                <span className="text-[#E0AC55]">de Dentro Para Fora</span>
              </h1>

              <p className="text-white/55 text-lg leading-relaxed mb-10 max-w-lg">
                Melasun combina OPC de Pinus Pinaster, Óleo de Oliva Oli-Ola e Vitamina C — três ativos com evidência científica publicada para inibição da tirosinase, redução de melanina e clareamento de manchas por via oral.
              </p>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: '200', unit: 'mg', label: 'OPC Pinus Pinaster' },
                  { value: '100', unit: 'mg', label: 'Oli-Ola' },
                  { value: '60', unit: 'mg', label: 'Vitamina C' },
                ].map((s) => (
                  <div key={s.label} className="text-center p-4 rounded-2xl bg-white/[0.04] border border-white/[0.07]">
                    <p className="font-display text-xl font-black text-white leading-tight">
                      {s.value}<span className="text-xs text-[#E0AC55] ml-1">{s.unit}</span>
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-white/35 mt-1.5 leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {imagemUrl && (
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#C9903A]/20 rounded-full blur-3xl scale-125" />
                  <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[380px] lg:h-[380px]">
                    <Image
                      src={imagemUrl}
                      alt="Melasun"
                      fill
                      sizes="(max-width: 640px) 256px, (max-width: 1024px) 320px, 380px"
                      className="object-contain"
                      style={{ filter: 'drop-shadow(0 30px 70px rgba(201,144,58,0.40))' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── O QUE É MELASMA ── */}
      <section className="py-20 border-y border-white/[0.06]" style={{ background: 'linear-gradient(135deg,#1A2036 0%,#1A2036 50%,#1A2036 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#E0AC55] mb-4">Entenda o Problema</p>
              <h2 className="font-display text-3xl sm:text-4xl font-black text-white mb-6 leading-tight">O Que É o Melasma e Por Que É Tão Difícil de Tratar</h2>
              <p className="text-white/55 text-sm leading-relaxed mb-4">
                O melasma é uma hiperpigmentação cutânea adquirida caracterizada por manchas acastanhadas simétricas que acometem predominantemente a face. Sua causa é multifatorial: exposição solar acumulada, alterações hormonais (gravidez, anticoncepcionais), predisposição genética e calor.
              </p>
              <p className="text-white/55 text-sm leading-relaxed mb-4">
                O problema central está na hiperatividade dos melanócitos — células que produzem melanina. Sob estímulo (UV, hormônios, inflamação), a enzima <strong className="text-white/80">tirosinase</strong> converte tirosina em DOPA e depois em melanina, que é transferida aos queratinócitos e se deposita na pele como mancha escura.
              </p>
              <p className="text-white/55 text-sm leading-relaxed">
                Tratamentos tópicos isolados têm ação limitada porque não atuam na origem do processo. Melasun complementa esse cuidado de <strong className="text-white/80">dentro para fora</strong>, inibindo a cascata melanogênica por via sistêmica.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { label: 'Tipo Hormonal', desc: 'Associado à gravidez (cloasma), anticoncepcionais e reposição hormonal. É o mais comum e o que mais responde ao tratamento oral.' },
                { label: 'Tipo Solar', desc: 'Intensificado por exposição UV cumulativa, que ativa a tirosinase nos melanócitos. Protetor solar é indispensável para não reverter o tratamento.' },
                { label: 'Tipo Misto', desc: 'A maioria dos casos é misto: componente dérmico (mais profundo) e epidérmico. O tratamento oral sistêmico atinge ambas as camadas.' },
              ].map((t) => (
                <div key={t.label} className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.07]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[#E0AC55] shrink-0" />
                    <h3 className="font-display text-white font-bold text-sm">{t.label}</h3>
                  </div>
                  <p className="text-white/40 text-xs leading-relaxed pl-5">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRIPLA AÇÃO ── */}
      <section className="py-20 bg-[#121628]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#C9903A] mb-3">Mecanismo de Ação</p>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white">Tripla Ação Despigmentante</h2>
            <p className="text-white/45 mt-4 max-w-xl mx-auto text-sm leading-relaxed">
              Três ativos com ação sinérgica e respaldo científico publicado, cada um atuando em um ponto diferente da cascata de melanogênese
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Sun,
                color: '#E0AC55',
                name: 'OPC de Pinus Pinaster',
                dose: '200mg',
                mechanism: 'Inibição da Tirosinase',
                desc: 'As proantocianidinas oligoméricas (OPC) do Pinus pinaster são captadas pelo organismo e atuam como inibidoras da tirosinase — a enzima-chave da melanogênese. Estudo clínico de 30 dias mostrou redução de 25,9% na área e 36,5% na intensidade das manchas de melasma.',
              },
              {
                icon: Droplets,
                color: '#EBC786',
                name: 'Óleo de Oliva Oli-Ola',
                dose: '100mg',
                mechanism: 'Anti-inflamatório Melanogênico',
                desc: 'O Oli-Ola fornece hidroxitirosol e oleuropeína, polifenóis que inibem a síntese de melanina em resposta à inflamação e ao estímulo UV. Estudos em células B16 demonstraram redução significativa de melanogênese com extratos de oliva, com mecanismo complementar ao OPC.',
              },
              {
                icon: Leaf,
                color: '#3B9B5D',
                name: 'Vitamina C',
                dose: '60mg',
                mechanism: 'Redutor de Dopaquinona',
                desc: 'O ácido ascórbico interrompe a cadeia de oxidação da melanina ao reduzir dopaquinona de volta a DOPA, impedindo a formação de eumelanina. Também é cofator na síntese de colágeno e potente antioxidante que neutraliza ROS gerados pela exposição UV.',
              },
            ].map((item) => (
              <div key={item.name} className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: `${item.color}1a`, border: `1px solid ${item.color}35` }}
                >
                  <item.icon size={22} style={{ color: item.color }} />
                </div>
                <div
                  className="inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider mb-3"
                  style={{ backgroundColor: `${item.color}18`, color: item.color }}
                >
                  {item.mechanism}
                </div>
                <h3 className="font-display text-white font-black text-lg mb-0.5">{item.name}</h3>
                <p className="text-sm font-semibold mb-4" style={{ color: item.color }}>{item.dose} por cápsula</p>
                <p className="text-white/45 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PESQUISA CIENTÍFICA ── */}
      <section className="py-20 border-y border-white/[0.06]" style={{ background: 'linear-gradient(135deg,#1A2036 0%,#1A2036 50%,#1A2036 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#E0AC55] mb-3">Evidências Científicas</p>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white">Estudos Publicados</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                accent: '#E0AC55',
                title: 'Pycnogenol reduz melasma em 30 dias — estudo clínico',
                body: 'Em ensaio clínico pioneiro publicado na Phytotherapy Research, 30 mulheres com melasma receberam Pycnogenol (extrato padronizado de Pinus pinaster) oral por 30 dias. Resultado: redução média de 25,9% na área afetada e 36,5% na intensidade pigmentar. O mecanismo foi atribuído à inibição da tirosinase pelos OPCs.',
                source: 'Ni Z, Mu Y, Gulati O — Phytother Res. 2002;16(6):567-71',
              },
              {
                accent: '#EBC786',
                title: 'OPC de Pinus pinaster melhora aparência e fotoproteção da pele',
                body: 'Estudo publicado na Skin Pharmacology and Physiology avaliou mulheres saudáveis suplementadas com Pycnogenol oral por 12 semanas. Os resultados mostraram redução significativa de manchas solares, melhora da hidratação cutânea e aumento da capacidade de fotoproteção endógena, com efeito antioxidante sistêmico documentado.',
                source: 'Grether-Beck S et al. — Skin Pharmacol Physiol. 2016;29(1):13-7',
              },
              {
                accent: '#E0AC55',
                title: 'Vitamina C oral como adjuvante no tratamento de melasma',
                body: 'Revisão sistemática analisou o papel do ácido ascórbico oral no tratamento de hiperpigmentação. O mecanismo documentado envolve redução de dopaquinona (precursor da eumelanina), inibição da tirosinase mediada por cobre e neutralização de ROS pós-UV. A combinação com outros despigmentantes potencializa os resultados.',
                source: 'Kameyama K et al. — J Dermatol Sci. 1996;12(3):175-84',
              },
              {
                accent: '#3B9B5D',
                title: 'Polifenóis de oliva inibem melanogênese em células B16',
                body: 'Pesquisadores demonstraram que o hidroxitirosol e a oleuropeína — principais polifenóis do azeite de oliva — inibiram dose-dependentemente a síntese de melanina em células de melanoma murino B16. A ação anti-inflamatória desses compostos reduz o estímulo melanogênico induzido por UV e inflamação.',
                source: 'Kimura Y et al. — Biosci Biotechnol Biochem. 2009;73(11):2401-6',
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

      {/* ── LINHA DO TEMPO DE RESULTADOS ── */}
      <section className="py-20 bg-[#121628]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#C9903A] mb-3">Progressão de Resultados</p>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white">O Que Esperar e Quando</h2>
            <p className="text-white/45 mt-4 text-sm max-w-lg mx-auto">
              O tratamento oral do melasma é gradual. A melanina já depositada leva tempo para ser renovada junto ao ciclo cutâneo. Resultados variam por tipo de pele e exposição solar.
            </p>
          </div>

          <div className="space-y-5">
            {[
              {
                period: 'Semanas 1–2',
                headline: 'Inibição ativa começa',
                color: '#A5762E',
                desc: 'Os OPCs e a Vitamina C estão circulando e inibindo a tirosinase. A formação de nova melanina começa a ser reduzida. Nenhuma mudança visível ainda — este é o período de construção bioquímica.',
                icon: '◦',
              },
              {
                period: 'Semanas 3–4',
                headline: 'Primeiras alterações sutis',
                color: '#C9903A',
                desc: 'Com o ciclo cutâneo de ~28 dias, células com menor carga de melanina começam a atingir a superfície. Pele pode apresentar aspecto mais uniforme e luminoso, especialmente em manchas mais superficiais (epidérmicas).',
                icon: '◎',
              },
              {
                period: 'Meses 2–3',
                headline: 'Clareamento progressivo visível',
                color: '#E0AC55',
                desc: 'Fase de maior resposta visível. O estudo de Ni et al. (2002) documentou reduções significativas após 30 dias de uso contínuo. Manchas hormonais tendem a responder melhor que as dérmicas. O uso de protetor solar é fundamental para não reativar a melanogênese.',
                icon: '●',
              },
              {
                period: 'Além de 3 meses',
                headline: 'Manutenção e consolidação',
                color: '#EBC786',
                desc: 'Após os primeiros 90 dias, o uso pode ser continuado como manutenção, especialmente nos meses de maior exposição solar. Associar ao protetor solar FPS 50+ e ao acompanhamento dermatológico para potencializar os resultados.',
                icon: '◉',
              },
            ].map((step, i) => (
              <div key={i} className="flex gap-5 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 font-black border border-white/10"
                  style={{ backgroundColor: `${step.color}30`, color: step.color }}
                >
                  {step.icon}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-wider" style={{ color: step.color }}>{step.period}</span>
                    <span className="text-white font-bold text-sm">{step.headline}</span>
                  </div>
                  <p className="text-white/45 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARA QUEM É ── */}
      <section className="py-20 border-y border-white/[0.06]" style={{ background: 'linear-gradient(135deg,#1A2036 0%,#1A2036 50%,#1A2036 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#E0AC55] mb-3">Indicação</p>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white">Melasun É Para Você?</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '◈', title: 'Melasma Hormonal', desc: 'Manchas associadas ao uso de anticoncepcionais, gravidez ou terapia hormonal — o tipo de melasma com melhor resposta ao tratamento oral sistêmico.' },
              { icon: '◉', title: 'Manchas Solares', desc: 'Hiperpigmentação induzida por exposição UV cumulativa. O OPC de Pinus pinaster e a Vitamina C reduzem a melanogênese mediada por radicais livres gerados pelo sol.' },
              { icon: '⬡', title: 'Complemento ao Tratamento Tópico', desc: 'Para quem usa cremes despigmentantes (hidroquinona, ácido kójico, retinol) e quer potencializar os resultados com ação oral sinérgica.' },
              { icon: '✦', title: 'Pele com Pigmentação Irregular', desc: 'Mulheres (e homens) com tom de pele irregular, escurecimento difuso e manchas pós-inflamatórias que desejam uniformizar a pele por dentro.' },
              { icon: '◇', title: 'Pós-Peeling e Procedimentos', desc: 'Complemento após procedimentos estéticos dermatológicos (peelings, laser, luz intensa pulsada) para manter e potencializar o resultado obtido.' },
              { icon: '◈', title: 'Uso Adulto · Todas as Fototipias', desc: 'Indicado para adultos ≥19 anos de todas as fototipias. Fototipos mais escuros (Fitzpatrick IV–VI) que têm melasma mais intenso tendem a se beneficiar do suporte oral.' },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
                <span className="text-2xl text-[#E0AC55] mb-3 block">{item.icon}</span>
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
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#C9903A] mb-3">Como Usar</p>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-white">Protocolo Melasun</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            {[
              { label: 'Dose Diária', value: '1 cápsula', sub: 'Ao dia, com a refeição principal' },
              { label: 'Duração Mínima', value: '90 dias', sub: 'Para resultados visíveis e duradouros' },
              { label: 'Associação', value: 'FPS 50+', sub: 'Protetor solar é indispensável' },
            ].map((item) => (
              <div key={item.label} className="p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/35 mb-2">{item.label}</p>
                <p className="font-display text-3xl font-black text-[#E0AC55] mb-1">{item.value}</p>
                <p className="text-xs text-white/40">{item.sub}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            {[
              { title: 'Com a refeição principal', desc: 'Tomar 1 cápsula ao dia, preferencialmente junto ao almoço ou jantar para melhorar a absorção das vitaminas lipossolúveis presentes na fórmula (Oli-Ola).' },
              { title: 'Use protetor solar diariamente', desc: 'O uso de FPS 50+ de amplo espectro é obrigatório durante o tratamento. Sem fotoproteção, a melanogênese é reativada pela exposição UV e anula o tratamento oral.' },
              { title: 'Seja constante por no mínimo 30 dias', desc: 'O ciclo cutâneo leva ~28 dias. Resultados iniciais são observados após 30 dias de uso contínuo. Interrupções frequentes comprometem a eficácia do tratamento.' },
            ].map((tip) => (
              <div key={tip.title} className="flex gap-4 p-5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <CheckCircle size={18} className="text-[#E0AC55] shrink-0 mt-0.5" />
                <div>
                  <p className="text-white font-semibold text-sm mb-1">{tip.title}</p>
                  <p className="text-white/45 text-xs leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-5 rounded-2xl bg-[#C9903A]/10 border border-[#C9903A]/20">
            <p className="text-sm text-white/65 leading-relaxed">
              <span className="text-[#E0AC55] font-bold">Importante: </span>
              Melasun é um suplemento alimentar. Não substitui o acompanhamento dermatológico. Consulte seu médico ou dermatologista para diagnóstico e plano de tratamento do melasma. Não é medicamento.
            </p>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 border-t border-white/[0.06]" style={{ background: 'linear-gradient(180deg,#1A2036 0%,#121628 100%)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#E0AC55] mb-3">Dúvidas</p>
            <h2 className="font-display text-3xl font-black text-white">Perguntas Frequentes</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Em quanto tempo verei resultados com Melasun?',
                a: 'Os primeiros resultados costumam ser percebidos entre 30 e 60 dias de uso contínuo, mas o tratamento recomendado é de no mínimo 90 dias. O ciclo de renovação cutânea leva ~28 dias, e os melanócitos precisam de tempo para reduzir a produção de melanina. O estudo clínico de referência (Ni et al., 2002) documentou reduções significativas após 30 dias.',
              },
              {
                q: 'Posso usar Melasun durante a gravidez?',
                a: 'Não. Melasun é indicado apenas para adultos ≥19 anos e não deve ser utilizado durante a gravidez ou lactação sem orientação médica. O cloasma gravídico (melasma da gestação) é tratado de forma específica pelo obstetra ou dermatologista.',
              },
              {
                q: 'Preciso parar de usar o protetor solar?',
                a: 'Ao contrário — o protetor solar é obrigatório durante o tratamento. A exposição UV é o principal gatilho de reativação da melanogênese. Sem fotoproteção adequada (FPS 50+ de amplo espectro), qualquer tratamento para melasma perde eficácia rapidamente.',
              },
              {
                q: 'Posso usar com cremes clareadores tópicos?',
                a: 'Sim, e esta é a combinação mais eficaz. Melasun atua sistemicamente (de dentro para fora) enquanto os tópicos (hidroquinona, ácido kójico, ácido azelaico, retinol) atuam localmente. A ação oral complementa e potencializa o tratamento tópico. Informe seu dermatologista sobre o uso.',
              },
              {
                q: 'O melasma volta depois que eu parar?',
                a: 'O melasma é uma condição crônica com tendência à recorrência, especialmente com exposição solar continuada ou uso de hormônios. Após o tratamento inicial, o uso de protetor solar diário e a manutenção periódica com Melasun podem ajudar a prevenir o reaparecimento das manchas.',
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] open:border-[#C9903A]/30 cursor-pointer"
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
