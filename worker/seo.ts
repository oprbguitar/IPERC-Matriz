/**
 * Posicionamiento en buscadores y redes sociales.
 * - /v/<vista>: URL indexable por vista (Google ignora el #). El Worker devuelve el index.html con título,
 *   descripción, canónica y Open Graph propios de esa vista; el navegador abre luego la vista con hash.
 * - /sitemap.xml: generado desde el menú, con fecha del día para que los buscadores vuelvan a rastrear.
 * - IndexNow (Bing, Yandex, Seznam, Naver): aviso semanal desde el cron con la lista de URLs.
 */
import { NAV_ITEMS } from '../src/data/platformContent'

export const SITE = 'https://sst.andesnova.solutions'
export const INDEXNOW_KEY = '1fca7ff4cfc3c73281720b500eb00e69'
const BRAND = 'Observatorio Prevenir Perú'

interface SeoEnv { ASSETS: Fetcher }

const PUBLIC_VIEWS = NAV_ITEMS.filter((item) => item.id !== 'inicio')

export function sitemapUrls(): string[] {
  return [`${SITE}/`, ...PUBLIC_VIEWS.map((item) => `${SITE}/v/${item.id}`)]
}

const escapeXml = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export async function seoResponse(request: Request, env: SeoEnv, url: URL): Promise<Response | null> {
  if (url.pathname === '/sitemap.xml') {
    const today = new Date().toISOString().slice(0, 10)
    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls()
  .map((loc, index) => `  <url><loc>${loc}</loc><lastmod>${today}</lastmod><changefreq>${index === 0 ? 'daily' : 'weekly'}</changefreq><priority>${index === 0 ? '1.0' : '0.7'}</priority></url>`)
  .join('\n')}
</urlset>`
    return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } })
  }

  const match = url.pathname.match(/^\/v\/([a-z0-9-]+)\/?$/)
  if (!match) return null
  const view = NAV_ITEMS.find((item) => item.id === match[1])
  if (!view) return null
  const page = await env.ASSETS.fetch(new Request(new URL('/', url), { headers: request.headers }))
  const title = `${view.label} | ${BRAND}`
  const description = `${view.description}. Seguridad y salud en el trabajo, ambiente y gestión integrada en Perú.`
  const canonical = `${SITE}/v/${view.id}`
  const rewritten = new HTMLRewriter()
    .on('title', { element: (el) => { el.setInnerContent(title) } })
    .on('meta[name="description"]', { element: (el) => { el.setAttribute('content', description) } })
    .on('meta[property="og:title"]', { element: (el) => { el.setAttribute('content', title) } })
    .on('meta[property="og:description"]', { element: (el) => { el.setAttribute('content', description) } })
    .on('meta[property="og:url"]', { element: (el) => { el.setAttribute('content', canonical) } })
    .on('meta[name="twitter:title"]', { element: (el) => { el.setAttribute('content', title) } })
    .on('link[rel="canonical"]', { element: (el) => { el.setAttribute('href', canonical) } })
    .on('div#root', {
      element: (el) => {
        el.append(`<noscript><h1>${escapeXml(view.label)}</h1><p>${escapeXml(description)}</p></noscript>`, { html: true })
      },
    })
    .transform(page)
  const headers = new Headers(rewritten.headers)
  headers.set('Cache-Control', 'public, max-age=600')
  return new Response(rewritten.body, { status: 200, headers })
}

export function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers)
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'SAMEORIGIN')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()')
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

export async function pingIndexNow(): Promise<void> {
  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: new URL(SITE).host, key: INDEXNOW_KEY, keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`, urlList: sitemapUrls() }),
    })
    console.log('indexnow', response.status)
  } catch (error) {
    console.log('indexnow error', String(error))
  }
}
