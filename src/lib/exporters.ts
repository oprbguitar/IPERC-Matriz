import * as XLSX from 'xlsx-js-style'
import { legalNorms, sectorModules } from '../data/legalDatabase'
import type { ActionStatus, CompanyProfile, GeneratedAssessment, JobPosition, SectorId, WorkArea, WorkTask } from '../types'

export interface ExportContext {
  profile: CompanyProfile
  sector: SectorId
  areas: WorkArea[]
  positions: JobPosition[]
  tasks: WorkTask[]
  rows: GeneratedAssessment[]
  appliedFilters?: string
}

export type ReportKind =
  | 'full'
  | 'executive'
  | 'matrix'
  | 'critical'
  | 'overdue'
  | 'pending-evidence'
  | 'legal-pending'
  | 'action-plan'

const RISK_FILL: Record<string, string> = {
  Bajo: 'FF1F7A45',
  Moderado: 'FFB7791F',
  Importante: 'FFC05621',
  Intolerable: 'FF9B2C2C',
}

const HEADER_STYLE = {
  font: { bold: true, color: { rgb: 'FFFFFFFF' }, sz: 11 },
  fill: { patternType: 'solid', fgColor: { rgb: 'FF312E81' } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border: thinBorder('FF1E1B4B'),
}

const TITLE_STYLE = {
  font: { bold: true, sz: 15, color: { rgb: 'FF312E81' } },
}

const LABEL_STYLE = {
  font: { bold: true, color: { rgb: 'FF334155' } },
  alignment: { vertical: 'top' },
}

const BODY_STYLE = {
  alignment: { vertical: 'top', wrapText: true },
  border: thinBorder('FFE2E8F0'),
}

function thinBorder(rgb: string) {
  const side = { style: 'thin', color: { rgb } }
  return { top: side, bottom: side, left: side, right: side }
}

function actionStatusLabel(status: ActionStatus): string {
  switch (status) {
    case 'implemented':
      return 'Implementado'
    case 'verified':
      return 'Verificado'
    case 'overdue':
      return 'Vencido'
    case 'not_applicable':
      return 'No aplica'
    case 'in_progress':
      return 'En ejecucion'
    default:
      return 'Pendiente'
  }
}

function activityLabel(kind: GeneratedAssessment['routineType']) {
  if (kind === 'routine') return 'Rutinaria'
  if (kind === 'non_routine') return 'No rutinaria'
  return 'Emergencia'
}

function sectorLabel(sector: SectorId): string {
  return sectorModules.find((module) => module.id === sector)?.label ?? sector
}

function slug(value: string): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'sin-dato'
}

export function buildFileName(profile: CompanyProfile, sector: SectorId, ext: string): string {
  const id = /^[0-9]{11}$/.test(profile.ruc) ? profile.ruc : slug(profile.name || 'Empresa')
  const date = new Date().toISOString().slice(0, 10)
  return `IPERC_${id}_${slug(sectorLabel(sector))}_${date}.${ext}`
}

const MATRIX_HEADERS = [
  'Empresa',
  'RUC',
  'Centro de trabajo',
  'Sector',
  'Area',
  'Proceso',
  'Puesto',
  'Tarea',
  'Tipo de actividad',
  'Trab. expuestos',
  'Trab. vulnerables',
  'Categoria de peligro',
  'Peligro',
  'Evento peligroso',
  'Riesgo',
  'Consecuencias',
  'Controles existentes',
  'Prob. inicial',
  'Sev. inicial',
  'Exp. inicial',
  'Puntaje inicial',
  'Nivel inicial',
  'Controles propuestos',
  'Jerarquia de control',
  'Prob. residual',
  'Sev. residual',
  'Exp. residual',
  'Puntaje residual',
  'Nivel residual',
  'Responsable',
  'Plazo',
  'Evidencia requerida',
  'Norma legal',
  'Articulo',
  'Obligacion',
  'Estado validacion',
  'Estado de control',
  'Observaciones',
  'Fecha revision',
  'Version',
]

// Column indexes used for formulas / colouring.
const COL_PROB_I = 17
const COL_SEV_I = 18
const COL_EXP_I = 19
const COL_SCORE_I = 20
const COL_LEVEL_I = 21
const COL_PROB_R = 24
const COL_SEV_R = 25
const COL_EXP_R = 26
const COL_SCORE_R = 27
const COL_LEVEL_R = 28

function cell(value: string | number, style?: Record<string, unknown>) {
  const isNumber = typeof value === 'number'
  return { v: value, t: isNumber ? 'n' : 's', s: { ...BODY_STYLE, ...(style ?? {}) } }
}

function matrixRowCells(row: GeneratedAssessment) {
  const legal = row.legalMatches[0]
  const proposed = row.proposedControls
    .map((control) => `${control.level}: ${control.description}`)
    .join('\n')
  const values: Array<string | number> = [
    row.companyName,
    row.ruc,
    row.workplace,
    sectorLabel(row.sector),
    row.area.name,
    row.process,
    row.position.title,
    row.task.name,
    activityLabel(row.routineType),
    row.exposedWorkers,
    row.vulnerableWorkers,
    row.hazardCategory,
    row.hazard.name,
    row.hazardousEvent,
    row.riskDescription,
    row.consequences,
    row.existingControls,
    row.probability,
    row.severity,
    row.exposureFrequency,
    row.initialScore,
    row.initialLevel,
    proposed || 'Control por definir',
    row.controlHierarchyLevel,
    row.residualProbability,
    row.residualSeverity,
    row.residualExposureFrequency,
    row.residualScore,
    row.residualLevel,
    row.responsible,
    row.deadline,
    row.requiredEvidence.join('\n') || 'No declarada',
    legal?.normTitle ?? 'Requiere validacion legal',
    legal?.articleLabel ?? 'Requiere validacion legal',
    legal?.obligation ?? 'Referencia normativa pendiente de validacion',
    row.legalValidationStatus === 'validated' ? 'Validado' : 'Requiere validacion legal',
    actionStatusLabel(row.actionStatus),
    row.observations || 'Sin observaciones',
    row.reviewDate,
    row.version,
  ]
  return values.map((value) => cell(value))
}

function riskLevelStyle(level: string) {
  const rgb = RISK_FILL[level]
  if (!rgb) return undefined
  return {
    font: { bold: true, color: { rgb: 'FFFFFFFF' } },
    fill: { patternType: 'solid', fgColor: { rgb } },
    alignment: { horizontal: 'center', vertical: 'center' },
  }
}

function buildMatrixSheet(rows: GeneratedAssessment[]): XLSX.WorkSheet {
  const headerRow = MATRIX_HEADERS.map((label) => ({ v: label, t: 's', s: HEADER_STYLE }))
  const dataRows = rows.map(matrixRowCells)
  const aoa = [headerRow, ...dataRows]
  const ws = XLSX.utils.aoa_to_sheet(aoa as unknown[][])

  rows.forEach((row, index) => {
    const excelRow = index + 2 // 1-based, header is row 1
    // Initial / residual score as live formulas (no failure on special chars).
    setFormula(ws, COL_SCORE_I, excelRow, COL_PROB_I, COL_SEV_I, COL_EXP_I, row.initialScore)
    setFormula(ws, COL_SCORE_R, excelRow, COL_PROB_R, COL_SEV_R, COL_EXP_R, row.residualScore)
    colourCell(ws, COL_LEVEL_I, excelRow, riskLevelStyle(row.initialLevel))
    colourCell(ws, COL_LEVEL_R, excelRow, riskLevelStyle(row.residualLevel))
  })

  applyTableShape(ws, MATRIX_HEADERS.length, rows.length)
  ws['!cols'] = autoWidths(aoa as Array<Array<{ v: unknown }>>)
  return ws
}

function setFormula(
  ws: XLSX.WorkSheet,
  col: number,
  excelRow: number,
  a: number,
  b: number,
  c: number,
  cached: number,
) {
  const ref = XLSX.utils.encode_cell({ c: col, r: excelRow - 1 })
  const ca = XLSX.utils.encode_cell({ c: a, r: excelRow - 1 })
  const cb = XLSX.utils.encode_cell({ c: b, r: excelRow - 1 })
  const cc = XLSX.utils.encode_cell({ c: c, r: excelRow - 1 })
  ws[ref] = { t: 'n', f: `${ca}*${cb}*${cc}`, v: cached, s: { ...BODY_STYLE, alignment: { horizontal: 'center' } } }
}

function colourCell(ws: XLSX.WorkSheet, col: number, excelRow: number, style?: Record<string, unknown>) {
  if (!style) return
  const ref = XLSX.utils.encode_cell({ c: col, r: excelRow - 1 })
  if (ws[ref]) ws[ref].s = style
}

function applyTableShape(ws: XLSX.WorkSheet, columns: number, dataRows: number) {
  const lastCol = XLSX.utils.encode_col(columns - 1)
  ws['!autofilter'] = { ref: `A1:${lastCol}${Math.max(1, dataRows + 1)}` }
}

function autoWidths(aoa: Array<Array<{ v: unknown }>>): Array<{ wch: number }> {
  const widths: number[] = []
  aoa.forEach((row) => {
    row.forEach((cellObj, index) => {
      const text = String(cellObj?.v ?? '')
      const longest = text.split('\n').reduce((max, line) => Math.max(max, line.length), 0)
      widths[index] = Math.min(48, Math.max(widths[index] ?? 10, longest + 2))
    })
  })
  return widths.map((wch) => ({ wch }))
}

function buildSummarySheet(context: ExportContext): XLSX.WorkSheet {
  const { profile, sector, rows } = context
  const counts = { Bajo: 0, Moderado: 0, Importante: 0, Intolerable: 0 } as Record<string, number>
  rows.forEach((row) => {
    counts[row.initialLevel] = (counts[row.initialLevel] ?? 0) + 1
  })
  const initialTotal = rows.reduce((sum, row) => sum + row.initialScore, 0)
  const residualTotal = rows.reduce((sum, row) => sum + row.residualScore, 0)
  const reduction = initialTotal ? Math.round(((initialTotal - residualTotal) / initialTotal) * 100) : 0
  const legalPending = rows.filter((row) => row.legalValidationMissing).length

  const aoa: Array<Array<unknown>> = [
    [{ v: 'Matriz IPERC - Resumen ejecutivo', t: 's', s: TITLE_STYLE }],
    [],
    [labelCell('Empresa'), valueCell(profile.name)],
    [labelCell('RUC'), valueCell(profile.ruc)],
    [labelCell('Tipo de propiedad'), valueCell(profile.ownership === 'public' ? 'Publica' : 'Privada')],
    [labelCell('Actividad economica'), valueCell(profile.businessActivity)],
    [labelCell('CIIU'), valueCell(profile.ciiu)],
    [labelCell('Centro de trabajo'), valueCell(profile.workplace)],
    [labelCell('N. de trabajadores'), valueCell(String(profile.workerCount))],
    [labelCell('Sector'), valueCell(sectorLabel(sector))],
    [labelCell('Responsable SST'), valueCell(profile.sgsstResponsible ?? '')],
    [labelCell('Elaborado por'), valueCell(profile.preparedBy ?? '')],
    [labelCell('Revisado por'), valueCell(profile.reviewedBy ?? '')],
    [labelCell('Aprobado por'), valueCell(profile.approvedBy ?? '')],
    [labelCell('Fecha de generacion'), valueCell(new Date().toISOString().slice(0, 10))],
    context.appliedFilters ? [labelCell('Filtros aplicados'), valueCell(context.appliedFilters)] : [],
    [],
    [{ v: 'Indicadores', t: 's', s: { font: { bold: true, sz: 12 } } }],
    [labelCell('Riesgos evaluados'), valueCell(String(rows.length))],
    [labelCell('Riesgos bajos'), valueCell(String(counts.Bajo))],
    [labelCell('Riesgos moderados'), valueCell(String(counts.Moderado))],
    [labelCell('Riesgos importantes'), valueCell(String(counts.Importante))],
    [labelCell('Riesgos intolerables'), valueCell(String(counts.Intolerable))],
    [labelCell('Reduccion de riesgo'), valueCell(`${reduction}%`)],
    [labelCell('Pendientes de validacion legal'), valueCell(String(legalPending))],
    [],
    [
      {
        v: 'Nota: esta herramienta no inventa obligaciones legales. Las referencias no validadas con fuente oficial se marcan como "Requiere validacion legal".',
        t: 's',
        s: { font: { italic: true, color: { rgb: 'FF64748B' } }, alignment: { wrapText: true } },
      },
    ],
  ]

  const ws = XLSX.utils.aoa_to_sheet(aoa as unknown[][])
  ws['!cols'] = [{ wch: 30 }, { wch: 60 }]
  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
    { s: { r: aoa.length - 1, c: 0 }, e: { r: aoa.length - 1, c: 1 } },
  ]
  return ws
}

function labelCell(value: string) {
  return { v: value, t: 's', s: LABEL_STYLE }
}
function valueCell(value: string) {
  return { v: value, t: 's', s: { alignment: { vertical: 'top', wrapText: true } } }
}

function buildActionPlanSheet(rows: GeneratedAssessment[]): XLSX.WorkSheet {
  const headers = ['Area', 'Tarea', 'Riesgo', 'Control propuesto', 'Jerarquia', 'Responsable', 'Plazo', 'Estado', 'Verificacion', 'Evidencia requerida']
  const aoa: unknown[][] = [headers.map((label) => ({ v: label, t: 's', s: HEADER_STYLE }))]
  rows.forEach((row) => {
    aoa.push(
      [
        row.area.name,
        row.task.name,
        row.riskDescription,
        row.proposedControls.map((control) => `${control.level}: ${control.description}`).join('\n') || 'Control por definir',
        row.controlHierarchyLevel,
        row.responsible,
        row.deadline,
        actionStatusLabel(row.actionStatus),
        row.verificationStatus,
        row.requiredEvidence.join('\n') || 'No declarada',
      ].map((value) => cell(value as string)),
    )
  })
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  applyTableShape(ws, headers.length, rows.length)
  ws['!cols'] = autoWidths(aoa as Array<Array<{ v: unknown }>>)
  return ws
}

function buildEvidenceSheet(rows: GeneratedAssessment[]): XLSX.WorkSheet {
  const headers = ['Area', 'Tarea', 'Peligro', 'Evidencia requerida', 'Responsable', 'Plazo', 'Estado']
  const aoa: unknown[][] = [headers.map((label) => ({ v: label, t: 's', s: HEADER_STYLE }))]
  rows
    .filter((row) => row.requiredEvidence.length > 0)
    .forEach((row) => {
      aoa.push(
        [
          row.area.name,
          row.task.name,
          row.hazard.name,
          row.requiredEvidence.join('\n'),
          row.responsible,
          row.deadline,
          row.verificationStatus,
        ].map((value) => cell(value as string)),
      )
    })
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  applyTableShape(ws, headers.length, aoa.length - 1)
  ws['!cols'] = autoWidths(aoa as Array<Array<{ v: unknown }>>)
  return ws
}

function buildNormativeSheet(sector: SectorId, rows: GeneratedAssessment[]): XLSX.WorkSheet {
  const headers = ['Norma', 'Nombre corto', 'Modulo', 'Estado de validacion', 'Fuente oficial']
  const module = sectorModules.find((item) => item.id === sector)
  const normIds = module?.normIds ?? []
  const aoa: unknown[][] = [headers.map((label) => ({ v: label, t: 's', s: HEADER_STYLE }))]
  normIds.forEach((id) => {
    const norm = legalNorms.find((item) => item.id === id)
    if (!norm) return
    aoa.push(
      [
        norm.title,
        norm.shortName,
        norm.module,
        norm.sourceStatus === 'internal_verified' ? 'Validado' : 'Requiere validacion legal',
        norm.sourceUrl ?? 'Pendiente de carga oficial',
      ].map((value) => cell(value as string)),
    )
  })
  // Reflect which rows still need legal validation.
  const pending = rows.filter((row) => row.legalValidationMissing).length
  aoa.push([])
  aoa.push([
    {
      v: `Filas con validacion legal pendiente: ${pending}. No se citan articulos sin fuente oficial validada.`,
      t: 's',
      s: { font: { italic: true, color: { rgb: 'FF64748B' } } },
    },
  ])
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!cols'] = autoWidths(aoa as Array<Array<{ v: unknown }>>)
  return ws
}

function buildCatalogSheet(context: ExportContext): XLSX.WorkSheet {
  const { areas, positions, tasks, sector } = context
  const aoa: unknown[][] = [
    [{ v: 'Catalogos del proyecto', t: 's', s: TITLE_STYLE }],
    [],
    [labelCell('Sector'), valueCell(sectorLabel(sector))],
    [],
    [{ v: 'Areas y procesos', t: 's', s: { font: { bold: true } } }],
    ...areas.map((area) => [valueCell(area.name), valueCell(area.process)]),
    [],
    [{ v: 'Puestos de trabajo', t: 's', s: { font: { bold: true } } }],
    ...positions.map((position) => [
      valueCell(position.title),
      valueCell(areas.find((area) => area.id === position.areaId)?.name ?? ''),
      valueCell(`${position.workerCount} trab.`),
    ]),
    [],
    [{ v: 'Tareas', t: 's', s: { font: { bold: true } } }],
    ...tasks.map((task) => [
      valueCell(task.name),
      valueCell(activityLabel(task.activityKind)),
      valueCell(`${task.exposedWorkers} expuestos`),
    ]),
    [],
    [{ v: 'Niveles de riesgo', t: 's', s: { font: { bold: true } } }],
    [valueCell('Bajo'), valueCell('Moderado'), valueCell('Importante'), valueCell('Intolerable')],
  ]
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!cols'] = [{ wch: 36 }, { wch: 30 }, { wch: 20 }, { wch: 16 }]
  return ws
}

function filterRowsForReport(kind: ReportKind, rows: GeneratedAssessment[]): GeneratedAssessment[] {
  const today = new Date().toISOString().slice(0, 10)
  switch (kind) {
    case 'critical':
      return rows.filter((row) => row.initialLevel === 'Intolerable' || row.initialLevel === 'Importante')
    case 'overdue':
      return rows.filter((row) => row.actionStatus === 'overdue' || (row.deadline && row.deadline < today && row.actionStatus !== 'verified'))
    case 'pending-evidence':
      return rows.filter((row) => row.requiredEvidence.length > 0 && row.verificationStatus.includes('Pendiente'))
    case 'legal-pending':
      return rows.filter((row) => row.legalValidationMissing)
    default:
      return rows
  }
}

function newWorkbook(): XLSX.WorkBook {
  return XLSX.utils.book_new()
}

function downloadWorkbook(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename, { bookType: 'xlsx', compression: true })
}

export function exportExcel(context: ExportContext) {
  const wb = newWorkbook()
  XLSX.utils.book_append_sheet(wb, buildSummarySheet(context), 'Resumen')
  XLSX.utils.book_append_sheet(wb, buildMatrixSheet(context.rows), 'Matriz IPERC')
  XLSX.utils.book_append_sheet(wb, buildActionPlanSheet(context.rows), 'Plan de Accion')
  XLSX.utils.book_append_sheet(wb, buildEvidenceSheet(context.rows), 'Evidencias')
  XLSX.utils.book_append_sheet(wb, buildNormativeSheet(context.sector, context.rows), 'Normativa')
  XLSX.utils.book_append_sheet(wb, buildCatalogSheet(context), 'Catalogos')
  downloadWorkbook(wb, buildFileName(context.profile, context.sector, 'xlsx'))
}

export function exportReport(kind: ReportKind, context: ExportContext) {
  if (kind === 'full') return exportExcel(context)
  const rows = filterRowsForReport(kind, context.rows)
  const scoped: ExportContext = { ...context, rows }
  const wb = newWorkbook()

  if (kind === 'executive') {
    XLSX.utils.book_append_sheet(wb, buildSummarySheet(scoped), 'Resumen')
    XLSX.utils.book_append_sheet(wb, buildMatrixSheet(rows), 'Matriz IPERC')
  } else if (kind === 'matrix') {
    XLSX.utils.book_append_sheet(wb, buildMatrixSheet(rows), 'Matriz IPERC')
  } else if (kind === 'action-plan') {
    XLSX.utils.book_append_sheet(wb, buildActionPlanSheet(rows), 'Plan de Accion')
  } else if (kind === 'pending-evidence') {
    XLSX.utils.book_append_sheet(wb, buildEvidenceSheet(rows), 'Evidencias')
  } else if (kind === 'legal-pending') {
    XLSX.utils.book_append_sheet(wb, buildNormativeSheet(context.sector, rows), 'Normativa')
    XLSX.utils.book_append_sheet(wb, buildMatrixSheet(rows), 'Matriz IPERC')
  } else {
    // critical / overdue
    XLSX.utils.book_append_sheet(wb, buildMatrixSheet(rows), 'Matriz IPERC')
    XLSX.utils.book_append_sheet(wb, buildActionPlanSheet(rows), 'Plan de Accion')
  }

  const suffix: Record<ReportKind, string> = {
    full: 'completo',
    executive: 'ejecutivo',
    matrix: 'matriz',
    critical: 'criticos',
    overdue: 'vencidos',
    'pending-evidence': 'evidencias',
    'legal-pending': 'legal',
    'action-plan': 'plan-accion',
  }
  const base = buildFileName(context.profile, context.sector, 'xlsx').replace(/\.xlsx$/, '')
  downloadWorkbook(wb, `${base}_${suffix[kind]}.xlsx`)
}

export function exportCsv(context: ExportContext) {
  const rows = context.rows
  const header = MATRIX_HEADERS
  const body = rows.map((row) => matrixRowCells(row).map((c) => String(c.v ?? '')))
  const csv = [header, ...body].map((line) => line.map(csvEscape).join(',')).join('\n')
  download(buildFileName(context.profile, context.sector, 'csv'), 'text/csv;charset=utf-8', '﻿' + csv)
}

export function exportWord(context: ExportContext) {
  const { profile, rows, sector } = context
  const body = `
    <h1>Informe tecnico IPERC</h1>
    <p><strong>Empresa:</strong> ${escapeHtml(profile.name)} | <strong>RUC:</strong> ${escapeHtml(profile.ruc)} | <strong>Sector:</strong> ${escapeHtml(sectorLabel(sector))}</p>
    <p><strong>Centro de trabajo:</strong> ${escapeHtml(profile.workplace)} | <strong>Trabajadores:</strong> ${profile.workerCount}</p>
    <p><strong>Elaborado por:</strong> ${escapeHtml(profile.preparedBy ?? '')} | <strong>Revisado por:</strong> ${escapeHtml(profile.reviewedBy ?? '')} | <strong>Aprobado por:</strong> ${escapeHtml(profile.approvedBy ?? '')}</p>
    <p><strong>Regla legal:</strong> no se inventan obligaciones. Todo articulo no validado con fuente oficial queda como "Requiere validacion legal".</p>
    ${rows
      .map(
        (row) => `
        <h2>${escapeHtml(row.area.name)} - ${escapeHtml(row.position.title)}</h2>
        <p><strong>Tarea:</strong> ${escapeHtml(row.task.name)}</p>
        <p><strong>Peligro:</strong> ${escapeHtml(row.hazard.name)} | <strong>Riesgo inicial:</strong> ${row.initialLevel} (${row.initialScore}) | <strong>Residual:</strong> ${row.residualLevel} (${row.residualScore})</p>
        <p><strong>Controles propuestos:</strong> ${escapeHtml(row.proposedControls.map((control) => `${control.level}: ${control.description}`).join('; '))}</p>
        <p><strong>Evidencia:</strong> ${escapeHtml(row.requiredEvidence.join('; '))}</p>
        <p><strong>Estado legal:</strong> ${escapeHtml(row.legalValidationStatus === 'validated' ? 'Validado' : 'Requiere validacion legal')}</p>
      `,
      )
      .join('')}
  `
  download(buildFileName(profile, sector, 'doc'), 'application/msword;charset=utf-8', wrapHtml(body))
}

export function printPdfReport() {
  window.print()
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
