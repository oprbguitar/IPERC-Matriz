import type { Hazard } from '../types'

export const hazards: Hazard[] = [
  {
    id: 'ergonomic-posture',
    category: 'Ergonomico',
    name: 'Posturas prolongadas o forzadas',
    commonConsequences: ['Trastornos musculoesqueleticos', 'fatiga', 'dolor lumbar o cervical'],
    keywords: ['computadora', 'pantalla', 'silla', 'postura', 'carga', 'archivo', 'digitacion'],
    sectors: ['public', 'health', 'manufacturing', 'offices'],
    suggestedControls: [
      {
        level: 'engineering',
        description: 'Adecuar puesto con silla regulable, soporte de pantalla y distribucion ergonomica.',
        technicalJustification: 'Reduce exposicion biomecanica en la fuente mediante ajuste fisico del puesto.',
        requiredEvidence: ['Registro fotografico del puesto', 'ficha de evaluacion ergonomica', 'acta de entrega/adecuacion'],
      },
      {
        level: 'administrative',
        description: 'Programar pausas activas y rotacion de tareas cuando exista exposicion sostenida.',
        technicalJustification: 'Disminuye duracion de exposicion y facilita recuperacion muscular.',
        requiredEvidence: ['Programa de pausas activas', 'lista de asistencia', 'cronograma de rotacion'],
      },
    ],
  },
  {
    id: 'fall-height',
    category: 'Locativo / mecanico',
    name: 'Trabajo en altura',
    commonConsequences: ['Caidas a distinto nivel', 'fracturas', 'lesiones graves o muerte'],
    keywords: ['altura', 'andamio', 'escalera', 'techo', 'borde', 'plataforma'],
    sectors: ['construction', 'mining', 'hydrocarbons', 'manufacturing'],
    suggestedControls: [
      {
        level: 'elimination',
        description: 'Redisenar la tarea para ejecutar el trabajo desde nivel de piso cuando sea posible.',
        technicalJustification: 'Eliminar la exposicion evita la materializacion del evento de caida.',
        requiredEvidence: ['Analisis de metodo alternativo', 'procedimiento actualizado', 'registro de aprobacion'],
      },
      {
        level: 'engineering',
        description: 'Instalar barandas, plataformas certificadas, lineas de vida y puntos de anclaje verificados.',
        technicalJustification: 'Las barreras fisicas y sistemas certificados reducen probabilidad y severidad de caida.',
        requiredEvidence: ['Certificado de andamio/anclaje', 'checklist preuso', 'inspeccion de linea de vida'],
      },
      {
        level: 'ppe',
        description: 'Usar arnes, doble linea de anclaje y casco con barbiquejo segun evaluacion de tarea.',
        technicalJustification: 'Mitiga consecuencias cuando los controles superiores no eliminan completamente el riesgo.',
        requiredEvidence: ['Registro de entrega de EPP', 'inspeccion de EPP', 'capacitacion en uso de arnes'],
      },
    ],
  },
  {
    id: 'chemical-exposure',
    category: 'Quimico',
    name: 'Exposicion a sustancias quimicas',
    commonConsequences: ['Intoxicacion', 'quemaduras', 'irritacion respiratoria o dermica'],
    keywords: ['quimico', 'solvente', 'pintura', 'limpieza', 'reactivo', 'combustible', 'derrame'],
    sectors: ['construction', 'health', 'hydrocarbons', 'manufacturing'],
    suggestedControls: [
      {
        level: 'substitution',
        description: 'Sustituir productos por alternativas de menor peligrosidad cuando sea viable.',
        technicalJustification: 'Reduce peligrosidad intrinseca antes de depender de conducta del trabajador.',
        requiredEvidence: ['Comparativo de HDS/SDS', 'aprobacion de sustitucion', 'inventario quimico actualizado'],
      },
      {
        level: 'engineering',
        description: 'Implementar ventilacion localizada, contencion secundaria y duchas/lavaojos donde aplique.',
        technicalJustification: 'Controla concentracion ambiental y respuesta ante contacto accidental.',
        requiredEvidence: ['Plano/ficha de ventilacion', 'inspeccion de contencion', 'prueba de ducha/lavaojos'],
      },
      {
        level: 'administrative',
        description: 'Mantener SDS disponibles, etiquetado, compatibilidad de almacenamiento y procedimiento de derrames.',
        technicalJustification: 'Estandariza informacion critica y respuesta operativa ante exposicion o fuga.',
        requiredEvidence: ['SDS vigentes', 'checklist de almacen', 'simulacro o entrenamiento de derrames'],
      },
    ],
  },
  {
    id: 'biological-agents',
    category: 'Biologico',
    name: 'Exposicion a agentes biologicos',
    commonConsequences: ['Infecciones', 'contaminacion cruzada', 'enfermedad ocupacional'],
    keywords: ['paciente', 'sangre', 'muestra', 'biologico', 'residuo', 'punzocortante', 'laboratorio'],
    sectors: ['health', 'public'],
    suggestedControls: [
      {
        level: 'engineering',
        description: 'Usar contenedores rigidos para punzocortantes, barreras fisicas y estaciones de higiene.',
        technicalJustification: 'Reduce contacto directo con fuente biologica y previene lesiones por punzocortantes.',
        requiredEvidence: ['Inspeccion de contenedores', 'registro de reposicion', 'mapa de estaciones de higiene'],
      },
      {
        level: 'administrative',
        description: 'Aplicar procedimientos de bioseguridad, segregacion de residuos y reporte de incidentes.',
        technicalJustification: 'Estandariza practicas criticas y asegura respuesta temprana ante exposicion.',
        requiredEvidence: ['Procedimiento de bioseguridad', 'capacitacion', 'registro de incidentes biologicos'],
      },
      {
        level: 'ppe',
        description: 'Usar guantes, mascarilla, proteccion ocular y mandil segun exposicion esperada.',
        technicalJustification: 'Disminuye contacto con fluidos o aerosoles cuando persiste riesgo residual.',
        requiredEvidence: ['Entrega de EPP', 'observacion planeada de uso', 'matriz de EPP por tarea'],
      },
    ],
  },
  {
    id: 'electrical',
    category: 'Electrico',
    name: 'Contacto electrico directo o indirecto',
    commonConsequences: ['Electrocucion', 'quemaduras', 'incendio', 'paro cardiorrespiratorio'],
    keywords: ['electricidad', 'tablero', 'cable', 'enchufe', 'mantenimiento', 'energia', 'bloqueo'],
    sectors: ['public', 'construction', 'mining', 'hydrocarbons', 'manufacturing', 'offices'],
    suggestedControls: [
      {
        level: 'engineering',
        description: 'Asegurar tableros, puesta a tierra, protecciones diferenciales y canalizacion de cables.',
        technicalJustification: 'Las protecciones fisicas reducen contacto accidental y fallas electricas.',
        requiredEvidence: ['Medicion de puesta a tierra', 'inspeccion electrica', 'registro de mantenimiento'],
      },
      {
        level: 'administrative',
        description: 'Aplicar bloqueo/etiquetado y permisos para intervenciones electricas.',
        technicalJustification: 'Controla energias peligrosas durante mantenimiento o reparacion.',
        requiredEvidence: ['Permiso de trabajo', 'registro LOTO', 'autorizacion de personal competente'],
      },
    ],
  },
  {
    id: 'noise',
    category: 'Fisico',
    name: 'Exposicion a ruido',
    commonConsequences: ['Hipoacusia', 'fatiga', 'interferencia de comunicacion', 'estres'],
    keywords: ['ruido', 'maquina', 'compresor', 'perforacion', 'planta', 'produccion'],
    sectors: ['construction', 'mining', 'hydrocarbons', 'manufacturing'],
    suggestedControls: [
      {
        level: 'engineering',
        description: 'Aislar fuente, instalar barreras acusticas o mantener equipos para reducir emision.',
        technicalJustification: 'Disminuye el nivel sonoro en origen o trayectoria.',
        requiredEvidence: ['Medicion de ruido', 'registro de mantenimiento', 'plano de barreras'],
      },
      {
        level: 'administrative',
        description: 'Limitar tiempos de exposicion y senalizar zonas con ruido.',
        technicalJustification: 'Reduce dosis acumulada de exposicion durante la jornada.',
        requiredEvidence: ['Mapa de ruido', 'programa de rotacion', 'senalizacion instalada'],
      },
      {
        level: 'ppe',
        description: 'Entregar protectores auditivos seleccionados segun nivel de exposicion.',
        technicalJustification: 'Atenua exposicion residual cuando los controles superiores no bastan.',
        requiredEvidence: ['Registro de entrega', 'capacitacion de uso', 'fit-check o verificacion de uso'],
      },
    ],
  },
  {
    id: 'psychosocial',
    category: 'Psicosocial',
    name: 'Carga mental, alta demanda o violencia externa',
    commonConsequences: ['Estres laboral', 'fatiga mental', 'ansiedad', 'conflictos'],
    keywords: ['estres', 'atencion al publico', 'turno', 'sobrecarga', 'emergencia', 'reclamo'],
    sectors: ['public', 'health', 'offices'],
    suggestedControls: [
      {
        level: 'administrative',
        description: 'Evaluar carga de trabajo, definir pausas, canales de reporte y protocolo de atencion dificil.',
        technicalJustification: 'Reduce demanda organizacional y mejora respuesta ante eventos psicosociales.',
        requiredEvidence: ['Evaluacion psicosocial', 'protocolo de atencion', 'registro de induccion'],
      },
    ],
  },
]
