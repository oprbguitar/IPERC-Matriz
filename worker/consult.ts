/**
 * Consultor SSOMA: responde preguntas especializadas usando SOLO el contenido del Observatorio
 * (normas del visor, glosario, riesgos, señales, diagramas y secciones). Primero busca en el catálogo
 * interno (determinista) y luego pide al modelo redactar la respuesta citando esas fuentes [F1], [F2]…
 * El navegador convierte cada cita en un enlace a la ficha interna.
 */
import { DIAGRAMS } from '../src/data/diagrams'
import { TERMS } from '../src/data/glossary'
import { NAV_ITEMS } from '../src/data/platformContent'
import { SIGNS } from '../src/data/signs'
import { SSOMA_NORMS, SSOMA_RISKS } from '../src/data/ssoma'

export interface Source { ref: string; kind: string; title: string; detail: string; href: string }
interface Doc { kind: string; title: string; text: string; detail: string; href: string }

const fold = (text: string) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const STOP = new Set('el la los las un una unos unas de del al a en y o u que se por para con sin sobre como cual cuales cuando donde quien es son ser esta este estos estas mi mis su sus le les lo me nos debo debe deben hay tiene tengo puedo cuanto cuantos cuanta que qué'.split(' '))
const enc = encodeURIComponent

let index: Doc[] | null = null
function buildIndex(): Doc[] {
  if (index) return index
  index = [
    ...SSOMA_NORMS.map((norm) => ({
      kind: 'Norma',
      title: `${norm.code} — ${norm.title}`,
      text: `${norm.code} ${norm.title} ${norm.summary} ${norm.authority}`,
      detail: norm.summary.slice(0, 400),
      href: `#/visor?sec=normas&q=${enc(norm.code)}`,
    })),
    ...TERMS.map((term) => ({
      kind: 'Glosario',
      title: term.t,
      text: `${term.t} ${term.d} ${term.n ?? ''}`,
      detail: `${term.d}${term.n ? ` (${term.n})` : ''}`,
      href: `#/glosario?q=${enc(term.t)}`,
    })),
    ...SSOMA_RISKS.map((risk) => ({
      kind: 'Riesgo',
      title: risk.name,
      text: `${risk.name} ${risk.examples.join(' ')} ${risk.consequences.join(' ')} ${risk.controls.join(' ')}`,
      detail: `Ejemplos: ${risk.examples.slice(0, 3).join('; ')}. Controles: ${risk.controls.slice(0, 4).join('; ')}.`,
      href: `#/visor?sec=riesgos&q=${enc(risk.name)}`,
    })),
    ...SIGNS.map((sign) => ({
      kind: 'Señal',
      title: sign.text,
      text: `${sign.text} ${sign.description} ${sign.where.join(' ')} ${sign.risks.join(' ')} señal ${sign.family}`,
      detail: `${sign.description} Dónde: ${sign.where.slice(0, 3).join(', ')}.`,
      href: `#/senales?s=${enc(sign.id)}`,
    })),
    ...DIAGRAMS.map((diagram) => ({
      kind: 'Diagrama',
      title: diagram.title,
      text: `${diagram.title} ${diagram.summary} ${diagram.nodes.map((node) => `${node.label} ${node.detail ?? ''} ${node.norm ?? ''}`).join(' ')}`,
      detail: `${diagram.summary} Pasos: ${diagram.nodes.slice(0, 6).map((node) => node.label).join(' → ')}.`,
      href: `#/diagramas?d=${enc(diagram.id)}`,
    })),
    ...NAV_ITEMS.filter((item) => item.id !== 'inicio').map((item) => ({
      kind: 'Sección',
      title: item.label,
      text: `${item.label} ${item.description}`,
      detail: item.description,
      href: `#/${item.id}`,
    })),
  ].map((doc) => ({ ...doc, text: fold(doc.text), titleFolded: fold(doc.title) })) as Doc[]
  return index
}

export function searchCatalog(question: string, limit = 10): Source[] {
  const tokens = fold(question)
    .split(/[^a-z0-9.ñ-]+/)
    .filter((token) => token.length > 2 && !STOP.has(token))
  if (!tokens.length) return []
  const perKind = new Map<string, number>()
  return buildIndex()
    .map((doc) => {
      const title = (doc as Doc & { titleFolded: string }).titleFolded
      let score = 0
      for (const token of tokens) {
        const stem = token.length > 5 ? token.slice(0, -1) : token
        if (title.includes(stem)) score += 4
        if (doc.text.includes(stem)) score += 1 + Math.min(3, doc.text.split(stem).length - 2)
      }
      if (/^\d{2,5}/.test(question) || /ley|d\.?s\.?|r\.?m\.?|ntp|iso/i.test(question)) score += doc.kind === 'Norma' ? 1 : 0
      return { doc, score }
    })
    .filter((item) => item.score >= 3)
    .sort((a, b) => b.score - a.score)
    .filter(({ doc }) => {
      const count = perKind.get(doc.kind) ?? 0
      if (count >= 4) return false
      perKind.set(doc.kind, count + 1)
      return true
    })
    .slice(0, limit)
    .map(({ doc }, position) => ({ ref: `F${position + 1}`, kind: doc.kind, title: doc.title, detail: doc.detail, href: doc.href }))
}

export const CONSULT_SYSTEM = `Eres el Consultor SSOMA del Observatorio Prevenir Perú: un ingeniero especialista en seguridad, salud ocupacional y medio ambiente en el Perú.
Responde en español claro y profesional, en Markdown:
1. Empieza con la respuesta directa en 2 o 3 frases.
2. Luego "### Qué exige la norma" con viñetas y "### Cómo aplicarlo" con pasos concretos.
3. Cita las fuentes del catálogo con su etiqueta entre corchetes, por ejemplo [F1] o [F2][F4], justo después del dato que respaldan.
Reglas: usa las fuentes del catálogo como base; si algo no está en ellas y no estás seguro, dilo y recomienda verificar en El Peruano o gob.pe. No inventes números de artículos ni de normas. No menciones que eres un modelo de IA ni qué proveedor usas.`

export function consultPrompt(question: string, sources: Source[]): string {
  const catalog = sources.length
    ? sources.map((source) => `[${source.ref}] (${source.kind}) ${source.title}: ${source.detail}`).join('\n')
    : '(No se encontraron fichas relacionadas en el catálogo.)'
  return `Fuentes del catálogo del Observatorio:\n${catalog}\n\nPregunta del usuario: ${question}`
}
