import { Download, ExternalLink, FileSpreadsheet, FileText, Plus, Printer, Search, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { findArticle, FORMATS, NATURE_LABELS, ORGANIZATION_FIELDS, type FormatItem } from '../catalog'
import type { FormatField } from '../catalog/formats'
import { findNorm } from '../data/legalDatabase'
import { trackDownload } from '../lib/api'
import { assetUrl } from '../lib/assets'
import { downloadExcel, downloadWord, printPdf } from '../lib/docgen'

interface FormatsViewProps {
  openFormatId?: string
  onFormatOpened?: () => void
}

const ORG_KEY = 'observatorio-sst:organizacion'

function readOrg(): Record<string, string> {
  try {
    return JSON.parse(window.localStorage.getItem(ORG_KEY) ?? '{}') as Record<string, string>
  } catch {
    return {}
  }
}

export function FormatsView({ openFormatId, onFormatOpened }: FormatsViewProps) {
  const [query, setQuery] = useState('')
  const [origin, setOrigin] = useState<'todos' | 'oficial' | 'propio'>('todos')
  const [editing, setEditing] = useState<FormatItem | null>(() => FORMATS.find((item) => item.id === openFormatId) ?? null)

  const visible = useMemo(
    () =>
      FORMATS.filter((item) => (origin === 'todos' || item.origin === origin) && `${item.name} ${item.description} ${item.topic}`.toLowerCase().includes(query.toLowerCase())),
    [query, origin],
  )

  return (
    <div className="view-page formats">
      <header className="page-head">
        <div>
          <span className="eyebrow"><FileSpreadsheet size={15} aria-hidden="true" /> Implementar</span>
          <h1>Formatos y registros</h1>
          <p>
            Los <b>oficiales</b> se enlazan a la entidad que los publica. Los <b>propios</b> se completan en línea y se descargan en Word, Excel o PDF;
            no son documentos oficiales y deben contrastarse con los campos mínimos de la R.M. 050-2013-TR.
          </p>
        </div>
        <div className="tab-switch" role="group" aria-label="Origen">
          {(['todos', 'oficial', 'propio'] as const).map((key) => (
            <button type="button" key={key} className={origin === key ? 'active' : ''} onClick={() => setOrigin(key)}>
              {key === 'todos' ? 'Todos' : key === 'oficial' ? 'Oficiales' : 'Editables propios'}
            </button>
          ))}
        </div>
      </header>

      <label className="search-inline">
        <Search size={16} aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar formato (registro, ergonomía, comité, contratistas…)" />
      </label>

      <div className="format-grid">
        {visible.map((item) => (
          <article key={item.id} className={`format-card ${item.origin}`}>
            <header>
              <span className={`origin-tag ${item.origin}`}>{item.origin === 'oficial' ? 'Oficial' : 'Propio · editable'}</span>
              <span className="nature-tag">{NATURE_LABELS[item.nature]}</span>
            </header>
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <dl>
              <div><dt>Publica</dt><dd>{item.publisher}</dd></div>
              <div><dt>Versión</dt><dd>{item.version}</dd></div>
              {item.retentionYears && <div><dt>Conservar</dt><dd>{item.retentionYears} años (art. 35)</dd></div>}
            </dl>
            <div className="guide-norms">
              {item.normIds.map((id) => <span key={id}>{findNorm(id)?.shortName ?? id}</span>)}
              {item.articleIds.map((id) => <span key={id} className="art">{findArticle(id)?.label}</span>)}
            </div>
            <footer>
              {item.url && (
                <a className="btn-secondary small" href={item.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} aria-hidden="true" /> Abrir original</a>
              )}
              {item.file && (
                <a className="btn-primary small" href={assetUrl(item.file)} download onClick={() => trackDownload(item.id)}><Download size={14} aria-hidden="true" /> Descargar</a>
              )}
              {(item.columns || item.fields) && (
                <button type="button" className="btn-primary small" onClick={() => setEditing(item)}><FileText size={14} aria-hidden="true" /> Completar en línea</button>
              )}
            </footer>
          </article>
        ))}
      </div>

      {editing && (
        <FormEditor
          format={editing}
          onClose={() => {
            setEditing(null)
            onFormatOpened?.()
          }}
        />
      )}
    </div>
  )
}

function FieldInput({ field, value, onChange }: { field: FormatField; value: string; onChange: (value: string) => void }) {
  if (field.type === 'textarea') return <textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} />
  if (field.type === 'select') {
    return (
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">—</option>
        {field.options?.map((option) => <option key={option}>{option}</option>)}
      </select>
    )
  }
  return <input type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'} value={value} onChange={(event) => onChange(event.target.value)} />
}

function FormEditor({ format, onClose }: { format: FormatItem; onClose: () => void }) {
  const [org, setOrg] = useState<Record<string, string>>(() => ({ version: format.version, fecha: new Date().toISOString().slice(0, 10), ...readOrg() }))
  const [fields, setFields] = useState<Record<string, string>>({})
  const [rows, setRows] = useState<Array<Record<string, string>>>(() => (format.columns ? [{}] : []))

  useEffect(() => {
    const { razonSocial, ruc, centro, responsable } = org
    try {
      window.localStorage.setItem(ORG_KEY, JSON.stringify({ razonSocial, ruc, centro, responsable }))
    } catch {
      // Sin almacenamiento.
    }
  }, [org])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.classList.add('no-scroll')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('no-scroll')
    }
  }, [onClose])

  const header = ORGANIZATION_FIELDS.map((field) => [field.label, org[field.key] ?? ''] as [string, string])
  const legal = [...format.normIds.map((id) => findNorm(id)?.shortName ?? id), ...format.articleIds.map((id) => findArticle(id)?.label ?? id)].join(', ')

  function markdown(): string {
    const meta = header.map(([label, value]) => `| ${label} | ${value || '—'} |`).join('\n')
    const body = (format.fields ?? []).map((field) => `## ${field.label}\n\n${fields[field.key] || '—'}`).join('\n\n')
    const table = format.columns
      ? `| ${format.columns.map((column) => column.label).join(' | ')} |\n|${format.columns.map(() => '---').join('|')}|\n${rows
          .map((row) => `| ${format.columns!.map((column) => row[column.key] || ' ').join(' | ')} |`)
          .join('\n')}`
      : ''
    return `# ${format.name}\n\n| Dato | Valor |\n|---|---|\n${meta}\n\n${body}\n\n${table}\n\nReferencia normativa: ${legal}. Origen: ${format.publisher} (${format.origin === 'propio' ? 'formato propio, no oficial' : 'oficial'}).${format.retentionYears ? ` Conservación: ${format.retentionYears} años.` : ''}\n\nFirma del responsable: ______________________`
  }

  return createPortal(
    <div className="reader-overlay" role="dialog" aria-modal="true" aria-label={format.name} onClick={onClose}>
      <div className="reader-panel form-panel" onClick={(event) => event.stopPropagation()}>
        <header className="reader-head">
          <div>
            <small>{format.origin === 'propio' ? 'Formato propio · no oficial' : 'Formato oficial'} · {NATURE_LABELS[format.nature]}</small>
            <h2>{format.name}</h2>
          </div>
          <div className="doc-actions">
            <button type="button" onClick={() => { downloadWord(format.name, markdown()); trackDownload(`${format.id}-word`) }}><FileText size={15} /> Word</button>
            {format.columns && (
              <button
                type="button"
                onClick={() => {
                  downloadExcel(format.name, header, format.columns!.map((column) => column.label), rows.map((row) => format.columns!.map((column) => row[column.key] ?? '')))
                  trackDownload(`${format.id}-excel`)
                }}
              >
                <FileSpreadsheet size={15} /> Excel
              </button>
            )}
            <button type="button" onClick={() => { printPdf(format.name, markdown()); trackDownload(`${format.id}-pdf`) }}><Printer size={15} /> PDF</button>
          </div>
          <button type="button" className="reader-close" onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        </header>
        <div className="form-body">
          <fieldset className="form-org">
            <legend>Organización (se recuerda en este navegador)</legend>
            {ORGANIZATION_FIELDS.map((field) => (
              <label key={field.key}><span>{field.label}</span><FieldInput field={field} value={org[field.key] ?? ''} onChange={(value) => setOrg({ ...org, [field.key]: value })} /></label>
            ))}
          </fieldset>
          {format.fields && (
            <fieldset className="form-fields">
              <legend>Contenido</legend>
              {format.fields.map((field) => (
                <label key={field.key}><span>{field.label}</span><FieldInput field={field} value={fields[field.key] ?? ''} onChange={(value) => setFields({ ...fields, [field.key]: value })} /></label>
              ))}
            </fieldset>
          )}
          {format.columns && (
            <fieldset className="form-rows">
              <legend>Registros</legend>
              <div className="md-table">
                <table>
                  <thead><tr>{format.columns.map((column) => <th key={column.key}>{column.label}</th>)}<th aria-label="Acciones" /></tr></thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={index}>
                        {format.columns!.map((column) => (
                          <td key={column.key}><FieldInput field={column} value={row[column.key] ?? ''} onChange={(value) => setRows(rows.map((item, i) => (i === index ? { ...item, [column.key]: value } : item)))} /></td>
                        ))}
                        <td><button type="button" className="icon-btn danger" aria-label="Eliminar fila" onClick={() => setRows(rows.filter((_, i) => i !== index))}><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" className="btn-secondary small" onClick={() => setRows([...rows, {}])}><Plus size={14} /> Agregar fila</button>
            </fieldset>
          )}
          <p className="site-disclaimer">Referencia: {legal}. {format.origin === 'propio' ? 'Formato elaborado por el Observatorio; no reemplaza los formatos referenciales oficiales.' : ''} No registre diagnósticos médicos: solo aptitud.</p>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export default FormatsView
