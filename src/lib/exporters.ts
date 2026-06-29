import type { CompanyProfile, GeneratedAssessment } from '../types'

const headers = [
  'Empresa',
  'RUC',
  'Centro de trabajo',
  'Actividad economica',
  'Sector',
  'Area',
  'Proceso',
  'Puesto',
  'Tarea',
  'Tipo de actividad',
  'Trabajadores expuestos',
  'Trabajadores vulnerables',
  'Categoria de peligro',
  'Peligro',
  'Fuente del peligro',
  'Evento peligroso',
  'Riesgo',
  'Consecuencias',
  'Probabilidad inicial',
  'Severidad inicial',
  'Exposicion inicial',
  'Puntaje inicial',
  'Nivel inicial',
  'Aceptabilidad inicial',
  'Controles existentes',
  'Controles propuestos',
  'Jerarquia principal',
  'Probabilidad residual',
  'Severidad residual',
  'Exposicion residual',
  'Puntaje residual',
  'Nivel residual',
  'Aceptabilidad residual',
  'Responsable',
  'Plazo',
  'Evidencia requerida',
  'Norma aplicable',
  'Articulo',
  'Obligacion',
  'Estado legal',
  'Observaciones',
  'Revision',
  'Elaborado por',
  'Revisado por',
  'Aprobado por',
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
    <p><strong>Regla legal:</strong> no se inventan obligaciones. Todo articulo no validado queda como Requires legal validation o Normative reference pending validation.</p>
    ${rows
      .map(
        (row) => `
        <h2>${escapeHtml(row.area.name)} - ${escapeHtml(row.position.title)}</h2>
        <p><strong>Tarea:</strong> ${escapeHtml(row.task.name)}</p>
        <p><strong>Peligro:</strong> ${escapeHtml(row.hazard.name)} | <strong>Riesgo inicial:</strong> ${row.initialLevel} (${row.initialScore}) | <strong>Residual:</strong> ${row.residualLevel} (${row.residualScore})</p>
        <p><strong>Controles:</strong> ${escapeHtml(row.proposedControls.map((control) => `${control.level}: ${control.description}`).join('; '))}</p>
        <p><strong>Justificacion tecnica:</strong> ${escapeHtml(row.proposedControls.map((control) => control.technicalJustification).join('; '))}</p>
        <p><strong>Evidencia:</strong> ${escapeHtml(row.requiredEvidence.join('; '))}</p>
        <p><strong>Legal:</strong> ${escapeHtml(row.legalMatches.map((match) => `${match.normTitle} / ${match.articleLabel} / ${match.obligation}`).join('; '))}</p>
        <p><strong>Estado:</strong> ${escapeHtml(row.legalValidationStatus === 'validated' ? 'Validado' : 'Requires legal validation')}</p>
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
    row.workplace,
    row.economicActivity,
    row.sector,
    row.area.name,
    row.process,
    row.position.title,
    row.task.name,
    activityLabel(row.task.activityKind),
    String(row.task.exposedWorkers),
    row.vulnerableWorkers,
    row.hazardCategory,
    row.hazard.name,
    row.hazardSource,
    row.hazardousEvent,
    row.riskDescription,
    row.consequences,
    String(row.probability),
    String(row.severity),
    String(row.exposureFrequency),
    String(row.initialScore),
    `${row.initialLevel} (${row.initialScore})`,
    row.riskAcceptability,
    row.existingControls,
    row.proposedControls.map((control) => `${control.level}: ${control.description} Justificacion: ${control.technicalJustification} Evidencia: ${control.requiredEvidence.join('; ')}`).join(' | '),
    row.controlHierarchyLevel,
    String(row.residualProbability),
    String(row.residualSeverity),
    String(row.residualExposureFrequency),
    String(row.residualScore),
    `${row.residualLevel} (${row.residualScore})`,
    row.residualAcceptability,
    row.responsible,
    row.deadline,
    row.requiredEvidence.join(' | '),
    legal?.normTitle ?? 'Requires legal validation',
    legal?.articleLabel ?? 'Requires legal validation',
    legal?.obligation ?? 'Normative reference pending validation',
    row.legalValidationStatus === 'validated' ? 'Validado' : 'Requires legal validation',
    row.observations,
    row.reviewDate,
    row.preparedBy,
    row.reviewedBy,
    row.approvedBy,
    row.version,
  ]
}

function activityLabel(kind: GeneratedAssessment['routineType']) {
  if (kind === 'routine') return 'Rutinaria'
  if (kind === 'non_routine') return 'No rutinaria'
  return 'Emergencia'
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
