/**
 * Hitos del plan premium de implementacion. El avance de cada usuario se guarda
 * en D1 (tabla `progress`); aqui solo vive la definicion publica de los hitos.
 */
export interface PlanPhase {
  id: string
  title: string
  color: string
  items: Array<{ id: string; label: string; hint: string }>
}

export const PREMIUM_PLAN: PlanPhase[] = [
  {
    id: 'base',
    title: 'Base legal del SGSST',
    color: '#1f6fe5',
    items: [
      { id: 'politica', label: 'Política y objetivos firmados', hint: 'Firmados por la máxima autoridad y difundidos.' },
      { id: 'comite', label: 'Comité o supervisor elegido', hint: 'Acta de elección y libro de actas al día.' },
      { id: 'risst', label: 'RISST entregado (≥ 20 trabajadores)', hint: 'Con cargo de entrega a cada trabajador.' },
      { id: 'plan-anual', label: 'Plan y programa anual aprobados', hint: 'Con presupuesto y responsables.' },
    ],
  },
  {
    id: 'riesgos',
    title: 'IPERC y controles',
    color: '#d97706',
    items: [
      { id: 'iperc-puestos', label: 'IPERC por puesto con participación', hint: 'Validado en campo con los trabajadores.' },
      { id: 'mapa', label: 'Mapa de riesgos publicado', hint: 'Visible en el centro de trabajo.' },
      { id: 'pets', label: 'PETS y permisos de alto riesgo', hint: 'Altura, caliente, confinados, energía.' },
      { id: 'epp', label: 'Registro de entrega de EPP', hint: 'Costo total asumido por el empleador.' },
    ],
  },
  {
    id: 'salud',
    title: 'Salud ocupacional',
    color: '#d0342c',
    items: [
      { id: 'emo', label: 'EMO vigentes del personal', hint: 'Preocupacional, periódico y de retiro.' },
      { id: 'monitoreo', label: 'Monitoreo de agentes ocupacionales', hint: 'Ruido, polvo, iluminación, ergonomía.' },
      { id: 'psicosocial', label: 'Evaluación psicosocial y salud mental', hint: 'Programa con acciones de seguimiento.' },
    ],
  },
  {
    id: 'soma',
    title: 'SOMA y emergencias',
    color: '#12a150',
    items: [
      { id: 'residuos', label: 'Plan de manejo de residuos', hint: 'Segregación, almacenamiento y operador autorizado.' },
      { id: 'emergencias', label: 'Plan de emergencias y simulacros', hint: 'Brigadas formadas y simulacro registrado.' },
      { id: 'contratistas', label: 'Control de contratistas', hint: 'SCTR, inducción y verificación previa.' },
    ],
  },
  {
    id: 'seguimiento',
    title: 'Seguimiento y auditoría',
    color: '#6d4bd6',
    items: [
      { id: 'indicadores', label: 'Tablero mensual de indicadores', hint: 'IF, IS, IA y proactivos.' },
      { id: 'capacitaciones', label: '4 capacitaciones por trabajador', hint: 'Registro firmado de cada sesión.' },
      { id: 'auditoria', label: 'Auditoría externa del SGSST', hint: 'Auditor registrado e independiente.' },
      { id: 'revision', label: 'Revisión por la dirección', hint: 'Acta anual con decisiones.' },
    ],
  },
  {
    id: 'ia',
    title: 'IA y automatización',
    color: '#0ea5e9',
    items: [
      { id: 'ia-procedimiento', label: 'Procedimiento de uso de IA aprobado', hint: 'Datos permitidos y revisión humana.' },
      { id: 'ia-biblioteca', label: 'Biblioteca normativa oficial cargada', hint: 'Fuentes de gob.pe y El Peruano.' },
      { id: 'ia-agente', label: 'Agente normativo / IPERC en piloto', hint: 'Con registro de uso y citas.' },
      { id: 'ia-alertas', label: 'Alertas automáticas de acciones vencidas', hint: 'Notificación y escalamiento.' },
    ],
  },
]

export const PREMIUM_ITEM_COUNT = PREMIUM_PLAN.reduce((sum, phase) => sum + phase.items.length, 0)
