/**
 * Resuelve rutas de archivos estaticos respetando la base de despliegue
 * (GitHub Pages sirve la aplicación bajo "/IPERC-Matriz/").
 */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL
  const clean = path.replace(/^\/+/, '')
  return `${base}${clean}`
}
