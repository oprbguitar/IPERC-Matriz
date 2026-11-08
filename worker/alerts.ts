/**
 * Alertas normativas: recolector programado (cron diario) de fuentes oficiales con RSS.
 * - Perú: buscador de gob.pe (normas y noticias de MTPE, SUNAFIL, MINAM, MINSA, MINEM, OEFA, PRODUCE).
 * - Internacional: EU-OSHA.
 * Filtra por palabras clave SSOMA y descarta resoluciones de personal (licencias, designaciones, viajes).
 * Solo guarda título, extracto, enlace y fecha: el texto oficial se consulta en la fuente.
 */

export interface AlertsEnv {
  DB: D1Database
}

interface Source { id: string; label: string; scope: 'peru' | 'internacional'; url: string; strict: boolean }

const GOB = (contenido: string, institucion: string) =>
  `https://www.gob.pe/busquedas.rss?contenido%5B%5D=${contenido}&institucion%5B%5D=${institucion}`

export const ALERT_SOURCES: Source[] = [
  { id: 'mtpe-normas', label: 'MTPE · normas', scope: 'peru', url: GOB('normas', 'mtpe'), strict: true },
  { id: 'sunafil-normas', label: 'SUNAFIL · normas', scope: 'peru', url: GOB('normas', 'sunafil'), strict: true },
  { id: 'sunafil-noticias', label: 'SUNAFIL · noticias', scope: 'peru', url: GOB('noticias', 'sunafil'), strict: true },
  { id: 'mtpe-noticias', label: 'MTPE · noticias', scope: 'peru', url: GOB('noticias', 'mtpe'), strict: true },
  { id: 'minam-normas', label: 'MINAM · normas', scope: 'peru', url: GOB('normas', 'minam'), strict: true },
  { id: 'minsa-normas', label: 'MINSA · normas', scope: 'peru', url: GOB('normas', 'minsa'), strict: true },
  { id: 'minem-normas', label: 'MINEM · normas', scope: 'peru', url: GOB('normas', 'minem'), strict: true },
  { id: 'oefa-normas', label: 'OEFA · normas', scope: 'peru', url: GOB('normas', 'oefa'), strict: true },
  { id: 'produce-normas', label: 'PRODUCE · normas', scope: 'peru', url: GOB('normas', 'produce'), strict: true },
  { id: 'eu-osha', label: 'EU-OSHA (Unión Europea)', scope: 'internacional', url: 'https://osha.europa.eu/en/rss.xml', strict: false },
]

const TAGS: Array<{ tag: string; re: RegExp }> = [
  { tag: 'SST', re: /seguridad y salud|salud en el trabajo|\bsst\b|riesgos? laboral|accidente|prevenci[oó]n de riesgos|occupational|safety|health at work|osh\b/i },
  { tag: 'Inspección', re: /sunafil|inspecci[oó]n|fiscalizaci[oó]n|infracci|sanci[oó]n|multa|inspector|enforcement/i },
  { tag: 'Ambiental', re: /ambiental|residuos|emisi|efluente|\beca\b|\blmp\b|calidad del aire|agua|ruido ambiental|oefa|environment/i },
  { tag: 'Químicos', re: /qu[ií]mic|sustancias|\bsga\b|ghs|etiquetado|hojas? de datos|plaguicid|mercurio|amianto|asbest|chemical|dangerous substances/i },
  { tag: 'Salud ocupacional', re: /salud ocupacional|vigilancia m[eé]dica|ex[aá]menes? m[eé]dic|enfermedad(es)? profesional|ergonom|psicosocial|estr[eé]s|mental health|musculoskeletal/i },
  { tag: 'Minería/energía', re: /miner[ií]a|minero|hidrocarburo|electricidad|el[eé]ctric|energ[ií]a|osinergmin/i },
  { tag: 'Construcción', re: /construcci[oó]n|edificaci|\bg\.?050\b|obra/i },
  { tag: 'Clima/emergencias', re: /fen[oó]meno el ni[nñ]o|lluvias|heladas|calor|emergencia|sismo|desastre|climate|heat/i },
]

/** Resoluciones internas que no interesan a un área SSOMA. */
const NOISE = /licencia (sin|con) goce|\bdesign(a|an|ar|aci[oó]n)\b|\bencarg(a|an|ar|atura)\b|dar por concluid|viaje|vacaciones|rotaci[oó]n de personal|aceptar la renuncia|remuneraci|contrataci[oó]n administrativa de servicios|proceso cas|delegar facultades|comisi[oó]n de servicios|\bbono\b|pago de|presupuest|desagregaci|cr[eé]dito suplementario|fraccionamiento|aplazamiento|error material|cronograma de ejecuci|agrupaci[oó]n musical|canci[oó]n criolla|empleos temporales|salarial|gratificaci|\bcts\b|procurador|donaci[oó]n|bienes muebles|conciliaci/i

/** Nombres de instituciones que contienen palabras clave y darían falsos positivos. */
const INSTITUTIONS = /organismo de evaluaci[oó]n y fiscalizaci[oó]n ambiental|superintendencia nacional de fiscalizaci[oó]n laboral|ministerio del ambiente|direcci[oó]n general de asuntos ambientales( mineros| de electricidad)?/gi

const STRONG = /seguridad y salud|salud en el trabajo|riesgos? laborales?|accidentes?|ocupacional|residuos|calidad ambiental|impacto ambiental|est[aá]ndares? de calidad|l[ií]mites? m[aá]ximos? permisibles|sustancias|qu[ií]mic|prevenci[oó]n de riesgos|ergonom|psicosocial|safety|occupational|hazard|\bosh\b|riesgo de desastres|fen[oó]meno el ni[nñ]o/i

function decode(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tag(xml: string, name: string): string {
  const match = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'))
  return match ? decode(match[1]) : ''
}

export function parseRss(xml: string): Array<{ title: string; link: string; summary: string; published: string | null }> {
  return [...xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)].map((match) => {
    const item = match[0]
    const date = tag(item, 'pubDate') || tag(item, 'dc:date')
    const parsed = date ? new Date(date) : null
    return {
      title: tag(item, 'title').slice(0, 300),
      link: tag(item, 'link').slice(0, 500),
      summary: tag(item, 'description').slice(0, 1200),
      published: parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString() : null,
    }
  })
}

export function classify(source: Source, title: string, summary: string): { keep: boolean; tags: string[]; score: number } {
  const text = `${title} ${summary}`.replace(INSTITUTIONS, ' ')
  if (NOISE.test(text)) return { keep: false, tags: [], score: 0 }
  const tags = TAGS.filter((item) => item.re.test(text)).map((item) => item.tag)
  const strong = STRONG.test(text)
  const score = tags.length + (strong ? 2 : 0)
  return { keep: source.strict ? strong : tags.length > 0 || source.scope === 'internacional', tags, score }
}

let schemaReady = false
export async function ensureAlertsSchema(env: AlertsEnv) {
  if (schemaReady) return
  await env.DB.batch([
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS norm_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT NOT NULL UNIQUE, source TEXT NOT NULL, scope TEXT NOT NULL,
      title TEXT NOT NULL, summary TEXT, published TEXT, tags TEXT, score INTEGER NOT NULL DEFAULT 0,
      fetched_at TEXT NOT NULL, ai_summary TEXT)`),
    env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_alerts_published ON norm_alerts(published)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS alert_runs (source TEXT PRIMARY KEY, ok INTEGER, found INTEGER, kept INTEGER, error TEXT, ran_at TEXT)'),
  ])
  schemaReady = true
}

/** Recorre todas las fuentes; se usa en el cron y en el botón «Actualizar ahora» del administrador. */
export async function collectAlerts(env: AlertsEnv): Promise<Array<{ source: string; ok: boolean; found: number; kept: number; error?: string }>> {
  await ensureAlertsSchema(env)
  const now = new Date().toISOString()
  const report = await Promise.all(
    ALERT_SOURCES.map(async (source) => {
      try {
        const response = await fetch(source.url, {
          headers: { 'User-Agent': 'ObservatorioPrevenirPeru/1.0 (+https://sst.andesnova.solutions)', Accept: 'application/rss+xml, application/xml, text/xml' },
          signal: AbortSignal.timeout(15_000),
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const items = parseRss(await response.text()).filter((item) => item.title && /^https?:\/\//.test(item.link))
        const kept = items
          .map((item) => ({ item, verdict: classify(source, item.title, item.summary) }))
          .filter(({ verdict }) => verdict.keep)
        if (kept.length) {
          await env.DB.batch(
            kept.map(({ item, verdict }) =>
              env.DB.prepare(
                'INSERT OR IGNORE INTO norm_alerts (url, source, scope, title, summary, published, tags, score, fetched_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
              ).bind(item.link, source.label, source.scope, item.title, item.summary, item.published, verdict.tags.join(','), verdict.score, now),
            ),
          )
        }
        return { source: source.label, ok: true, found: items.length, kept: kept.length }
      } catch (error) {
        return { source: source.label, ok: false, found: 0, kept: 0, error: error instanceof Error ? error.message : 'error' }
      }
    }),
  )
  await env.DB.batch(
    report.map((row) =>
      env.DB.prepare(
        'INSERT INTO alert_runs (source, ok, found, kept, error, ran_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6) ON CONFLICT(source) DO UPDATE SET ok = ?2, found = ?3, kept = ?4, error = ?5, ran_at = ?6',
      ).bind(row.source, row.ok ? 1 : 0, row.found, row.kept, row.error ?? null, now),
    ),
  )
  // Conserva un año de alertas.
  await env.DB.prepare("DELETE FROM norm_alerts WHERE fetched_at < datetime('now', '-365 days')").run()
  return report
}

export async function listAlerts(env: AlertsEnv, url: URL): Promise<Response> {
  await ensureAlertsSchema(env)
  const scope = url.searchParams.get('scope')
  const tagFilter = url.searchParams.get('tag')
  const q = (url.searchParams.get('q') ?? '').trim().slice(0, 80)
  const where: string[] = []
  const binds: unknown[] = []
  if (scope === 'peru' || scope === 'internacional') { where.push('scope = ?'); binds.push(scope) }
  if (tagFilter) { where.push("(',' || tags || ',') LIKE ?"); binds.push(`%,${tagFilter.slice(0, 40)},%`) }
  if (q) { where.push('(title LIKE ? OR summary LIKE ?)'); binds.push(`%${q}%`, `%${q}%`) }
  const sql = `SELECT id, url, source, scope, title, summary, published, tags, score, ai_summary FROM norm_alerts ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY COALESCE(published, fetched_at) DESC LIMIT 80`
  const [alerts, runs] = await Promise.all([
    env.DB.prepare(sql).bind(...binds).all(),
    env.DB.prepare('SELECT source, ok, found, kept, error, ran_at FROM alert_runs ORDER BY source').all(),
  ])
  return new Response(JSON.stringify({ alerts: alerts.results, runs: runs.results, tags: TAGS.map((item) => item.tag) }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}
