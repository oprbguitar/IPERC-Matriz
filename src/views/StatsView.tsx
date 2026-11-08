import { AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, Crown, ExternalLink, Lock, Loader2, MapPin, ShieldAlert, Sparkles } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { ApiUser } from '../lib/api'
import { markdownToHtml } from '../lib/markdown'
import '../styles/stats.css'

interface Row { label: string; value: number; parent?: boolean; mortales?: number; accidentes?: number; incidentes?: number; enfermedades?: number; afectados?: number }
interface Totals { mortales: number; accidentes: number; incidentes: number; enfermedades: number; total: number }
interface Month {
  period: string; year: number; month: number; source: string; pdf: string | null; totales: Totals
  regiones?: Row[]; actividades?: Row[]; categorias?: Row[]; turno?: Row[]; tipos?: Row[]; agentes?: Row[]; cuerpo?: Row[]; lesion?: Row[]
  consecuencias?: Row[]; mortalesTipo?: Row[]; mortalesAgente?: Row[]; incidentes?: Row[]; enfermedades?: Row[]
}
interface Dataset { generated: string; source: string; series: Array<{ period: string } & Totals>; months: Month[] }
interface Source { ref: string; kind: string; title: string; href: string }

const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre']
const label = (period: string) => { const [y, m] = period.split('-'); return `${MONTHS[Number(m) - 1]} ${y}` }
const pct = (part: number, total: number) => (total ? Math.round((part / total) * 1000) / 10 : 0)
const fmt = (n: number) => n.toLocaleString('es-PE')
const isUnclassified = (text: string) => /no clasificad|falta de datos|^otros?\b|no determinado|especificar/i.test(text)

/** Lectura técnica por forma de accidente: por qué suele fallar la prevención y qué norma aplica. */
const FAILURES: Array<{ match: RegExp; why: string; controls: string; norms: Array<{ text: string; href: string }> }> = [
  { match: /^ca[ií]das de personas/i, why: 'Pisos resbaladizos o desordenados, aberturas sin protección, escaleras y andamios sin inspección y trabajo en altura sin sistema anticaídas.', controls: 'Orden y limpieza (5S), barandas y rodapiés, cubiertas de aberturas, línea de vida y arnés con doble eslinga desde 1,80 m, permiso de trabajo en altura.', norms: [{ text: 'Norma G.050', href: '#/visor?sec=normas&q=G.050' }, { text: 'D.S. 005-2012-TR', href: '#/visor?sec=normas&q=005-2012-TR' }, { text: 'Señales de caída', href: '#/senales' }] },
  { match: /^ca[ií]das de objetos/i, why: 'Apilamiento inestable, izajes sin plan ni área restringida, herramientas sin amarre en altura y estanterías sin anclaje.', controls: 'Plan de izaje y rigger, delimitación bajo cargas suspendidas, rodapiés, anclaje de racks y límites de carga visibles.', norms: [{ text: 'Norma G.050', href: '#/visor?sec=normas&q=G.050' }, { text: 'IPERC', href: '#/diagramas?d=iperc' }] },
  { match: /^atrapad/i, why: 'Máquinas sin guardas, mantenimiento sin bloqueo de energías y ropa o guantes cerca de partes móviles.', controls: 'Guardas fijas o con enclavamiento, bloqueo y etiquetado (LOTO) con candado personal, paradas de emergencia probadas.', norms: [{ text: 'D.S. 005-2012-TR', href: '#/visor?sec=normas&q=005-2012-TR' }, { text: 'Etiquetas LOTO', href: '#/senales' }] },
  { match: /corriente el[eé]ctrica/i, why: 'Tableros sin tapa ni señalización, extensiones dañadas, falta de puesta a tierra o de interruptor diferencial, trabajos con tensión sin habilitación.', controls: 'Interruptores diferenciales de 30 mA, puesta a tierra verificada, las cinco reglas de oro, personal calificado y EPP dieléctrico.', norms: [{ text: 'R.M. 111-2013-MEM/DM', href: '#/visor?sec=normas&q=111-2013' }, { text: 'Riesgo eléctrico', href: '#/senales' }] },
  { match: /^esfuerzos/i, why: 'Levantamiento manual por encima de los límites, posturas forzadas, tareas repetitivas sin pausas y falta de ayudas mecánicas.', controls: 'Carga máxima de 25 kg (varones) y 15 kg (mujeres), carretillas o polipastos, rotación de tareas y capacitación en manipulación.', norms: [{ text: 'R.M. 375-2008-TR', href: '#/visor?sec=normas&q=375-2008-TR' }] },
  { match: /sustancias nocivas/i, why: 'Trasvases sin ventilación, envases sin etiqueta SGA, falta de hoja de datos de seguridad y protección respiratoria inadecuada.', controls: 'Sustitución, extracción localizada, etiquetado SGA y hojas de datos, respiradores con el filtro correcto y monitoreo frente a los valores límite.', norms: [{ text: 'D.S. 015-2005-SA', href: '#/visor?sec=normas&q=015-2005-SA' }, { text: 'Etiquetas SGA', href: '#/senales' }] },
  { match: /temperaturas extremas/i, why: 'Superficies calientes sin aislamiento, cocinas y hornos sin EPP térmico y exposición al calor sin hidratación ni pausas.', controls: 'Aislamiento y barreras, guantes y mandiles térmicos, régimen trabajo-descanso según índice WBGT e hidratación programada.', norms: [{ text: 'D.S. 005-2012-TR', href: '#/visor?sec=normas&q=005-2012-TR' }] },
  { match: /^pisadas|choques|golpes/i, why: 'Pasillos obstruidos, mala iluminación, tránsito mixto de personas y montacargas y piezas proyectadas por herramientas.', controls: 'Separación de vías peatonales y vehiculares, señalización y demarcación, iluminación adecuada y protección facial en esmerilado.', norms: [{ text: 'NTP 399.010-1', href: '#/visor?sec=normas&q=399.010' }, { text: 'Señales', href: '#/senales' }] },
  { match: /punzo/i, why: 'Cuchillas y herramientas sin protección, manipulación de vidrio o láminas sin guantes y desorden en mesas de trabajo.', controls: 'Herramientas con retracción, guantes con resistencia al corte adecuada, portaherramientas y procedimiento seguro.', norms: [{ text: 'D.S. 005-2012-TR', href: '#/visor?sec=normas&q=005-2012-TR' }] },
]

function Bars({ rows, total, max = 8, tone = 'blue', showMortal = false }: { rows: Row[]; total?: number; max?: number; tone?: string; showMortal?: boolean }) {
  const list = [...rows].sort((a, b) => b.value - a.value).slice(0, max)
  const top = Math.max(1, ...list.map((row) => row.value))
  return (
    <ul className={`st-bars tone-${tone}`}>
      {list.map((row) => (
        <li key={row.label} className={isUnclassified(row.label) ? 'muted' : ''}>
          <span className="st-bar-label" title={row.label}>{row.label}</span>
          <span className="st-bar-track"><i style={{ width: `${(row.value / top) * 100}%` }} /></span>
          <b>{fmt(row.value)}{total ? <small> {pct(row.value, total)} %</small> : null}</b>
          {showMortal && row.mortales ? <em className="st-mortal" title="Accidentes mortales">{row.mortales} †</em> : null}
        </li>
      ))}
    </ul>
  )
}

function Trend({ series, current }: { series: Dataset['series']; current: string }) {
  const width = 720
  const height = 200
  const pad = 30
  const maxA = Math.max(...series.map((point) => point.accidentes))
  const maxM = Math.max(...series.map((point) => point.mortales), 1)
  const x = (index: number) => pad + (index * (width - pad * 2)) / Math.max(1, series.length - 1)
  const y = (value: number) => height - pad - (value / maxA) * (height - pad * 2)
  const path = series.map((point, index) => `${index ? 'L' : 'M'}${x(index).toFixed(1)},${y(point.accidentes).toFixed(1)}`).join(' ')
  return (
    <svg className="st-trend" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Accidentes de trabajo y mortales notificados por mes">
      {series.map((point, index) => (
        <rect key={point.period} x={x(index) - 5} width={10} y={height - pad - (point.mortales / maxM) * 60} height={(point.mortales / maxM) * 60} className={`st-mbar ${point.period === current ? 'on' : ''}`}>
          <title>{label(point.period)}: {point.mortales} mortales</title>
        </rect>
      ))}
      <path d={path} className="st-line" />
      {series.map((point, index) => (
        <circle key={point.period} cx={x(index)} cy={y(point.accidentes)} r={point.period === current ? 5 : 3} className={`st-dot ${point.period === current ? 'on' : ''}`}>
          <title>{label(point.period)}: {fmt(point.accidentes)} accidentes</title>
        </circle>
      ))}
      {series.map((point, index) => (index % 3 === 0 || index === series.length - 1 ? <text key={point.period} x={x(index)} y={height - 8} textAnchor="middle" className="st-axis">{point.period.slice(2).replace('-', '/')}</text> : null))}
      <text x={pad} y={14} className="st-axis">Línea: accidentes · Barras: mortales</text>
    </svg>
  )
}

export default function StatsView({ user, onNavigate }: { user: ApiUser | null; onNavigate: (view: 'premium') => void }) {
  const premium = Boolean(user?.premium?.active && user.consentOk)
  const [data, setData] = useState<Dataset | null>(null)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('')
  const [analysis, setAnalysis] = useState<{ answer: string; sources: Source[] } | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const url = premium ? '/api/ai/stats/months' : `${import.meta.env.BASE_URL}data/mtpe-ultimo-mes.json`
    fetch(url, { credentials: 'same-origin' })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((json: Dataset) => { setData(json); setPeriod(json.months[json.months.length - 1]?.period ?? '') })
      .catch(() => setError('No se pudieron cargar las estadísticas.'))
  }, [premium])

  const month = useMemo(() => data?.months.find((item) => item.period === period) ?? data?.months[data.months.length - 1], [data, period])
  const previous = useMemo(() => {
    if (!data || !month) return null
    const index = data.series.findIndex((item) => item.period === month.period)
    return index > 0 ? data.series[index - 1] : null
  }, [data, month])

  if (error) return <div className="view-page"><p className="notice-block">{error}</p></div>
  if (!data || !month) return <div className="view-page"><p className="empty-note">Cargando estadísticas oficiales…</p></div>

  const t = month.totales
  const types = (month.tipos ?? []).filter((row) => row.parent)
  const classified = types.filter((row) => !isUnclassified(row.label))
  const nonMortal = types.reduce((sum, row) => sum + row.value, 0)
  const unclassifiedShare = pct(types.filter((row) => isUnclassified(row.label)).reduce((sum, row) => sum + row.value, 0), nonMortal)
  const topType = [...classified].sort((a, b) => b.value - a.value)[0]
  const topActivity = [...(month.actividades ?? [])].filter((row) => !isUnclassified(row.label)).sort((a, b) => b.value - a.value)[0]
  const topRegion = [...(month.regiones ?? [])].sort((a, b) => b.value - a.value)[0]
  const conseq = month.consecuencias ?? []
  const leve = conseq.find((row) => /leve/i.test(row.label))?.value ?? 0
  const incap = conseq.find((row) => /^accidente incapacitante/i.test(row.label))?.value ?? 0
  const mortalTypes = (month.mortalesTipo ?? []).filter((row) => row.parent && row.value > 0)
  const delta = (key: keyof Totals) => (previous ? t[key] - previous[key] : null)

  const summaryText = () => [
    `Totales: ${t.total} notificaciones; ${t.accidentes} accidentes no mortales; ${t.mortales} mortales; ${t.incidentes} incidentes peligrosos; ${t.enfermedades} enfermedades ocupacionales.`,
    previous ? `Mes anterior: ${previous.accidentes} accidentes y ${previous.mortales} mortales.` : '',
    `Formas de accidente: ${classified.sort((a, b) => b.value - a.value).slice(0, 6).map((row) => `${row.label} ${row.value}`).join('; ')}. No clasificados: ${unclassifiedShare} %.`,
    `Mortales por forma: ${mortalTypes.map((row) => `${row.label} ${row.value}`).join('; ')}.`,
    `Actividades: ${(month.actividades ?? []).slice(0, 8).map((row) => `${row.label} ${row.value} (mortales ${row.mortales ?? 0})`).join('; ')}.`,
    `Regiones: ${(month.regiones ?? []).sort((a, b) => b.value - a.value).slice(0, 6).map((row) => `${row.label} ${row.value}`).join('; ')}.`,
    `Partes del cuerpo: ${(month.cuerpo ?? []).sort((a, b) => b.value - a.value).slice(0, 5).map((row) => `${row.label} ${row.value}`).join('; ')}.`,
    `Lesiones: ${(month.lesion ?? []).sort((a, b) => b.value - a.value).slice(0, 5).map((row) => `${row.label} ${row.value}`).join('; ')}.`,
    `Consecuencias: leves ${leve}, incapacitantes ${incap}, mortales ${t.mortales}.`,
    `Enfermedades: ${(month.enfermedades ?? []).map((row) => `${row.label} ${row.value}`).join('; ')}.`,
  ].filter(Boolean).join('\n')

  const analyze = async () => {
    setBusy(true)
    try {
      const response = await fetch('/api/ai/stats/analyze', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ period: label(month.period), summary: summaryText() }) })
      const json = await response.json()
      setAnalysis(response.ok ? json : { answer: `**${json.error ?? 'No disponible.'}**`, sources: [] })
    } finally {
      setBusy(false)
    }
  }

  const KPIS: Array<{ key: keyof Totals; text: string; tone: string }> = [
    { key: 'accidentes', text: 'Accidentes de trabajo', tone: 'blue' },
    { key: 'mortales', text: 'Accidentes mortales', tone: 'red' },
    { key: 'incidentes', text: 'Incidentes peligrosos', tone: 'amber' },
    { key: 'enfermedades', text: 'Enfermedades ocupacionales', tone: 'violet' },
  ]

  return (
    <div className="view-page stats-view">
      <header className="page-head">
        <div>
          <span className="eyebrow"><BarChart3 size={15} aria-hidden="true" /> Estadística oficial MTPE · SAT</span>
          <h1>Accidentes de trabajo en el Perú</h1>
          <p>Notificaciones de accidentes, incidentes peligrosos y enfermedades ocupacionales reportadas por las empresas al Ministerio de Trabajo, con lectura técnica de qué falló y qué norma aplica.</p>
        </div>
      </header>

      <div className="st-period">
        <label>
          <span>Periodo</span>
          <select value={month.period} onChange={(event) => { setPeriod(event.target.value); setAnalysis(null) }} disabled={!premium}>
            {(premium ? data.series : data.series.filter((item) => item.period === month.period)).map((item) => <option key={item.period} value={item.period}>{label(item.period)}</option>)}
          </select>
        </label>
        {!premium && (
          <button type="button" className="st-unlock" onClick={() => onNavigate('premium')}>
            <Crown size={15} aria-hidden="true" /> {data.series.length - 1} meses más, tendencias y análisis con IA en Premium
          </button>
        )}
        <a className="btn-ghost small" href={month.pdf ?? month.source} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> Boletín oficial</a>
      </div>

      <section className="st-kpis" aria-label="Indicadores del periodo">
        {KPIS.map(({ key, text, tone }) => {
          const change = delta(key)
          return (
            <article key={key} className={`st-kpi tone-${tone}`}>
              <b>{fmt(t[key])}</b>
              <span>{text}</span>
              {change !== null && change !== 0 && (
                <small className={change > 0 ? 'up' : 'down'}>{change > 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />} {change > 0 ? '+' : ''}{fmt(change)} vs. mes anterior</small>
              )}
            </article>
          )
        })}
      </section>

      <section className="panel st-flow" aria-labelledby="st-flow-title">
        <h2 id="st-flow-title">Del evento a la consecuencia · {label(month.period)}</h2>
        <div className="st-flow-grid">
          <div className="st-step"><span>1 · Notificaciones</span><b>{fmt(t.total)}</b><small>{pct(t.accidentes, t.total)} % accidentes de trabajo</small></div>
          <div className="st-step"><span>2 · Forma más frecuente</span><b>{topType?.label ?? '—'}</b><small>{topType ? `${fmt(topType.value)} casos · ${pct(topType.value, nonMortal)} %` : ''}</small></div>
          <div className="st-step"><span>3 · Sector con más casos</span><b>{topActivity?.label ?? '—'}</b><small>{topActivity ? `${fmt(topActivity.value)} notificaciones · ${topActivity.mortales ?? 0} mortales` : ''}</small></div>
          <div className="st-step"><span>4 · Región</span><b><MapPin size={14} aria-hidden="true" /> {topRegion?.label ?? '—'}</b><small>{topRegion ? `${pct(topRegion.value, t.total)} % del total` : ''}</small></div>
          <div className="st-step danger"><span>5 · Consecuencia</span><b>{pct(incap, leve + incap + t.mortales)} % incapacitantes</b><small>{fmt(leve)} leves · {fmt(incap)} incapacitantes · {t.mortales} mortales</small></div>
        </div>
        {unclassifiedShare >= 20 && (
          <p className="st-note"><AlertTriangle size={15} aria-hidden="true" /> El {unclassifiedShare} % de los accidentes se notificó sin forma clasificada: una investigación incompleta impide aprender de ellos (D.S. 005-2012-TR, arts. 110-111).</p>
        )}
      </section>

      <div className="st-grid">
        <section className="panel"><h3>Forma del accidente (no mortales)</h3><Bars rows={types} total={nonMortal} /></section>
        <section className="panel"><h3>Actividad económica</h3><Bars rows={month.actividades ?? []} total={t.total} showMortal /></section>
        <section className="panel"><h3>Región (lugar de ocurrencia)</h3><Bars rows={month.regiones ?? []} total={t.total} tone="teal" /></section>
        <section className="panel"><h3>Parte del cuerpo afectada</h3><Bars rows={month.cuerpo ?? []} tone="teal" /></section>
        <section className="panel"><h3>Naturaleza de la lesión</h3><Bars rows={month.lesion ?? []} tone="violet" /></section>
        <section className="panel st-mortal-box"><h3><ShieldAlert size={16} aria-hidden="true" /> Accidentes mortales por forma</h3>{mortalTypes.length ? <Bars rows={mortalTypes} tone="red" /> : <p className="empty-note">Sin datos de mortales en el periodo.</p>}</section>
      </div>

      <section className="panel st-lessons" aria-labelledby="st-lessons-title">
        <h2 id="st-lessons-title">Por qué pudo fallar y qué exige la norma</h2>
        <p className="ssoma-count">Inferencia técnica a partir de datos agregados: orienta la prevención, no reemplaza la investigación de cada caso.</p>
        <div className="st-lesson-grid">
          {classified.sort((a, b) => b.value - a.value).slice(0, 6).map((row) => {
            const info = FAILURES.find((item) => item.match.test(row.label))
            if (!info) return null
            return (
              <article key={row.label} className="st-lesson">
                <header><b>{row.label}</b><span>{fmt(row.value)} casos</span></header>
                <p><strong>Falla típica:</strong> {info.why}</p>
                <p><strong>Control:</strong> {info.controls}</p>
                <div className="st-links">{info.norms.map((norm) => <a key={norm.text} href={norm.href}>{norm.text}</a>)}</div>
              </article>
            )
          })}
        </div>
      </section>

      <section className={`panel st-premium ${premium ? '' : 'locked'}`} aria-labelledby="st-premium-title">
        <h2 id="st-premium-title"><Crown size={18} aria-hidden="true" /> Tendencia y análisis experto</h2>
        {premium ? (
          <>
            <Trend series={data.series} current={month.period} />
            <button type="button" className="btn-primary pulse-btn" disabled={busy} onClick={analyze}>
              {busy ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />} {busy ? 'Analizando el periodo…' : `Analizar ${label(month.period)} con IA`}
            </button>
            {analysis && (
              <article className="st-analysis doc-body" dangerouslySetInnerHTML={{ __html: analysis.answer ? markdownToHtml(analysis.answer).replace(/\[(F\d{1,2})\]/g, (match, ref: string) => { const source = analysis.sources.find((item) => item.ref === ref); return source ? `<a class="cite" href="${source.href}" title="${source.title.replace(/"/g, '&quot;')}">${ref}</a>` : match }) : '' }} />
            )}
          </>
        ) : (
          <div className="st-lock">
            <Lock size={22} aria-hidden="true" />
            <p>Con Premium: los {data.series.length} meses publicados, tendencia de accidentes y mortales, comparación entre meses y un análisis experto de qué falló, qué norma aplica y qué hacer en su empresa.</p>
            <button type="button" className="btn-primary" onClick={() => onNavigate('premium')}><Crown size={15} aria-hidden="true" /> Probar Premium gratis</button>
          </div>
        )}
      </section>

      <p className="site-disclaimer">Fuente: Ministerio de Trabajo y Promoción del Empleo — Sistema de Accidentes de Trabajo (SAT), OGETIC / Oficina de Estadística. Datos de notificaciones: reflejan lo que las empresas reportan, no el total real de accidentes. Actualizado: {data.generated}.</p>
    </div>
  )
}
