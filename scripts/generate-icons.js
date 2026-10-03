import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Resvg } from '@resvg/resvg-js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = resolve(root, 'public')
mkdirSync(outDir, { recursive: true })

const mark = (size, inset, radius, fontSize) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="#0f172a"/>
  <rect x="${inset}" y="${inset}" width="${size - inset * 2}" height="${size - inset * 2}"
        rx="${radius / 2}" fill="none" stroke="#22d3ee" stroke-width="${size / 42}"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
        font-family="Helvetica, Arial, sans-serif" font-size="${fontSize}"
        font-weight="700" fill="#e2e8f0">QA</text>
</svg>`

const targets = [
  { file: 'pwa-192.png', size: 192, inset: 14, radius: 42, fontSize: 84 },
  { file: 'pwa-512.png', size: 512, inset: 38, radius: 112, fontSize: 224 },
  { file: 'pwa-maskable-512.png', size: 512, inset: 0, radius: 0, fontSize: 176 },
  { file: 'apple-touch-icon.png', size: 180, inset: 0, radius: 0, fontSize: 62 },
]

for (const { file, size, inset, radius, fontSize } of targets) {
  const resvg = new Resvg(mark(size, inset, radius, fontSize), {
    fitTo: { mode: 'width', value: size },
  })
  writeFileSync(resolve(outDir, file), resvg.render().asPng())
  console.log(`  wrote public/${file} (${size}x${size})`)
}