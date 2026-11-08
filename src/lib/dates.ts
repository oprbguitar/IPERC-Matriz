/** Fecha corta en español de Perú. */
export const fmtDate = (iso: string | null | undefined) => (iso ? new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')
