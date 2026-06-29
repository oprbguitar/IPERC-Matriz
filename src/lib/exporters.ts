import type { CompanyProfile, GeneratedAssessment } from '../types'

const headers = [
  'Empresa',
  'RUC',
  'Area',
  'Puesto',
  'Tarea',
  'Actividad',
  'Trabajadores expuestos',
  'Peligro',
  'Riesgo',
  'Consecuencias',
  'Nivel inicial',
  'Controles existentes',
  'Controles propuestos',
  'Nivel residual',
  'Responsable',
  'Plazo',
  'Evidencia requerida',
  'Norma aplicable',
  'Articulo',
  'Obligacion',
  'Revision',
  'Version',
]

export function exportCsv(profile: CompanyProfile, rows: GeneratedAssessment[]) {
  const csv = [headers, ...rows.map((row) => rowToCells(profile, row))]
    .map((line) => line.map(csvEscape).join(','))
    .join('\n')
  download(`iperc-${profile.ruc || 'empresa'}.csv`, `text/csv;charset=utf-8`, csv)
}

export function exportExcel(profile: CompanyProfile, rows: GeneratedAssessment[]) {
  const htmlRows = [headers, ...rows.map((row) => rowToCells(profile, row))]
    .map((cells, index) => `<tr>${cells.map((cell) => `<${index === 0 ? 'th' : 'td'}>${escapeHtml(String(cell))}</${index === 0 ? 'th' : 'td'}>`).join('')}</tr>`)
    .join('')
  const workbook = `<html><head><meta charset="utf-8" /></head><body><table>${htmlRows}</table></body></html>`
  download(`iperc-${profile.ruc || 'empresa'}.xls`, 'application/vnd.ms-excel;charset=utf-8', workbook)
}

export function exportWord(profile: CompanyProfile, rows: GeneratedAssessment[]) {
  const body = `
    <h1>Informe tecnico IPERC</h1>
    <p><strong>Empresa:</strong> ${escapeHtml(profile.name)} | <strong>RUC:</strong> ${escapeHtml(profile.ruc)}</p>
    <p>Este informe conserva trazabilidad entre peligro, riesgo, controles, justificacion tecnica, evidencia requerida y validacion legal.</p>
    ${rows
      .map(
        (row) => `
        <h2>${escapeHtml(row.area.name)} - ${escapeHtml(row.position.title)}</h2>
        <p><strong>Tarea:</strong> ${escapeHtml(row.task.name)}</p>
        <p><strong>Peligro:</strong> ${escapeHtml(row.hazard.name)} | <strong>Riesgo inicial:</strong> ${row.initialLevel} (${row.initialScore}) | <strong>Residual:</strong> ${row.residualLevel} (${row.residualScore})</p>
        <p><strong>Controles:</strong> ${escapeHtml(row.proposedControls.map((control) => `${control.level}: ${control.description}`).join('; '))}</p>
        <p><strong>Evidencia:</strong> ${escapeHtml(row.requiredEvidence.join('; '))}</p>
        <p><strong>Legal:</strong> ${escapeHtml(row.legalMatches.map((match) => `${match.normTitle} / ${match.articleLabel} / ${match.obligation}`).join('; '))}</p>
      `,
      )
      .join('')}
  `
  download(`informe-iperc-${profile.ruc || 'empresa'}.doc`, 'application/msword;charset=utf-8', wrapHtml(body))
}

export function printPdfReport() {
  window.print()
}

function rowToCells(profile: CompanyProfile, row: GeneratedAssessment): string[] {
  const legal = row.legalMatches[0]
  return [
    profile.name,
    profile.ruc,
    row.area.name,
    row.position.title,
    row.task.name,
    row.task.activityKind === 'routine' ? 'Rutinaria' : 'No rutinaria',
    String(row.task.exposedWorkers),
    row.hazard.name,
    row.riskDescription,
    row.consequences,
    `${row.initialLevel} (${row.initialScore})`,
    row.existingControls,
    row.proposedControls.map((control) => `${control.level}: ${control.description}`).join(' | '),
    `${row.residualLevel} (${row.residualScore})`,
    row.responsible,
    row.deadline,
    row.requiredEvidence.join(' | '),
    legal?.normTitle ?? 'requires legal validation',
    legal?.articleLabel ?? 'requires legal validation',
    legal?.obligation ?? 'requires legal validation',
    row.reviewDate,
    row.version,
  ]
}

function download(filename: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function csvEscape(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function wrapHtml(body: string) {
  return `<html><head><meta charset="utf-8" /></head><body>${body}</body></html>`
}
