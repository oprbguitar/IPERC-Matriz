/**
 * Consentimiento y términos de uso del Observatorio Premium.
 * Marco: Ley 29733 de Protección de Datos Personales y su Reglamento (D.S. 016-2024-JUS),
 * Código de Protección y Defensa del Consumidor (Ley 29571) y Ley 29783 (el usuario sigue siendo
 * responsable de su SGSST). Si se cambia el texto, suba la versión: todos los usuarios deberán aceptar de nuevo.
 */
export const CONSENT_VERSION = '2026-11-07'

export interface ConsentClause {
  id: 'datos' | 'terminos' | 'ia'
  title: string
  points: string[]
}

export const CONSENT_CLAUSES: ConsentClause[] = [
  {
    id: 'datos',
    title: 'Tratamiento de datos personales (Ley 29733)',
    points: [
      'Titular del banco de datos: Observatorio Prevenir Perú (AndesNova Solutions). Finalidad: crear y administrar su cuenta, validar su identidad, controlar el periodo de prueba o suscripción y la seguridad del acceso.',
      'Datos tratados: nombre, correo, DNI o documento de identidad, organización, registros de acceso (fecha y una huella anónima de su IP) y las consultas que haga a la IA.',
      'Las fotos que envíe al diagnóstico se procesan al momento y no se guardan; solo queda un resumen de texto en su historial.',
      'Sus datos no se venden ni se ceden a terceros. Los proveedores de IA que el administrador active (Cloudflare, OpenAI, Anthropic u otros) reciben solo el contenido de la consulta.',
      'Puede ejercer sus derechos de acceso, rectificación, cancelación y oposición (ARCO) escribiendo al administrador. Si no recibe respuesta, puede acudir a la Autoridad Nacional de Protección de Datos Personales (MINJUSDH).',
    ],
  },
  {
    id: 'terminos',
    title: 'Términos de uso y responsabilidad',
    points: [
      'La cuenta es personal e intransferible. Usted se compromete a no compartir su clave ni sus códigos de acceso, y a cambiar la clave temporal en el primer ingreso.',
      'El periodo de prueba es gratuito y temporal. Al vencer, el acceso premium se suspende hasta que active un código de extensión entregado por el administrador.',
      'El administrador puede suspender cuentas ante uso indebido, intentos de intrusión, extracción automatizada o reventa del servicio.',
      'La información normativa es orientativa: verifique siempre el texto oficial en El Peruano o gob.pe.',
    ],
  },
  {
    id: 'ia',
    title: 'Uso responsable de la inteligencia artificial',
    points: [
      'Los diagnósticos, probabilidades e informes generados con IA son preliminares y pueden contener errores. No reemplazan la evaluación de un profesional SST ni la matriz IPERC de su empresa.',
      'El empleador sigue siendo responsable de la gestión de la seguridad y salud en el trabajo (Ley 29783, principio de prevención). Usted asume la responsabilidad del uso que dé a los resultados.',
      'No envíe fotos donde se identifique a personas sin su autorización, ni datos de salud de trabajadores.',
    ],
  },
]
