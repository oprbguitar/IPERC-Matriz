import { markdownToHtml } from './markdown'

/**
 * Genera documentos descargables a partir de Markdown, sin dependencias:
 * - Word (.doc en HTML compatible, abre y se edita en Word / LibreOffice / Google Docs)
 * - Markdown (.md)
 * - PDF (vista de impresion del navegador)
 */
const DOC_STYLES = `
  body { font-family: Calibri, "Segoe UI", Arial, sans-serif; font-size: 11pt; color: #17233c; line-height: 1.45; }
  h1 { font-size: 20pt; color: #1857bd; border-bottom: 2px solid #1f6fe5; padding-bottom: 4pt; }
  h2 { font-size: 14pt; color: #1857bd; margin-top: 16pt; }
  h3 { font-size: 12pt; color: #0f9d8f; }
  table { border-collapse: collapse; width: 100%; margin: 8pt 0; }
  th { background: #e8f0fe; color: #1857bd; text-align: left; }
  th, td { border: 1px solid #cfdaeb; padding: 4pt 6pt; font-size: 10pt; vertical-align: top; }
  pre { background: #f2f7fd; border: 1px solid #e2e9f4; padding: 8pt; font-family: Consolas, monospace; font-size: 9pt; white-space: pre-wrap; }
  code { font-family: Consolas, monospace; background: #f2f7fd; }
  blockquote { border-left: 3px solid #0f9d8f; margin: 8pt 0; padding: 4pt 10pt; color: #47566f; background: #e0f6f3; }
  .meta { color: #6b7a92; font-size: 9pt; }
  .disclaimer { margin-top: 18pt; padding-top: 6pt; border-top: 1px solid #cfdaeb; color: #6b7a92; font-size: 8.5pt; }
`

const DISCLAIMER =
  'Documento generado por el Observatorio SST Perú (sst.andesnova.solutions). Es orientativo: verifique el texto vigente de cada norma en El Peruano o gob.pe antes de citarlo o aplicarlo.'

function buildHtml(title: string, markdown: string): string {
  const date = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${title}</title><style>${DOC_STYLES}</style></head>
<body><p class="meta">Observatorio SST Perú · ${date}</p>${markdownToHtml(markdown)}<p class="disclaimer">${DISCLAIMER}</p></body></html>`
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 70)
}

function save(content: BlobPart, type: string, fileName: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export function downloadWord(title: string, markdown: string): void {
  // El BOM ayuda a Word a detectar UTF-8 (tildes y eñes).
  save(`﻿${buildHtml(title, markdown)}`, 'application/msword', `${slugify(title)}.doc`)
}

export function downloadMarkdown(title: string, markdown: string): void {
  save(`${markdown}\n\n---\n${DISCLAIMER}\n`, 'text/markdown;charset=utf-8', `${slugify(title)}.md`)
}

export function printPdf(title: string, markdown: string): void {
  const popup = window.open('', '_blank', 'noopener=no,width=900,height=1000')
  if (!popup) {
    downloadWord(title, markdown)
    return
  }
  popup.document.write(buildHtml(title, markdown))
  popup.document.close()
  popup.focus()
  window.setTimeout(() => popup.print(), 350)
}
