import { Building2, ChevronDown, Eye, FileDown, FileSpreadsheet, Printer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { trackDownload } from '../lib/api'
import { downloadExcel, downloadWord, printPdf } from '../lib/docgen'
import { onOrgChange, ORG_FIELDS, readOrg, saveOrg, type OrgData } from '../lib/orgStore'
import type { AdvancedTemplate } from '../lib/templateBuilder'

/** Datos de la organización, compartidos por todas las plantillas (se recuerdan en este navegador). */
export function useOrg(): OrgData {
  const [org, setOrg] = useState<OrgData>(readOrg)
  useEffect(() => onOrgChange(() => setOrg(readOrg())), [])
  return org
}

/** Panel plegable para escribir una sola vez los datos de la empresa. */
export function OrgPanel({ compact }: { compact?: boolean }) {
  const org = useOrg()
  const [draft, setDraft] = useState<OrgData>(org)
  const [open, setOpen] = useState(!org.razonSocial && !compact)
  useEffect(() => setDraft(org), [org])

  return (
    <section className={`org-panel ${open ? 'open' : ''}`}>
      <button type="button" className="org-toggle" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <Building2 size={17} aria-hidden="true" />
        <span>
          <b>{org.razonSocial ? org.razonSocial : 'Datos de su empresa o entidad'}</b>
          <small>
            {org.razonSocial
              ? `Las plantillas se descargan con estos datos${org.ruc ? ` · RUC ${org.ruc}` : ''}. Clic para editar.`
              : 'Complételos una vez: todas las plantillas se descargarán con su razón social, RUC, sede y responsables.'}
          </small>
        </span>
        <ChevronDown size={17} aria-hidden="true" className={open ? 'rotated' : ''} />
      </button>
      {open && (
        <form
          className="org-form"
          onSubmit={(event) => {
            event.preventDefault()
            saveOrg(draft)
            setOpen(false)
          }}
        >
          {ORG_FIELDS.map((field) => (
            <label key={field.key}>
              <span>{field.label}</span>
              <input value={draft[field.key] ?? ''} placeholder={field.placeholder} onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })} />
            </label>
          ))}
          <div className="org-actions">
            <button type="submit" className="btn-primary small">Guardar datos</button>
            <small>Se guardan solo en este navegador. No se envían a ningún servidor.</small>
          </div>
        </form>
      )}
    </section>
  )
}

interface AdaptedDownloadProps {
  template: AdvancedTemplate
  onPreview?: (template: AdvancedTemplate) => void
  label?: string
}

/** Botones de descarga de una plantilla adaptada: Word, Excel (si tiene tabla), PDF y vista previa. */
export function AdaptedDownload({ template, onPreview, label }: AdaptedDownloadProps) {
  const org = useOrg()
  return (
    <div className="adapted-download">
      {label && <b className="adapted-label">{label}</b>}
      <div className="doc-actions compact">
        {onPreview && (
          <button type="button" onClick={() => onPreview(template)} title="Ver antes de descargar">
            <Eye size={15} aria-hidden="true" /> Ver
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            downloadWord(template.name, template.markdown)
            trackDownload(`${template.id}-word`)
          }}
          title="Descargar en Word, con los datos de su empresa"
        >
          <FileDown size={15} aria-hidden="true" /> Word
        </button>
        {template.sheet && (
          <button
            type="button"
            onClick={() => {
              downloadExcel(
                template.name,
                [
                  ['Organización', org.razonSocial ?? ''],
                  ['RUC', org.ruc ?? ''],
                  ['Centro de trabajo', org.centro ?? ''],
                  ['Base legal', template.basis.join(' | ')],
                  ['Origen', 'Plantilla propia del Observatorio Prevenir Perú (no es un formato oficial)'],
                ],
                template.sheet!.columns,
                template.sheet!.rows,
              )
              trackDownload(`${template.id}-excel`)
            }}
            title="Descargar en Excel"
          >
            <FileSpreadsheet size={15} aria-hidden="true" /> Excel
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            printPdf(template.name, template.markdown)
            trackDownload(`${template.id}-pdf`)
          }}
          title="Imprimir o guardar como PDF"
        >
          <Printer size={15} aria-hidden="true" /> PDF
        </button>
      </div>
    </div>
  )
}
