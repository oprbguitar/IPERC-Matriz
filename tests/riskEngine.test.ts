import { describe, expect, it } from 'vitest'
import { buildDashboard, generateAssessments, resolveResidualBasis } from '../src/lib/riskEngine'
import type { CompanyProfile, JobPosition, WorkArea, WorkTask } from '../src/types'

const profile: CompanyProfile = {
  name: 'Prueba SAC',
  ruc: '20123456789',
  ownership: 'private',
  businessActivity: 'Construcción',
  ciiu: '4100',
  workplace: 'Obra',
  workerCount: 30,
}
const areas: WorkArea[] = [{ id: 'a1', name: 'Obra', process: 'Estructuras' }]
const positions: JobPosition[] = [{ id: 'p1', areaId: 'a1', title: 'Operario', workerCount: 8 }]
const tasks: WorkTask[] = [
  { id: 't1', positionId: 'p1', name: 'Trabajo en altura sobre andamio', activityKind: 'routine', frequency: 'Diaria', exposedWorkers: 8, existingControls: 'Arnés' },
]

describe('riesgo residual: proyectado vs. verificado', () => {
  const rows = generateAssessments(profile, 'construction', areas, positions, tasks)

  it('los controles sugeridos no reducen el riesgo vigente', () => {
    expect(rows.length).toBeGreaterThan(0)
    for (const row of rows) {
      expect(row.residualBasis).toBe('proyectado')
      expect(row.currentScore).toBe(row.initialScore)
      expect(row.actionStatus).toBe('pending')
    }
    expect(buildDashboard(rows).reductionPercent).toBe(0)
  })

  it('verificar sin evidencia degrada a "ejecutado, por verificar"', () => {
    const row = resolveResidualBasis({ ...rows[0], actionStatus: 'verified' }, { verifiedBy: 'Ing. Pérez' })
    expect(row.residualBasis).toBe('proyectado')
    expect(row.actionStatus).toBe('implemented')
  })

  it('con responsable y evidencia el residual pasa a verificado y reduce el riesgo vigente', () => {
    const row = resolveResidualBasis({ ...rows[0], actionStatus: 'verified' }, { verifiedBy: 'Ing. Pérez', verificationEvidence: 'Acta de inspección 12' })
    expect(row.residualBasis).toBe('verificado')
    expect(row.currentScore).toBe(row.residualScore)
    expect(buildDashboard([row]).verifiedControls).toBe(1)
  })

  it('las filas IPERC citan artículos verificados de evaluación de riesgos', () => {
    expect(rows[0].legalMatches.some((match) => match.articleLabel === 'Art. 77' && match.status === 'validated')).toBe(true)
  })
})
