import { describe, expect, it } from 'vitest'
import { isSiteView, PREMIUM_VIEWS, spaceOf } from '../src/data/platformContent'
import { PREVENTION_SCENES } from '../src/data/preventionScenes'
import { PREVENTION_TOPICS } from '../src/data/prevention'

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
})
