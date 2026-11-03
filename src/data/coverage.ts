import {
  AlertTriangle,
  BadgeCheck,
  Bot,
  Brain,
  ClipboardCheck,
  Flame,
  Gavel,
  GraduationCap,
  HardHat,
  HeartPulse,
  Leaf,
  Recycle,
  ShieldCheck,
  Siren,
  Users,
  Waves,
  Zap,
} from 'lucide-react'
import type { IconType, SiteViewId } from './platformContent'

/**
 * Dominios del sistema de seguimiento. Cada uno enlaza normas del catalogo,
 * una guia descargable y la pregunta del diagnostico que lo mide (si existe).
 */
export interface CoverageDomain {
  id: string
  label: string
  icon: IconType
  tone: 'blue' | 'sky' | 'teal' | 'green' | 'amber' | 'violet' | 'red'
  description: string
  normIds: string[]
  guideId?: string
  diagnosticId?: string
  view: SiteViewId
}

export const COVERAGE_DOMAINS: CoverageDomain[] = [
  { id: 'sst', label: 'SST / SGSST', icon: ShieldCheck, tone: 'blue', description: 'Política, plan anual, objetivos y mejora continua.', normIds: ['law-29783', 'ds-005-2012-tr'], guideId: 'guia-sgsst', diagnosticId: 'annual-plan', view: 'obligaciones' },
  { id: 'iperc', label: 'IPERC y mapa de riesgos', icon: AlertTriangle, tone: 'amber', description: 'Peligros, evaluación y controles por puesto.', normIds: ['ds-005-2012-tr'], guideId: 'guia-iperc', diagnosticId: 'iperc', view: 'herramientas' },
  { id: 'comite', label: 'Comité / supervisor', icon: Users, tone: 'violet', description: 'Elección, actas mensuales y funciones.', normIds: ['ds-001-2021-tr', 'sunafil-guia-comite'], guideId: 'guia-comite', diagnosticId: 'committee', view: 'obligaciones' },
  { id: 'registros', label: 'Registros obligatorios', icon: ClipboardCheck, tone: 'sky', description: 'Los registros del SGSST y sus plazos de conservación.', normIds: ['rm-050-2013-tr'], guideId: 'guia-registros', diagnosticId: 'records', view: 'plantillas' },
  { id: 'salud', label: 'Salud ocupacional', icon: HeartPulse, tone: 'red', description: 'EMO, vigilancia médica y médico ocupacional.', normIds: ['rm-312-2011-minsa', 'rm-021-2016-minsa', 'law-31246'], guideId: 'guia-salud', view: 'normativa' },
  { id: 'higiene', label: 'Higiene ocupacional', icon: Waves, tone: 'teal', description: 'Monitoreo de ruido, polvo, gases e iluminación.', normIds: ['ds-005-2012-tr', 'rm-375-2008-tr'], guideId: 'guia-ergonomia', view: 'normativa' },
  { id: 'ergonomia', label: 'Ergonomía', icon: HardHat, tone: 'teal', description: 'Carga manual, posturas y pantallas.', normIds: ['rm-375-2008-tr'], guideId: 'guia-ergonomia', view: 'normativa' },
  { id: 'psicosocial', label: 'Riesgos psicosociales', icon: Brain, tone: 'violet', description: 'Salud mental, estrés y hostigamiento.', normIds: ['law-31246'], guideId: 'guia-salud', view: 'normativa' },
  { id: 'inspecciones', label: 'Inspecciones SUNAFIL', icon: Gavel, tone: 'violet', description: 'Infracciones, multas y descargos.', normIds: ['law-28806', 'ds-019-2006-tr', 'ds-008-2020-tr'], guideId: 'guia-sunafil', view: 'herramientas' },
  { id: 'auditoria', label: 'Auditoría del SGSST', icon: BadgeCheck, tone: 'blue', description: 'Auditor registrado y periodicidad.', normIds: ['ds-014-2013-tr'], guideId: 'guia-auditoria', view: 'herramientas' },
  { id: 'emergencias', label: 'Emergencias', icon: Siren, tone: 'red', description: 'Plan de respuesta, brigadas y simulacros.', normIds: ['ds-005-2012-tr'], guideId: 'guia-emergencias', view: 'plantillas' },
  { id: 'incendios', label: 'Incendios y explosiones', icon: Flame, tone: 'amber', description: 'Extintores, rutas de evacuación y señalización.', normIds: ['ds-005-2012-tr'], guideId: 'guia-emergencias', view: 'plantillas' },
  { id: 'electrico', label: 'Riesgo eléctrico', icon: Zap, tone: 'amber', description: 'Bloqueo, etiquetado y EPP dieléctrico.', normIds: ['rm-111-2013-mem-dm'], guideId: 'guia-contratistas', view: 'normativa' },
  { id: 'residuos', label: 'Residuos sólidos', icon: Recycle, tone: 'green', description: 'Segregación, almacenamiento y operadores.', normIds: ['dl-1278', 'ds-014-2017-minam'], guideId: 'guia-residuos', diagnosticId: 'environment', view: 'obligaciones' },
  { id: 'ambiente', label: 'Medio ambiente (SOMA)', icon: Leaf, tone: 'green', description: 'Aspectos ambientales y cumplimiento.', normIds: ['law-28611'], guideId: 'guia-residuos', view: 'obligaciones' },
  { id: 'capacitacion', label: 'Capacitación y contratistas', icon: GraduationCap, tone: 'sky', description: '4 capacitaciones al año y control de terceros.', normIds: ['law-29783'], guideId: 'guia-contratistas', view: 'plantillas' },
  { id: 'ia', label: 'SST digital e IA', icon: Bot, tone: 'sky', description: 'Datos, tableros, agentes y protección de datos.', normIds: ['law-29733'], view: 'premium' },
]
