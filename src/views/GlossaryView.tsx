import { useMemo, useState } from 'react'
import { Palette, Search, X } from 'lucide-react'
import { COLOR_GROUPS, TERM_CATS, TERMS, type TermCat } from '../data/glossary'
import '../styles/ssoma.css'

const norm = (text: string) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const KIND_LABEL = { norma: 'Norma', referencia: 'Referencia internacional', practica: 'Práctica común' } as const

export default function GlossaryView() {
  const [tab, setTab] = useState<'terminos' | 'colores'>('terminos')
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState<TermCat | 'todas'>('todas')
  const [letter, setLetter] = useState<string | null>(null)
  const term = norm(query.trim())

  const terms = useMemo(
    () =>
      TERMS.filter((item) => (cat === 'todas' || item.c === cat) && (!letter || norm(item.t).startsWith(letter)) && (!term || norm(`${item.t} ${item.d} ${item.n ?? ''}`).includes(term))).sort((a, b) =>
        a.t.localeCompare(b.t, 'es'),
      ),
    [cat, letter, term],
  )
  const letters = useMemo(() => [...new Set(TERMS.map((item) => norm(item.t)[0].toUpperCase()))].sort(), [])
  const groups = COLOR_GROUPS.filter((group) => !term || norm(`${group.title} ${group.source} ${group.rows.map((row) => `${row.color} ${row.meaning}`).join(' ')}`).includes(term))

  return (
    <div className="view-page ssoma-visor">
      <header className="page-head">
        <div>
          <h1>Glosario y códigos de colores</h1>
          <p>Términos, siglas y leyes que se usan en SST, salud ocupacional, ambiente y químicos, y los códigos de colores de la industria. Escriba y filtre al instante.</p>
        </div>
      </header>

      <label className="ssoma-search">
        <Search size={18} aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej.: IPERC, ECA, PETAR, tuberías, residuos, casco…" aria-label="Buscar en el glosario" />
        {query && <button type="button" aria-label="Limpiar" onClick={() => setQuery('')}><X size={16} /></button>}
      </label>

      <div className="tab-switch ssoma-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'terminos'} className={tab === 'terminos' ? 'active' : ''} onClick={() => setTab('terminos')}>Términos ({TERMS.length})</button>
        <button type="button" role="tab" aria-selected={tab === 'colores'} className={tab === 'colores' ? 'active' : ''} onClick={() => setTab('colores')}><Palette size={15} aria-hidden="true" /> Códigos de colores</button>
      </div>

      {tab === 'terminos' && (
        <section className="ssoma-section">
          <div className="ssoma-filter">
            <button type="button" className={cat === 'todas' ? 'active' : ''} onClick={() => setCat('todas')}>Todas</button>
            {(Object.keys(TERM_CATS) as TermCat[]).map((key) => (
              <button type="button" key={key} className={cat === key ? 'active' : ''} onClick={() => setCat(key)}>{TERM_CATS[key]}</button>
            ))}
          </div>
          <div className="ssoma-filter gloss-letters">
            <button type="button" className={!letter ? 'active' : ''} onClick={() => setLetter(null)}>A-Z</button>
            {letters.map((item) => (
              <button type="button" key={item} className={letter === item.toLowerCase() ? 'active' : ''} onClick={() => setLetter(item.toLowerCase())}>{item}</button>
            ))}
          </div>
          <p className="ssoma-count">{terms.length} término(s). Toque uno para ver su definición.</p>
          {terms.map((item) => (
            <details className="ssoma-fold" key={item.t} open={term.length > 2 && terms.length <= 3}>
              <summary><span>{item.t}</span><em>{TERM_CATS[item.c]}</em></summary>
              <div className="ssoma-fold-body">
                <p>{item.d}</p>
                {item.n && <p className="ssoma-source">Base: {item.n}</p>}
              </div>
            </details>
          ))}
          {terms.length === 0 && <p className="empty-note">Sin coincidencias. Pruebe en «Códigos de colores» o con otra palabra.</p>}
        </section>
      )}

      {tab === 'colores' && (
        <section className="ssoma-section">
          <p className="ssoma-count">Cada código indica si es norma, referencia internacional o práctica común. Las prácticas deben definirse en su RISST.</p>
          {groups.map((group) => (
            <details className="ssoma-fold" key={group.id} open={Boolean(term)}>
              <summary><span>{group.title}</span><em>{KIND_LABEL[group.kind]}</em></summary>
              <div className="ssoma-fold-body">
                <p className="ssoma-source">Fuente: {group.source}</p>
                <ul className="color-list">
                  {group.rows.map((row) => (
                    <li key={row.color + row.meaning}>
                      <span className="color-chip" style={{ background: row.hex, color: row.text ?? '#111' }}>{row.color}</span>
                      <span>{row.meaning}</span>
                    </li>
                  ))}
                </ul>
                {group.note && <p className="ssoma-count">{group.note}</p>}
              </div>
            </details>
          ))}
        </section>
      )}
    </div>
  )
}
