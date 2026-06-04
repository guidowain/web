if (!process.env.CI) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

async function main() {
  const { generarNewsBrief } = await import('../src/lib/news/generator')
  const brief = await generarNewsBrief()

  console.log(`Brief generado: ${brief.fecha} (${brief.actualizacion})`)
  if (brief.estado.estado === 'error') {
    console.error(`Generación con error: ${brief.estado.mensaje}`)
    process.exitCode = 1
  }
}

main()
  .then(() => {
    // listo
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
