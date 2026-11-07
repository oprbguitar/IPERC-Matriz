import { AMBIENTAL_NORMS } from './ambiental'
import { QUIMICOS_NORMS, GHS_PICTOGRAMS } from './quimicos'
import { SSOMA_RISKS } from './riesgos'
import { SST_NORMS } from './sst'
import type { SsomaBranch, SsomaNorm } from './types'

export type { SsomaBranch, SsomaNorm, SsomaRisk, SsomaTable } from './types'
export { SSOMA_RISKS, GHS_PICTOGRAMS }

export const SSOMA_NORMS: SsomaNorm[] = [...SST_NORMS, ...AMBIENTAL_NORMS, ...QUIMICOS_NORMS].sort((a, b) => a.year - b.year)

export const BRANCH_LABELS: Record<SsomaBranch, string> = {
  sst: 'Seguridad (SST)',
  salud: 'Salud ocupacional',
  ambiental: 'Medio ambiente',
  quimicos: 'Productos químicos (SGA)',
}

/** Qué significa cada letra de SSOMA, con el marco legal que la sostiene. */
export const SSOMA_PILLARS: Array<{ letter: string; name: string; what: string; how: string[]; normIds: string[] }> = [
  {
    letter: 'S',
    name: 'Seguridad',
    what: 'Prevenir accidentes: identificar peligros, evaluar riesgos y controlarlos antes de que causen lesiones o daños materiales.',
    how: [
      'IPERC por puesto y actividad, actualizado al menos una vez al año o cuando cambian las condiciones.',
      'Jerarquía de controles: eliminación, sustitución, ingeniería, administrativos y EPP como última barrera.',
      'Inspecciones, permisos de trabajo de alto riesgo, señalización y respuesta ante emergencias.',
    ],
    normIds: ['ley-29783', 'ds-005-2012-tr', 'ds-011-2019-tr', 'ntp-350-043'],
  },
  {
    letter: 'SO',
    name: 'Salud ocupacional',
    what: 'Proteger la salud física y mental del trabajador frente a agentes físicos, químicos, biológicos, ergonómicos y psicosociales.',
    how: [
      'Exámenes médicos ocupacionales (pre-empleo, periódicos y de retiro) y vigilancia de la salud.',
      'Evaluación ergonómica y monitoreo de agentes (ruido, polvo, químicos) contra valores límite.',
      'Protección especial de la trabajadora gestante y en periodo de lactancia.',
    ],
    normIds: ['rm-312-2011-minsa', 'rm-375-2008-tr', 'rm-374-2008-tr'],
  },
  {
    letter: 'MA',
    name: 'Medio ambiente',
    what: 'Prevenir la contaminación: gestionar los aspectos ambientales (residuos, emisiones, efluentes, ruido, suelo) y cumplir los estándares de calidad.',
    how: [
      'Identificar aspectos e impactos ambientales y los requisitos legales asociados.',
      'Gestión integral de residuos: minimizar, segregar en la fuente, valorizar y disponer con una EO-RS.',
      'Comparar monitoreos con los ECA (aire, agua, suelo, ruido) y los VMA de efluentes al alcantarillado.',
    ],
    normIds: ['ley-28611', 'dl-1278', 'ds-014-2017-minam', 'ds-003-2017-minam', 'ds-004-2017-minam', 'ds-011-2017-minam', 'ds-085-2003-pcm', 'ds-010-2019-vivienda', 'ntp-900-058'],
  },
]

/** Normaliza para búsqueda sin tildes ni mayúsculas. */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export function normHaystack(norm: SsomaNorm): string {
  return normalize(
    [
      norm.code,
      norm.title,
      norm.authority,
      norm.summary,
      norm.scope,
      ...norm.keywords,
      ...norm.howItWorks,
      ...norm.obligations,
      ...(norm.risks ?? []),
      ...norm.keyArticles.map((article) => `${article.ref} ${article.text}`),
      ...(norm.tables ?? []).map((table) => table.title),
      ...(norm.international ?? []).map((item) => item.name),
    ].join(' '),
  )
}

/** Hallazgos del contraste entre las fuentes (Markdown, PDF de presentación, Excel CLP y catálogo del Observatorio). */
export const CONTRAST_NOTES: Array<{ topic: string; finding: string; normIds: string[] }> = [
  { topic: 'Conservación de registros', finding: 'La Ley 29783 (arts. 87-88) fija 10 y 5 años; el D.S. 005-2012-TR (art. 35) distingue 20 años (enfermedades ocupacionales), 10 (accidentes e incidentes) y 5 (demás registros). Aplique el plazo del reglamento por ser específico.', normIds: ['ley-29783', 'ds-005-2012-tr'] },
  { topic: 'Periodicidad del examen médico', finding: 'La Ley 29783 (art. 49 d) y el D.S. 005-2012-TR (art. 101) establecen exámenes periódicos cada dos años; la R.M. 312-2011-MINSA indica al menos uno anual según el riesgo. La historia clínica se conserva 40 años según la R.M. 312 y 20 años según el D.S. 005 para enfermedades ocupacionales.', normIds: ['ley-29783', 'ds-005-2012-tr', 'rm-312-2011-minsa'] },
  { topic: 'Integrantes del comité', finding: 'El D.S. 005-2012-TR deja el número (4 a 12) al acuerdo de partes; a falta de acuerdo, 6 con más de 100 trabajadores, +2 por cada 100, tope 12. En construcción (D.S. 011-2019-TR) la escala es fija: 4/6/8/10/12 según tramos de 100, 300, 500 y 1000.', normIds: ['ds-005-2012-tr', 'ds-011-2019-tr'] },
  { topic: 'Versión del reglamento de SST', finding: 'El texto de la Ley 29783 analizado incluye el D.S. 005 con modificaciones de 2021-2022 (D.S. 001-2021-TR y 006-2022-TR); el archivo propio del D.S. 005 llega hasta el D.S. 016-2016-TR. Use siempre el texto concordado más reciente.', normIds: ['ds-005-2012-tr'] },
  { topic: 'Fecha de la Ley 29783', finding: 'La presentación del curso indica 21/08/2011; el texto oficial consigna 20/08/2011. Además, una lámina atribuye al empleador el plazo «último día hábil del mes siguiente», que según el art. 110 del reglamento corresponde al centro médico asistencial.', normIds: ['ley-29783', 'ds-005-2012-tr'] },
  { topic: 'Manifiesto de residuos peligrosos', finding: 'El D.S. 014-2017-MINAM dice «primeros 15 días hábiles de cada trimestre» (art. 13) y «15 primeros días de cada inicio de trimestre» (art. 56). Por prudencia, presente dentro de los 15 días hábiles.', normIds: ['ds-014-2017-minam'] },
  { topic: 'Código de colores', finding: 'El D. Leg. 1278 (art. 36) remite a la NTP 900.058:2005; la edición vigente analizada es la NTP 900.058:2019.', normIds: ['dl-1278', 'ntp-900-058'] },
  { topic: 'Archivos duplicados', finding: 'Los dos archivos del D.S. 014-2017-MINAM tienen el mismo contenido; solo cambian el título y las rutas de imágenes.', normIds: ['ds-014-2017-minam'] },
  { topic: 'Altura de extintores', finding: 'La NTP 350.043-1 fija 1,10 m para extintores de más de 18 kg (8.1.4.8.2), pero su figura de señalización usa 1,00 m.', normIds: ['ntp-350-043'] },
  { topic: 'Ergonomía (estrés térmico)', finding: 'La R.M. 375-2008-TR cita «ISO 7247» para el índice WBGT; la norma correcta es la ISO 7243.', normIds: ['rm-375-2008-tr'] },
  { topic: 'Proyecto de reglamento SGA', finding: 'El documento es el proyecto de reglamento del D. Leg. 1570 (Ley de Gestión Integral de Sustancias Químicas, MINAM); el SGA (6.ª ed. revisada) se implementa en su Título II. Su Anexo 1 tiene errores de transcripción (sensibilización «2B» en vez de 1B; reproducción «1A → H361») y lista la categoría 5 de toxicidad aguda que el art. 6.2 excluye.', normIds: ['proyecto-sga-peru', 'sga-anexo-1'] },
  { topic: 'Clasificación armonizada (CLP)', finding: 'El listado de clasificación anticipada del proyecto peruano reproduce en esencia el Anexo VI del Reglamento CLP de la UE. El Excel usado es una versión no oficial actualizada a la ATP 23 (Reglamento Delegado 2025/1222); los nombres de sustancias están en inglés.', normIds: ['proyecto-sga-peru'] },
  { topic: 'Normas nuevas para el catálogo', finding: 'El D.S. 010-2019-VIVIENDA (VMA), la NTP 900.058:2019, la NTP 350.043-1:2011, la R.M. 374-2008-TR y el proyecto SGA no estaban en el catálogo de enlaces del Observatorio: se incorporan aquí con su detalle.', normIds: ['ds-010-2019-vivienda', 'ntp-900-058', 'ntp-350-043', 'rm-374-2008-tr', 'proyecto-sga-peru'] },
]
