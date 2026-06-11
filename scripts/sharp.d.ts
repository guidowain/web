// sharp 0.35 no expone "types" en su mapa de exports, así que TS no encuentra
// las declaraciones con moduleResolution "bundler". Declaramos lo mínimo que usa
// scripts/optimizar-imagenes.ts.
declare module 'sharp' {
  type SharpInstance = {
    webp(options?: { quality?: number; effort?: number }): SharpInstance
    toFile(path: string): Promise<unknown>
  }

  function sharp(input: string, options?: { animated?: boolean }): SharpInstance

  export default sharp
}
