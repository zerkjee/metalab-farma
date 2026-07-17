import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  buildHiggsfieldBackgroundPrompt,
  informativeProducts,
} from '@/data/informativos'
import { buildProductFaq, buildProductVisualStory } from '@/data/informativos/product-experience'
import { buildProductTechnicalOverview } from '@/data/informativos/technical-explanations'
import {
  hasEmbeddedWhiteProductBackground,
  productImagesWithEmbeddedWhiteBackground,
} from '@/lib/product-image-presentation'

describe('informativos de produtos', () => {
  it('mantém um informativo único para cada produto ativo do catálogo', () => {
    const slugs = informativeProducts.map((product) => product.slug)

    expect(informativeProducts).toHaveLength(52)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('só expõe conteúdo extraído quando existe fonte e composição rastreáveis', () => {
    const extracted = informativeProducts.filter((product) => product.status === 'ocr-extracted')
    const pending = informativeProducts.filter((product) => product.status === 'pending')

    expect(extracted).toHaveLength(46)
    expect(pending).toHaveLength(6)

    for (const product of extracted) {
      expect(product.profile?.sourceFile).toBeTruthy()
      expect(product.profile?.ingredients.length).toBeGreaterThan(0)
    }

    for (const product of pending) {
      expect(product.profile).toBeUndefined()
      const faqText = buildProductFaq(product, null).map((item) => item.answer).join(' ')
      const visual = buildProductVisualStory(product, null)

      expect(faqText).toContain('Ainda não é possível resumir a composição')
      expect(visual.kind).toBe('technical')
      expect(visual.tags).toContain('Sem composição inferida')
    }
  })

  it('mantém campos mínimos para montar folhetos técnicos por produto', () => {
    const extracted = informativeProducts.filter((product) => product.status === 'ocr-extracted')

    for (const product of extracted) {
      const profile = product.profile

      expect(profile?.presentation).toBeTruthy()
      expect(profile?.classification).toBeTruthy()
      expect(profile?.sourceFile).toMatch(/\.pdf$/i)
      expect(profile?.sourceLabel).toContain('OCR')
      expect(profile?.ingredients.length).toBeGreaterThan(0)
    }
  })

  it('não mantém destinos comerciais externos no modelo dos folhetos', () => {
    for (const product of informativeProducts) {
      expect('storeUrl' in product).toBe(false)
      expect('marketplace' in product).toBe(false)
    }
  })

  it('identifica fundos brancos incorporados sem recortar o produto', () => {
    expect(productImagesWithEmbeddedWhiteBackground).toHaveLength(53)
    expect(productImagesWithEmbeddedWhiteBackground).toEqual(expect.arrayContaining([
      'ademoril.png',
      'azigov.png',
      'biotina.png',
      'epatinon_comprimido.png',
      'epatinon_comprimido_200.png',
      'flebogenol_30.png',
      'lactulose.png',
      'visyneral_folato.png',
      'visyneral_pre_natal.png',
    ]))

    for (const filename of productImagesWithEmbeddedWhiteBackground) {
      expect(hasEmbeddedWhiteProductBackground(`/products/${filename}`)).toBe(true)
      expect(existsSync(join(process.cwd(), 'public/products', filename))).toBe(true)
    }

    expect(hasEmbeddedWhiteProductBackground('/products/flebogenol.png')).toBe(false)
    expect(hasEmbeddedWhiteProductBackground('/products/epatinon_comprimido.png?v=2')).toBe(true)
    expect(hasEmbeddedWhiteProductBackground('/products/visyneral_folato.png#produto')).toBe(true)
    expect(hasEmbeddedWhiteProductBackground('/products/%65patinon_comprimido.png')).toBe(true)
  })

  it('altera somente a moldura e preserva os pixels dos produtos em todas as superfícies', () => {
    const productImageSource = readFileSync(join(process.cwd(), 'components/ProductImage.tsx'), 'utf8')
    const presentationSource = readFileSync(join(process.cwd(), 'lib/product-image-presentation.ts'), 'utf8')
    const globalStylesSource = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8')
    const surfaces = [
      'components/ProductCard.tsx',
      'components/ProductDetailHero.tsx',
      'components/SearchBar.tsx',
      'components/informativos/InformativoCard.tsx',
      'components/cart/CartDrawer.tsx',
      'components/checkout/OrderSummary.tsx',
      'components/social-proof/PurchaseNotification.tsx',
      'app/informativos/[slug]/page.tsx',
      'app/produtos/[id]/page.tsx',
      'app/pedidos/page.tsx',
      'app/admin/produtos/page.tsx',
      'app/admin/pedidos/page.tsx',
      'app/admin/pedidos/[id]/page.tsx',
    ]

    expect(productImageSource).toContain('hasEmbeddedWhiteProductBackground')
    expect(productImageSource).toContain('data-product-image-treatment')
    expect(productImageSource).toContain("'background-only'")
    expect(productImageSource).toContain("'bg-white'")
    expect(productImageSource).toContain('style={style}')
    expect(productImageSource).not.toMatch(/\b(?:clipPath|maskImage|mixBlendMode)\b/)
    expect(presentationSource).not.toMatch(/\b(?:clipPath|maskImage|mixBlendMode)\b/)
    expect(globalStylesSource).not.toMatch(/html\[data-theme=["']dark["']\]\s+\.bg-white/)

    for (const surface of surfaces) {
      expect(readFileSync(join(process.cwd(), surface), 'utf8')).toContain('ProductImage')
    }
  })

  it('gera explicações técnicas curtas, rastreáveis e sem promessas terapêuticas', () => {
    const prohibitedClaims = /\b(cura|trata|previne|combate|elimina|anti-inflamat[óo]rio|analg[ée]sico)\b/i

    for (const product of informativeProducts) {
      if (!product.profile) continue
      const overview = buildProductTechnicalOverview(product.slug, product.profile)

      expect(overview.purpose.length).toBeLessThanOrEqual(280)
      expect(prohibitedClaims.test(overview.purpose)).toBe(false)

      for (const component of overview.components) {
        expect(component.explanation.length).toBeLessThanOrEqual(220)
        expect(component.sourceIds.length).toBeGreaterThan(0)
        expect(prohibitedClaims.test(component.explanation)).toBe(false)
      }

      for (const source of overview.sources) {
        expect(source.url).toMatch(/^https:\/\//)
      }
    }
  })

  it('bloqueia explicação funcional quando a própria auditoria aponta contradição material', () => {
    const blockedSlugs = [
      'sulfato-ferroso-60-comprimidos',
      'inovitann-magnesio-l-treonato-60-capsulas',
      'osteocorp-500mg-vitamina-d-60-comprimidos',
    ]

    for (const slug of blockedSlugs) {
      const product = informativeProducts.find((item) => item.slug === slug)
      expect(product?.profile).toBeTruthy()
      expect(buildProductTechnicalOverview(slug, product!.profile!).status).toBe('blocked')
    }
  })

  it('gera perguntas curtas e um contexto visual sem inventar matéria-prima', () => {
    const prohibitedClaims = /\b(cura|trata|previne|combate|elimina|anti-inflamat[óo]rio|analg[ée]sico)\b/i

    for (const product of informativeProducts) {
      const overview = product.profile ? buildProductTechnicalOverview(product.slug, product.profile) : null
      const faq = buildProductFaq(product, overview)
      const story = buildProductVisualStory(product, overview)

      expect(faq.length).toBeGreaterThanOrEqual(4)
      expect(story.kind).toBeTruthy()
      expect(story.title).toBeTruthy()
      expect(story.description).toBeTruthy()
      for (const item of faq) {
        expect(item.question.length).toBeLessThanOrEqual(90)
        expect(item.answer.length).toBeLessThanOrEqual(320)
        expect(prohibitedClaims.test(item.answer)).toBe(false)
      }
    }

    const flebogenol = informativeProducts.find((product) => product.slug === 'flebogenol-30-comprimidos')!
    const overview = buildProductTechnicalOverview(flebogenol.slug, flebogenol.profile!)
    const story = buildProductVisualStory(flebogenol, overview)
    const faqText = buildProductFaq(flebogenol, overview).map((item) => item.answer).join(' ')

    expect(story.kind).toBe('pine-bark')
    expect(story.title).toContain('casca')
    expect(story.description).toContain('não é a fonte do extrato')
    expect(faqText).toContain('casca de Pinus pinaster Aiton')
    expect(faqText).toContain('não vem do fruto')
  })

  it('gera um prompt de fundo seguro e utilizável para cada produto', () => {
    for (const product of informativeProducts) {
      const prompt = buildHiggsfieldBackgroundPrompt(product)

      expect(prompt).toContain(product.nome)
      expect(prompt).toContain('wide 16:9 website hero banner')
      expect(prompt).toContain('Background only')
      expect(prompt).toContain('do not render the product')
      expect(prompt).toContain('Avoid people, hands, pills, capsules')

      if (product.status === 'pending') {
        expect(prompt).toContain('technical formula is still under review')
      }
    }
  })

  it('mantém a página individual no formato de folheto técnico', () => {
    const pageSource = readFileSync(join(process.cwd(), 'app/informativos/[slug]/page.tsx'), 'utf8')

    expect(pageSource).toContain('Folheto técnico informativo')
    expect(pageSource).toContain('1. Identificação do produto')
    expect(pageSource).toContain('2. Composição')
    expect(pageSource).toContain('3. Função dos componentes')
    expect(pageSource).toContain('4. Origem e contexto visual')
    expect(pageSource).toContain('5. Modo de uso')
    expect(pageSource).toContain('6. Informação nutricional')
    expect(pageSource).toContain('7. Advertências e declarações')
    expect(pageSource).toContain('8. Conservação e rastreabilidade')
    expect(pageSource).toContain('9. Perguntas e respostas')
    expect(pageSource).toContain('id="modo-de-uso"')
    expect(pageSource).toContain('ComingSoonStoreButton')
    expect(pageSource).not.toContain('MTL Nutrition')
    expect(pageSource).not.toContain('Mercado Livre')
    expect(pageSource).not.toContain('product.storeUrl')
    expect(pageSource).not.toContain('product.marketplace')
    expect(pageSource).toContain('rel="noreferrer"')
    expect(pageSource).toContain('Não substitui o rótulo físico vigente')
  })

  it('abre um aviso acessível de loja em breve sem criar link de compra', () => {
    const buttonSource = readFileSync(join(process.cwd(), 'components/informativos/ComingSoonStoreButton.tsx'), 'utf8')

    expect(buttonSource).toContain("'use client'")
    expect(buttonSource).toContain('aria-haspopup="dialog"')
    expect(buttonSource).toContain('role="dialog"')
    expect(buttonSource).toContain('aria-modal="true"')
    expect(buttonSource).toContain("event.key === 'Escape'")
    expect(buttonSource).toContain('triggerElement?.focus()')
    expect(buttonSource).toContain('Loja em breve')
    expect(buttonSource).not.toContain('href=')
  })

  it('inicializa e persiste o tema antes da hidratação', () => {
    const layoutSource = readFileSync(join(process.cwd(), 'app/layout.tsx'), 'utf8')
    const themeToggleSource = readFileSync(join(process.cwd(), 'components/theme/ThemeToggle.tsx'), 'utf8')
    const globalCssSource = readFileSync(join(process.cwd(), 'app/globals.css'), 'utf8')

    expect(layoutSource).toContain("window.localStorage.getItem('metalab-theme')")
    expect(layoutSource).toContain('prefers-color-scheme: dark')
    expect(layoutSource).toContain('suppressHydrationWarning')
    expect(themeToggleSource).toContain("window.localStorage.setItem(STORAGE_KEY, next)")
    expect(globalCssSource).toContain('html[data-theme="dark"]')
    expect(globalCssSource).toContain('@media print')
  })

  it('reutiliza o padrão técnico seguro em todas as páginas comerciais catalogadas', () => {
    const commercialPageSource = readFileSync(join(process.cwd(), 'app/produtos/[id]/page.tsx'), 'utf8')

    expect(commercialPageSource).toContain('buildProductFaq')
    expect(commercialPageSource).toContain('safeTechnicalDescription')
    expect(commercialPageSource).toContain('descricaoHtml: null')
    expect(commercialPageSource).toContain('ficha técnica/OCR conciliada > banco')
    expect(commercialPageSource).toContain('Origem, fórmula e respostas rápidas')
    expect(commercialPageSource).toContain('<ProductFaq items={informativeFaq} />')
    expect(commercialPageSource).toContain('Abrir folheto técnico')
    expect(commercialPageSource).toContain('ComingSoonStoreButton')
    expect(commercialPageSource).toMatch(/const researchCards = informativeProduct\s*\? \[\]/)
    expect(commercialPageSource).toContain('&& !informativeProduct')
    expect(commercialPageSource).not.toContain('Ver no Mercado Livre')
    expect(commercialPageSource).not.toContain('informativeProduct.marketplace')
  })
})
