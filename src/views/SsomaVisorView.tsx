import { useEffect, useMemo, useState } from 'react'
import { BookOpen, ChevronDown, FlaskConical, Globe2, Leaf, ListTree, Search, ShieldCheck, Table2, TriangleAlert, Workflow, X } from 'lucide-react'
import {
  BRANCH_LABELS,
  CONTRAST_NOTES,
  GHS_PICTOGRAMS,
  normalize,
  normHaystack,
  SSOMA_NORMS,
  SSOMA_PILLARS,
  SSOMA_RISKS,
  type SsomaBranch,
  type SsomaNorm,
  type SsomaRisk,
  type SsomaTable,
} from '../data/ssoma'
import { assetUrl } from '../lib/assets'
import '../styles/ssoma.css'
import { hashParam } from '../lib/hashParams'

type Section = 'que-es' | 'flujo' | 'normas' | 'riesgos' | 'cuadros' | 'linea' | 'quimicos'

const SECTIONS: Array<{ id: Section; label: string; icon: typeof Leaf }> = [
  { id: 'que-es', label: '¿Qué es SSOMA?', icon: BookOpen },
  { id: 'flujo', label: 'Flujo de riesgos', icon: Workflow },
  { id: 'normas', label: 'Normativa', icon: ShieldCheck },
  { id: 'riesgos', label: 'Riesgos comunes', icon: TriangleAlert },
  { id: 'cuadros', label: 'Cuadros y límites', icon: Table2 },
  { id: 'linea', label: 'Línea de tiempo', icon: ListTree },
  { id: 'quimicos', label: 'Químicos (SGA / CLP)', icon: FlaskConical },
]

/** Preguntas rápidas: llevan a la sección y aplican el filtro. */
const QUICK: Array<{ label: string; section: Section; query?: string; branch?: SsomaBranch | 'todas' }> = [
  { label: '¿Qué es SSOMA?', section: 'que-es' },
  { label: '¿Qué normativa aplica?', section: 'normas', branch: 'todas' },
  { label: 'Leyes ambientales', section: 'normas', branch: 'ambiental' },
  { label: '¿Riesgos más comunes?', section: 'riesgos' },
  { label: 'Riesgos por ambiente', section: 'flujo' },
  { label: 'Límites de ruido', section: 'cuadros', query: 'ruido' },
  { label: 'Calidad de agua', section: 'cuadros', query: 'agua' },
  { label: 'Colores de residuos', section: 'cuadros', query: 'color' },
  { label: 'Comité de SST', section: 'normas', query: 'comite' },
  { label: 'Exámenes médicos', section: 'normas', query: 'examen' },
  { label: 'Buscar sustancia química', section: 'quimicos' },
]

const FREQ_ORDER = { alta: 0, media: 1, baja: 2 } as const
const RISK_LABELS: Record<SsomaRisk['category'], string> = {
  seguridad: 'Seguridad',
  higiene: 'Higiene (agentes físicos)',
  ergonomico: 'Ergonómico',
  psicosocial: 'Psicosocial',
  ambiental: 'Ambiental',
  quimico: 'Químico',
  biologico: 'Biológico',
}

const normById = new Map(SSOMA_NORMS.map((norm) => [norm.id, norm]))

function Fold({ title, count, children, defaultOpen = false }: { title: string; count?: number; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="ssoma-fold" open={defaultOpen}>
      <summary>
        <span>{title}</span>
        {count !== undefined && <em>{count}</em>}
        <ChevronDown size={15} aria-hidden="true" className="fold-icon" />
      </summary>
      <div className="ssoma-fold-body">{children}</div>
    </details>
  )
}

function DataTable({ table }: { table: SsomaTable }) {
  return (
    <figure className="ssoma-table">
      <figcaption>
        <b>{table.title}</b>
        {table.note && <span>{table.note}</span>}
      </figcaption>
      <div className="ssoma-table-scroll">
        <table>
          <thead>
            <tr>{table.columns.map((column, index) => <th key={index}>{column}</th>)}</tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}

function NormChips({ ids, onPick }: { ids: string[]; onPick: (id: string) => void }) {
  return (
    <div className="ssoma-chips">
      {ids.map((id) => {
        const norm = normById.get(id)
        if (!norm) return null
        return (
          <button type="button" key={id} className="chip-link" onClick={() => onPick(id)}>
            {norm.code}
          </button>
        )
      })}
    </div>
  )
}

function NormCard({ norm, open, onToggle, onOpenCatalog }: { norm: SsomaNorm; open: boolean; onToggle: () => void; onOpenCatalog?: (id: string) => void }) {
  return (
    <article className={`ssoma-norm branch-${norm.branch}`} id={`ssoma-${norm.id}`}>
      <button type="button" className="ssoma-norm-head" aria-expanded={open} onClick={onToggle}>
        <span className="ssoma-year">{norm.year}</span>
        <span className="ssoma-norm-title">
          <b>{norm.code}</b>
          <small>{norm.title}</small>
        </span>
        <span className="ssoma-badges">
          <span className={`ssoma-badge b-${norm.branch}`}>{BRANCH_LABELS[norm.branch]}</span>
          {norm.status && <span className="ssoma-badge status">{norm.status}</span>}
        </span>
        <ChevronDown size={18} aria-hidden="true" className={open ? 'rotated' : ''} />
      </button>
      {open && (
        <div className="ssoma-norm-body">
          <p className="ssoma-summary">{norm.summary}</p>
          <dl className="ssoma-meta">
            <div><dt>Autoridad</dt><dd>{norm.authority}</dd></div>
            <div><dt>A quién aplica</dt><dd>{norm.scope}</dd></div>
            {norm.date && <div><dt>Publicación</dt><dd>{norm.date}</dd></div>}
            <div>
              <dt>Contraste con el Observatorio</dt>
              <dd>
                {norm.catalogId ? (
                  <>
                    Ya figura en el catálogo normativo.{' '}
                    {onOpenCatalog && (
                      <button type="button" className="link-button" onClick={() => onOpenCatalog(norm.catalogId!)}>
                        Ver enlaces oficiales
                      </button>
                    )}
                  </>
                ) : (
                  'Nueva: incorporada desde la documentación fuente; no estaba en el catálogo de enlaces.'
                )}
              </dd>
            </div>
          </dl>
          <Fold title="Cómo funciona" count={norm.howItWorks.length}>
            <ul>{norm.howItWorks.map((item) => <li key={item}>{item}</li>)}</ul>
          </Fold>
          <Fold title="Artículos clave" count={norm.keyArticles.length}>
            <ul className="ssoma-articles">
              {norm.keyArticles.map((article) => (
                <li key={article.ref + article.text}>
                  <b>{article.ref}</b> {article.text}
                </li>
              ))}
            </ul>
          </Fold>
          <Fold title="Obligaciones para la empresa" count={norm.obligations.length}>
            <ul className="ssoma-check">{norm.obligations.map((item) => <li key={item}>{item}</li>)}</ul>
          </Fold>
          {norm.tables && norm.tables.length > 0 && (
            <Fold title="Cuadros y valores" count={norm.tables.length}>
              {norm.tables.map((table) => <DataTable key={table.title} table={table} />)}
            </Fold>
          )}
          {norm.risks && norm.risks.length > 0 && (
            <Fold title="Riesgos y aspectos que identifica" count={norm.risks.length}>
              <ul>{norm.risks.map((item) => <li key={item}>{item}</li>)}</ul>
            </Fold>
          )}
          {norm.international && norm.international.length > 0 && (
            <Fold title="Referentes internacionales" count={norm.international.length}>
              <ul className="ssoma-intl">
                {norm.international.map((item) => (
                  <li key={item.name}>
                    <Globe2 size={14} aria-hidden="true" /> <b>{item.name}</b>: {item.relation}
                  </li>
                ))}
              </ul>
            </Fold>
          )}
          {norm.modifications && norm.modifications.length > 0 && (
            <Fold title="Modificatorias y notas de vigencia" count={norm.modifications.length}>
              <ul>{norm.modifications.map((item) => <li key={item}>{item}</li>)}</ul>
            </Fold>
          )}
          <p className="ssoma-source">Fuente cotejada: {norm.source}</p>
        </div>
      )}
    </article>
  )
}

/** Ambientes de trabajo del flujo progresivo y los riesgos que suelen presentarse en cada uno. */
const ENVIRONMENTS: Array<{ id: string; label: string; riskIds: string[] }> = [
  { id: 'oficina', label: 'Oficina administrativa', riskIds: ['caida-mismo-nivel', 'contacto-electrico', 'posturas-forzadas', 'movimientos-repetitivos', 'riesgo-psicosocial', 'incendio'] },
  { id: 'almacen', label: 'Almacén logístico', riskIds: ['transito-vehiculos', 'manipulacion-cargas', 'golpes-atrapamientos', 'caida-distinto-nivel', 'incendio', 'derrames-quimicos-hidrocarburos'] },
  { id: 'planta', label: 'Planta de manufactura', riskIds: ['golpes-atrapamientos', 'ruido-ocupacional', 'exposicion-quimicos', 'contacto-electrico', 'trabajos-caliente', 'residuos-peligrosos', 'emisiones-atmosfericas'] },
  { id: 'obra', label: 'Obra de construcción', riskIds: ['caida-distinto-nivel', 'polvo-silice', 'radiacion-uv', 'estres-termico', 'golpes-atrapamientos', 'ruido-ambiental'] },
  { id: 'laboratorio', label: 'Laboratorio o tópico', riskIds: ['exposicion-quimicos', 'riesgo-biologico', 'derrames-quimicos-hidrocarburos', 'residuos-peligrosos', 'vertimiento-aguas-residuales'] },
]

const FLOW_STEPS = ['Ficha IPERC: peligro y consecuencias', 'Evaluación y controles por jerarquía', 'Marco normativo aplicable', 'Generar señal, informe o practicar'] as const

function RiskFlow({ onPickNorm, onNavigate }: { onPickNorm: (id: string) => void; onNavigate?: (view: 'simulador' | 'senales') => void }) {
  const [envId, setEnvId] = useState<string | null>(null)
  const [riskId, setRiskId] = useState<string | null>(null)
  const env = ENVIRONMENTS.find((item) => item.id === envId)
  const risk = SSOMA_RISKS.find((item) => item.id === riskId)
  const envRisks = env ? SSOMA_RISKS.filter((item) => env.riskIds.includes(item.id)) : []
  const step = !env ? 1 : !risk ? 2 : 3
  return (
    <ol className="ssoma-flow">
      <li className="done">
        <span className="flow-dot">1</span>
        <div>
          <b>Seleccione el ambiente de trabajo</b>
          <div className="ssoma-filter">
            {ENVIRONMENTS.map((item) => (
              <button type="button" key={item.id} className={envId === item.id ? 'active' : ''} onClick={() => { setEnvId(item.id); setRiskId(null) }}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </li>
      <li className={step >= 2 ? 'done' : 'locked'}>
        <span className="flow-dot">2</span>
        <div>
          <b>Seleccione un peligro</b>
          {env && (
            <div className="ssoma-filter">
              {envRisks.map((item) => (
                <button type="button" key={item.id} className={riskId === item.id ? 'active' : ''} onClick={() => setRiskId(item.id)}>
                  {item.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </li>
      {FLOW_STEPS.map((title, index) => (
        <li key={title} className={step >= 3 ? 'done' : 'locked'}>
          <span className="flow-dot">{index + 3}</span>
          <div>
            <b>{title}</b>
            {risk && index === 0 && (
              <>
                <p className="ssoma-sub">Dónde aparece</p>
                <ul>{risk.examples.map((item) => <li key={item}>{item}</li>)}</ul>
                <p className="ssoma-sub">Consecuencias</p>
                <ul>{risk.consequences.map((item) => <li key={item}>{item}</li>)}</ul>
              </>
            )}
            {risk && index === 1 && (
              <>
                <p className="ssoma-count">
                  Frecuencia en el Perú: <b>{risk.frequency}</b>. Evalúe probabilidad × severidad (D.S. 005-2012-TR) antes y después de los
                  controles; el riesgo residual se verifica en campo.
                </p>
                <ol>{risk.controls.map((item) => <li key={item}>{item}</li>)}</ol>
              </>
            )}
            {risk && index === 2 && <NormChips ids={risk.normIds} onPick={onPickNorm} />}
            {risk && index === 3 && onNavigate && (
              <div className="ssoma-chips">
                <button type="button" className="btn-primary small" onClick={() => onNavigate('senales')}>Generar señal o sticker con QR</button>
                <button type="button" className="btn-ghost small" onClick={() => onNavigate('simulador')}>Practicar en el simulador</button>
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

interface ClpRow {
  i: string
  n: string
  es?: string
  a3?: number
  ec?: string
  cas?: string
  c?: string
  h?: string
  p?: string
  l?: string
}

function ClpSearch() {
  const [rows, setRows] = useState<ClpRow[] | null>(null)
  const [error, setError] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetch(assetUrl('data/clp-annex-vi.json'))
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((data: ClpRow[]) => setRows(data))
      .catch(() => setError(true))
  }, [])

  const results = useMemo(() => {
    if (!rows) return []
    const term = normalize(query.trim())
    if (term.length < 2) return []
    const rank = (row: ClpRow) => {
      const name = normalize(row.n)
      const es = normalize(row.es ?? '')
      if (name === term || es === term || row.cas === term || row.ec === term) return 0
      if (name.startsWith(term) || es.startsWith(term)) return 1
      return 2
    }
    return rows
      .filter((row) => normalize(`${row.n} ${row.es ?? ''} ${row.cas ?? ''} ${row.ec ?? ''} ${row.i}`).includes(term))
      .sort((a, b) => rank(a) - rank(b) || a.n.length - b.n.length)
      .slice(0, 40)
  }, [rows, query])

  return (
    <div className="ssoma-clp">
      <p>
        Contraste con el <b>Anexo VI del Reglamento CLP (UE) 1272/2008</b> (clasificación armonizada, ATP 23):
        contrastado con el <b>Anexo 3 del D.S. 005-2026-MINAM</b> (nombres en español). Escriba el nombre en español o inglés, el n.° CAS o el n.° CE.
      </p>
      <label className="ssoma-search small">
        <Search size={16} aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej.: tolueno, hidróxido de sodio, 108-88-3…" />
      </label>
      {error && <p className="empty-note">No se pudo cargar la tabla CLP.</p>}
      {!rows && !error && <p className="empty-note">Cargando tabla CLP…</p>}
      {rows && query.trim().length >= 2 && (
        <p className="ssoma-count">{results.length === 40 ? 'Primeros 40 resultados' : `${results.length} resultado(s)`} de {rows.length.toLocaleString('es-PE')} sustancias</p>
      )}
      {results.length > 0 && (
        <div className="ssoma-table-scroll">
          <table className="ssoma-clp-table">
            <thead>
              <tr><th>Sustancia</th><th>CAS / CE</th><th>Clasificación</th><th>Indicaciones H</th><th>Pictogramas</th></tr>
            </thead>
            <tbody>
              {results.map((row) => (
                <tr key={row.i + row.n}>
                  <td><b>{row.es ?? row.n}</b><small>{row.es ? `${row.n} · ` : ''}Índice {row.i}{row.a3 ? ' · nombre ES del Anexo 3 Perú (OCR)' : ''}</small></td>
                  <td>{row.cas || '—'}<small>{row.ec}</small></td>
                  <td>{row.c}</td>
                  <td>{row.h}</td>
                  <td>{row.p}{row.l && <small>{row.l}</small>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function SsomaVisorView({ onOpenNorm, onNavigate }: { onOpenNorm?: (normId: string) => void; onNavigate?: (view: 'simulador' | 'senales') => void }) {
  const [section, setSection] = useState<Section>(() => {
    const sec = hashParam('sec')
    return sec && ['que-es', 'flujo', 'normas', 'riesgos', 'cuadros', 'linea', 'quimicos'].includes(sec) ? (sec as Section) : hashParam('q') ? 'normas' : 'que-es'
  })
  const [query, setQuery] = useState(() => hashParam('q') ?? '')
  const [branch, setBranch] = useState<SsomaBranch | 'todas'>('todas')
  const [openNorm, setOpenNorm] = useState<string | null>(null)
  const [riskCat, setRiskCat] = useState<SsomaRisk['category'] | 'todas'>('todas')

  const term = normalize(query.trim())

  const norms = useMemo(
    () =>
      SSOMA_NORMS.filter((norm) => (branch === 'todas' || norm.branch === branch) && (!term || normHaystack(norm).includes(term))),
    [branch, term],
  )

  const risks = useMemo(
    () =>
      SSOMA_RISKS.filter(
        (risk) =>
          (riskCat === 'todas' || risk.category === riskCat) &&
          (!term || normalize([risk.name, ...risk.examples, ...risk.consequences, ...risk.controls].join(' ')).includes(term)),
      ).sort((a, b) => FREQ_ORDER[a.frequency] - FREQ_ORDER[b.frequency]),
    [riskCat, term],
  )

  const tables = useMemo(
    () =>
      SSOMA_NORMS.flatMap((norm) => (norm.tables ?? []).map((table) => ({ norm, table }))).filter(
        ({ norm, table }) =>
          !term || normalize(`${norm.code} ${table.title} ${table.note ?? ''} ${table.columns.join(' ')} ${table.rows.map((row) => row[0]).join(' ')}`).includes(term),
      ),
    [term],
  )

  const stats = useMemo(() => {
    const inCatalog = SSOMA_NORMS.filter((norm) => norm.catalogId).length
    return {
      norms: SSOMA_NORMS.length,
      inCatalog,
      added: SSOMA_NORMS.length - inCatalog,
      tables: SSOMA_NORMS.reduce((sum, norm) => sum + (norm.tables?.length ?? 0), 0),
      articles: SSOMA_NORMS.reduce((sum, norm) => sum + norm.keyArticles.length, 0),
      intl: new Set(SSOMA_NORMS.flatMap((norm) => (norm.international ?? []).map((item) => item.name))).size,
    }
  }, [])

  const years = useMemo(() => {
    const map = new Map<number, SsomaNorm[]>()
    for (const norm of SSOMA_NORMS) map.set(norm.year, [...(map.get(norm.year) ?? []), norm])
    return [...map.entries()].sort((a, b) => a[0] - b[0])
  }, [])

  const goToNorm = (id: string) => {
    setQuery('')
    setBranch('todas')
    setSection('normas')
    setOpenNorm(id)
    window.setTimeout(() => document.getElementById(`ssoma-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }

  // Buscar desde cualquier sección: si la sección actual no tiene resultados, saltar a Normativa.
  const onSearch = (value: string) => {
    setQuery(value)
    if (value.trim() && (section === 'que-es' || section === 'flujo' || section === 'linea' || section === 'quimicos')) setSection('normas')
  }

  return (
    <div className="view-page ssoma-visor">
      <header className="page-head">
        <div>
          <h1>Visor SSOMA</h1>
          <p>
            Seguridad, salud ocupacional y medio ambiente en un solo lugar: qué regula cada norma, cómo funciona, sus cuadros
            y límites, los riesgos más comunes y su referente internacional. Todo plegable para consultar desde el celular.
          </p>
        </div>
      </header>

      <label className="ssoma-search">
        <Search size={18} aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Escriba: residuos, ruido, comité, extintor, agua, gestante…"
          aria-label="Buscar en el visor SSOMA"
        />
        {query && (
          <button type="button" aria-label="Limpiar búsqueda" onClick={() => setQuery('')}>
            <X size={16} />
          </button>
        )}
      </label>

      <div className="ssoma-quick" aria-label="Preguntas rápidas">
        {QUICK.map((item) => (
          <button
            type="button"
            key={item.label}
            onClick={() => {
              setSection(item.section)
              setQuery(item.query ?? '')
              if (item.branch) setBranch(item.branch)
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="tab-switch ssoma-tabs" role="tablist" aria-label="Secciones del visor">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" role="tab" aria-selected={section === id} className={section === id ? 'active' : ''} onClick={() => setSection(id)}>
            <Icon size={15} aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      {section === 'que-es' && (
        <section className="ssoma-section">
          <div className="ssoma-stats">
            <div><b>{stats.norms}</b><span>normas analizadas</span></div>
            <div><b>{stats.articles}</b><span>artículos clave</span></div>
            <div><b>{stats.tables}</b><span>cuadros transcritos</span></div>
            <div><b>{SSOMA_RISKS.length}</b><span>riesgos comunes</span></div>
            <div><b>{stats.intl}</b><span>referentes internacionales</span></div>
          </div>
          <p className="ssoma-lead">
            <b>SSOMA</b> es la gestión integrada de <b>S</b>eguridad, <b>S</b>alud <b>O</b>cupacional y <b>M</b>edio <b>A</b>mbiente.
            En el Perú se sostiene en dos troncos legales: la <b>Ley 29783</b> (trabajadores) y la <b>Ley 28611</b> (ambiente), y se
            integra con ISO 45001 e ISO 14001 bajo la misma lógica de mejora continua (planificar, hacer, verificar, actuar).
          </p>
          {SSOMA_PILLARS.map((pillar) => (
            <Fold key={pillar.letter} title={`${pillar.letter} · ${pillar.name}`} defaultOpen={false}>
              <p>{pillar.what}</p>
              <ul>{pillar.how.map((item) => <li key={item}>{item}</li>)}</ul>
              <p className="ssoma-sub">Normas que lo regulan:</p>
              <NormChips ids={pillar.normIds} onPick={goToNorm} />
            </Fold>
          ))}
          <Fold title="Contraste y verificación de fuentes" count={CONTRAST_NOTES.length}>
            <p>
              Se analizaron {stats.norms} normas de la documentación fuente: <b>{stats.inCatalog}</b> ya figuraban en el catálogo de
              enlaces del Observatorio y <b>{stats.added}</b> se incorporan por primera vez con su detalle (estándares de calidad
              ambiental, VMA, NTP de extintores y colores, gestantes y el proyecto de reglamento SGA).
            </p>
            <p className="ssoma-sub">Hallazgos al contrastar las fuentes ({CONTRAST_NOTES.length})</p>
            <ul className="ssoma-contrast">
              {CONTRAST_NOTES.map((note) => (
                <li key={note.topic}>
                  <b>{note.topic}.</b> {note.finding}
                  <NormChips ids={note.normIds} onPick={goToNorm} />
                </li>
              ))}
            </ul>
            <p className="site-disclaimer">
              Contenido orientativo elaborado a partir de los textos oficiales convertidos a Markdown. Verifique la versión vigente en
              El Peruano o el SPIJ antes de citarla en un trámite.
            </p>
          </Fold>
        </section>
      )}

      {section === 'flujo' && (
        <section className="ssoma-section">
          <p className="ssoma-count">Recorra el proceso paso a paso: cada nodo se abre al completar el anterior.</p>
          <RiskFlow onPickNorm={goToNorm} onNavigate={onNavigate} />
        </section>
      )}

      {section === 'normas' && (
        <section className="ssoma-section">
          <div className="ssoma-filter">
            {(['todas', 'sst', 'salud', 'ambiental', 'quimicos'] as const).map((id) => (
              <button type="button" key={id} className={branch === id ? 'active' : ''} onClick={() => setBranch(id)}>
                {id === 'todas' ? 'Todas' : BRANCH_LABELS[id]}
              </button>
            ))}
          </div>
          <p className="ssoma-count">{norms.length} norma(s){term ? ` para «${query}»` : ''}. Toque una para desplegarla.</p>
          {norms.map((norm) => (
            <NormCard
              key={norm.id}
              norm={norm}
              open={openNorm === norm.id}
              onToggle={() => setOpenNorm(openNorm === norm.id ? null : norm.id)}
              onOpenCatalog={onOpenNorm}
            />
          ))}
          {norms.length === 0 && <p className="empty-note">Sin coincidencias. Pruebe con otra palabra o revise «Riesgos comunes».</p>}
        </section>
      )}

      {section === 'riesgos' && (
        <section className="ssoma-section">
          <div className="ssoma-filter">
            <button type="button" className={riskCat === 'todas' ? 'active' : ''} onClick={() => setRiskCat('todas')}>Todos</button>
            {(Object.keys(RISK_LABELS) as SsomaRisk['category'][])
              .filter((cat) => SSOMA_RISKS.some((risk) => risk.category === cat))
              .map((cat) => (
                <button type="button" key={cat} className={riskCat === cat ? 'active' : ''} onClick={() => setRiskCat(cat)}>
                  {RISK_LABELS[cat]}
                </button>
              ))}
          </div>
          <p className="ssoma-count">Ordenados de mayor a menor frecuencia en centros de trabajo del Perú.</p>
          {risks.map((risk) => (
            <details className={`ssoma-risk freq-${risk.frequency}`} key={risk.id}>
              <summary>
                <span className="ssoma-freq">{risk.frequency}</span>
                <span className="ssoma-risk-name"><b>{risk.name}</b><small>{RISK_LABELS[risk.category]}</small></span>
                <ChevronDown size={16} aria-hidden="true" className="fold-icon" />
              </summary>
              <div className="ssoma-fold-body">
                <p className="ssoma-sub">Dónde aparece</p>
                <ul>{risk.examples.map((item) => <li key={item}>{item}</li>)}</ul>
                <p className="ssoma-sub">Consecuencias</p>
                <ul>{risk.consequences.map((item) => <li key={item}>{item}</li>)}</ul>
                <p className="ssoma-sub">Controles (jerarquía)</p>
                <ol>{risk.controls.map((item) => <li key={item}>{item}</li>)}</ol>
                <p className="ssoma-sub">Normas que aplican</p>
                <NormChips ids={risk.normIds} onPick={goToNorm} />
              </div>
            </details>
          ))}
        </section>
      )}

      {section === 'cuadros' && (
        <section className="ssoma-section">
          <p className="ssoma-count">{tables.length} cuadro(s){term ? ` para «${query}»` : ''}. Valores transcritos del texto oficial.</p>
          {tables.map(({ norm, table }) => (
            <Fold key={norm.id + table.title} title={`${table.title}`} count={table.rows.length}>
              <p className="ssoma-sub">
                {norm.code} ·{' '}
                <button type="button" className="link-button" onClick={() => goToNorm(norm.id)}>ver ficha de la norma</button>
              </p>
              <DataTable table={table} />
            </Fold>
          ))}
        </section>
      )}

      {section === 'linea' && (
        <section className="ssoma-section">
          <p className="ssoma-count">
            Evolución de las normas analizadas. Las marcadas con ● ya están en la línea de tiempo y el catálogo del Observatorio; las
            marcadas con ○ se incorporan con este visor.
          </p>
          <ol className="ssoma-timeline">
            {years.map(([year, items]) => (
              <li key={year}>
                <span className="ssoma-tl-year">{year}</span>
                <div>
                  {items.map((norm) => (
                    <button type="button" key={norm.id} className={`ssoma-tl-item b-${norm.branch}`} onClick={() => goToNorm(norm.id)}>
                      <span aria-hidden="true">{norm.catalogId ? '●' : '○'}</span> <b>{norm.code}</b> {norm.title}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {section === 'quimicos' && (
        <section className="ssoma-section">
          <Fold title="Buscador de sustancias (CLP, Unión Europea)" defaultOpen>
            <ClpSearch />
          </Fold>
          <Fold title="Pictogramas del SGA (GHS01–GHS09)" count={GHS_PICTOGRAMS.length}>
            <ul className="ssoma-ghs">
              {GHS_PICTOGRAMS.map((item) => (
                <li key={item.code}><b>{item.code}</b> {item.name}<small>{item.hazards}</small></li>
              ))}
            </ul>
          </Fold>
          {SSOMA_NORMS.filter((norm) => norm.branch === 'quimicos').map((norm) => (
            <NormCard key={norm.id} norm={norm} open={openNorm === norm.id} onToggle={() => setOpenNorm(openNorm === norm.id ? null : norm.id)} />
          ))}
        </section>
      )}
    </div>
  )
}
