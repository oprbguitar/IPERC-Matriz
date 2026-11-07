import { BookOpen, FileText, Gavel, LayoutGrid, Scale, ScrollText, Search, ShieldCheck, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ARTICLES, CASES, FORMATS, INFRACTIONS, OBLIGATIONS } from '../catalog'
import { GUIDES } from '../data/guides'
import { findNorm, legalNorms } from '../data/legalDatabase'
import { PREVENTION_TOPICS } from '../data/prevention'
import { NAV_ITEMS, type SiteViewId } from '../data/platformContent'
import { DIAGRAMS } from '../data/diagrams'
import { TERMS } from '../data/glossary'
import { SIGNS } from '../data/signs'

export type SearchTarget =
  | { kind: 'vista'; id: SiteViewId }
  | { kind: 'riesgo'; id: string }
  | { kind: 'norma'; id: string }
  | { kind: 'obligacion'; id: string }
  | { kind: 'formato'; id: string }
  | { kind: 'caso'; id: string }
  | { kind: 'guia'; id: string }
  | { kind: 'infraccion'; id: string }

interface Result {
  group: string
  icon: typeof Scale
  title: string
  detail: string
  target: SearchTarget
  haystack: string
}

const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function buildIndex(): Result[] {
  const items: Result[] = []
  // Páginas de la plataforma: el buscador también lleva a cada sección del menú.
  for (const item of NAV_ITEMS) {
    items.push({ group: 'Páginas', icon: LayoutGrid, title: item.label, detail: item.description, target: { kind: 'vista', id: item.id }, haystack: `${item.label} ${item.description}` })
  }
  for (const diagram of DIAGRAMS) {
    items.push({ group: 'Diagramas de procesos', icon: LayoutGrid, title: diagram.title, detail: diagram.summary, target: { kind: 'vista', id: 'diagramas' }, haystack: `diagrama flujo proceso ${diagram.title} ${diagram.summary} ${diagram.nodes.map((node) => node.label).join(' ')}` })
  }
  for (const sign of SIGNS) {
    items.push({ group: 'Señales', icon: ShieldCheck, title: sign.text, detail: sign.description, target: { kind: 'vista', id: 'senales' }, haystack: `señal ${sign.text} ${sign.description}` })
  }
  for (const term of TERMS) {
    items.push({ group: 'Glosario', icon: BookOpen, title: term.t, detail: term.d, target: { kind: 'vista', id: 'glosario' }, haystack: `${term.t} ${term.d}` })
  }
  for (const topic of PREVENTION_TOPICS) {
    items.push({ group: 'Riesgos y controles', icon: ShieldCheck, title: topic.title, detail: topic.summary, target: { kind: 'riesgo', id: topic.id }, haystack: `${topic.title} ${topic.summary} ${topic.controls.join(' ')} ${topic.instruments.join(' ')} ${topic.ppe.join(' ')}` })
  }
  for (const norm of legalNorms) {
    items.push({ group: 'Normas', icon: Scale, title: norm.shortName, detail: norm.plainLanguageSummary, target: { kind: 'norma', id: norm.id }, haystack: `${norm.shortName} ${norm.officialTitle} ${norm.keyTopics.join(' ')} ${norm.plainLanguageSummary}` })
  }
  for (const article of ARTICLES) {
    items.push({ group: 'Artículos verificados', icon: ScrollText, title: `${findNorm(article.normId)?.shortName ?? ''} · ${article.label} — ${article.title}`, detail: article.plainLanguage, target: { kind: 'norma', id: article.normId }, haystack: `${article.label} ${article.title} ${article.plainLanguage} ${article.topics.join(' ')}` })
  }
  for (const obligation of OBLIGATIONS) {
    items.push({ group: 'Obligaciones', icon: ShieldCheck, title: obligation.title, detail: obligation.requirement, target: { kind: 'obligacion', id: obligation.id }, haystack: `${obligation.title} ${obligation.requirement} ${obligation.domain} ${obligation.evidence.join(' ')}` })
  }
  for (const format of FORMATS) {
    items.push({ group: 'Formatos', icon: FileText, title: format.name, detail: `${format.origin === 'oficial' ? 'Oficial' : 'Propio editable'} · ${format.publisher}`, target: { kind: 'formato', id: format.id }, haystack: `${format.name} ${format.description} ${format.topic}` })
  }
  for (const infraction of INFRACTIONS) {
    items.push({ group: 'Infracciones RLGIT', icon: Gavel, title: `Num. ${infraction.code} (${infraction.severity})`, detail: infraction.text, target: { kind: 'infraccion', id: infraction.code }, haystack: `${infraction.code} ${infraction.text} ${infraction.topics.join(' ')}` })
  }
  for (const item of CASES) {
    items.push({ group: 'Casuística', icon: Gavel, title: item.reference, detail: item.criterion, target: { kind: 'caso', id: item.id }, haystack: `${item.reference} ${item.criterion} ${item.topics.join(' ')}` })
  }
  for (const guide of GUIDES) {
    items.push({ group: 'Guías', icon: BookOpen, title: guide.title, detail: guide.summary, target: { kind: 'guia', id: guide.id }, haystack: `${guide.title} ${guide.summary} ${guide.audience}` })
  }
  return items.map((item) => ({ ...item, haystack: normalize(item.haystack) }))
}

const SUGGESTIONS = ['ergonomía en oficinas', 'registro de capacitaciones', 'accidente mortal', 'inspección SUNAFIL', 'microempresa', 'contratistas', 'salud mental']

export function GlobalSearch({ open, onClose, onSelect }: { open: boolean; onClose: () => void; onSelect: (target: SearchTarget) => void }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const index = useMemo(buildIndex, [])

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const results = useMemo(() => {
    const terms = normalize(query).split(/\s+/).filter((term) => term.length > 2)
    if (terms.length === 0) return []
    return index
      .map((item) => ({ item, score: terms.reduce((sum, term) => sum + (item.haystack.includes(term) ? 1 : 0), 0) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 40)
      .map((entry) => entry.item)
  }, [query, index])

  if (!open) return null
  const groups = [...new Set(results.map((item) => item.group))]

  return createPortal(
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Buscar en el Observatorio" onClick={onClose}>
      <div className="search-panel" onClick={(event) => event.stopPropagation()}>
        <div className="search-input">
          <Search size={18} aria-hidden="true" />
          <input aria-label="Buscar en el Observatorio" ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busque una obligación, norma, formato, caso o tema…" />
          <button type="button" onClick={onClose} aria-label="Cerrar búsqueda"><X size={18} /></button>
        </div>
        {results.length === 0 && (
          <div className="search-suggest">
            <small>{query.trim().length > 2 ? 'Sin resultados. Pruebe:' : 'Pruebe:'}</small>
            {SUGGESTIONS.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => setQuery(suggestion)}>{suggestion}</button>
            ))}
          </div>
        )}
        <div className="search-results">
          {groups.map((group) => (
            <section key={group}>
              <h4>{group}</h4>
              {results
                .filter((item) => item.group === group)
                .slice(0, 6)
                .map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      type="button"
                      key={`${group}-${item.title}`}
                      onClick={() => {
                        onSelect(item.target)
                        onClose()
                      }}
                    >
                      <Icon size={15} aria-hidden="true" />
                      <span><b>{item.title}</b><small>{item.detail.slice(0, 140)}</small></span>
                    </button>
                  )
                })}
            </section>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default GlobalSearch
