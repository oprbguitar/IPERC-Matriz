import { Activity, Building2, CalendarClock, Gavel, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import {
  BRACKETS,
  computeFine,
  FINE_TABLE,
  formatSoles,
  SEVERITY_LABELS,
  SIZE_LABELS,
  UIT_BY_YEAR,
  type CompanySize,
  type Severity,
} from '../lib/sunafil'
import type { GeneratedAssessment } from '../types'

interface AnalyticsViewProps {
  rows: GeneratedAssessment[]
  workerCount: number
  onOpenGuide?: (guideId: string) => void
}

/**
 * Analitica SST: calculadoras de contingencia SUNAFIL, organizacion exigible
 * segun tamano, indicadores de accidentabilidad y exposicion por nivel de riesgo.
 */
export function AnalyticsView({ rows, workerCount, onOpenGuide }: AnalyticsViewProps) {
  return (
    <section className="analytics">
      <header className="view-header">
        <h2>Analítica SST</h2>
        <p>Calculadoras con la normativa peruana: contingencia de multas, organización exigible e indicadores.</p>
      </header>
      <div className="analytics-grid">
        <FineCalculator workerCount={workerCount} onOpenGuide={onOpenGuide} />
        <OrganizationCalculator defaultWorkers={workerCount} />
        <IndicatorCalculator />
        <ExposureMatrix rows={rows} />
      </div>
    </section>
  )
}

function FineCalculator({ workerCount, onOpenGuide }: { workerCount: number; onOpenGuide?: (id: string) => void }) {
  const [size, setSize] = useState<CompanySize>('no-mype')
  const [severity, setSeverity] = useState<Severity>('grave')
  const [affected, setAffected] = useState(Math.min(workerCount, 10) || 1)
  const [year, setYear] = useState(2026)
  const [mortal, setMortal] = useState(false)

  const effectiveAffected = mortal ? Math.max(workerCount, affected) : affected
  const result = computeFine(size, mortal ? 'muy-grave' : severity, effectiveAffected, year)
  // Sin REMYPE vigente la autoridad aplica la tabla No MYPE.
  const withoutRemype = size !== 'no-mype' ? computeFine('no-mype', mortal ? 'muy-grave' : severity, effectiveAffected, year) : null
  const values = FINE_TABLE[size][mortal ? 'muy-grave' : severity]
  const max = Math.max(...values)

  return (
    <article className="an-card wide">
      <h3><Gavel size={18} aria-hidden="true" /> Calculadora de multas SUNAFIL</h3>
      <div className="an-form">
        <label><span>Tamaño</span>
          <select value={size} onChange={(event) => setSize(event.target.value as CompanySize)}>
            {(Object.keys(SIZE_LABELS) as CompanySize[]).map((key) => <option key={key} value={key}>{SIZE_LABELS[key]}</option>)}
          </select>
        </label>
        <label><span>Gravedad</span>
          <select value={severity} disabled={mortal} onChange={(event) => setSeverity(event.target.value as Severity)}>
            {(Object.keys(SEVERITY_LABELS) as Severity[]).map((key) => <option key={key} value={key}>{SEVERITY_LABELS[key]}</option>)}
          </select>
        </label>
        <label><span>Afectados</span>
          <input type="number" min={1} value={affected} onChange={(event) => setAffected(Math.max(1, Number(event.target.value) || 1))} />
        </label>
        <label><span>Año UIT</span>
          <select value={year} onChange={(event) => setYear(Number(event.target.value))}>
            {Object.keys(UIT_BY_YEAR).map((key) => <option key={key} value={key}>{key} · S/ {UIT_BY_YEAR[Number(key)].toLocaleString('es-PE')}</option>)}
          </select>
        </label>
        <label className="check"><input type="checkbox" checked={mortal} onChange={(event) => setMortal(event.target.checked)} /> Accidente mortal (afecta a toda la plantilla)</label>
      </div>
      <div className="fine-result">
        <div>
          <small>Multa estimada por infracción</small>
          <strong>{formatSoles(result.soles)}</strong>
          <span>{result.uit} UIT · tramo {result.bracket}{mortal ? ` · ${effectiveAffected} trabajadores` : ''}</span>
        </div>
        {withoutRemype && (
          <div className="warn">
            <small>Sin REMYPE vigente</small>
            <strong>{formatSoles(withoutRemype.soles)}</strong>
            <span>+{Math.round(((withoutRemype.soles - result.soles) / result.soles) * 100)} % de sobrecosto</span>
          </div>
        )}
      </div>
      <div className="fine-bars" aria-label="Escala de multas por tramo">
        {values.map((value, index) => (
          <div key={BRACKETS[size][index].label} className={BRACKETS[size][index].label === result.bracket ? 'current' : ''} title={`${BRACKETS[size][index].label}: ${value} UIT`}>
            <i style={{ height: `${Math.max(6, (value / max) * 100)}%` }} />
            <span>{BRACKETS[size][index].label.replace(' y más', '+')}</span>
          </div>
        ))}
      </div>
      <p className="an-note">
        Tabla referencial del art. 48 del D.S. N.° 019-2006-TR (modif. D.S. N.° 008-2020-TR). Verifique la tabla vigente.{' '}
        {onOpenGuide && <button type="button" className="link-button" onClick={() => onOpenGuide('guia-sunafil')}>Ver guía SUNAFIL</button>}
      </p>
    </article>
  )
}

function OrganizationCalculator({ defaultWorkers }: { defaultWorkers: number }) {
  const [workers, setWorkers] = useState(defaultWorkers || 1)
  const [highRisk, setHighRisk] = useState(false)
  const committee = workers >= 20
  const members = committee ? Math.min(12, Math.max(4, Math.ceil(workers / 50) * 2)) : 0
  const audit = workers <= 10 && !highRisk ? 'Exonerada (salvo requerimiento)' : highRisk ? 'Cada 2 años' : 'Cada 3 años'

  const rows: Array<[string, string, boolean]> = [
    ['Órgano de participación', committee ? `Comité paritario (sugerido ${members} miembros, mín. 4 – máx. 12)` : 'Supervisor de SST elegido por los trabajadores', true],
    ['Reglamento Interno de SST (RISST)', committee ? 'Obligatorio' : 'No obligatorio (recomendado)', committee],
    ['Reuniones del comité', committee ? 'Ordinaria mensual con acta' : 'Reportes del supervisor', true],
    ['Capacitaciones por trabajador', 'Mínimo 4 al año', true],
    ['Auditoría externa del SGSST', audit, !(workers <= 10 && !highRisk)],
    ['SCTR', highRisk ? 'Obligatorio para actividades de riesgo' : 'Según actividad (anexo 5 D.S. 009-97-SA)', highRisk],
  ]

  return (
    <article className="an-card">
      <h3><Users size={18} aria-hidden="true" /> Organización exigible</h3>
      <div className="an-form">
        <label><span>Trabajadores</span><input type="number" min={1} value={workers} onChange={(event) => setWorkers(Math.max(1, Number(event.target.value) || 1))} /></label>
        <label className="check"><input type="checkbox" checked={highRisk} onChange={(event) => setHighRisk(event.target.checked)} /> Actividad de alto riesgo</label>
      </div>
      <ul className="org-list">
        {rows.map(([label, value, required]) => (
          <li key={label} className={required ? 'req' : ''}><span>{label}</span><b>{value}</b></li>
        ))}
      </ul>
    </article>
  )
}

function IndicatorCalculator() {
  const [hours, setHours] = useState(200000)
  const [accidents, setAccidents] = useState(2)
  const [days, setDays] = useState(30)
  const frequency = hours > 0 ? (accidents * 1_000_000) / hours : 0
  const severity = hours > 0 ? (days * 1_000_000) / hours : 0
  const accidentability = (frequency * severity) / 1000

  return (
    <article className="an-card">
      <h3><Activity size={18} aria-hidden="true" /> Indicadores de accidentabilidad</h3>
      <div className="an-form">
        <label><span>Horas-hombre</span><input type="number" min={1} value={hours} onChange={(event) => setHours(Number(event.target.value) || 0)} /></label>
        <label><span>Accid. incapacitantes</span><input type="number" min={0} value={accidents} onChange={(event) => setAccidents(Number(event.target.value) || 0)} /></label>
        <label><span>Días perdidos</span><input type="number" min={0} value={days} onChange={(event) => setDays(Number(event.target.value) || 0)} /></label>
      </div>
      <dl className="kpi-trio">
        <div><dt>IF</dt><dd>{frequency.toFixed(2)}</dd><small>acc. × 10⁶ / HHT</small></div>
        <div><dt>IS</dt><dd>{severity.toFixed(1)}</dd><small>días × 10⁶ / HHT</small></div>
        <div><dt>IA</dt><dd>{accidentability.toFixed(2)}</dd><small>IF × IS / 1000</small></div>
      </dl>
    </article>
  )
}

const LEVELS = ['Bajo', 'Moderado', 'Importante', 'Intolerable'] as const

function ExposureMatrix({ rows }: { rows: GeneratedAssessment[] }) {
  const data = useMemo(
    () =>
      LEVELS.map((level) => ({
        level,
        initial: rows.filter((row) => row.initialLevel === level).length,
        residual: rows.filter((row) => row.residualLevel === level).length,
        exposed: rows.filter((row) => row.initialLevel === level).reduce((sum, row) => sum + (row.task.exposedWorkers || 0), 0),
      })),
    [rows],
  )
  const max = Math.max(1, ...data.map((item) => Math.max(item.initial, item.residual)))

  return (
    <article className="an-card wide">
      <h3><Building2 size={18} aria-hidden="true" /> Riesgo inicial vs. residual de su matriz</h3>
      <div className="exposure-chart">
        {data.map((item) => (
          <div key={item.level} className={`exp-col ${item.level.toLowerCase()}`}>
            <div className="exp-bars">
              <i className="initial" style={{ height: `${(item.initial / max) * 100}%` }} title={`Inicial: ${item.initial}`} />
              <i className="residual" style={{ height: `${(item.residual / max) * 100}%` }} title={`Residual: ${item.residual}`} />
            </div>
            <b>{item.level}</b>
            <small>{item.initial} → {item.residual} · {item.exposed} expuestos</small>
          </div>
        ))}
      </div>
      <p className="an-note"><CalendarClock size={13} aria-hidden="true" /> Barra oscura: riesgo inicial. Barra clara: riesgo residual tras controles propuestos.</p>
    </article>
  )
}

export default AnalyticsView
