/**
 * Convierte las imágenes de public/images (png/jpg/gif) a WebP y actualiza
 * las referencias en src/content/site.json. Los GIF se convierten a WebP animado.
 *
 * Uso: npx tsx scripts/optimizar-imagenes.ts
 */
import { promises as fs } from 'fs'
import path from 'path'
import sharp from 'sharp'

const root = process.cwd()
const imagesDir = path.join(root, 'public/images')
const siteJsonPath = path.join(root, 'src/content/site.json')

async function main() {
  const files = await fs.readdir(imagesDir)
  const convertibles = files.filter((file) => /\.(png|jpe?g|gif)$/i.test(file))
  let siteJson = await fs.readFile(siteJsonPath, 'utf8')

  for (const file of convertibles) {
    const inputPath = path.join(imagesDir, file)
    const outputName = file.replace(/\.(png|jpe?g|gif)$/i, '.webp')
    const outputPath = path.join(imagesDir, outputName)
    const animated = /\.gif$/i.test(file)

    const before = (await fs.stat(inputPath)).size
    await sharp(inputPath, { animated }).webp({ quality: 80, effort: 5 }).toFile(outputPath)
    const after = (await fs.stat(outputPath)).size

    await fs.unlink(inputPath)

    const oldRef = `/images/${file}`
    const newRef = `/images/${outputName}`
    siteJson = siteJson.split(JSON.stringify(oldRef).slice(1, -1)).join(JSON.stringify(newRef).slice(1, -1))

    console.log(`${file} → ${outputName}: ${(before / 1024 / 1024).toFixed(2)} MB → ${(after / 1024 / 1024).toFixed(2)} MB`)
  }

  await fs.writeFile(siteJsonPath, siteJson, 'utf8')
  console.log('Listo. Referencias de site.json actualizadas.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
