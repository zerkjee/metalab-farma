import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import {
  buildHiggsfieldBackgroundPrompt,
  informativeCatalogSyncedAt,
  informativeProducts,
} from '../data/informativos'

const outputPath = path.resolve('docs/higgsfield-background-prompts.md')

function renderPromptDocument() {
  const withVerifiedFormula = informativeProducts.filter((product) => product.profile).length
  const pending = informativeProducts.length - withVerifiedFormula

  const prompts = informativeProducts.map((product, index) => {
    const sourceStatus = product.profile
      ? `Verified visual direction from OCR source: ${product.profile.sourceFile}`
      : 'Packaging-led neutral direction; formula is pending technical reconciliation.'

    return [
      `## ${index + 1}. ${product.nome}`,
      '',
      `Status: ${sourceStatus}`,
      '',
      '```text',
      buildHiggsfieldBackgroundPrompt(product),
      '```',
    ].join('\n')
  })

  return [
    '# Higgsfield background prompts — MetaLab Farma',
    '',
    `Catalog snapshot: ${informativeCatalogSyncedAt}`,
    '',
    `Products: ${informativeProducts.length} total; ${withVerifiedFormula} with OCR-backed visual direction; ${pending} kept packaging-led while their technical sheet is reconciled.`,
    '',
    'Use each prompt to generate only the background. Composite the real product pack afterward so labels, proportions and regulatory text remain exact. Suggested format: 16:9, 2K or higher. Do not ask the model to recreate the packaging.',
    '',
    ...prompts,
    '',
  ].join('\n')
}

async function main() {
  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, renderPromptDocument(), 'utf8')
  console.log(`Wrote ${informativeProducts.length} prompts to ${outputPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
