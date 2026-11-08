/**
 * Verificación anti-bots sin terceros: el servidor entrega un reto firmado y el navegador busca un
 * número cuyo SHA-256 empiece con N bits en cero (≈0,3–1 s en un celular). Un bot que intente miles
 * de claves debe pagar ese cálculo en cada intento.
 */

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
])
const W = new Uint32Array(64)

/** SHA-256 síncrono de una cadena ASCII; devuelve la primera palabra de 32 bits (basta para contar ceros). */
function sha256FirstWord(text: string): number {
  const length = text.length
  const blocks = ((length + 9 + 63) >> 6) << 4
  const words = new Uint32Array(blocks)
  for (let i = 0; i < length; i += 1) words[i >> 2] |= (text.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8)
  words[length >> 2] |= 0x80 << (24 - (length % 4) * 8)
  words[blocks - 1] = length * 8
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a, h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19
  for (let offset = 0; offset < blocks; offset += 16) {
    for (let t = 0; t < 64; t += 1) {
      if (t < 16) W[t] = words[offset + t]
      else {
        const a = W[t - 15], b = W[t - 2]
        const s0 = ((a >>> 7) | (a << 25)) ^ ((a >>> 18) | (a << 14)) ^ (a >>> 3)
        const s1 = ((b >>> 17) | (b << 15)) ^ ((b >>> 19) | (b << 13)) ^ (b >>> 10)
        W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0
      }
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7
    for (let t = 0; t < 64; t += 1) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))
      const ch = (e & f) ^ (~e & g)
      const t1 = (h + S1 + ch + K[t] + W[t]) | 0
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))
      const maj = (a & b) ^ (a & c) ^ (b & c)
      const t2 = (S0 + maj) | 0
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0
    }
    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0
    h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0
  }
  void h1; void h2; void h3; void h4; void h5; void h6; void h7
  return h0 >>> 0
}

export interface Guard { nonce: string; exp: number; bits: number; sig: string; counter: number; elapsed: number }

/** Pide un reto, lo resuelve sin bloquear la interfaz demasiado tiempo y devuelve la prueba. */
export async function solveGuard(formStartedAt: number): Promise<Guard> {
  const response = await fetch('/api/auth/challenge', { credentials: 'same-origin' })
  const data = (await response.json().catch(() => ({}))) as { nonce?: string; exp?: number; bits?: number; sig?: string; error?: string }
  if (!response.ok || !data.nonce || !data.sig || !data.exp || !data.bits) throw new Error(data.error ?? 'No se pudo obtener la verificación de seguridad.')
  const { nonce, exp, bits, sig } = data
  if (bits > 31) throw new Error('Verificación no soportada.')
  const limit = 2 ** (32 - bits)
  let counter = 0
  for (;;) {
    const deadline = performance.now() + 40
    while (performance.now() < deadline) {
      for (let i = 0; i < 500; i += 1, counter += 1) {
        if (sha256FirstWord(`${nonce}:${counter}`) < limit) return { nonce, exp, bits, sig, counter, elapsed: Date.now() - formStartedAt }
      }
    }
    // Cede el hilo para que la pantalla siga respondiendo.
    await new Promise((resolve) => setTimeout(resolve, 0))
    if (Date.now() > exp - 5_000) throw new Error('La verificación tardó demasiado. Intente de nuevo.')
  }
}
