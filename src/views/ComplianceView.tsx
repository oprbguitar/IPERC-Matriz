import { AlertTriangle, BadgeCheck, ChevronDown, ClipboardCheck, FileText, Gavel, Scale, ShieldAlert } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  applicableObligations,
  findArticle,
  findFormat,
  findInfraction,
  summarizeCompliance,
  type ApplicableObligation,
  type ComplianceEntry,
  type ComplianceStatus,
  type OrgProfile,
} from '../catalog'
import { DocActions } from '../components/DocReader'
import { findNorm, sectorModules } from '../data/legalDatabase'
import { pushRemote, readLocalCompliance, syncFromRemote, writeLocalCompliance, type ComplianceState } from '../lib/complianceStore'

export type ComplianceTab = 'aplicables' | 'seguimiento'

interface ComplianceViewProps {
  tab: ComplianceTab
  onTabChange: (tab: ComplianceTab) => void
  signedIn: boolean
  onOpenFormat: (formatId: string) => void
}

const STATUS_LABELS: Record<ComplianceStatus, string> = {
  'sin-evaluar': 'Sin evaluar',
  acreditada: 'Acreditada con evidencia',
  parcial: 'Parcial',
  incumplida: 'Incumplida',
  'no-aplica': 'No aplica (justificar)',
}

const SEVERITY_LABEL = { leve: 'Leve', grave: 'Grave', 'muy-grave': 'Muy grave' } as const

function reportMarkdown(profile: OrgProfile, items: ApplicableObligation[], entries: Record<string, ComplianceEntry>): string {
  const summary = summarizeCompliance(items, entries)
  const rows = items
    .map((item) => {
      const entry = entries[item.id]
      const articles = item.articleIds.map((id) => findArticle(id)?.label ?? id).join(', ') || 'Pendiente de validación jurídica'
      return `| ${item.critical ? '**' : ''}${item.title}${item.critical ? '**' : ''} | ${articles} | ${item.infractionCodes.join(', ') || '—'} | ${STATUS_LABELS[entry?.status ?? 'sin-evaluar']} | ${entry?.evidence || '—'} | ${entry?.responsible || item.responsible} |`
    })
    .join('\n')
  return `# Matriz de obligaciones y cumplimiento SST\n\nFecha: ${new Date().toLocaleDateString('es-PE')}\n\n## Perfil\n\n| Dato | Valor |\n|---|---|\n| Tipo | ${profile.ownership === 'publico' ? 'Entidad pública' : 'Empleador privado'} |\n| Trabajadores | ${profile.workers} |\n| Sector | ${sectorModules.find((item) => item.id === profile.sector)?.label ?? profile.sector} |\n| Alto riesgo | ${profile.highRisk ? 'Sí' : 'No'} |\n| Contratistas | ${profile.contractors ? 'Sí' : 'No'} |\n| Teletrabajo | ${profile.telework ? 'Sí' : 'No'} |\n| REMYPE | ${profile.remype ? 'Sí' : 'No'} |\n\n## Resultado\n\n| Indicador | Valor |\n|---|---|\n| Obligaciones aplicables | ${summary.applicable} |\n| Acreditadas con evidencia | ${summary.accredited} (${summary.percent} %) |\n| Parciales | ${summary.partial} |\n| Incumplidas | ${summary.failed} |\n| Sin evaluar | ${summary.unevaluated} |\n| **Críticas abiertas** | **${summary.criticalOpen}** |\n\n## Detalle (en negrita, obligaciones críticas)\n\n| Obligación | Artículo | Infracción RLGIT | Estado | Evidencia | Responsable |\n|---|---|---|---|---|---|\n${rows}\n\n> El porcentaje cuenta obligaciones acreditadas con evidencia, no documentos presentes. Las obligaciones sin artículo verificado requieren validación jurídica.`
}

export function ComplianceView({ tab, onTabChange, signedIn, onOpenFormat }: ComplianceViewProps) {
  const [state, setState] = useState<ComplianceState>(readLocalCompliance)
  const [open, setOpen] = useState<string | null>(null)
  const [onlyCritical, setOnlyCritical] = useState(false)

  useEffect(() => {
    if (signedIn) void syncFromRemote(readLocalCompliance()).then(setState)
  }, [signedIn])

  function update(next: ComplianceState) {
    const stamped = { ...next, updatedAt: new Date().toISOString() }
    setState(stamped)
    writeLocalCompliance(stamped)
    if (signedIn) pushRemote(stamped)
  }

  const items = useMemo(() => applicableObligations(state.profile), [state.profile])
  const summary = summarizeCompliance(items, state.entries)
  const verifiedCount = items.filter((item) => item.trace === 'articulo-verificado').length
  const visible = onlyCritical ? items.filter((item) => item.critical) : items
  const profile = state.profile

  function setProfile(patch: Partial<OrgProfile>) {
    update({ ...state, profile: { ...profile, ...patch } })
  }

  function setEntry(id: string, patch: Partial<ComplianceEntry>) {
    const current = state.entries[id] ?? { status: 'sin-evaluar', evidence: '', responsible: '', updatedAt: '' }
    update({ ...state, entries: { ...state.entries, [id]: { ...current, ...patch, updatedAt: new Date().toISOString().slice(0, 10) } } })
  }

  return (
    <div className="view-page compliance">
      <header className="page-head">
        <div>
          <span className="eyebrow"><Scale size={15} aria-hidden="true" /> {tab === 'aplicables' ? 'Diagnosticar' : 'Verificar'}</span>
          <h1>{tab === 'aplicables' ? 'Obligaciones aplicables' : 'Seguimiento de cumplimiento'}</h1>
          <p>
            {tab === 'aplicables'
              ? 'Describa su organización: el motor indica qué obligaciones aplican, por qué, con qué artículo, qué evidencia conservar y qué infracción se arriesga.'
              : 'Registre el estado, la evidencia y el responsable de cada obligación. Solo cuenta como acreditada la que tiene evidencia.'}
          </p>
        </div>
        <div className="tab-switch" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'aplicables'} className={tab === 'aplicables' ? 'active' : ''} onClick={() => onTabChange('aplicables')}>Aplicables</button>
          <button type="button" role="tab" aria-selected={tab === 'seguimiento'} className={tab === 'seguimiento' ? 'active' : ''} onClick={() => onTabChange('seguimiento')}>Seguimiento</button>
        </div>
      </header>

      <section className="org-profile" aria-label="Perfil de la organización">
        <label><span>Tipo</span>
          <select value={profile.ownership} onChange={(event) => setProfile({ ownership: event.target.value as OrgProfile['ownership'] })}>
            <option value="privado">Empleador privado</option>
            <option value="publico">Entidad pública</option>
          </select>
        </label>
        <label><span>Trabajadores</span>
          <input type="number" min={1} value={profile.workers} onChange={(event) => setProfile({ workers: Math.max(1, Number(event.target.value) || 1) })} />
        </label>
        <label><span>Actividad</span>
          <select value={profile.sector} onChange={(event) => setProfile({ sector: event.target.value as OrgProfile['sector'] })}>
            {sectorModules.map((module) => <option key={module.id} value={module.id}>{module.label}</option>)}
          </select>
        </label>
        {([
          ['highRisk', 'Actividades de riesgo / SCTR'],
          ['contractors', 'Contratistas o terceros'],
          ['telework', 'Personal en teletrabajo'],
          ['remype', 'Inscrita en REMYPE'],
          ['standingWork', 'Puestos de pie 3 h continuas o más (Ley 32721)'],
          ['sunExposure', 'Trabajo al sol entre 10:00 y 16:00 (D.S. 003-2026-SA)'],
        ] as const).map(([key, label]) => (
          <label className="check" key={key}>
            <input type="checkbox" checked={Boolean(profile[key])} onChange={(event) => setProfile({ [key]: event.target.checked })} /> {label}
          </label>
        ))}
      </section>

      <section className="compliance-summary">
        <div><b>{items.length}</b><small>obligaciones aplicables</small></div>
        <div><b>{verifiedCount}</b><small>con artículo verificado</small></div>
        <div className="accent"><b>{summary.percent}%</b><small>acreditadas con evidencia</small></div>
        <div className={summary.criticalOpen ? 'danger' : 'ok'}><b>{summary.criticalOpen}</b><small>críticas sin acreditar</small></div>
        <div><b>{summary.partial}</b><small>parciales</small></div>
        <div><b>{summary.failed}</b><small>incumplidas</small></div>
        <DocActions id="matriz-obligaciones" title="Matriz de obligaciones y cumplimiento SST" markdown={reportMarkdown(profile, items, state.entries)} compact />
      </section>

      <label className="check filter-critical">
        <input type="checkbox" checked={onlyCritical} onChange={(event) => setOnlyCritical(event.target.checked)} /> Mostrar solo obligaciones críticas
      </label>

      <ol className="obligation-cards">
        {visible.map((item) => {
          const entry = state.entries[item.id]
          const status = entry?.status ?? 'sin-evaluar'
          const isOpen = open === item.id
          return (
            <li key={item.id} className={`ob-card ${status} ${item.critical ? 'critical' : ''}`}>
              <button type="button" className="ob-head" onClick={() => setOpen(isOpen ? null : item.id)} aria-expanded={isOpen}>
                <span className="ob-title">
                  {item.critical && <ShieldAlert size={15} aria-hidden="true" />}
                  <b>{item.title}</b>
                  <small>{item.reason}</small>
                </span>
                <span className={`trace ${item.trace}`}>{item.trace === 'articulo-verificado' ? 'Artículo verificado' : 'Validación jurídica pendiente'}</span>
                {tab === 'seguimiento' && <span className={`ob-status ${status}`}>{STATUS_LABELS[status]}</span>}
                <ChevronDown size={16} className={isOpen ? 'rotated' : ''} aria-hidden="true" />
              </button>

              {tab === 'seguimiento' && (
                <div className="ob-track">
                  <select value={status} onChange={(event) => setEntry(item.id, { status: event.target.value as ComplianceStatus })} aria-label="Estado">
                    {(Object.keys(STATUS_LABELS) as ComplianceStatus[]).map((key) => <option key={key} value={key}>{STATUS_LABELS[key]}</option>)}
                  </select>
                  <input placeholder="Evidencia (documento, registro, acta, fecha)" value={entry?.evidence ?? ''} onChange={(event) => setEntry(item.id, { evidence: event.target.value })} />
                  <input placeholder={`Responsable (${item.responsible})`} value={entry?.responsible ?? ''} onChange={(event) => setEntry(item.id, { responsible: event.target.value })} />
                  {status === 'acreditada' && !entry?.evidence.trim() && <small className="warn">Sin evidencia no se cuenta como acreditada.</small>}
                </div>
              )}

              {isOpen && (
                <div className="ob-body">
                  <p className="ob-req">{item.requirement}</p>
                  <div className="ob-grid">
                    <section>
                      <h4><Scale size={14} aria-hidden="true" /> Fundamento</h4>
                      {item.articleIds.length === 0 && (
                        <p className="muted">
                          Normas: {item.normIds.map((id) => findNorm(id)?.shortName ?? id).join(', ') || 'por identificar'}. Artículo pendiente de validación jurídica.
                        </p>
                      )}
                      {item.articleIds.map((id) => {
                        const article = findArticle(id)
                        if (!article) return null
                        return (
                          <details key={id} className="article">
                            <summary><b>{findNorm(article.normId)?.shortName} · {article.label}</b> {article.title}</summary>
                            <p>{article.plainLanguage}</p>
                            <blockquote>“{article.excerpt}”</blockquote>
                            <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer">Texto oficial (PDF)</a>
                            {article.amendedBy && <small> · Modificatorias a revisar: {article.amendedBy.map((norm) => findNorm(norm)?.shortName ?? norm).join(', ')}</small>}
                          </details>
                        )
                      })}
                    </section>
                    <section>
                      <h4><ClipboardCheck size={14} aria-hidden="true" /> Evidencia a conservar</h4>
                      <ul>{item.evidence.map((evidence) => <li key={evidence}>{evidence}</li>)}</ul>
                      <p className="muted">Frecuencia: {item.frequency} · Responsable: {item.responsible}</p>
                    </section>
                    <section>
                      <h4><Gavel size={14} aria-hidden="true" /> Infracción en juego (RLGIT)</h4>
                      {item.infractionCodes.length === 0 && <p className="muted">Sin numeral identificado.</p>}
                      <ul>
                        {item.infractionCodes.map((code) => {
                          const infraction = findInfraction(code)
                          return infraction ? <li key={code}><em className={`sev ${infraction.severity}`}>{code} · {SEVERITY_LABEL[infraction.severity]}</em> {infraction.text}</li> : null
                        })}
                      </ul>
                    </section>
                    <section>
                      <h4><FileText size={14} aria-hidden="true" /> Formatos</h4>
                      <div className="guide-norms">
                        {item.formatIds.map((id) => {
                          const format = findFormat(id)
                          return format ? <button type="button" key={id} className="chip-link" onClick={() => onOpenFormat(id)}>{format.name}</button> : null
                        })}
                        {item.formatIds.length === 0 && <span>Sin formato asociado</span>}
                      </div>
                    </section>
                  </div>
                  {item.exceptions && <p className="ob-exception"><AlertTriangle size={14} aria-hidden="true" /> {item.exceptions}</p>}
                </div>
              )}
            </li>
          )
        })}
      </ol>
      <p className="site-disclaimer">
        <BadgeCheck size={14} aria-hidden="true" /> "Artículo verificado" significa que el texto citado se cotejó con el PDF oficial; no reemplaza la validación jurídica del caso concreto.
        {signedIn ? ' Su avance se guarda en su cuenta.' : ' Su avance se guarda en este navegador; inicie sesión Premium para guardarlo en la nube.'}
      </p>
    </div>
  )
}

export default ComplianceView
