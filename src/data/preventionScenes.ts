export interface PreventionHotspot {
  id: string
  label: string
  topicId: string
  /** Posición porcentual sobre el lienzo 860 × 460. */
  x: number
  y: number
}

export interface PreventionSceneData {
  id: string
  label: string
  description: string
  domestic?: boolean
  hotspots: PreventionHotspot[]
}

export const PREVENTION_SCENES: PreventionSceneData[] = [
  { id: 'oficina', label: 'Oficina', description: 'Puestos, pantallas, instalación eléctrica y condiciones de trabajo.', hotspots: [
    { id: 'oficina-puesto', label: 'Ajuste del puesto', topicId: 'ergonomia', x: 39, y: 46 },
    { id: 'oficina-tablero', label: 'Tablero eléctrico', topicId: 'electricidad', x: 73, y: 35 },
    { id: 'oficina-ambiente', label: 'Ambiente y ventilación', topicId: 'confort', x: 47, y: 17 },
    { id: 'oficina-organizacion', label: 'Carga y organización', topicId: 'psicosocial', x: 55, y: 71 },
  ] },
  { id: 'almacen', label: 'Almacén', description: 'Cruces de peatones, estanterías, cargas y circulación interna.', hotspots: [
    { id: 'almacen-cruce', label: 'Cruce peatón–montacargas', topicId: 'maquinaria', x: 56, y: 64 },
    { id: 'almacen-carga', label: 'Manipulación de cargas', topicId: 'ergonomia', x: 29, y: 48 },
    { id: 'almacen-casco', label: 'Caída de objetos y EPP', topicId: 'epp', x: 66, y: 34 },
    { id: 'almacen-salida', label: 'Ruta de evacuación', topicId: 'incendios', x: 44, y: 21 },
  ] },
  { id: 'planta', label: 'Planta industrial', description: 'Línea de fabricación, puntos de atrapamiento, energía y ruido.', hotspots: [
    { id: 'planta-linea', label: 'Resguardo de maquinaria', topicId: 'maquinaria', x: 48, y: 47 },
    { id: 'planta-ruido', label: 'Ruido de proceso', topicId: 'ruido', x: 71, y: 43 },
    { id: 'planta-energia', label: 'Aislamiento de energía', topicId: 'electricidad', x: 33, y: 26 },
    { id: 'planta-residuo', label: 'Residuos del proceso', topicId: 'residuos', x: 33, y: 70 },
  ] },
  { id: 'alimentos', label: 'Planta de alimentos', description: 'Separación de operaciones, cadena de frío, higiene y limpieza.', hotspots: [
    { id: 'alimentos-mesa', label: 'Separar crudo y listo', topicId: 'alimentos', x: 49, y: 49 },
    { id: 'alimentos-limpieza', label: 'Productos de limpieza', topicId: 'quimicos', x: 31, y: 27 },
    { id: 'alimentos-corte', label: 'Corte y atrapamiento', topicId: 'maquinaria', x: 65, y: 61 },
    { id: 'alimentos-frio', label: 'Frío y condiciones ambientales', topicId: 'confort', x: 69, y: 31 },
  ] },
  { id: 'salud', label: 'Establecimiento de salud', description: 'Atención de pacientes, residuos biocontaminados y movilización.', hotspots: [
    { id: 'salud-atencion', label: 'Exposición biológica', topicId: 'biologicos', x: 49, y: 48 },
    { id: 'salud-punzantes', label: 'Punzocortantes', topicId: 'residuos', x: 70, y: 42 },
    { id: 'salud-movilizar', label: 'Movilizar sin sobreesfuerzo', topicId: 'ergonomia', x: 37, y: 66 },
    { id: 'salud-piel', label: 'Higiene y cuidado de piel', topicId: 'piel', x: 36, y: 26 },
  ] },
  { id: 'construccion', label: 'Construcción', description: 'Bordes, andamios, tránsito y exposición al ambiente exterior.', hotspots: [
    { id: 'obra-borde', label: 'Bordes y trabajo en altura', topicId: 'alturas', x: 40, y: 28 },
    { id: 'obra-epp', label: 'Protección personal', topicId: 'epp', x: 57, y: 65 },
    { id: 'obra-sol', label: 'Exposición al sol', topicId: 'uv', x: 73, y: 20 },
    { id: 'obra-maquina', label: 'Herramientas y maquinaria', topicId: 'maquinaria', x: 68, y: 49 },
  ] },
  { id: 'agricultura', label: 'Agricultura exterior', description: 'Trabajo al sol, sustancias, equipos y protección de la piel.', hotspots: [
    { id: 'campo-sol', label: 'Radiación UV solar', topicId: 'uv', x: 73, y: 20 },
    { id: 'campo-piel', label: 'Piel y protección complementaria', topicId: 'piel', x: 49, y: 58 },
    { id: 'campo-quimicos', label: 'Almacenamiento de productos', topicId: 'quimicos', x: 30, y: 36 },
    { id: 'campo-cargas', label: 'Tareas repetitivas y cargas', topicId: 'ergonomia', x: 64, y: 69 },
  ] },
  { id: 'hogar', label: 'Hogar', domestic: true, description: 'Prevención doméstica general. No traslada obligaciones empresariales a la vivienda.', hotspots: [
    { id: 'hogar-cocina', label: 'Gas, ventilación y calor', topicId: 'gases', x: 70, y: 37 },
    { id: 'hogar-enchufe', label: 'Conexiones eléctricas', topicId: 'electricidad', x: 33, y: 29 },
    { id: 'hogar-limpieza', label: 'Guardar productos separados', topicId: 'quimicos', x: 32, y: 66 },
    { id: 'hogar-incendio', label: 'Respuesta ante incendio', topicId: 'incendios', x: 58, y: 65 },
  ] },
]
