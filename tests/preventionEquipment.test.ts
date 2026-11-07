import { describe, expect, it } from 'vitest'
import { PREVENTION_EQUIPMENT, HELMET_COMPARISON, filterEquipment } from '../src/data/preventionEquipment'

describe('catálogo técnico de EPP e instrumentos', () => {
  it('incluye diez familias EPP y ocho instrumentos con IDs únicos', () => {
    expect(PREVENTION_EQUIPMENT.filter(item => item.kind === 'epp')).toHaveLength(10)
    expect(PREVENTION_EQUIPMENT.filter(item => item.kind === 'instrumento')).toHaveLength(8)
    expect(new Set(PREVENTION_EQUIPMENT.map(item => item.id)).size).toBe(18)
  })
  it('conserva límites, inspección, retiro y fuentes oficiales con estado explícito', () => {
    for (const item of PREVENTION_EQUIPMENT) {
      for (const key of ['purpose','limits','inspection','replacement','reference','status'] as const) expect(item[key].length, `${item.id}: ${key}`).toBeGreaterThan(20)
      expect(item.sourceUrl).toMatch(/^https:\/\/(www\.)?(osha\.gov|inacal\.gob\.pe)\//)
      expect(item.status).toContain('referencia')
    }
  })
  it('filtra por tipo y texto sin tildes, incluyendo contenido técnico', () => {
    expect(filterEquipment('', '')).toHaveLength(18)
    expect(filterEquipment('epp', '')).toHaveLength(10)
    expect(filterEquipment('instrumento', '')).toHaveLength(8)
    expect(filterEquipment('epp', 'proteccion auditiva').map(item => item.id)).toEqual(['auditiva'])
    expect(filterEquipment('instrumento', 'sonometro').map(item => item.id)).toEqual(['sonometro'])
    expect(filterEquipment('epp', 'WBGT')).toHaveLength(0)
    expect(filterEquipment('', 'no-existe')).toHaveLength(0)
  })
  it('distingue impacto y ensayos eléctricos de los cascos', () => {
    expect(HELMET_COMPARISON.map(item => item.label)).toEqual(['Tipo I','Tipo II','Clase G','Clase E','Clase C'])
    expect(HELMET_COMPARISON.find(item => item.label === 'Clase G')?.description).toContain('2 200 V')
    expect(HELMET_COMPARISON.find(item => item.label === 'Clase E')?.description).toContain('20 000 V')
    expect(HELMET_COMPARISON.find(item => item.label === 'Clase C')?.description).toContain('Sin protección eléctrica')
    expect(PREVENTION_EQUIPMENT.find(item => item.id === 'cabeza')?.limits).toContain('no autorizan trabajar')
  })
})
