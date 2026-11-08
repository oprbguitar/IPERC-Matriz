/** Lee parámetros de la ruta con hash: #/vista?q=texto&sec=normas */
export function hashParam(name: string): string | null {
  const hash = typeof window === 'undefined' ? '' : window.location.hash
  const index = hash.indexOf('?')
  return index >= 0 ? new URLSearchParams(hash.slice(index + 1)).get(name) : null
}
