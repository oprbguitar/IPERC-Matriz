import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import QRCode from 'qrcode'
import { Download, Printer, Search, TriangleAlert } from 'lucide-react'
import { SIGN_ICONS as ICONS } from '../lib/signIcons'
import { FAMILY_INFO, minSignArea, SIGN_NORMS, SIGNS, type SafetySign, type SignFamily } from '../data/signs'
import { H_TABLE_ROWS } from '../data/ssoma/quimicos'
import { OPS, OP_GROUPS, QUARTERS, type OpField, type OpKind, type OpSpec } from '../data/signsOps'
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

const FAMILIES = Object.keys(FAMILY_INFO) as SignFamily[]
/** Señales mostradas por familia antes de pulsar «Ver más». */
const PER_FAMILY = 6
const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
/** Texto indexado para la búsqueda: nombre, descripción, riesgos, código ISO y lugares de uso. */
const SIGN_INDEX = new Map(SIGNS.map((item) => [item.id, normalize(`${item.text} ${item.description} ${item.risks.join(' ')} ${item.iso ?? ''} ${item.where.join(' ')} ${FAMILY_INFO[item.family].label}`)]))
const FAMILY_COUNT = Object.fromEntries(FAMILIES.map((key) => [key, SIGNS.filter((item) => item.family === key).length])) as Record<SignFamily, number>

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

const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SET', 'OCT', 'NOV', 'DIC']
const fit = (value: string, max: number) => (value.length > max ? `${value.slice(0, max - 1)}…` : value)
const fmtDate = (value: string) => (/^\d{4}-\d{2}-\d{2}$/.test(value) ? value.split('-').reverse().join('/') : value)
const wrapText = (value: string, max: number) => {
  const out: string[] = []
  for (const word of value.split(' ')) {
    const last = out[out.length - 1]
    if (last !== undefined && `${last} ${word}`.length <= max) out[out.length - 1] = `${last} ${word}`
    else out.push(word)
  }
  return out
}

function OpsLabel({ kind, values, qrText, svgRef, className = 'ops-svg' }: { kind: OpKind; values: Record<string, string>; qrText: string; svgRef?: React.Ref<SVGSVGElement>; className?: string }) {
  const spec: OpSpec = OPS[kind]
  const Icon = ICONS[spec.icon] ?? TriangleAlert
  const color = spec.color
  const fg = spec.statusFg ?? '#fff'
  const ROW = 38

  // Campos: dos columnas; los "wide" ocupan toda la fila.
  const cells: { field: OpField; x: number; y: number; w: number }[] = []
  let y = 108
  let pending = false
  for (const field of spec.fields) {
    if (field.wide) {
      if (pending) { y += ROW; pending = false }
      cells.push({ field, x: 16, y, w: 368 })
      y += ROW
    } else if (!pending) {
      cells.push({ field, x: 16, y, w: 176 })
      pending = true
    } else {
      cells.push({ field, x: 208, y, w: 176 })
      y += ROW
      pending = false
    }
  }
  if (pending) y += ROW
  y += 4

  const quarterY = y
  if (spec.quarters) y += 48
  const checksY = y
  const checks = spec.checks ?? []
  if (checks.length) y += 16 + checks.length * 17 + 8
  const monthsY = y
  if (spec.months) y += 52
  const footY = y
  const colW = qrText ? 256 : 368
  const sigH = 46
  const leftH = (spec.due ? 44 : 0) + sigH
  y += Math.max(leftH, qrText ? 106 : 0) + 8
  const noteLines = wrapText(spec.note, 96)
  const noteY = y
  y += noteLines.length * 10 + 16
  const height = y

  const statusSize = Math.min(24, 306 / (spec.status.length * 0.7))
  const titleSize = Math.min(14, 368 / (spec.title.length * 0.7))
  const subSize = Math.min(9, 368 / (spec.subtitle.length * 0.52))
  const quarterSel = QUARTERS.findIndex((q) => q.label === values.trimestre)
  const dueValue = fmtDate(values.__due ?? '')

  return (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 400 ${height}`} className={`sign-svg label-svg ${className}`} role="img" aria-label={spec.title}>
      <rect x="2" y="2" width="396" height={height - 4} rx="12" fill="#fff" stroke={color} strokeWidth="4" />
      <path d="M2 56 V14 a12 12 0 0 1 12 -12 H386 a12 12 0 0 1 12 12 V56 Z" fill={color} />
      {spec.hole && <circle cx="200" cy="12" r="5" fill="#fff" stroke="#00000055" strokeWidth="1.2" />}
      <circle cx="38" cy="31" r="19" fill="#fff" />
      <Icon x={26} y={19} size={24} color={color} strokeWidth={2} />
      <text x="66" y={31 + statusSize * 0.36} fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize={statusSize} fill={fg}>{spec.status}</text>
      <text x="16" y="78" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize={titleSize} fill="#111">{spec.title}</text>
      <text x="16" y="92" fontFamily="Arial, Helvetica, sans-serif" fontSize={subSize} fill="#555">{spec.subtitle}</text>
      <line x1="16" x2="384" y1="99" y2="99" stroke={color} strokeWidth="1.5" />

      {cells.map(({ field, x, y: cy, w }) => {
        const raw = values[field.key] ?? ''
        const shown = field.type === 'date' ? fmtDate(raw) : raw
        return (
          <g key={field.key} transform={`translate(${x} ${cy})`}>
            <text y="9" fontFamily="Arial, Helvetica, sans-serif" fontSize="8.5" fill="#555">{field.label.toUpperCase()}</text>
            <text y="24" fontFamily="Arial, Helvetica, sans-serif" fontSize="12" fontWeight="700" fill="#111">{fit(shown, Math.floor(w / 6.6))}</text>
            <line x1="0" x2={w - 6} y1="28" y2="28" stroke="#9aa0a8" strokeWidth="0.8" />
          </g>
        )
      })}

      {spec.quarters && (
        <g transform={`translate(16 ${quarterY})`}>
          <text y="9" fontFamily="Arial" fontSize="8.5" fill="#555">CÓDIGO DE COLOR DEL TRIMESTRE (CINTA)</text>
          {QUARTERS.map((quarter, index) => (
            <g key={quarter.label} transform={`translate(${index * 93} 14)`} opacity={quarterSel >= 0 && quarterSel !== index ? 0.35 : 1}>
              <rect width="89" height="26" rx="4" fill={quarter.color} stroke="#111" strokeWidth={quarterSel === index ? 3 : 0.8} />
              <text x="44.5" y="17" textAnchor="middle" fontFamily="Arial" fontWeight="700" fontSize="9" fill={quarter.fg}>{quarterSel === index ? '✔ ' : ''}{quarter.label}</text>
            </g>
          ))}
        </g>
      )}

      {checks.length > 0 && (
        <g transform={`translate(16 ${checksY})`}>
          <rect width="368" height="16" fill={color} opacity="0.14" />
          <text x="6" y="11.5" fontFamily="Arial" fontWeight="700" fontSize="8.5" fill="#111">LISTA DE VERIFICACIÓN</text>
          {['OK', 'NO', 'N/A'].map((head, index) => (
            <text key={head} x={302 + index * 24} y="11.5" textAnchor="middle" fontFamily="Arial" fontWeight="700" fontSize="7.5" fill="#111">{head}</text>
          ))}
          {checks.map((item, index) => (
            <g key={item} transform={`translate(0 ${16 + index * 17})`}>
              {index % 2 === 1 && <rect width="368" height="17" fill="#f2f4f7" />}
              <text x="6" y="12" fontFamily="Arial" fontSize="9" fill="#111">{index + 1}. {fit(item, 54)}</text>
              {[0, 1, 2].map((col) => <rect key={col} x={296 + col * 24} y="3" width="11" height="11" fill="#fff" stroke="#555" strokeWidth="0.9" />)}
            </g>
          ))}
        </g>
      )}

      {spec.months && (
        <g transform={`translate(16 ${monthsY})`}>
          <text y="9" fontFamily="Arial" fontSize="8.5" fill="#555">CONTROL MENSUAL (INICIAL DEL INSPECTOR)</text>
          {MONTHS.map((month, index) => (
            <g key={month} transform={`translate(${index * 30.7} 13)`}>
              <rect width="29" height="32" fill="#fff" stroke="#777" strokeWidth="0.9" />
              <rect width="29" height="10" fill={color} opacity="0.18" />
              <text x="14.5" y="8" textAnchor="middle" fontSize="7" fontWeight="700" fontFamily="Arial" fill="#111">{month}</text>
            </g>
          ))}
        </g>
      )}

      <g transform={`translate(16 ${footY})`}>
        {spec.due && (
          <g>
            <rect width={colW} height="36" rx="5" fill={color} opacity="0.1" />
            <rect width={colW} height="36" rx="5" fill="none" stroke={color} strokeWidth="1.6" />
            <text x="8" y="12" fontFamily="Arial" fontWeight="700" fontSize="8.5" fill="#111">{fit(spec.due.toUpperCase(), Math.floor(colW / 5.2))}</text>
            {dueValue
              ? <text x="8" y="29" fontFamily="Arial" fontWeight="900" fontSize="15" fill="#111">{dueValue}</text>
              : <text x="8" y="29" fontFamily="Arial" fontSize="14" fill="#8a9099" xmlSpace="preserve">____ / ____ / ________</text>}
          </g>
        )}
        {spec.signatures.map((label, index) => {
          const w = (colW - (spec.signatures.length - 1) * 6) / spec.signatures.length
          return (
            <g key={label} transform={`translate(${index * (w + 6)} ${spec.due ? 44 : 0})`}>
              <rect width={w} height={sigH} rx="4" fill="#fff" stroke="#777" strokeWidth="0.9" />
              <line x1="8" x2={w - 8} y1={sigH - 14} y2={sigH - 14} stroke="#999" strokeWidth="0.8" />
              <text x={w / 2} y={sigH - 5} textAnchor="middle" fontFamily="Arial" fontSize="7.5" fill="#555">{fit(label, Math.floor(w / 4.2))}</text>
            </g>
          )
        })}
        {qrText && (
          <g>
            <QrPath text={qrText} x={278} y={0} size={90} />
            <text x={323} y={100} textAnchor="middle" fontFamily="Arial" fontSize="7.5" fill="#555">Escanee: registro / ficha</text>
          </g>
        )}
      </g>

      <text fontFamily="Arial" fontSize="7.5" fill="#666">
        {noteLines.map((line, index) => <tspan key={index} x="16" y={noteY + 6 + index * 10}>{line}</tspan>)}
      </text>
      <text x="384" y={height - 9} textAnchor="end" fontFamily="Arial" fontSize="6.5" fill="#999">Observatorio Prevenir Perú · formato de control interno</text>
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

  const secParam = params.get('sec')
  const qrOp = params.get('etiqueta')
  const [tab, setTab] = useState<Tab>(secParam === 'etiquetas' || (qrOp && qrOp in OPS) ? 'operativas' : 'senales')
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

  const [opKind, setOpKind] = useState<OpKind>(qrOp && qrOp in OPS ? (qrOp as OpKind) : 'extintor')
  const [opValues, setOpValues] = useState<Record<string, string>>({})
  const [opQr, setOpQr] = useState('')
  const [opWithQr, setOpWithQr] = useState(true)
  const [opCopies, setOpCopies] = useState(4)
  const [opWidth, setOpWidth] = useState(92)
  const opRef = useRef<SVGSVGElement>(null)
  const [openFamilies, setOpenFamilies] = useState<Partial<Record<SignFamily, boolean>>>({})

  // Enlaces de la portada (#/senales?sec=senales | etiquetas): abre la sección y se desplaza a ella.
  useEffect(() => {
    const go = (id: string) => window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150)
    const initial = readHashParams().get('sec')
    if (initial === 'etiquetas') go('etiquetas-operativas')
    else if (initial === 'senales') go('senales-catalogo')
    const onHash = () => {
      const sec = readHashParams().get('sec')
      if (sec === 'etiquetas') { setTab('operativas'); go('etiquetas-operativas') }
      else if (sec === 'senales') { setTab('senales'); go('senales-catalogo') }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => () => document.body.classList.remove('print-ops'), [])

  function printOps() {
    const style = document.createElement('style')
    style.textContent = '@page { size: A4; margin: 8mm; }'
    document.head.appendChild(style)
    document.body.classList.add('print-ops')
    const done = () => {
      document.body.classList.remove('print-ops')
      style.remove()
      window.removeEventListener('afterprint', done)
    }
    window.addEventListener('afterprint', done)
    window.setTimeout(() => window.print(), 80)
  }

  useEffect(() => {
    if (tab !== 'quimicos' || rows) return
    fetch(assetUrl('data/clp-annex-vi.json')).then((response) => response.json()).then(setRows).catch(() => setRows([]))
  }, [tab, rows])

  const sign = SIGNS.find((item) => item.id === signId) ?? SIGNS[0]
  const opQrText = opWithQr ? (opQr.trim() || fichaUrl(`etiqueta=${opKind}`)) : ''
  const [signQuery, setSignQuery] = useState('')
  const sq = signQuery.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const visibleSigns = SIGNS.filter((item) => (family === 'todas' || item.family === family) && (!sq || (SIGN_INDEX.get(item.id) ?? '').includes(sq)))
  const groups = FAMILIES.filter((key) => family === 'todas' || key === family)
    .map((key) => ({ key, items: visibleSigns.filter((item) => item.family === key) }))
    .filter((group) => group.items.length > 0)
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
        <div className="sign-layout" id="senales-catalogo">
          <div className="sign-config">
            <div className="ssoma-filter">
              <button type="button" className={family === 'todas' ? 'active' : ''} onClick={() => setFamily('todas')}>Todas ({SIGNS.length})</button>
              {FAMILIES.map((key) => (
                <button type="button" key={key} className={family === key ? 'active' : ''} onClick={() => setFamily(key)}>{FAMILY_INFO[key].label} ({FAMILY_COUNT[key]})</button>
              ))}
            </div>
            <label className="ssoma-search small">
              <Search size={16} aria-hidden="true" />
              <input value={signQuery} onChange={(event) => setSignQuery(event.target.value)} placeholder={`Buscar entre ${SIGNS.length} señales: extintor, arnés, P002, ruido…`} />
            </label>
            {groups.length === 0 && <p className="empty-note">No hay señales que coincidan con la búsqueda.</p>}
            {groups.map((group) => {
              const info = FAMILY_INFO[group.key]
              const open = Boolean(openFamilies[group.key])
              const shown = open ? group.items : group.items.slice(0, PER_FAMILY)
              const hidden = group.items.length - PER_FAMILY
              return (
                <section key={group.key} className="sign-group" aria-label={info.label}>
                  <h3 className="sign-group-head">
                    <span className="sign-family" style={{ background: info.bg, color: info.fg }}>{info.label}</span>
                    <small>{group.items.length} {group.items.length === 1 ? 'señal' : 'señales'}{sq ? ' encontradas' : ''}</small>
                  </h3>
                  <div className="sign-picker">
                    {shown.map((item) => (
                      <button type="button" key={item.id} className={item.id === signId ? 'active' : ''} onClick={() => setSignId(item.id)} title={item.text}>
                        <SignSvg sign={item} qr={false} />
                        <span>{item.text}</span>
                      </button>
                    ))}
                  </div>
                  {hidden > 0 && (
                    <button type="button" className="btn-ghost sign-more" aria-expanded={open} onClick={() => setOpenFamilies((prev) => ({ ...prev, [group.key]: !open }))}>
                      {open ? 'Ver menos' : `Ver más (${hidden})`}
                    </button>
                  )}
                </section>
              )
            })}
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
        <div className="sign-layout" id="etiquetas-operativas">
          <div className="sign-config">
            {OP_GROUPS.map((group) => (
              <div key={group} className="ops-group">
                <h3>{group}</h3>
                <div className="ops-picker">
                  {(Object.keys(OPS) as OpKind[]).filter((key) => OPS[key].group === group).map((key) => (
                    <button type="button" key={key} className={opKind === key ? 'active' : ''} style={{ '--ops-color': OPS[key].color } as CSSProperties} onClick={() => { setOpKind(key); setOpValues({}) }}>
                      {OPS[key].short}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <h2 className="ops-form-title">{OPS[opKind].title}</h2>
            <div className="ops-form">
              {(OPS[opKind].fields as OpField[]).map((field) => (
                <label className={`sign-field${field.wide ? ' wide' : ''}`} key={field.key}>
                  <span>{field.label}</span>
                  {field.type === 'select' ? (
                    <select value={opValues[field.key] ?? ''} onChange={(event) => setOpValues((prev) => ({ ...prev, [field.key]: event.target.value }))}>
                      <option value="">—</option>
                      {field.options?.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  ) : (
                    <input type={field.type === 'date' ? 'date' : 'text'} value={opValues[field.key] ?? ''} onChange={(event) => setOpValues((prev) => ({ ...prev, [field.key]: event.target.value }))} />
                  )}
                </label>
              ))}
              {OPS[opKind].due && (
                <label className="sign-field wide">
                  <span>{OPS[opKind].due}</span>
                  <input type="date" value={opValues.__due ?? ''} onChange={(event) => setOpValues((prev) => ({ ...prev, __due: event.target.value }))} />
                </label>
              )}
            </div>
            <p className="ssoma-count">Deje los campos vacíos para imprimir la tarjeta en blanco y llenarla a mano.</p>
            <label className="sign-check"><input type="checkbox" checked={opWithQr} onChange={(event) => setOpWithQr(event.target.checked)} /> Incluir código QR</label>
            {opWithQr && (
              <label className="sign-field"><span>Contenido del QR (enlace al registro, procedimiento o código). Vacío: abre este formato.</span><input value={opQr} onChange={(event) => setOpQr(event.target.value)} placeholder="https://… o código del equipo" /></label>
            )}
            <p className="site-disclaimer">Las etiquetas operativas controlan inspecciones y activos: no sustituyen las señales normativas de seguridad ni los registros exigidos por la Ley 29783.</p>
          </div>
          <div className="sign-preview">
            <OpsLabel kind={opKind} values={opValues} qrText={opQrText} svgRef={opRef} />
            <div className="sign-export">
              <div className="ops-print-options">
                <label>
                  <span>Ancho de impresión</span>
                  <select value={opWidth} onChange={(event) => setOpWidth(Number(event.target.value))}>
                    <option value={70}>Compacto (70 mm)</option>
                    <option value={92}>Estándar (92 mm, 2 por fila en A4)</option>
                    <option value={140}>Grande (140 mm)</option>
                    <option value={190}>Ancho completo A4 (190 mm)</option>
                  </select>
                </label>
                <label>
                  <span>Copias en la hoja</span>
                  <select value={opCopies} onChange={(event) => setOpCopies(Number(event.target.value))}>
                    {[1, 2, 4, 6, 8, 12].map((count) => <option key={count} value={count}>{count}</option>)}
                  </select>
                </label>
              </div>
              <div className="sign-export-buttons">
                <button type="button" className="btn-primary" onClick={printOps}><Printer size={16} /> Imprimir tamaño real</button>
                <button type="button" className="btn-ghost" onClick={() => exportSvg(opRef.current, `etiqueta-${opKind}`)}><Download size={16} /> SVG</button>
                <button type="button" className="btn-ghost" onClick={() => exportPng(opRef.current, `etiqueta-${opKind}`)}><Download size={16} /> PNG</button>
              </div>
              <p className="ssoma-count">En el diálogo de impresión elija escala 100 % («tamaño real») y active los gráficos de fondo.</p>
            </div>
          </div>
          {typeof document !== 'undefined' && createPortal(
            <div className="ops-print-sheet" style={{ '--ops-w': `${opWidth}mm` } as CSSProperties} aria-hidden="true">
              {Array.from({ length: opCopies }, (_, index) => <OpsLabel key={index} kind={opKind} values={opValues} qrText={opQrText} className="ops-sheet-svg" />)}
            </div>,
            document.body,
          )}
        </div>
      )}
    </div>
  )
}
