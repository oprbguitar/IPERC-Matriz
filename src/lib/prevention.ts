import { PREVENTION_TOPICS, type PreventionTopic } from '../data/prevention'
import { PREVENTION_SCENES, type SceneFact } from '../data/preventionScenes'
import { SECTOR_CONTEXT } from '../data/preventionSectors'

const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

/** Todos los términos se combinan con las dos facetas, sin alterar el catálogo. */
export function filterPreventionTopics(query: string, sectorId = '', familyId = '') {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean)
  return PREVENTION_TOPICS.filter((topic) => {
    if (sectorId && !topic.sectorIds.includes(sectorId)) return false
    if (familyId && topic.family !== familyId) return false
    const content = normalize([topic.title, topic.summary, topic.exposure, ...topic.controls, ...topic.instruments, ...topic.ppe, ...topic.normIds].join(' '))
    return terms.every((term) => content.includes(term))
  })
}

/** Modelo educativo de nivel constante: T = 8 h × 2^((85 − L dB(A))/3). No es dosis de jornada. */
export function noiseReferenceHours(db: number): number | null {
  if (!Number.isFinite(db) || db < 80 || db > 100) return null
  return 8 * 2 ** ((85 - db) / 3)
}

/** Bandas educativas del índice UV OMS; no calcula exposición individual ni tiempo seguro. */
export function uvBand(index: number): { label: string; advice: string } | null {
  if (!Number.isFinite(index) || index < 0) return null
  if (index < 3) return { label: 'Bajo', advice: 'Mantenga hábitos de protección y valore las circunstancias de exposición y sensibilidad individual.' }
  if (index < 6) return { label: 'Moderado', advice: 'Busque sombra cerca del mediodía y use ropa, sombrero, protección ocular y fotoprotección complementaria.' }
  if (index < 8) return { label: 'Alto', advice: 'Reduzca la exposición cerca del mediodía; organice la tarea con sombra y barreras de protección.' }
  if (index < 11) return { label: 'Muy alto', advice: 'Evite exposición cerca del mediodía; reprograme labores exteriores y disponga sombra y protección.' }
  return { label: 'Extremo', advice: 'Evite exposición cerca del mediodía; priorice reprogramación, sombra efectiva y barreras de protección.' }
}

/** Con un sector elegido, sus fichas prioritarias van primero y conservan el orden definido para ese sector. */
export function prioritizeForSector(topics: PreventionTopic[], sectorId: string): PreventionTopic[] {
  const priority = SECTOR_CONTEXT[sectorId]?.priority ?? []
  const rank = (id: string) => { const index = priority.indexOf(id); return index === -1 ? priority.length : index }
  return [...topics].sort((a, b) => rank(a.id) - rank(b.id))
}

/** Datos con fuente reunidos de los puntos del visor que remiten a esta ficha, sin duplicados. */
export function topicReferenceFacts(topicId: string): SceneFact[] {
  const seen = new Set<string>()
  const facts: SceneFact[] = []
  for (const scene of PREVENTION_SCENES) for (const spot of scene.hotspots) {
    if (spot.topicId !== topicId) continue
    for (const fact of spot.facts) {
      const key = `${fact.label}|${fact.value}`
      if (!seen.has(key)) { seen.add(key); facts.push(fact) }
    }
  }
  return facts
}
