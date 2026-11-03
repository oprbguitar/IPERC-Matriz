#!/usr/bin/env node
/**
 * Crea (o reemplaza la clave de) un usuario del Observatorio en D1.
 *
 *   node scripts/create-user.mjs --email tu@correo.com --name "Tu nombre" --role admin [--remote]
 *
 * Genera una clave aleatoria (o usa --password), la deriva con PBKDF2-SHA256
 * (100 000 iteraciones, igual que worker/index.ts) y ejecuta el INSERT con wrangler.
 * La clave se imprime una sola vez: guárdela y cámbiela desde el panel premium.
 */
import { execFileSync } from 'node:child_process'
import { pbkdf2Sync, randomBytes, randomUUID } from 'node:crypto'
import { rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const args = process.argv.slice(2)
const flag = (name) => {
  const index = args.indexOf(`--${name}`)
  return index >= 0 ? args[index + 1] : undefined
}

const email = (flag('email') ?? '').trim().toLowerCase()
if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
  console.error('Uso: node scripts/create-user.mjs --email correo --name "Nombre" --role admin|member [--remote]')
  process.exit(1)
}
const name = flag('name') ?? null
const role = flag('role') === 'admin' ? 'admin' : 'member'
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
const password = flag('password') ?? Array.from(randomBytes(14), (byte) => alphabet[byte % alphabet.length]).join('')
const salt = randomBytes(16)
const hash = pbkdf2Sync(password, salt, 100_000, 32, 'sha256').toString('base64')

const sqlText = (value) => (value === null ? 'NULL' : `'${String(value).replace(/'/g, "''")}'`)
const sql = `INSERT INTO users (id, email, name, role, pass_hash, pass_salt) VALUES (${sqlText(randomUUID())}, ${sqlText(email)}, ${sqlText(name)}, ${sqlText(role)}, ${sqlText(hash)}, ${sqlText(salt.toString('base64'))})
ON CONFLICT(email) DO UPDATE SET pass_hash = excluded.pass_hash, pass_salt = excluded.pass_salt, role = excluded.role, name = COALESCE(excluded.name, users.name);`

const target = args.includes('--remote') ? '--remote' : '--local'
// El SQL va por archivo: en Windows el shell parte los argumentos con espacios.
const file = join(tmpdir(), `obs-user-${Date.now()}.sql`)
writeFileSync(file, sql)
try {
  execFileSync('npx', ['wrangler', 'd1', 'execute', 'observatorio-sst', target, '--yes', `--file=${file}`], {
    stdio: ['ignore', 'ignore', 'inherit'],
    shell: process.platform === 'win32',
  })
} finally {
  rmSync(file, { force: true })
}

console.log(`Usuario ${role} listo en D1 (${target.slice(2)}): ${email}`)
console.log(`Clave inicial: ${password}`)
