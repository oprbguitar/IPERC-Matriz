import { markdownToHtml } from './markdown'

/**
 * Genera documentos descargables a partir de Markdown, sin dependencias:
 * - Word (.doc en HTML compatible, abre y se edita en Word / LibreOffice / Google Docs)
 * - Markdown (.md)
 * - PDF (vista de impresion del navegador)
 */
const DOC_STYLES = `
  @page { size: A4; margin: 2.2cm 2cm 2.2cm 2.4cm; }
  @page WordSection1 { size: 21cm 29.7cm; margin: 2.2cm 2cm 2.2cm 2.4cm; mso-header-margin: 1.1cm; mso-footer-margin: 1.1cm; }
  div.WordSection1 { page: WordSection1; }
  body { font-family: Calibri, "Segoe UI", Arial, sans-serif; font-size: 11pt; color: #1f2a3d; line-height: 1.5; }
  p { margin: 0 0 8pt; text-align: justify; }
  li { margin-bottom: 4pt; }
  h1 { font-size: 19pt; color: #0b2545; margin: 0 0 10pt; padding-bottom: 6pt; border-bottom: 2.5pt solid #f28c1b; }
  h2 { font-size: 13.5pt; color: #0b2545; margin: 18pt 0 6pt; padding: 3pt 0 3pt 8pt; border-left: 4pt solid #f28c1b; background: #f4f6fa; page-break-after: avoid; }
  h3 { font-size: 11.5pt; color: #13315c; margin: 12pt 0 4pt; page-break-after: avoid; }
  table { border-collapse: collapse; width: 100%; margin: 6pt 0 12pt; page-break-inside: auto; }
  tr { page-break-inside: avoid; }
  th { background: #0b2545; color: #ffffff; text-align: left; font-weight: bold; }
  th, td { border: 0.75pt solid #b8c2d3; padding: 4pt 6pt; font-size: 9.5pt; vertical-align: top; }
  tr:nth-child(even) td { background: #f7f9fc; }
  pre { background: #f4f6fa; border: 0.75pt solid #d5dbe6; padding: 8pt; font-family: Consolas, monospace; font-size: 9pt; white-space: pre-wrap; }
  code { font-family: Consolas, monospace; background: #f4f6fa; }
  blockquote { border-left: 3pt solid #f28c1b; margin: 8pt 0; padding: 6pt 10pt; color: #3c4a60; background: #fff6ec; }
  .cover { text-align: center; padding-top: 70pt; }
  .cover .brand { font-size: 10pt; letter-spacing: 2pt; text-transform: uppercase; color: #f28c1b; font-weight: bold; }
  .cover h1 { font-size: 26pt; border: none; margin: 18pt 0 8pt; }
  .cover .subtitle { font-size: 12pt; color: #3c4a60; text-align: center; }
  .cover table { width: 80%; margin: 40pt auto 0; }
  .cover td { font-size: 10pt; text-align: left; }
  .cover td.k { width: 38%; background: #f4f6fa; font-weight: bold; color: #0b2545; }
  .toc { margin: 0 0 6pt; }
  .toc li { margin-bottom: 2pt; }
  .page-break { page-break-before: always; }
  .meta { color: #6b7a92; font-size: 9pt; }
  .disclaimer { margin-top: 18pt; padding-top: 6pt; border-top: 0.75pt solid #b8c2d3; color: #6b7a92; font-size: 8.5pt; }
`

const DISCLAIMER =
  'Documento generado por el Observatorio Prevenir Perú (sst.andesnova.solutions). Es orientativo: verifique el texto vigente de cada norma en El Peruano, gob.pe o el SPIJ antes de citarlo o aplicarlo.'

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function readOrgSafe(): Record<string, string> {
  try {
    return JSON.parse(window.localStorage.getItem('observatorio-sst:organizacion') ?? '{}') as Record<string, string>
  } catch {
    return {}
  }
}

/**
 * Documento con portada (organización, fecha, versión), índice de secciones y cuerpo.
 * El mismo HTML sirve para Word (.doc) y para imprimir como PDF.
 */
function buildHtml(title: string, markdown: string): string {
  const date = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })
  const org = readOrgSafe()
  const body = markdown.replace(/^#\s+.*$/m, '').trim()
  const subtitle = (body.match(/^([^#|>\-\n][^\n]{20,220})$/m) ?? [])[1] ?? ''
  const sections = [...body.matchAll(/^##\s+(.*)$/gm)].map((match) => match[1].replace(/\*\*/g, ''))
  const row = (label: string, value?: string) => `<tr><td class="k">${label}</td><td>${escapeHtml(value?.trim() || '')}</td></tr>`
  const cover = `<div class="cover">
    <p class="brand">Observatorio Prevenir Perú</p>
    <h1>${escapeHtml(title)}</h1>
    ${subtitle ? `<p class="subtitle">${escapeHtml(subtitle.replace(/\*\*/g, ''))}</p>` : ''}
    <table>
      ${row('Organización', org.razonSocial)}
      ${row('RUC', org.ruc)}
      ${row('Centro de trabajo', org.centro)}
      ${row('Responsable de SST', org.responsable)}
      ${row('Versión', '01')}
      ${row('Fecha de emisión', date)}
    </table>
  </div>`
  const toc = sections.length > 2
    ? `<br clear="all" class="page-break" style="page-break-before:always" /><h2>Contenido</h2><ol class="toc">${sections.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol>`
    : ''
  return `<!doctype html><html lang="es" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
<style>${DOC_STYLES}</style></head>
<body><div class="WordSection1">${cover}${toc}<br clear="all" class="page-break" style="page-break-before:always" />
<h1>${escapeHtml(title)}</h1>${markdownToHtml(body)}<p class="disclaimer">${DISCLAIMER}</p></div></body></html>`
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

function escapeCell(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Hoja Excel (.xls en HTML) que Excel, LibreOffice y Google Sheets abren y editan. */
export function downloadExcel(title: string, header: Array<[string, string]>, columns: string[], rows: string[][]): void {
  const meta = header.map(([label, value]) => `<tr><th align="left">${escapeCell(label)}</th><td colspan="${Math.max(1, columns.length - 1)}">${escapeCell(value)}</td></tr>`).join('')
  const head = `<tr>${columns.map((column) => `<th style="background:#e8f0fe">${escapeCell(column)}</th>`).join('')}</tr>`
  const body = rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeCell(cell)}</td>`).join('')}</tr>`).join('')
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table border="1"><tr><th colspan="${columns.length}" align="left">${escapeCell(title)}</th></tr>${meta}<tr></tr>${head}${body}</table></body></html>`
  save(`﻿${html}`, 'application/vnd.ms-excel', `${slugify(title)}.xls`)
}
