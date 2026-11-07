/**
 * Visor SSOMA: fichas normativas extraídas de los textos oficiales convertidos a Markdown
 * (carpeta data/fundamentos ssoma). Cada ficha resume qué regula la norma, cómo funciona,
 * artículos clave, obligaciones, cuadros (ECA, LMP, tablas técnicas), riesgos que identifica
 * y su relación con normas internacionales. Es orientativo: verificar el texto vigente.
 */
export type SsomaBranch = 'sst' | 'ambiental' | 'quimicos' | 'salud'

export interface SsomaTable {
  title: string
  /** Aclaración: unidades, periodo, condiciones de medición, fuente (artículo/anexo). */
  note?: string
  columns: string[]
  rows: string[][]
}

export interface SsomaArticle {
  /** "Art. 17" o "Anexo II" */
  ref: string
  /** Paráfrasis fiel o fragmento breve del texto. */
  text: string
}

export interface SsomaInternational {
  name: string
  /** Cómo se relaciona: equivalencia, referencia, diferencia. */
  relation: string
}

export interface SsomaNorm {
  id: string
  code: string
  title: string
  year: number
  /** Fecha de publicación AAAA-MM-DD si consta en el texto. */
  date?: string
  branch: SsomaBranch
  authority: string
  /** Estado según el propio texto y lo conocido: "Vigente", "Vigente (modificada por ...)", "Proyecto". */
  status: string
  /** id en el catálogo normativo del Observatorio (src/data/legalDatabase.ts y extensiones), si existe. */
  catalogId?: string
  summary: string
  scope: string
  howItWorks: string[]
  keyArticles: SsomaArticle[]
  obligations: string[]
  tables?: SsomaTable[]
  risks?: string[]
  international?: SsomaInternational[]
  modifications?: string[]
  keywords: string[]
  /** Ruta del archivo fuente dentro de data/fundamentos ssoma. */
  source: string
}

export interface SsomaRisk {
  id: string
  name: string
  category: 'seguridad' | 'higiene' | 'ergonomico' | 'psicosocial' | 'ambiental' | 'quimico' | 'biologico'
  /** Qué lo origina / ejemplos de actividades. */
  examples: string[]
  /** Consecuencias típicas. */
  consequences: string[]
  /** Controles según jerarquía (eliminación → EPP). */
  controls: string[]
  /** ids de SsomaNorm que lo regulan. */
  normIds: string[]
  /** Frecuencia relativa en el Perú: alta / media / baja (según estadística o práctica). */
  frequency: 'alta' | 'media' | 'baja'
}
