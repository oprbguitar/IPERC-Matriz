import { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Download, Printer, Search, TriangleAlert } from 'lucide-react'
import { SIGN_ICONS as ICONS } from '../lib/signIcons'
import { FAMILY_INFO, minSignArea, SIGN_NORMS, SIGNS, type SafetySign, type SignFamily } from '../data/signs'
import { H_TABLE_ROWS } from '../data/ssoma/quimicos'
import { assetUrl } from '../lib/assets'
import '../styles/signage.css'

type Tab = 'senales' | 'quimicos' | 'operativas'
type Format = 'A4' | 'A5' | 'A6' | 'sticker' | 'hoja'
const FORMATS: Record<Format, { label: string; page: string; widthMm: number; copies: number }> = {
  A4: { label: 'A4 (210 × 297 mm)', page: 'A4', widthMm: 180, copies: 1 },
  A5: { label: 'A5 (148 × 210 mm)', page: 'A5', widthMm: 125, copies: 1 },
  A6: { label: 'A6 (105 × 148 mm)', page: 'A6', widthMm: 88, copies: 1 },
  sticker: { label: 'Sticker 10 × 10 cm', page: '100mm 130mm', widthMm: 90, copies: 1 },
  hoja: { label: 'Hoja A4 de 6 stickers', page: 'A4', widthMm: 88, copies: 6 },
}

const H_TEXT = new Map(H_TABLE_ROWS.map((row) => [row[0], row[1]]))

/** URL pública de una ficha del generador (lo que abre el QR). */
function fichaUrl(params: string): string {
  return `${window.location.origin}${assetUrl('')}#/senales?${params}`
}

/** QR dibujado como un único path SVG (sin dependencias de canvas). */
function QrPath({ text, x, y, size, color = '#000' }: { text: string; x: number; y: number; size: number; color?: string }) {
  const qr = useMemo(() => QRCode.create(text, { errorCorrectionLevel: 'M' }), [text])
  const count = qr.modules.size
  const cell = size / (count + 2)
  let d = ''
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (qr.modules.get(row, col)) d += `M${(col + 1) * cell} ${(row + 1) * cell}h${cell}v${cell}h-${cell}z`
    }
  }
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={size} height={size} fill="#fff" />
      <path d={d} fill={color} shapeRendering="crispEdges" />
    </g>
  )
}

function Pictogram({ family, icon }: { family: SignFamily; icon: string }) {
  const Icon = ICONS[icon] ?? TriangleAlert
  const info = FAMILY_INFO[family]
  if (family === 'prohibicion')
    return (
      <g>
        <circle cx="100" cy="100" r="84" fill="#fff" stroke={info.bg} strokeWidth="16" />
        <Icon x={48} y={48} size={104} color="#111" strokeWidth={1.8} />
        <line x1="42" y1="42" x2="158" y2="158" stroke={info.bg} strokeWidth="15" />
      </g>
    )
  if (family === 'obligacion')
    return (
      <g>
        <circle cx="100" cy="100" r="92" fill={info.bg} />
        <Icon x={46} y={46} size={108} color="#fff" strokeWidth={1.8} />
      </g>
    )
  if (family === 'advertencia')
    return (
      <g>
        <path d="M100 10 L192 176 H8 Z" fill={info.bg} stroke="#111" strokeWidth="10" strokeLinejoin="round" />
        <Icon x={58} y={72} size={84} color="#111" strokeWidth={2} />
      </g>
    )
  return (
    <g>
      <rect x="6" y="6" width="188" height="188" rx="10" fill={info.bg} />
      <Icon x={40} y={40} size={120} color="#fff" strokeWidth={1.8} />
    </g>
  )
}

/** Señal completa: pictograma + panel de texto a todo el ancho + franja de QR con leyenda (opcional). */
function SignSvg({ sign, qr, svgRef }: { sign: SafetySign; qr: boolean; svgRef?: React.Ref<SVGSVGElement> }) {
  const info = FAMILY_INFO[sign.family]
  const panelBg = sign.family === 'prohibicion' ? '#fff' : info.bg
  const panelFg = sign.family === 'prohibicion' ? info.bg : info.fg
  const lines: string[] = []
  for (const word of sign.text.split(' ')) {
    const last = lines[lines.length - 1]
    if (last && `${last} ${word}`.length <= 20) lines[lines.length - 1] = `${last} ${word}`
    else lines.push(word)
  }
  const fontSize = lines.length > 3 ? 11.5 : lines.length > 2 ? 13 : 15
  const panelH = Math.max(56, lines.length * fontSize * 1.2 + 18)
  const panelY = 202
  const qrY = panelY + panelH + 6
  const height = qr ? qrY + 72 : panelY + panelH + 6
  return (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 200 ${height}`} className="sign-svg" role="img" aria-label={sign.text}>
      <rect width="200" height={height} fill="#fff" />
      <Pictogram family={sign.family} icon={sign.icon} />
      <rect x="6" y={panelY} width="188" height={panelH} rx="8" fill={panelBg} stroke={info.bg} strokeWidth="3" />
      <text
        x="100"
        y={panelY + panelH / 2 - ((lines.length - 1) * fontSize * 1.2) / 2 + fontSize * 0.36}
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="700"
        fontSize={fontSize}
        fill={panelFg}
      >
        {lines.map((line, index) => (
          <tspan key={index} x="100" dy={index === 0 ? 0 : fontSize * 1.2}>{line}</tspan>
        ))}
      </text>
      {qr && (
        <g>
          <rect x="6" y={qrY} width="188" height="66" rx="8" fill="#fff" stroke="#c9ced6" strokeWidth="1.5" />
          <QrPath text={fichaUrl(`s=${sign.id}`)} x={10} y={qrY + 3} size={60} />
          <text x="76" y={qrY + 22} fontFamily="Arial" fontWeight="700" fontSize="9.5" fill="#111">ESCANEE PARA VER</text>
          <text x="76" y={qrY + 35} fontFamily="Arial" fontSize="8.5" fill="#333">peligro, controles,</text>
          <text x="76" y={qrY + 46} fontFamily="Arial" fontSize="8.5" fill="#333">EPP y norma</text>
          <text x="76" y={qrY + 58} fontFamily="Arial" fontSize="7.5" fill="#666">{sign.iso ? `Ref. ISO 7010 ${sign.iso}` : 'NTP 399.010-1'}</text>
        </g>
      )}
    </svg>
  )
}

/** Exporta un SVG del DOM: descarga SVG, PNG o abre una ventana de impresión (PDF) con el formato elegido. */
function serialize(svg: SVGSVGElement): string {
  return new XMLSerializer().serializeToString(svg)
}

function download(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

function exportSvg(svg: SVGSVGElement | null, name: string) {
  if (svg) download(`${name}.svg`, new Blob([serialize(svg)], { type: 'image/svg+xml' }))
}

function exportPng(svg: SVGSVGElement | null, name: string) {
  if (!svg) return
  const box = svg.viewBox.baseVal
  const scale = 1600 / box.width
  const image = new Image()
  image.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = box.width * scale
    canvas.height = box.height * scale
    const context = canvas.getContext('2d')
    if (!context) return
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => blob && download(`${name}.png`, blob), 'image/png')
  }
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serialize(svg))}`
}

function printSvg(svg: SVGSVGElement | null, format: Format, title: string) {
  if (!svg) return
  const spec = FORMATS[format]
  const markup = serialize(svg)
  const items = Array.from({ length: spec.copies }, () => `<div class="item">${markup}</div>`).join('')
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${title}</title><style>
    @page { size: ${spec.page}; margin: 8mm; }
    body { margin: 0; font-family: Arial, sans-serif; }
    .grid { display: flex; flex-wrap: wrap; gap: 6mm; justify-content: center; }
    .item svg { width: ${spec.widthMm}mm; height: auto; display: block; }
    .item { break-inside: avoid; }
    .foot { font-size: 8pt; color: #555; text-align: center; margin-top: 4mm; }
  </style></head><body><div class="grid">${items}</div>
  <p class="foot">Observatorio Prevenir Perú · Pictograma ilustrativo: valide con NTP 399.010-1 / ISO 7010 antes de su uso oficial.</p>
  <script>window.onload = () => { window.print() }</script></body></html>`)
  win.document.close()
}

function ExportBar({ svgRef, name, format, onFormat }: { svgRef: React.RefObject<SVGSVGElement | null>; name: string; format: Format; onFormat: (format: Format) => void }) {
  return (
    <div className="sign-export">
      <label>
        <span>Formato de impresión</span>
        <select value={format} onChange={(event) => onFormat(event.target.value as Format)}>
          {(Object.keys(FORMATS) as Format[]).map((key) => <option key={key} value={key}>{FORMATS[key].label}</option>)}
        </select>
      </label>
      <div className="sign-export-buttons">
        <button type="button" className="btn-primary" onClick={() => printSvg(svgRef.current, format, name)}><Printer size={16} /> Imprimir / PDF</button>
        <button type="button" className="btn-ghost" onClick={() => exportSvg(svgRef.current, name)}><Download size={16} /> SVG</button>
        <button type="button" className="btn-ghost" onClick={() => exportPng(svgRef.current, name)}><Download size={16} /> PNG</button>
      </div>
    </div>
  )
}

/* ---------------- Etiqueta SGA ---------------- */

interface ClpRow { i: string; n: string; es?: string; ec?: string; cas?: string; c?: string; h?: string; p?: string; a3?: number }

const GHS_ICON: Record<string, string> = { GHS01: 'Bomb', GHS02: 'Flame', GHS03: 'Flame', GHS04: 'Cylinder', GHS05: 'Droplets', GHS06: 'Skull', GHS07: '!', GHS08: 'PersonStanding', GHS09: 'Fish' }

function GhsDiamond({ code, x, y, size }: { code: string; x: number; y: number; size: number }) {
  const icon = GHS_ICON[code]
  const Icon = icon && icon !== '!' ? ICONS[icon] : undefined
  const half = size / 2
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M${half} 2 L${size - 2} ${half} L${half} ${size - 2} L2 ${half} Z`} fill="#fff" stroke="#E00000" strokeWidth={size * 0.07} strokeLinejoin="round" />
      {Icon ? <Icon x={size * 0.27} y={size * 0.27} size={size * 0.46} color="#000" strokeWidth={2.2} /> : (
        <text x={half} y={half + size * 0.16} textAnchor="middle" fontSize={size * 0.46} fontWeight="900" fontFamily="Arial">!</text>
      )}
    </g>
  )
}

function ChemicalLabel({ row, supplier, fdsUrl, svgRef }: { row: ClpRow; supplier: string; fdsUrl: string; svgRef: React.Ref<SVGSVGElement> }) {
  const pics = (row.p ?? '').match(/GHS0\d/g) ?? []
  const signal = /Dgr/.test(row.p ?? '') ? 'PELIGRO' : /Wng/.test(row.p ?? '') ? 'ATENCIÓN' : ''
  const hCodes = [...new Set((row.h ?? '').match(/H\d{3}[A-Za-z]*/g) ?? [])]
  // Cada indicación H se ajusta a ~52 caracteres por línea para no invadir el QR (columna derecha).
  const hLines = hCodes.flatMap((code) => {
    const words = `${code}: ${H_TEXT.get(code) ?? H_TEXT.get(code.slice(0, 4)) ?? 'ver FDS'}`.split(' ')
    const out: string[] = []
    for (const word of words) {
      const last = out[out.length - 1]
      if (last !== undefined && `${last} ${word}`.length <= 52) out[out.length - 1] = `${last} ${word}`
      else out.push(out.length ? `   ${word}` : word)
    }
    return out
  })
  const name = row.es ?? row.n
  const height = Math.max(250, 232 + hLines.length * 13)
  return (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 400 ${height}`} className="sign-svg label-svg" role="img" aria-label={`Etiqueta SGA de ${name}`}>
      <rect x="2" y="2" width="396" height={height - 4} fill="#fff" stroke="#E00000" strokeWidth="4" rx="6" />
      <text x="16" y="30" fontFamily="Arial" fontWeight="700" fontSize="17">{name.length > 40 ? `${name.slice(0, 40)}…` : name}</text>
      <text x="16" y="48" fontFamily="Arial" fontSize="10" fill="#333">CAS {row.cas || '—'} · CE {row.ec || '—'} · Índice {row.i}</text>
      {pics.map((code, index) => <GhsDiamond key={code} code={code} x={16 + index * 66} y={58} size={62} />)}
      {signal && <text x="16" y="146" fontFamily="Arial" fontWeight="900" fontSize="20" fill="#000">{signal}</text>}
      <text fontFamily="Arial" fontSize="10.5" fill="#000">
        {hLines.map((line, index) => <tspan key={index} x="16" y={166 + index * 13} xmlSpace="preserve">{line}</tspan>)}
      </text>
      <text x="16" y={height - 46} fontFamily="Arial" fontSize="9.5" fill="#333">Consejos de prudencia (P): según la FDS.</text>
      <text x="16" y={height - 30} fontFamily="Arial" fontSize="10" fontWeight="700">{(supplier || 'Proveedor: nombre, dirección y teléfono').slice(0, 48)}</text>
      <text x="16" y={height - 16} fontFamily="Arial" fontSize="8.5" fill="#555">Clasificación: Anexo VI CLP · D.S. 005-2026-MINAM</text>
      <QrPath text={fdsUrl || fichaUrl(`sust=${encodeURIComponent(row.i)}`)} x={316} y={height - 96} size={76} />
    </svg>
  )
}

/* ---------------- Etiqueta operativa ---------------- */

const OPS = {
  extintor: { title: 'TARJETA DE INSPECCIÓN DE EXTINTOR', color: '#C1121C', fields: ['Código / ubicación', 'Tipo y capacidad', 'Última recarga', 'Próxima recarga', 'Responsable'], months: true },
  epp: { title: 'CONTROL DE EPP', color: '#0B5CAD', fields: ['Trabajador', 'EPP entregado', 'Fecha de entrega', 'Próxima revisión', 'Firma'], months: false },
  mantenimiento: { title: 'MANTENIMIENTO DE EQUIPO', color: '#E07B00', fields: ['Equipo / código', 'Último mantenimiento', 'Próximo mantenimiento', 'Técnico', 'Estado'], months: false },
  acceso: { title: 'ACCESO AUTORIZADO', color: '#0E7A3E', fields: ['Nombre', 'Área autorizada', 'Válido hasta', 'Autoriza'], months: false },
  loto: { title: 'PELIGRO · NO OPERAR (LOTO)', color: '#B71C1C', fields: ['Bloqueado por', 'Área / equipo', 'Energía aislada', 'Fecha y hora', 'Teléfono'], months: false },
  andamioOk: { title: 'ANDAMIO APTO PARA USO', color: '#1B7F3B', fields: ['Andamio / ubicación', 'Carga máxima', 'Inspeccionado por', 'Fecha', 'Válido hasta'], months: false },
  andamioPrec: { title: 'PRECAUCIÓN · USO RESTRINGIDO', color: '#C99700', fields: ['Andamio / ubicación', 'Restricción', 'EPP requerido', 'Inspeccionado por', 'Fecha'], months: false },
  andamioNo: { title: 'NO USAR · FUERA DE SERVICIO', color: '#B71C1C', fields: ['Equipo / ubicación', 'Motivo', 'Reportado por', 'Fecha'], months: false },
  arnes: { title: 'INSPECCIÓN DE ARNÉS Y LÍNEA DE VIDA', color: '#E07B00', fields: ['Código del arnés', 'Usuario', 'Fecha de fabricación', 'Inspeccionado por'], months: true },
  herramienta: { title: 'HERRAMIENTA INSPECCIONADA', color: '#0B5CAD', fields: ['Herramienta / código', 'Trimestre (color)', 'Inspector', 'Fecha'], months: false },
  botiquin: { title: 'CONTROL DE BOTIQUÍN', color: '#0E7A3E', fields: ['Ubicación', 'Responsable', 'Última reposición', 'Productos vencidos'], months: true },
} as const
type OpKind = keyof typeof OPS

function OpsLabel({ kind, values, qrText, svgRef }: { kind: OpKind; values: string[]; qrText: string; svgRef: React.Ref<SVGSVGElement> }) {
  const spec = OPS[kind]
  const months = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
  const height = 70 + spec.fields.length * 30 + (spec.months ? 56 : 0) + 20
  return (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 300 ${height}`} className="sign-svg label-svg" role="img" aria-label={spec.title}>
      <rect x="2" y="2" width="296" height={height - 4} rx="8" fill="#fff" stroke={spec.color} strokeWidth="3" />
      <rect x="2" y="2" width="296" height="40" rx="8" fill={spec.color} />
      <text x="150" y="27" textAnchor="middle" fill="#fff" fontFamily="Arial" fontWeight="700" fontSize="13">{spec.title}</text>
      {spec.fields.map((field, index) => (
        <g key={field} transform={`translate(14 ${62 + index * 30})`}>
          <text fontFamily="Arial" fontSize="9" fill="#555">{field}</text>
          <text y="15" fontFamily="Arial" fontSize="12" fontWeight="700">{values[index] ?? ''}</text>
          <line x1="0" x2={qrText && index < 3 ? 190 : 272} y1="19" y2="19" stroke="#bbb" />
        </g>
      ))}
      {spec.months && (
        <g transform={`translate(14 ${62 + spec.fields.length * 30})`}>
          <text fontFamily="Arial" fontSize="9" fill="#555">Inspección mensual (marque ✓)</text>
          {months.map((month, index) => (
            <g key={index} transform={`translate(${index * 22.6} 8)`}>
              <rect width="20" height="30" fill="#fff" stroke="#999" />
              <text x="10" y="11" textAnchor="middle" fontSize="8" fontFamily="Arial">{month}</text>
            </g>
          ))}
        </g>
      )}
      {qrText && <QrPath text={qrText} x={214} y={52} size={72} />}
    </svg>
  )
}

/* ---------------- Ficha que abre el QR ---------------- */

function readHashParams(): URLSearchParams {
  const hash = window.location.hash
  const query = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : ''
  return new URLSearchParams(query)
}

function SignFicha({ sign }: { sign: SafetySign }) {
  const info = FAMILY_INFO[sign.family]
  return (
    <article className="sign-ficha">
      <div className="sign-ficha-head">
        <div className="sign-ficha-svg"><SignSvg sign={sign} qr={false} /></div>
        <div>
          <span className="sign-family" style={{ background: info.bg, color: info.fg }}>{info.label}</span>
          <h2>{sign.text}</h2>
          <p>{sign.description}</p>
          <p className="ssoma-count">Revisión de la ficha: {new Date().getFullYear()} · Referencia ISO 7010: {sign.iso ?? 'no aplica'}</p>
        </div>
      </div>
      <div className="sign-ficha-grid">
        <section><h3>Peligro y consecuencias</h3><ul>{sign.risks.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section><h3>Controles</h3><ul>{sign.controls.map((item) => <li key={item}>{item}</li>)}</ul></section>
        {sign.epp && <section><h3>EPP</h3><ul>{sign.epp.map((item) => <li key={item}>{item}</li>)}</ul></section>}
        <section><h3>Dónde se usa</h3><ul>{sign.where.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section><h3>Referencia normativa</h3><ul>{sign.norms.map((item) => <li key={item}>{item}</li>)}</ul></section>
      </div>
    </article>
  )
}

function SubstanceFicha({ index }: { index: string }) {
  const [row, setRow] = useState<ClpRow | null | undefined>(undefined)
  useEffect(() => {
    fetch(assetUrl('data/clp-annex-vi.json'))
      .then((response) => response.json())
      .then((rows: ClpRow[]) => setRow(rows.find((item) => item.i === index) ?? null))
      .catch(() => setRow(null))
  }, [index])
  if (row === undefined) return <p className="empty-note">Cargando ficha…</p>
  if (!row) return <p className="empty-note">No se encontró la sustancia {index}.</p>
  const hCodes = [...new Set((row.h ?? '').match(/H\d{3}[A-Za-z]*/g) ?? [])]
  return (
    <article className="sign-ficha">
      <h2>{row.es ?? row.n}</h2>
      <p className="ssoma-count">{row.es ? `${row.n} · ` : ''}CAS {row.cas || '—'} · CE {row.ec || '—'} · Índice {row.i}</p>
      <div className="sign-ficha-grid">
        <section><h3>Clasificación SGA</h3><p>{row.c}</p><p><b>{row.p}</b></p></section>
        <section><h3>Indicaciones de peligro</h3><ul>{hCodes.map((code) => <li key={code}><b>{code}</b> {H_TEXT.get(code) ?? H_TEXT.get(code.slice(0, 4)) ?? ''}</li>)}</ul></section>
        <section><h3>Importante</h3><p>Esta ficha resume la clasificación armonizada. No sustituye la etiqueta obligatoria ni la Ficha de Datos de Seguridad (FDS) del proveedor.</p></section>
      </div>
    </article>
  )
}

/* ---------------- Vista ---------------- */

export default function SignageView() {
  const params = readHashParams()
  const qrSign = SIGNS.find((sign) => sign.id === params.get('s'))
  const qrSubstance = params.get('sust')

  const [tab, setTab] = useState<Tab>('senales')
  const [family, setFamily] = useState<SignFamily | 'todas'>('todas')
  const [signId, setSignId] = useState(qrSign?.id ?? 'primeros-auxilios')
  const [withQr, setWithQr] = useState(true)
  const [format, setFormat] = useState<Format>('A4')
  const [distance, setDistance] = useState(10)
  const signRef = useRef<SVGSVGElement>(null)

  const [rows, setRows] = useState<ClpRow[] | null>(null)
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<ClpRow | null>(null)
  const [supplier, setSupplier] = useState('')
  const [fdsUrl, setFdsUrl] = useState('')
  const labelRef = useRef<SVGSVGElement>(null)

  const [opKind, setOpKind] = useState<OpKind>('extintor')
  const [opValues, setOpValues] = useState<string[]>([])
  const [opQr, setOpQr] = useState('')
  const opRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (tab !== 'quimicos' || rows) return
    fetch(assetUrl('data/clp-annex-vi.json')).then((response) => response.json()).then(setRows).catch(() => setRows([]))
  }, [tab, rows])

  const sign = SIGNS.find((item) => item.id === signId) ?? SIGNS[0]
  const [signQuery, setSignQuery] = useState('')
  const sq = signQuery.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const visibleSigns = SIGNS.filter((item) => (family === 'todas' || item.family === family) && (!sq || `${item.text} ${item.description} ${item.risks.join(' ')}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(sq)))
  const size = minSignArea(distance)

  const results = useMemo(() => {
    if (!rows) return []
    const term = query.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    if (term.length < 2) return []
    return rows
      .filter((row) => `${row.n} ${row.es ?? ''} ${row.cas ?? ''}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(term))
      .slice(0, 12)
  }, [rows, query])

  return (
    <div className="view-page signage">
      <header className="page-head">
        <div>
          <h1>Señales, stickers y etiquetas</h1>
          <p>Genere señales de seguridad, etiquetas SGA de productos químicos y tarjetas operativas listas para imprimir, con un QR que abre su ficha informativa.</p>
        </div>
      </header>

      {qrSign && <SignFicha sign={qrSign} />}
      {qrSubstance && <SubstanceFicha index={qrSubstance} />}

      <div className="tab-switch" role="tablist" aria-label="Tipo de generador">
        <button type="button" role="tab" aria-selected={tab === 'senales'} className={tab === 'senales' ? 'active' : ''} onClick={() => setTab('senales')}>Señales de seguridad</button>
        <button type="button" role="tab" aria-selected={tab === 'quimicos'} className={tab === 'quimicos' ? 'active' : ''} onClick={() => setTab('quimicos')}>Etiqueta SGA (química)</button>
        <button type="button" role="tab" aria-selected={tab === 'operativas'} className={tab === 'operativas' ? 'active' : ''} onClick={() => setTab('operativas')}>Etiquetas operativas</button>
      </div>

      {tab === 'senales' && (
        <div className="sign-layout">
          <div className="sign-config">
            <div className="ssoma-filter">
              <button type="button" className={family === 'todas' ? 'active' : ''} onClick={() => setFamily('todas')}>Todas</button>
              {(Object.keys(FAMILY_INFO) as SignFamily[]).map((key) => (
                <button type="button" key={key} className={family === key ? 'active' : ''} onClick={() => setFamily(key)}>{FAMILY_INFO[key].label}</button>
              ))}
            </div>
            <label className="ssoma-search small">
              <Search size={16} aria-hidden="true" />
              <input value={signQuery} onChange={(event) => setSignQuery(event.target.value)} placeholder={`Buscar entre ${SIGNS.length} señales: extintor, arnés, corrosivo…`} />
            </label>
            <div className="sign-picker">
              {visibleSigns.map((item) => (
                <button type="button" key={item.id} className={item.id === signId ? 'active' : ''} onClick={() => setSignId(item.id)} title={item.text}>
                  <SignSvg sign={item} qr={false} />
                  <span>{item.text}</span>
                </button>
              ))}
            </div>
            <label className="sign-check"><input type="checkbox" checked={withQr} onChange={(event) => setWithQr(event.target.checked)} /> Agregar QR informativo (abre la ficha con peligro, controles, EPP y norma)</label>
            <details className="ssoma-fold">
              <summary><span>Tamaño mínimo según la distancia de observación</span></summary>
              <div className="ssoma-fold-body">
                <label className="sign-range">
                  Distancia: <b>{distance} m</b>
                  <input type="range" min={1} max={49} value={distance} onChange={(event) => setDistance(Number(event.target.value))} />
                </label>
                <p>Área mínima S ≥ L²/2000 = <b>{size.areaM2.toFixed(3)} m²</b>, equivalente a una señal cuadrada de <b>{Math.ceil(size.sideCm)} × {Math.ceil(size.sideCm)} cm</b> (NTP 399.010-1, válido hasta 50 m).</p>
              </div>
            </details>
            <details className="ssoma-fold">
              <summary><span>Familia, forma, colores y normas</span></summary>
              <div className="ssoma-fold-body">
                <ul>{(Object.keys(FAMILY_INFO) as SignFamily[]).map((key) => <li key={key}><b>{FAMILY_INFO[key].label}:</b> {FAMILY_INFO[key].shape}. {FAMILY_INFO[key].colors}. {FAMILY_INFO[key].meaning}</li>)}</ul>
                <ul>{SIGN_NORMS.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            </details>
          </div>
          <div className="sign-preview">
            <SignSvg sign={sign} qr={withQr} svgRef={signRef} />
            <ExportBar svgRef={signRef} name={`senal-${sign.id}`} format={format} onFormat={setFormat} />
            <p className="site-disclaimer">
              Pictograma ilustrativo. Antes de imprimir para uso oficial, valide geometría, dimensiones y ubicación con la NTP 399.010-1:2016 o la
              norma sectorial aplicable; los pictogramas ISO 7010 tienen condiciones de licencia. El QR complementa, no reemplaza, la señal.
            </p>
          </div>
        </div>
      )}

      {tab === 'quimicos' && (
        <div className="sign-layout">
          <div className="sign-config">
            <label className="ssoma-search small">
              <Search size={16} aria-hidden="true" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Sustancia en español o inglés, o n.° CAS (p. ej. hidróxido de sodio)" />
            </label>
            {!rows && <p className="empty-note">Cargando clasificación armonizada…</p>}
            <ul className="sign-results">
              {results.map((row) => (
                <li key={row.i + row.n}>
                  <button type="button" className={picked?.i === row.i ? 'active' : ''} onClick={() => setPicked(row)}>
                    <b>{row.es ?? row.n}</b>
                    <small>{row.es ? `${row.n} · ` : ''}CAS {row.cas || '—'}{row.a3 ? ' · nombre ES del Anexo 3 (OCR)' : ''}</small>
                  </button>
                </li>
              ))}
            </ul>
            <label className="sign-field"><span>Proveedor (nombre, dirección, teléfono)</span><input value={supplier} onChange={(event) => setSupplier(event.target.value)} /></label>
            <label className="sign-field"><span>Enlace a la FDS (opcional; si no, el QR abre la ficha de clasificación)</span><input value={fdsUrl} onChange={(event) => setFdsUrl(event.target.value)} placeholder="https://…" /></label>
            <p className="site-disclaimer">
              El D.S. 005-2026-MINAM asigna la clasificación y el etiquetado al fabricante y su cumplimiento al importador. Esta etiqueta es un borrador:
              agregue los consejos de prudencia de la FDS y verifique dimensiones mínimas según la capacidad del envase.
            </p>
          </div>
          <div className="sign-preview">
            {picked ? (
              <>
                <ChemicalLabel row={picked} supplier={supplier} fdsUrl={fdsUrl} svgRef={labelRef} />
                <ExportBar svgRef={labelRef} name={`etiqueta-sga-${picked.i}`} format={format} onFormat={setFormat} />
              </>
            ) : (
              <p className="empty-note">Busque y elija una sustancia para generar su etiqueta.</p>
            )}
          </div>
        </div>
      )}

      {tab === 'operativas' && (
        <div className="sign-layout">
          <div className="sign-config">
            <div className="ssoma-filter">
              {(Object.keys(OPS) as OpKind[]).map((key) => (
                <button type="button" key={key} className={opKind === key ? 'active' : ''} onClick={() => { setOpKind(key); setOpValues([]) }}>{OPS[key].title.toLowerCase()}</button>
              ))}
            </div>
            {OPS[opKind].fields.map((field, index) => (
              <label className="sign-field" key={field}>
                <span>{field}</span>
                <input value={opValues[index] ?? ''} onChange={(event) => setOpValues((prev) => { const next = [...prev]; next[index] = event.target.value; return next })} />
              </label>
            ))}
            <label className="sign-field"><span>Contenido del QR (enlace al registro, procedimiento o código)</span><input value={opQr} onChange={(event) => setOpQr(event.target.value)} placeholder="https://… o código del equipo" /></label>
            <p className="site-disclaimer">Las etiquetas operativas controlan inspecciones y activos: no sustituyen las señales normativas de seguridad.</p>
          </div>
          <div className="sign-preview">
            <OpsLabel kind={opKind} values={opValues} qrText={opQr} svgRef={opRef} />
            <ExportBar svgRef={opRef} name={`etiqueta-${opKind}`} format={format} onFormat={setFormat} />
          </div>
        </div>
      )}
    </div>
  )
}
