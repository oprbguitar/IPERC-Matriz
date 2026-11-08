/** Proyección isométrica compartida por el visor y los datos de los ambientes. */
export type Point3 = [number, number, number?]

export const SCENE_WIDTH = 860
export const SCENE_HEIGHT = 460

export function project([x, y, z = 0]: Point3): [number, number] {
  return [430 + (x - y) * 30, 105 + (x + y) * 17 - z]
}

/** Posición porcentual sobre el lienzo, para ubicar los puntos de inspección. */
export function toPercent(point: Point3): { x: number; y: number } {
  const [px, py] = project(point)
  return { x: Math.round((px / SCENE_WIDTH) * 1000) / 10, y: Math.round((py / SCENE_HEIGHT) * 1000) / 10 }
}
