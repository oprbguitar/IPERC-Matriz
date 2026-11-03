import { LEGAL_CATEGORY_LABELS, LEGAL_STATUS_LABELS, legalNorms } from '../data/legalDatabase'
import { DIAGNOSTIC_QUESTIONS, DIAGNOSTIC_STATUS_LABELS, OBLIGATION_KIND_LABELS } from '../data/platformContent'
import type { LegalCategory } from '../types'
import { statusForAnswer, type DiagnosticAnswers } from './diagnostic'
import { fineTableMarkdown, UIT_BY_YEAR } from './sunafil'

/**
 * Informes enriquecidos generados en el navegador a partir del catalogo legal
 * y de las respuestas del diagnostico. Devuelven Markdown para docgen.
 */
export interface ReportDefinition {
  id: string
  title: string
  summary: string
  build: (answers: DiagnosticAnswers) => string
}

function today(): string {
  return new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })
}

function profileLine(answers: DiagnosticAnswers): string {
  const pick = (id: string) => {
    const question = DIAGNOSTIC_QUESTIONS.find((item) => item.id === id)
    return question?.options.find((option) => option.value === answers[id])?.label ?? 'No indicado'
  }
  return `| Tipo de organización | ${pick('ownership')} |\n| Trabajadores | ${pick('size')} |\n| Sector | ${pick('sector')} |`
}

export const REPORTS: ReportDefinition[] = [
  {
    id: 'informe-diagnostico',
    title: 'Informe de diagnóstico SST de mi organización',
    summary: 'Estado de cumplimiento según sus respuestas en Mi Ruta, con acciones, responsables, evidencias y normas.',
    build: (answers) => {
      const controls = DIAGNOSTIC_QUESTIONS.filter((question) => question.type === 'control')
      const answered = controls.filter((question) => answers[question.id])
      const counts = { cumple: 0, pendiente: 0, verificar: 0, 'no-aplica': 0 }
      for (const question of answered) counts[statusForAnswer(question.id, answers[question.id]) ?? 'verificar'] += 1
      const evaluable = answered.length - counts['no-aplica']
      const score = evaluable > 0 ? Math.round((counts.cumple / evaluable) * 100) : 0
      const rows = controls
        .map((question) => {
          const status = statusForAnswer(question.id, answers[question.id])
          const outcome = question.outcome
          return `| ${question.question} | ${status ? DIAGNOSTIC_STATUS_LABELS[status] : 'Sin respuesta'} | ${outcome?.action ?? '—'} | ${outcome?.responsible ?? '—'} | ${outcome?.evidence ?? '—'} |`
        })
        .join('\n')
      const pending = answered
        .filter((question) => statusForAnswer(question.id, answers[question.id]) !== 'cumple')
        .map((question, index) => `${index + 1}. **${question.outcome?.action ?? question.question}** — ${question.outcome?.responsible ?? ''}`)
        .join('\n')
      return `# Informe de diagnóstico SST\n\nFecha: ${today()}\n\n## Perfil\n\n| Dato | Valor |\n|---|---|\n${profileLine(answers)}\n\n## Resultado\n\n| Indicador | Valor |\n|---|---|\n| Preguntas respondidas | ${answered.length} de ${controls.length} |\n| Cumple | ${counts.cumple} |\n| Pendiente | ${counts.pendiente} |\n| Por verificar | ${counts.verificar} |\n| No aplica | ${counts['no-aplica']} |\n| **Índice de cumplimiento** | **${score} %** |\n\n## Detalle por requisito\n\n| Requisito | Estado | Acción | Responsable | Evidencia |\n|---|---|---|---|---|\n${rows}\n\n## Plan de acción priorizado\n\n${pending || 'Sin acciones pendientes según sus respuestas.'}\n\n> Complete las preguntas de Mi Ruta para enriquecer este informe.`
    },
  },
  {
    id: 'compendio-normativo',
    title: 'Compendio normativo SST y SSOMA Perú',
    summary: `Todas las normas del catálogo (${legalNorms.length}) agrupadas por tema, con resumen, alcance, estado y enlace oficial.`,
    build: () => {
      const groups = (Object.keys(LEGAL_CATEGORY_LABELS) as LegalCategory[])
        .map((category) => {
          const norms = legalNorms.filter((norm) => norm.category === category)
          if (norms.length === 0) return ''
          const body = norms
            .map(
              (norm) =>
                `### ${norm.shortName}\n\n**${norm.officialTitle}** · ${norm.authority}${norm.publicationDate ? ` · ${norm.publicationDate}` : ''} · ${LEGAL_STATUS_LABELS[norm.effectiveStatus]} · ${OBLIGATION_KIND_LABELS[norm.obligationKind]}\n\n${norm.plainLanguageSummary}\n\n${norm.whatItRegulates.map((item) => `- ${item}`).join('\n')}\n\nAplica a: ${norm.appliesTo.join(', ')}. Fuente oficial: ${norm.officialPageUrl}`,
            )
            .join('\n\n')
          return `## ${LEGAL_CATEGORY_LABELS[category]}\n\n${body}`
        })
        .filter(Boolean)
        .join('\n\n')
      return `# Compendio normativo SST y SSOMA Perú\n\nCorte: ${today()} · ${legalNorms.length} normas y documentos oficiales.\n\n${groups}`
    },
  },
  {
    id: 'expediente-sunafil',
    title: 'Expediente de preparación para inspección SUNAFIL',
    summary: 'Lista de verificación documental, tabla de multas 2026 y riesgos financieros por tamaño de empresa.',
    build: (answers) =>
      `# Expediente de preparación para inspección SUNAFIL\n\nFecha: ${today()} · UIT 2026: S/ ${UIT_BY_YEAR[2026].toLocaleString('es-PE')}\n\n## Perfil\n\n| Dato | Valor |\n|---|---|\n${profileLine(answers)}\n\n## Documentos que debe tener a la mano\n\n| # | Documento | Estado | Observación |\n|---|---|---|---|\n${[
        'Política y objetivos de SST firmados',
        'Reglamento Interno de SST y cargos de entrega',
        'Acta de elección y libro de actas del comité o supervisor',
        'Matriz IPERC por puesto y mapa de riesgos',
        'Plan y programa anual de SST',
        'Programa anual de capacitación y registros firmados (mínimo 4 por trabajador)',
        'Registro de entrega de EPP',
        'Certificados de aptitud de EMO vigentes',
        'Registros de accidentes, incidentes y enfermedades ocupacionales',
        'Registro de monitoreo de agentes ocupacionales',
        'Registro de inspecciones internas',
        'Plan de respuesta ante emergencias y registro de simulacros',
        'Constancias SCTR y verificación de contratistas',
        'Informe de auditoría del SGSST (si corresponde)',
        'Constancia REMYPE vigente (si es MYPE)',
      ]
        .map((item, index) => `| ${index + 1} | ${item} | ☐ | |`)
        .join('\n')}\n\n## Tabla referencial de multas 2026\n\n${fineTableMarkdown(2026)}\n\n## Reglas críticas\n\n- Sin REMYPE vigente antes de la inspección se aplica la tabla de No MYPE.\n- Ante un accidente mortal se consideran afectados todos los trabajadores del centro de trabajo.\n- Las infracciones se multan por separado dentro del mismo procedimiento.`,
  },
]
