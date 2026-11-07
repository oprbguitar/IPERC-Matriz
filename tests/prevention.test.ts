import { describe, expect, it } from 'vitest'
import { PREVENTION_FAMILIES, PREVENTION_PROFILES, PREVENTION_SECTORS, PREVENTION_TOPICS } from '../src/data/prevention'
import { findNorm } from '../src/data/legalDatabase'
import { filterPreventionTopics, noiseReferenceHours, uvBand } from '../src/lib/prevention'

describe('catálogo preventivo conectado', () => {
  it('cubre sectores, perfiles y familias sin duplicados', () => {
    expect(PREVENTION_SECTORS).toHaveLength(16)
    expect(PREVENTION_FAMILIES).toHaveLength(9)
    expect(PREVENTION_PROFILES).toHaveLength(5)
    expect(PREVENTION_TOPICS.length).toBeGreaterThanOrEqual(16)
    expect(new Set(PREVENTION_TOPICS.map((item) => item.id)).size).toBe(PREVENTION_TOPICS.length)
    for (const sector of PREVENTION_SECTORS) expect(PREVENTION_TOPICS.some((topic) => topic.sectorIds.includes(sector.id))).toBe(true)
  })
  it('resuelve normas existentes y exige controles y evidencias', () => {
    for (const topic of PREVENTION_TOPICS) {
      expect(PREVENTION_FAMILIES.some((family) => family.id === topic.family), topic.id).toBe(true)
      topic.sectorIds.forEach((id) => expect(PREVENTION_SECTORS.some((sector) => sector.id === id), id).toBe(true))
      topic.normIds.forEach((id) => expect(findNorm(id), id).toBeDefined())
      expect(topic.controls.length).toBeGreaterThan(1)
      expect(topic.verification.length).toBeGreaterThan(1)
      expect(topic.limits.length).toBeGreaterThan(30)
      expect(topic.sourceStatus).toBeTruthy()
    }
  })
  it('filtra por consulta sin tildes, sector y familia simultáneamente', () => {
    expect(filterPreventionTopics('', '', '')).toHaveLength(PREVENTION_TOPICS.length)
    expect(filterPreventionTopics('radiacion', 'agriculture', 'physical').some((topic) => topic.id === 'uv')).toBe(true)
    expect(filterPreventionTopics('radiacion', 'offices', 'electrical')).toHaveLength(0)
    expect(filterPreventionTopics('no-existe', '', '')).toHaveLength(0)
    expect(filterPreventionTopics('', 'domestic', '').length).toBeGreaterThan(0)
  })
})

describe('simulaciones educativas', () => {
  it.each([[85, 8], [88, 4], [91, 2], [94, 1]])('referencia de ruido a %i dB(A)', (level, hours) => {
    expect(noiseReferenceHours(level)).toBe(hours)
  })
  it.each([NaN, Infinity, -1, 79, 101])('rechaza ruido inválido %s', (level) => expect(noiseReferenceHours(level)).toBeNull())
  it('no redondea una exposición intermedia', () => expect(noiseReferenceHours(86)).toBeCloseTo(6.349604, 5))
  it.each([[0, 'Bajo'], [2, 'Bajo'], [3, 'Moderado'], [5, 'Moderado'], [6, 'Alto'], [7, 'Alto'], [8, 'Muy alto'], [10, 'Muy alto'], [11, 'Extremo'], [20, 'Extremo']])('clasifica UV %s como %s', (value, label) => {
    expect(uvBand(value)?.label).toBe(label)
    expect(uvBand(value)?.advice.length).toBeGreaterThan(20)
  })
  it.each([-1, NaN, Infinity])('rechaza índice UV inválido %s', (index) => expect(uvBand(index)).toBeNull())
})
