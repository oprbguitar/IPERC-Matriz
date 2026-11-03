import { Gavel } from 'lucide-react'
import { useState } from 'react'
import { CERTAINTY_LABELS, computeContingency, INFRACTIONS } from '../catalog'
import { formatSoles, SIZE_LABELS, UIT_BY_YEAR, type CompanySize } from '../lib/sunafil'

const SEVERITY_LABEL = { leve: 'Leve', grave: 'Grave', 'muy-grave': 'Muy grave' } as const

/**
 * Ficha de contingencia SUNAFIL: parte del numeral tipificado (arts. 26-28 RLGIT) y aplica
 * las reglas especiales verificadas (48.1-C, 27.15, tope REMYPE). No es una multa definitiva.
 */
export function ContingencyCalculator({ defaultWorkers = 10, onOpenGuide }: { defaultWorkers?: number; onOpenGuide?: (id: string) => void }) {
  const [size, setSize] = useState<CompanySize>('no-mype')
  const [code, setCode] = useState('27.3')
  const [affected, setAffected] = useState(Math.min(defaultWorkers, 10) || 1)
  const [total, setTotal] = useState(defaultWorkers || 1)
  const [death, setDeath] = useState(false)
  const [year, setYear] = useState(2026)
  const [remype, setRemype] = useState(true)
  const [income, setIncome] = useState('')

  const result = computeContingency({
    size,
    infractionCode: code,
    affected,
    totalWorkers: total,
    deathOrPermanentDisability: death,
    year,
    remypeRegistered: remype,
    netIncome: Number(income) || undefined,
  })
  const infraction = result?.infraction

  return (
    <article className="an-card wide contingency">
      <h3><Gavel size={18} aria-hidden="true" /> Ficha de contingencia SUNAFIL</h3>
      <div className="an-form">
        <label className="wide-field"><span>Infracción tipificada (RLGIT)</span>
          <select value={code} onChange={(event) => setCode(event.target.value)}>
            {INFRACTIONS.map((item) => (
              <option key={item.code} value={item.code}>{item.code} · {SEVERITY_LABEL[item.severity]} — {item.text.slice(0, 90)}{item.text.length > 90 ? '…' : ''}</option>
            ))}
          </select>
        </label>
        <label><span>Tamaño</span>
          <select value={size} onChange={(event) => setSize(event.target.value as CompanySize)}>
            {(Object.keys(SIZE_LABELS) as CompanySize[]).map((key) => <option key={key} value={key}>{SIZE_LABELS[key]}</option>)}
          </select>
        </label>
        <label><span>Afectados por el hecho</span><input type="number" min={1} value={affected} onChange={(event) => setAffected(Math.max(1, Number(event.target.value) || 1))} /></label>
        <label><span>Total de trabajadores</span><input type="number" min={1} value={total} onChange={(event) => setTotal(Math.max(1, Number(event.target.value) || 1))} /></label>
        <label><span>Año UIT</span>
          <select value={year} onChange={(event) => setYear(Number(event.target.value))}>
            {Object.keys(UIT_BY_YEAR).map((key) => <option key={key} value={key}>{key} · S/ {UIT_BY_YEAR[Number(key)].toLocaleString('es-PE')}</option>)}
          </select>
        </label>
        {size !== 'no-mype' && (
          <>
            <label className="check"><input type="checkbox" checked={remype} onChange={(event) => setRemype(event.target.checked)} /> REMYPE acreditado</label>
            <label><span>Ingresos netos año anterior (S/)</span><input type="number" min={0} value={income} onChange={(event) => setIncome(event.target.value)} /></label>
          </>
        )}
        {code === '28.10' && (
          <label className="check"><input type="checkbox" checked={death} onChange={(event) => setDeath(event.target.checked)} /> El accidente causó muerte o incapacidad permanente</label>
        )}
      </div>

      {result && infraction && (
        <div className="contingency-sheet">
          <div className="fine-result">
            <div>
              <small>Estimación ({result.infractionsCount > 1 ? `${result.infractionsCount} infracciones` : '1 infracción'})</small>
              <strong>{formatSoles(result.totalSoles)}</strong>
              <span>{result.totalUit} UIT · tramo {result.bracket} · tabla {SIZE_LABELS[result.effectiveSize]}{result.capApplied ? ' · tope 1 % aplicado' : ''}</span>
            </div>
          </div>
          <dl className="sheet">
            <div><dt>Infracción potencial</dt><dd>Num. {infraction.code} RLGIT ({SEVERITY_LABEL[infraction.severity]}): {infraction.text}</dd></div>
            <div><dt>Trabajadores afectados</dt><dd>{result.affectedUsed} — {result.affectedCriterion}</dd></div>
            <div><dt>Factores especiales</dt><dd><ul>{result.notes.map((note) => <li key={note}>{note}</li>)}</ul></dd></div>
            <div><dt>Documentos a contrastar</dt><dd><ul>{result.documentsToCheck.map((doc) => <li key={doc}>{doc}</li>)}</ul></dd></div>
            <div><dt>Grado de certeza</dt><dd><em className={`certainty ${result.certainty}`}>{CERTAINTY_LABELS[result.certainty]}</em></dd></div>
          </dl>
        </div>
      )}
      <p className="an-note">
        Tabla del art. 48 RLGIT (D.S. 008-2020-TR) y tipificación de los arts. 26-28 cotejadas con el texto oficial. Es una estimación preventiva, no una multa definitiva.{' '}
        {onOpenGuide && <button type="button" className="link-button" onClick={() => onOpenGuide('guia-sunafil')}>Ver guía SUNAFIL</button>}
      </p>
    </article>
  )
}

export default ContingencyCalculator
