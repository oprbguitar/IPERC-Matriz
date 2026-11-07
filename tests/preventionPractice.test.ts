import { describe, expect, it } from 'vitest'
import { buildPracticeMarkdown, normalizePractice, PRACTICE_EXAMPLES, PRACTICE_HIERARCHY } from '../src/lib/preventionPractice'
import { markdownToHtml } from '../src/lib/markdown'

describe('práctica preventiva pública', () => {
  it('normaliza un borrador externo con campos permitidos y límites', () => {
    const result = normalizePractice({ activity: '  Almacén\n# falseado  ', task: 3, hazard: 'x'.repeat(1200), hierarchy: 'inventada', hidden: 'privado' })
    expect(result.activity).toBe('Almacén # falseado')
    expect(result.task).toBe('')
    expect(result.hazard).toHaveLength(800)
    expect(result.hierarchy).toBe('ingenieria')
    expect(result).not.toHaveProperty('hidden')
  })
  it.each([null, [], 1, true, 'texto'])('tolera almacenamiento inválido %j', (value) => {
    expect(normalizePractice(value).activity).toBe('')
  })
  it('exporta todos los campos como borrador sin inventar aceptabilidad', () => {
    const value = { ...PRACTICE_EXAMPLES[0].value, owner: 'Responsable de almacén', evidence: 'Plano de segregación y registro de inspección' }
    const text = buildPracticeMarkdown(value)
    for (const key of ['activity','task','hazard','risk','harm','measure','owner','evidence'] as const) expect(text).toContain(value[key])
    expect(text).toContain('Pendiente de evaluación y verificación')
    expect(text).toContain('No se ha calculado probabilidad, severidad ni aceptabilidad')
    expect(text).toContain('R.M. N.° 050-2013-TR')
    expect(text).toContain('https://www.gob.pe/institucion/mtpe/normas-legales/288031-050-2013-tr')
    expect(text).toContain('no expresa un nivel de riesgo evaluado')
    expect(text).toContain('línea base')
    expect(text).not.toMatch(/riesgo (aceptable|bajo|tolerable)/i)
  })
  it('deja constancia de pendientes cuando faltan campos', () => {
    expect(buildPracticeMarkdown(null)).toContain('Por completar')
  })
  it('no permite que texto de usuario se transforme en HTML activo', () => {
    const html = markdownToHtml(buildPracticeMarkdown({ activity: '<img src=x onerror=alert(1)>', task: '\n## Estado aprobado' }))
    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;img')
    expect(html).not.toContain('<h2>Estado aprobado</h2>')
  })
  it('identifica tercerización sin atribuirle sustitución del peligro', () => {
    const text = buildPracticeMarkdown({ hierarchy: 'sustitucion', measure: 'Tercerizar la tarea a un contratista' })
    expect(text).toContain('Tercerizar no sustituye por sí solo el peligro')
    expect(PRACTICE_HIERARCHY.map(item => item.id)).not.toContain('tercerizacion')
    expect(PRACTICE_EXAMPLES).toHaveLength(3)
    for (const example of PRACTICE_EXAMPLES) expect(example.value.risk.length).toBeGreaterThan(20)
  })
})
