import { describe, expect, it } from 'vitest'
import { isSiteView, PREMIUM_VIEWS, spaceOf } from '../src/data/platformContent'
import { PREVENTION_SCENES } from '../src/data/preventionScenes'
import { PREVENTION_SECTORS, PREVENTION_TOPICS } from '../src/data/prevention'
import { SECTOR_CONTEXT } from '../src/data/preventionSectors'
import { findNorm } from '../src/data/legalDatabase'
import { filterPreventionTopics, prioritizeForSector, topicReferenceFacts } from '../src/lib/prevention'
import { toPercent } from '../src/lib/preventionScene'

describe('integración del explorador público', () => {
  it('expone una ruta pública dentro de Explorar', () => {
    expect(isSiteView('explorador')).toBe(true)
    expect(spaceOf('explorador')).toBe('explorar')
    expect(PREMIUM_VIEWS).not.toContain('explorador')
  })
  it('cada punto del visor abre una ficha existente y está dentro del lienzo', () => {
    expect(PREVENTION_SCENES).toHaveLength(8)
    for (const scene of PREVENTION_SCENES) {
      expect(new Set(scene.hotspots.map(p => p.id)).size).toBe(scene.hotspots.length)
      for (const point of scene.hotspots) {
        expect(PREVENTION_TOPICS.some(t => t.id === point.topicId), point.id).toBe(true)
        expect(point.x).toBeGreaterThan(0)
        expect(point.x).toBeLessThan(100)
        expect(point.y).toBeGreaterThan(0)
        expect(point.y).toBeLessThan(100)
      }
    }
  })
  it('cada punto aporta datos técnicos con fuente y controles, y su posición proviene de la proyección', () => {
    for (const scene of PREVENTION_SCENES) {
      expect(scene.overview.length, scene.id).toBeGreaterThan(60)
      for (const point of scene.hotspots) {
        expect(point.summary.length, point.id).toBeGreaterThan(40)
        expect(point.facts.length, point.id).toBeGreaterThan(1)
        point.facts.forEach(fact => { expect(fact.value.length, point.id).toBeGreaterThan(3); expect(fact.source.length, point.id).toBeGreaterThan(2) })
        expect(point.controls.length, point.id).toBeGreaterThanOrEqual(3)
        expect(toPercent(point.at)).toEqual({ x: point.x, y: point.y })
      }
    }
  })
  it('cita los criterios de ergonomía solicitados', () => {
    const text = JSON.stringify(PREVENTION_SCENES)
    expect(text).toContain('25 kg para varones y 15 kg para mujeres')
    expect(text).toContain('45 a 70 cm')
    expect(text).toContain('500 lx')
  })
  it('cada sector cambia el contenido con fichas, normas y notas válidas', () => {
    for (const sector of PREVENTION_SECTORS) {
      const ctx = SECTOR_CONTEXT[sector.id]
      expect(ctx, sector.id).toBeDefined()
      ctx.normIds.forEach(id => expect(findNorm(id), id).toBeDefined())
      ctx.priority.forEach(id => expect(PREVENTION_TOPICS.find(t => t.id === id)?.sectorIds.includes(sector.id), `${sector.id}:${id}`).toBe(true))
      Object.keys(ctx.notes).forEach(id => expect(PREVENTION_TOPICS.some(t => t.id === id), id).toBe(true))
      const sorted = prioritizeForSector(filterPreventionTopics('', sector.id, ''), sector.id)
      expect(sorted[0].id).toBe(ctx.priority[0])
    }
    expect(prioritizeForSector(PREVENTION_TOPICS, 'construction')[0].id).not.toBe(prioritizeForSector(PREVENTION_TOPICS, 'offices')[0].id)
    expect(topicReferenceFacts('ruido').length).toBeGreaterThan(0)
  })
})
