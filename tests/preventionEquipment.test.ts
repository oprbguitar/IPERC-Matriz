import { describe, expect, it } from 'vitest'
import { CALIBRATION_NOTE, PREVENTION_EQUIPMENT, HELMET_COMPARISON, filterEquipment } from '../src/data/preventionEquipment'

describe('catálogo técnico de EPP e instrumentos', () => {
  it('incluye diez familias EPP y diez instrumentos con IDs únicos', () => {
    expect(PREVENTION_EQUIPMENT.filter(item => item.kind === 'epp')).toHaveLength(10)
    expect(PREVENTION_EQUIPMENT.filter(item => item.kind === 'instrumento')).toHaveLength(10)
    expect(new Set(PREVENTION_EQUIPMENT.map(item => item.id)).size).toBe(20)
  })
  it('conserva límites, inspección, retiro y fuentes oficiales con estado explícito', () => {
    for (const item of PREVENTION_EQUIPMENT) {
      for (const key of ['purpose','limits','inspection','replacement','reference','status'] as const) expect(item[key].length, `${item.id}: ${key}`).toBeGreaterThan(20)
      expect(item.sourceUrl).toMatch(/^https:\/\/(www\.)?(osha\.gov|inacal\.gob\.pe)\//)
      expect(item.status).toContain('referencia')
    }
  })
  it('filtra por tipo y texto sin tildes, incluyendo contenido técnico', () => {
    expect(filterEquipment('', '')).toHaveLength(20)
    expect(filterEquipment('epp', '')).toHaveLength(10)
    expect(filterEquipment('instrumento', '')).toHaveLength(10)
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
  it('cada categoría tiene normas, selección, datos con fuente y su propia ilustración', async () => {
    const { EQUIPMENT_ART_LABEL } = await import('../src/data/preventionEquipmentArt')
    const labels = new Set<string>()
    for (const item of PREVENTION_EQUIPMENT) {
      expect(item.standards.length, item.id).toBeGreaterThan(0)
      expect(item.selection.length, item.id).toBeGreaterThan(0)
      expect(item.facts.length, item.id).toBeGreaterThan(0)
      for (const fact of [...item.standards, ...item.facts, ...(item.calibration ?? [])]) {
        expect(fact.label.length, item.id).toBeGreaterThanOrEqual(2)
        expect(fact.value.length, item.id).toBeGreaterThan(5)
        expect(fact.source.length, `${item.id}: ${fact.label}`).toBeGreaterThan(2)
      }
      expect(EQUIPMENT_ART_LABEL[item.id], item.id).toBeTruthy()
      labels.add(EQUIPMENT_ART_LABEL[item.id])
    }
    expect(labels.size).toBe(PREVENTION_EQUIPMENT.length)
  })
  it('los instrumentos documentan calibración trazable y los datos clave', () => {
    for (const item of PREVENTION_EQUIPMENT.filter(i => i.kind === 'instrumento')) expect(item.calibration?.length, item.id).toBeGreaterThan(0)
    expect(CALIBRATION_NOTE).toContain('INACAL')
    const text = (id: string) => JSON.stringify(PREVENTION_EQUIPMENT.find(i => i.id === id))
    expect(text('detector-gases')).toContain('19,5 %')
    expect(text('detector-gases')).toContain('23,5 %')
    expect(text('detector-gases')).toContain('50 % LEL metano')
    expect(text('detector-gases')).toContain('ISEA')
    expect(text('sonometro')).toContain('IEC 61672')
    expect(text('sonometro')).toContain('94 dB')
    expect(text('luxometro')).toContain('DIN 5032-7')
    expect(text('wbgt')).toContain('ISO 7243')
    expect(text('vibraciones')).toContain('ISO 8041')
    expect(text('bomba')).toContain('±5 %')
    expect(text('respiratoria')).toContain('42 CFR Part 84')
    expect(text('auditiva')).toContain('EN 352')
  })
})
