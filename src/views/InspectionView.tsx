import { BookOpenCheck, ExternalLink, FolderKanban, Gavel, Plus, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { BINDING_LABELS, CASES, findArticle, findInfraction, INFRACTIONS, OBLIGATIONS, type CaseItem } from '../catalog'
import { SUNAFIL_NORMS_SEARCH } from '../catalog/cases'
import { ContingencyCalculator } from '../components/ContingencyCalculator'
import { DocActions } from '../components/DocReader'
import { findNorm } from '../data/legalDatabase'

export type InspectionTab = 'contingencia' | 'expediente' | 'casos'

interface InspectionViewProps {
  tab: InspectionTab
  onTabChange: (tab: InspectionTab) => void
  onOpenGuide: (id: string) => void
}

const CLASSIFICATIONS = [
  'Ausencia de la obligación',
  'Cumplimiento incompleto',
  'Deficiencia documental (se cumplió pero no se acredita)',
  'Controles preventivos insuficientes',
  'Observación no corresponde (sustentar)',
] as const

interface TimelineRow {
  fecha: string
  actuacion: string
  medio: string
  plazo: string
}

interface ObservationRow {
  descripcion: string
  obligacion: string
  clasificacion: string
  evidencia: string
  medida: string
  responsable: string
  fecha: string
}

interface Dossier {
  orden: string
  materia: string
  hechos: string
  timeline: TimelineRow[]
  observations: ObservationRow[]
}

const KEY = 'observatorio-sst:expediente'
const EMPTY: Dossier = { orden: '', materia: '', hechos: '', timeline: [], observations: [] }

function readDossier(): Dossier {
  try {
    return { ...EMPTY, ...(JSON.parse(window.localStorage.getItem(KEY) ?? '{}') as Partial<Dossier>) }
  } catch {
    return EMPTY
  }
}

function dossierMarkdown(dossier: Dossier): string {
  const timeline = dossier.timeline.map((row) => `| ${row.fecha} | ${row.actuacion} | ${row.medio} | ${row.plazo} |`).join('\n')
  const observations = dossier.observations
    .map((row, index) => {
      const obligation = OBLIGATIONS.find((item) => item.id === row.obligacion)
      const articles = obligation?.articleIds.map((id) => `${findNorm(findArticle(id)?.normId ?? '')?.shortName ?? ''} ${findArticle(id)?.label ?? ''}`).join('; ') || 'Validación jurídica pendiente'
      const infractions = obligation?.infractionCodes.map((code) => `${code} (${findInfraction(code)?.severity ?? ''})`).join(', ') || '—'
      return `### Observación ${index + 1}: ${row.descripcion || '—'}\n\n| Campo | Detalle |\n|---|---|\n| Obligación vinculada | ${obligation?.title ?? 'No asignada'} |\n| Fundamento | ${articles} |\n| Infracción potencial | ${infractions} |\n| Clasificación | ${row.clasificacion || '—'} |\n| Evidencia preexistente | ${row.evidencia || '—'} |\n| Medida correctiva | ${row.medida || '—'} |\n| Responsable / fecha | ${row.responsable || '—'} / ${row.fecha || '—'} |`
    })
    .join('\n\n')
  const topics = new Set(dossier.observations.flatMap((row) => OBLIGATIONS.find((item) => item.id === row.obligacion)?.domain ?? []))
  const cases = CASES.filter((item) => item.topics.some((topic) => topics.has(topic)) || item.topics.includes('defensa'))
    .map((item) => `- ${item.reference} (${BINDING_LABELS[item.binding]}${item.verification === 'reportado-sin-cotejar' ? ', texto no cotejado' : ''}): ${item.criterion}`)
    .join('\n')
  return `# Expediente de fiscalización — ${dossier.orden || 'sin número'}\n\nMateria: ${dossier.materia || '—'}\n\n> Documento de trabajo para revisión profesional (técnica y jurídica). No es un descargo final ni sustituye el análisis de un abogado.\n\n## Hechos\n\n${dossier.hechos || '—'}\n\n## Cronología de actuaciones\n\n| Fecha | Actuación | Medio de notificación | Plazo |\n|---|---|---|---|\n${timeline || '| — | — | — | — |'}\n\n## Observaciones, fundamento y plan correctivo\n\n${observations || 'Sin observaciones registradas.'}\n\n## Casuística a revisar\n\n${cases}\n\n## Lista de control\n\n- [ ] Cada hecho imputado encaja exactamente en el numeral tipificado (tipicidad).\n- [ ] El número de trabajadores afectados está justificado.\n- [ ] La evidencia preexistente tiene fecha anterior a la inspección.\n- [ ] Las medidas correctivas protegen de inmediato a los trabajadores.\n- [ ] Las notificaciones se recibieron por los medios y plazos debidos.`
}

export function InspectionView({ tab, onTabChange, onOpenGuide }: InspectionViewProps) {
  const [dossier, setDossier] = useState<Dossier>(readDossier)
  const [caseQuery, setCaseQuery] = useState('')

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(dossier))
    } catch {
      // Sin almacenamiento local.
    }
  }, [dossier])

  const cases = useMemo(
    () => CASES.filter((item) => `${item.reference} ${item.criterion} ${item.topics.join(' ')}`.toLowerCase().includes(caseQuery.toLowerCase())),
    [caseQuery],
  )

  function setTimeline(index: number, patch: Partial<TimelineRow>) {
    setDossier({ ...dossier, timeline: dossier.timeline.map((row, i) => (i === index ? { ...row, ...patch } : row)) })
  }
  function setObservation(index: number, patch: Partial<ObservationRow>) {
    setDossier({ ...dossier, observations: dossier.observations.map((row, i) => (i === index ? { ...row, ...patch } : row)) })
  }

  return (
    <div className="view-page inspection">
      <header className="page-head">
        <div>
          <span className="eyebrow"><Gavel size={15} aria-hidden="true" /> Verificar</span>
          <h1>Centro de fiscalización</h1>
          <p>Prevenga incumplimientos, estime contingencias por infracción tipificada y ordene un expediente documentado para revisión profesional. No es una herramienta para eludir inspecciones.</p>
        </div>
        <div className="tab-switch" role="tablist">
          {([
            ['contingencia', 'Contingencia'],
            ['expediente', 'Expediente'],
            ['casos', 'Casuística'],
          ] as const).map(([key, label]) => (
            <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? 'active' : ''} onClick={() => onTabChange(key)}>{label}</button>
          ))}
        </div>
      </header>

      {tab === 'contingencia' && <ContingencyCalculator defaultWorkers={35} onOpenGuide={onOpenGuide} />}

      {tab === 'expediente' && (
        <section className="dossier">
          <div className="dossier-head">
            <label><span>Orden de inspección / expediente</span><input value={dossier.orden} onChange={(event) => setDossier({ ...dossier, orden: event.target.value })} /></label>
            <label><span>Materia</span><input value={dossier.materia} onChange={(event) => setDossier({ ...dossier, materia: event.target.value })} placeholder="Ej.: IPERC desactualizado en almacén" /></label>
            <DocActions id="expediente-fiscalizacion" title={`Expediente de fiscalización ${dossier.orden}`} markdown={dossierMarkdown(dossier)} compact />
          </div>
          <label className="block"><span>Hechos (qué constató el inspector, con fechas)</span><textarea rows={3} value={dossier.hechos} onChange={(event) => setDossier({ ...dossier, hechos: event.target.value })} /></label>

          <h3><FolderKanban size={16} aria-hidden="true" /> Cronología</h3>
          <div className="md-table">
            <table>
              <thead><tr><th>Fecha</th><th>Actuación (requerimiento, acta, descargo)</th><th>Medio de notificación</th><th>Plazo</th><th aria-label="Acciones" /></tr></thead>
              <tbody>
                {dossier.timeline.map((row, index) => (
                  <tr key={index}>
                    <td><input type="date" value={row.fecha} onChange={(event) => setTimeline(index, { fecha: event.target.value })} /></td>
                    <td><input value={row.actuacion} onChange={(event) => setTimeline(index, { actuacion: event.target.value })} /></td>
                    <td><input value={row.medio} onChange={(event) => setTimeline(index, { medio: event.target.value })} placeholder="Casilla electrónica, presencial…" /></td>
                    <td><input value={row.plazo} onChange={(event) => setTimeline(index, { plazo: event.target.value })} /></td>
                    <td><button type="button" className="icon-btn danger" aria-label="Eliminar" onClick={() => setDossier({ ...dossier, timeline: dossier.timeline.filter((_, i) => i !== index) })}><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="btn-secondary small" onClick={() => setDossier({ ...dossier, timeline: [...dossier.timeline, { fecha: '', actuacion: '', medio: '', plazo: '' }] })}><Plus size={14} /> Agregar actuación</button>

          <h3><BookOpenCheck size={16} aria-hidden="true" /> Observaciones y plan correctivo</h3>
          {dossier.observations.map((row, index) => (
            <div key={index} className="obs-card">
              <label className="block"><span>Observación</span><input value={row.descripcion} onChange={(event) => setObservation(index, { descripcion: event.target.value })} /></label>
              <label><span>Obligación vinculada</span>
                <select value={row.obligacion} onChange={(event) => setObservation(index, { obligacion: event.target.value })}>
                  <option value="">—</option>
                  {OBLIGATIONS.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
                </select>
              </label>
              <label><span>Clasificación</span>
                <select value={row.clasificacion} onChange={(event) => setObservation(index, { clasificacion: event.target.value })}>
                  <option value="">—</option>
                  {CLASSIFICATIONS.map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label><span>Evidencia preexistente</span><input value={row.evidencia} onChange={(event) => setObservation(index, { evidencia: event.target.value })} /></label>
              <label><span>Medida correctiva</span><input value={row.medida} onChange={(event) => setObservation(index, { medida: event.target.value })} /></label>
              <label><span>Responsable</span><input value={row.responsable} onChange={(event) => setObservation(index, { responsable: event.target.value })} /></label>
              <label><span>Fecha compromiso</span><input type="date" value={row.fecha} onChange={(event) => setObservation(index, { fecha: event.target.value })} /></label>
              <button type="button" className="icon-btn danger" aria-label="Eliminar observación" onClick={() => setDossier({ ...dossier, observations: dossier.observations.filter((_, i) => i !== index) })}><Trash2 size={14} /></button>
            </div>
          ))}
          <button type="button" className="btn-secondary small" onClick={() => setDossier({ ...dossier, observations: [...dossier.observations, { descripcion: '', obligacion: '', clasificacion: '', evidencia: '', medida: '', responsable: '', fecha: '' }] })}><Plus size={14} /> Agregar observación</button>
        </section>
      )}

      {tab === 'casos' && (
        <section className="cases">
          <input className="search-plain" value={caseQuery} onChange={(event) => setCaseQuery(event.target.value)} placeholder="Buscar por tema (iperc, epp, salud mental, causalidad, multas…)" />
          <div className="case-grid">
            {cases.map((item) => (
              <article key={item.id} className={`case-card ${item.binding} ${item.verification}`}>
                <header>
                  <span className={`binding ${item.binding}`}>{BINDING_LABELS[item.binding]}</span>
                  <span className={`verif ${item.verification}`}>{item.verification === 'ficha-oficial-verificada' ? 'Ficha oficial enlazada' : 'Reportado · texto no cotejado'}</span>
                </header>
                <h3>{item.reference}</h3>
                <small>{item.body} · {item.year}</small>
                <p>{item.criterion}</p>
                <p className="case-use"><b>Uso en la plataforma:</b> {item.platformUse}</p>
                <div className="guide-norms">{item.topics.map((topic) => <span key={topic}>{topic}</span>)}</div>
                <CaseDetail item={item} />
                <a href={item.url ?? SUNAFIL_NORMS_SEARCH} target="_blank" rel="noopener noreferrer"><ExternalLink size={13} aria-hidden="true" /> {item.url ? 'Documento oficial' : 'Buscar en SUNAFIL'}</a>
              </article>
            ))}
          </div>
          <p className="site-disclaimer">Los criterios marcados "reportado" provienen de los informes entregados y deben leerse en su texto íntegro antes de citarse. Una resolución de sala no vinculante solo orienta el análisis del caso concreto.</p>
        </section>
      )}
    </div>
  )
}

const BINDING_HELP: Record<CaseItem['binding'], string> = {
  'precedente-vinculante': 'Lo fijó la Sala Plena del Tribunal de Fiscalización Laboral: la inspección y las instancias de SUNAFIL deben aplicarlo en casos iguales.',
  'no-vinculante': 'Resolución de una sala del Tribunal: muestra cómo se razonó un caso, pero no obliga en otros. Úsela como orientación.',
  judicial: 'Pronunciamiento del Poder Judicial: pesa en el análisis, pero hay que revisar si fija doctrina para casos similares.',
  'norma-administrativa': 'Disposición de SUNAFIL que ordena cómo actúa la inspección: conviene conocerla para preparar la defensa.',
}

/** Detalle plegable del caso: cómo leerlo, obligaciones e infracciones relacionadas, qué hacer. */
function CaseDetail({ item }: { item: CaseItem }) {
  const topics = item.topics.map((topic) => topic.toLowerCase())
  const related = OBLIGATIONS.filter((obligation) => topics.some((topic) => obligation.domain.includes(topic) || obligation.title.toLowerCase().includes(topic))).slice(0, 4)
  const infractions = INFRACTIONS.filter((infraction) => infraction.topics.some((topic) => topics.includes(topic))).slice(0, 4)
  return (
    <details className="case-detail">
      <summary>Ver detalle del caso</summary>
      <dl>
        <div>
          <dt>Qué tipo de pronunciamiento es</dt>
          <dd>{BINDING_HELP[item.binding]}</dd>
        </div>
        <div>
          <dt>Criterio</dt>
          <dd>{item.criterion}</dd>
        </div>
        <div>
          <dt>Qué hacer en su organización</dt>
          <dd>{item.platformUse}</dd>
        </div>
        {related.length > 0 && (
          <div>
            <dt>Obligaciones relacionadas</dt>
            <dd>
              <ul>
                {related.map((obligation) => (
                  <li key={obligation.id}>
                    {obligation.title} — <small>{obligation.evidence.slice(0, 2).join('; ')}</small>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
        {infractions.length > 0 && (
          <div>
            <dt>Infracciones que suelen imputarse</dt>
            <dd>
              <ul>
                {infractions.map((infraction) => (
                  <li key={infraction.code}>
                    <b>{infraction.code}</b> ({infraction.severity}): {infraction.text}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
        <div>
          <dt>Estado de verificación</dt>
          <dd>
            {item.verification === 'ficha-oficial-verificada'
              ? 'La ficha oficial existe y está enlazada. Lea el texto íntegro antes de citarlo en un descargo.'
              : 'Caso reportado en los informes entregados: el texto íntegro aún no fue cotejado. No lo cite sin leerlo en la fuente.'}
          </dd>
        </div>
      </dl>
    </details>
  )
}

export default InspectionView
