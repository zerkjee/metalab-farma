# Auditoria de conteúdo dos informativos

Data da análise: 15 de julho de 2026.

## Escopo conferido

- 52 produtos simples e ativos no catálogo de produção.
- Pasta do Drive `FICHA TÉCNICA - METALAB`, com 90 PDFs na raiz e a subpasta `INOVITANN CARTUCHO`.
- 71 PDFs processados localmente por OCR, incluindo as fichas com correspondência direta aos SKUs ativos e as fichas Inovitann.
- 52 páginas de informativo criadas: 46 com fonte OCR identificada e 6 bloqueadas para conciliação.

O OCR é uma etapa de extração, não uma aprovação regulatória. Todas as páginas continuam com `noindex`, e nenhuma ficha está marcada como `published`.

## SKUs ainda bloqueados

| Produto | Motivo |
| --- | --- |
| Água Inglesa | Nenhuma ficha com correspondência inequívoca foi localizada. |
| Apetimax | Nenhuma ficha com correspondência inequívoca foi localizada. |
| Dermatrox 10 Cápsulas | Nenhuma ficha com correspondência inequívoca foi localizada. |
| Epanon Amargo | Nenhuma ficha com correspondência inequívoca foi localizada. |
| Melasun 30 Cápsulas | Nenhuma ficha com correspondência inequívoca foi localizada. |
| Meltrat Spray | A ficha foi localizada, mas o cabeçalho/tabela cita zinco, mel, própolis e gengibre enquanto a lista de formulação reconhecida cita vitamina C e canela. O conteúdo permanece oculto até conferência da arte vigente. |

## Divergências que exigem conferência humana

- Cloreto de Magnésio: o catálogo informa comprimidos; a ficha localizada informa cápsulas.
- LacIntesty 10, 30 e 60: o catálogo informa cápsulas; as fichas descrevem comprimidos ou comprimidos mastigáveis.
- Inovitann Metilcobalamina: o catálogo informa cápsulas; a ficha descreve comprimidos mastigáveis.
- Inovitann Magnésio L-Treonato: o nome comercial cita L-treonato; a ficha reconhecida lista L-treonina e bisglicinato.
- Sulfato Ferroso: a tabela declara ferro, mas a composição reconhecida lista vitaminas do complexo B; não publicar sem a arte correta.
- Osteocorp 500 mg + 400 UI: a frente e a tabela citam vitamina D3, mas ela não aparece na lista de componentes reconhecida.
- Purofer Gotas: as porções por faixa etária ficaram ambíguas no OCR; as dosagens não foram transcritas para a página.
- Flex-A-Mim: a quantidade logística reconhecida diverge da apresentação comercial de 60 comprimidos.

Cada divergência também aparece na página do produto correspondente, no bloco “Pontos para conciliação”.

## Regra de publicação

1. Conferir a transcrição contra a embalagem comercial vigente e o PDF original.
2. Corrigir composição, apresentação, tabela, declarações e advertências em `data/informativos/profiles.ts`.
3. Registrar a aprovação técnica/regulatória.
4. Adicionar o slug ao `PUBLISHED_SLUGS` de `data/informativos/profiles.ts`.
5. Rodar TypeScript, testes, lint e build. Somente fichas publicadas entram no sitemap e recebem indexação.

## Prompts de imagem

Os prompts usam ingredientes visuais somente nos 46 produtos com fonte identificada. Os seis produtos bloqueados recebem direção abstrata guiada pela embalagem, sem ingrediente literal, alegação terapêutica, pessoa, anatomia, comprimido ou embalagem recriada por IA.
