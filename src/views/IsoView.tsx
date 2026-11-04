import { AlertTriangle, ClipboardCheck, HelpCircle, Lightbulb, Scale, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DocActions } from '../components/DocReader'
import { findNorm } from '../data/legalDatabase'
import iso from '../data/iso.json'
import { INACAL_CATALOG, ISO_FAMILY, isoFamilyMarkdown } from '../data/isoFamily'

/**
 * ISO 45001, ISO 14001 y Sistemas Integrados de Gestion. Contenido importado de los
 * cursos del autor (scripts/import-iso.mjs): parafrasis interpretativa, no texto ISO.
 */
interface Clause {
  id: string
  num: string
  title: string
  kind: string
  parent: string | null
  summary: string
  intent: string
  evidence: string[]
  questions: string[]
  findings: Array<{ text: string; severity: string }>
  legal: string[]
  trap: string
}

type TabId = '45001' | '14001' | 'sig' | 'docs' | 'familia'

const TABS: Array<{ id: TabId; label: string }> = [
  { id: '45001', label: 'ISO 45001 · SST' },
  { id: '14001', label: 'ISO 14001 · Ambiente' },
  { id: 'sig', label: 'SIG · Tronco común' },
  { id: 'docs', label: 'Matriz documental SIG' },
  { id: 'familia', label: 'Normas relacionadas e INACAL' },
]

/** Los cursos usan "ley-29783"; el catalogo usa "law-29783". */
function catalogueId(id: string): string {
  return id.replace(/^ley-/, 'law-')
}

function clausesFor(tab: TabId): Clause[] {
  if (tab === '45001' || tab === '14001') {
    return (iso.standards.find((std) => std.key === tab)?.clauses ?? []) as Clause[]
  }
  return [...iso.sig.common, ...iso.sig.specific].map((item) => ({
    id: `sig-${'norm' in item ? item.norm : 'sig'}-${item.num}`,
    num: item.num,
    title: 'norm' in item ? `${item.title} (ISO ${item.norm})` : item.title,
    kind: 'requisito',
    parent: null,
    summary: item.requirement,
    intent: item.intent,
    evidence: item.evidence,
    questions: item.questions,
    findings: item.finding ? [{ text: item.finding, severity: '' }] : [],
    legal: [],
    trap: item.trap,
  }))
}

function auditMarkdown(tab: TabId, clauses: Clause[]): string {
  const label = TABS.find((item) => item.id === tab)?.label ?? ''
  const body = clauses
    .filter((clause) => clause.kind !== 'marco')
    .map(
      (clause) =>
        `## ${clause.num} ${clause.title}\n\n${clause.summary}\n\n**Evidencia objetiva esperada**\n\n${clause.evidence.map((item) => `- [ ] ${item}`).join('\n')}\n\n**Preguntas de auditoría**\n\n${clause.questions.map((item) => `- ${item}`).join('\n')}${
          clause.trap ? `\n\n> Trampa frecuente: ${clause.trap}` : ''
        }`,
    )
    .join('\n\n')
  return `# Lista de verificación de auditoría — ${label}\n\nParáfrasis interpretativa con fines de formación y autoevaluación; no reproduce el texto de la norma ISO (adquiérala en ISO o INACAL).\n\n${body}`
}

function sigDocsMarkdown(): string {
  const rows = iso.sig.documents
    .map((doc) => `| ${doc.name} | ${doc.iso9001} | ${doc.iso14001} | ${doc.iso45001} | ${doc.iso37001} | ${doc.note} |`)
    .join('\n')
  return `# Matriz documental del sistema integrado de gestión

Información documentada que exige cada norma y cómo integrarla en un solo sistema. Úsela como evidencia de planificación del SIG.

## Matriz

| Información documentada | ISO 9001 | ISO 14001 | ISO 45001 | ISO 37001 | Integración |
|---|---|---|---|---|---|
${rows}

## Control de la matriz

| Revisado por | Cargo | Fecha | Firma |
|---|---|---|---|
| | | | |`
}

export function IsoView() {
  const [tab, setTab] = useState<TabId>('45001')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const clauses = useMemo(() => clausesFor(tab), [tab])
  const filtered = clauses.filter((clause) => `${clause.num} ${clause.title} ${clause.summary}`.toLowerCase().includes(query.toLowerCase()))
  const selected = clauses.find((clause) => clause.id === selectedId) ?? filtered.find((clause) => clause.kind !== 'marco') ?? filtered[0]
  const meta = iso.standards.find((std) => std.key === tab)

  return (
    <section className="iso-view">
      <div className="iso-top">
        <div className="tab-switch" role="tablist" aria-label="Normas ISO">
          {TABS.map((item) => (
            <button
              type="button"
              role="tab"
              key={item.id}
              aria-selected={tab === item.id}
              className={tab === item.id ? 'active' : ''}
              onClick={() => {
                setTab(item.id)
                setSelectedId(null)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        {tab !== 'docs' && tab !== 'familia' && <DocActions id={`auditoria-iso-${tab}`} title={`Lista de auditoría ${TABS.find((item) => item.id === tab)?.label}`} markdown={auditMarkdown(tab, clauses)} compact />}
        {tab === 'docs' && <DocActions id="matriz-documental-sig" title="Matriz documental del sistema integrado de gestión" markdown={sigDocsMarkdown()} compact />}
      </div>

      {meta && (
        <div className="iso-meta">
          <b>{meta.norma}</b> · {meta.titulo} · publicada {meta.publicacion}. {meta.exclusiones ?? ''}
        </div>
      )}
      {tab === 'sig' && (
        <div className="sig-norms">
          {iso.sig.norms.map((norm) => (
            <article key={norm.k}>
              <b>{norm.n}</b>
              <small>{norm.t}</small>
              <p>{norm.obj}</p>
              <em>{norm.ntp}</em>
            </article>
          ))}
        </div>
      )}

      {tab === 'familia' ? (
        <div className="iso-family">
          <p className="adv-intro">
            Normas técnicas que complementan la legislación peruana. Son voluntarias salvo que una norma legal las haga exigibles.
            La adopción como Norma Técnica Peruana (NTP) se confirma en el{' '}
            <a href={INACAL_CATALOG} target="_blank" rel="noopener noreferrer">catálogo de INACAL</a>.
          </p>
          <DocActions id="iso-familia" title="Matriz de normas técnicas relacionadas" markdown={isoFamilyMarkdown()} />
          <div className="iso-family-grid">
            {ISO_FAMILY.map((item) => (
              <details key={item.code} className="iso-family-card">
                <summary>
                  <span className={`fam-tag fam-${item.family.split(' ')[0].toLowerCase()}`}>{item.family}</span>
                  <b>{item.code}</b>
                  <small>{item.title}</small>
                </summary>
                <dl>
                  <div><dt>Para qué sirve</dt><dd>{item.purpose}</dd></div>
                  <div><dt>Cómo usarla</dt><dd>{item.howToUse}</dd></div>
                  <div><dt>En el Perú</dt><dd>{item.peru}</dd></div>
                </dl>
              </details>
            ))}
          </div>
        </div>
      ) : tab === 'docs' ? (
        <div className="md-table iso-docs">
          <table>
            <thead>
              <tr><th>Información documentada</th><th>ISO 9001</th><th>ISO 14001</th><th>ISO 45001</th><th>ISO 37001</th><th>Integración</th></tr>
            </thead>
            <tbody>
              {iso.sig.documents.map((doc) => (
                <tr key={doc.name}>
                  <td>{doc.name}</td><td>{doc.iso9001}</td><td>{doc.iso14001}</td><td>{doc.iso45001}</td><td>{doc.iso37001}</td><td>{doc.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="iso-layout">
          <aside className="iso-list">
            <label className="search-inline">
              <Search size={15} aria-hidden="true" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar cláusula" />
            </label>
            <ol>
              {filtered.map((clause) => (
                <li key={clause.id}>
                  <button
                    type="button"
                    className={`${clause.kind === 'marco' ? 'marco' : ''} ${selected?.id === clause.id ? 'active' : ''}`}
                    onClick={() => setSelectedId(clause.id)}
                  >
                    <span>{clause.num}</span> {clause.title}
                  </button>
                </li>
              ))}
            </ol>
          </aside>
          {selected && (
            <article className="iso-detail" key={selected.id}>
              <header>
                <span className="iso-num">{selected.num}</span>
                <h3>{selected.title}</h3>
              </header>
              <p className="iso-summary">{selected.summary}</p>
              {selected.intent && <p className="iso-intent"><Lightbulb size={15} aria-hidden="true" /> {selected.intent}</p>}
              {selected.evidence.length > 0 && (
                <section>
                  <h4><ClipboardCheck size={15} aria-hidden="true" /> Evidencia objetiva</h4>
                  <ul>{selected.evidence.map((item) => <li key={item}>{item}</li>)}</ul>
                </section>
              )}
              {selected.questions.length > 0 && (
                <section>
                  <h4><HelpCircle size={15} aria-hidden="true" /> Preguntas de auditoría</h4>
                  <ul>{selected.questions.map((item) => <li key={item}>{item}</li>)}</ul>
                </section>
              )}
              {selected.findings.length > 0 && (
                <section>
                  <h4><AlertTriangle size={15} aria-hidden="true" /> Hallazgos típicos</h4>
                  <ul className="iso-findings">
                    {selected.findings.map((item) => (
                      <li key={item.text}>{item.severity && <em>{item.severity}</em>} {item.text}</li>
                    ))}
                  </ul>
                </section>
              )}
              {selected.legal.length > 0 && (
                <section>
                  <h4><Scale size={15} aria-hidden="true" /> Correlación legal peruana</h4>
                  <div className="guide-norms">
                    {selected.legal.map((id) => <span key={id}>{findNorm(catalogueId(id))?.shortName ?? id}</span>)}
                  </div>
                </section>
              )}
              {selected.trap && <blockquote className="iso-trap">{selected.trap}</blockquote>}
            </article>
          )}
        </div>
      )}

      <p className="site-disclaimer">
        Contenido interpretativo importado el {iso.importedAt} de{' '}
        {iso.sources.map((source, index) => (
          <span key={source.url}>
            {index > 0 && ' y '}
            <a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a>
          </span>
        ))}
        . No reproduce el texto de las normas ISO, que está protegido por derechos de autor.
      </p>
    </section>
  )
}

export default IsoView
