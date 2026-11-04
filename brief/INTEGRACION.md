# Integración con el publicador del Mac

La web ya acepta todo lo que se describe acá. **Nada se rompe si el Mac sigue publicando como hoy:** los campos nuevos son opcionales y la web se adapta a lo que reciba. Este documento sirve para que Codex o Claude Code, desde el Mac, conecten el generador con las mejoras.

Orden recomendado: 1 (fuentes) → 3 (revisión) → 2 (campos nuevos). Cada paso funciona por separado.

---

## 1. Fuentes desde el repositorio

`brief/fuentes.json` reúne 70 feeds RSS en 9 categorías (incluye Fotografía/Diseño y Mundo, que antes no existían), con pesos, cupos y exclusiones, más 5 búsquedas de Google News para medios sin RSS.

**Leerlo en cada corrida**, con la copia local como respaldo:

```python
import json, pathlib, urllib.request
URL = "https://raw.githubusercontent.com/guidowain/web/main/brief/fuentes.json"
LOCAL = pathlib.Path.home() / "Library/Application Support/local-brief/news/fuentes.json"
try:
    data = urllib.request.urlopen(URL, timeout=10).read()
    json.loads(data)                      # solo se guarda si es JSON válido
    LOCAL.write_bytes(data)
except Exception:
    data = LOCAL.read_bytes()
fuentes = json.loads(data)
```

Así, sumar una fuente es editar ese archivo en GitHub, incluso desde el teléfono. El sitio no se redespliega porque `vercel.json` ignora los cambios en `brief/`.

**Verificar las URLs.** Se armaron sin poder probarlas desde la nube:

```bash
npx tsx scripts/brief-verificar-fuentes.ts
```

```bash
npx tsx scripts/brief-verificar-fuentes.ts --json > ~/Library/Application\ Support/local-brief/news/fuentes-estado.json
```

Las fuentes con `"estado": "falla"` se saltean. Si el script propone un `reemplazo`, corregir la URL en `brief/fuentes.json`. Conviene correrlo una vez por semana desde un LaunchAgent.

**Usar los metadatos:**
- `peso`: multiplica el puntaje editorial. Con 1.0 alcanza una sola fuente; con 0.5 conviene confirmar con otra.
- `categorias[*].cupo`: mínimo y máximo de noticias por categoría en cada edición.
- `reglas.max_por_fuente`: como máximo 2 noticias de un mismo medio.
- `busquedas`: los enlaces de Google News son redirecciones. Resolver la URL real antes de pasarla a Trafilatura y citar el medio original.
- `exclusiones`: se suman a las reglas fijas de `REGLAS.md`.
- `paywall: true`: Trafilatura puede traer solo el comienzo. Buscar cobertura alternativa con DDGS, como ya se hace.

## 2. Campos editoriales nuevos

Todos son opcionales. La web los muestra cuando llegan y los ignora cuando están vacíos.

| Campo | Dónde | Límite | Se ve en la web como |
|---|---|---|---|
| `bajada` | noticia | 400 caracteres (ideal ≤ 220) | Subtítulo gris bajo el título |
| `claves` | noticia | hasta 6 (ideal 2 a 4), 300 caracteres c/u | Lista con marcadores |
| `por_que_importa` | noticia | 600 caracteres (ideal ≤ 300) | Recuadro «Por qué importa» |
| `publicado_en` | noticia | fecha ISO 8601 | «hace 3 h» junto a la fuente |
| `lo_importante` | edición | hasta 6 frases, 300 caracteres c/u | Recuadro «Lo importante» en la portada |
| `resumen` | edición | 1200 caracteres | Párrafo de apertura en la portada |

Ejemplo:

```json
{
  "edicion_id": "20261105-090004-123456",
  "fecha": "2026-11-05",
  "turno": "manana",
  "generado_en": "2026-11-05T12:00:04Z",
  "lo_importante": ["El BCRA recortó la tasa al 29% tras una inflación de 1,9%."],
  "noticias": [{
    "id": "bcra-tasa",
    "categoria": "Argentina",
    "fuente": "La Nación",
    "titulo": "El BCRA bajó la tasa de referencia al 29% y el dólar oficial cerró estable en $1.320",
    "bajada": "Es el segundo recorte en un mes; los plazos fijos minoristas quedarían por debajo del 27%.",
    "resumen": "…100 a 140 palabras…",
    "claves": ["Tasa: del 32% al 29% anual.", "Inflación de octubre: 1,9%."],
    "por_que_importa": "Si tenés plazo fijo, el rendimiento real vuelve a ser negativo: conviene comparar con fondos money market.",
    "publicado_en": "2026-11-05T10:12:00-03:00",
    "url": "https://www.lanacion.com.ar/…",
    "imagen": { "url": "https://…", "alt": "…" },
    "fuentes_resumen": [{ "nombre": "La Nación", "url": "https://…" }]
  }]
}
```

Los prompts del redactor, el editor jefe y el revisor de títulos están en `brief/REDACCION.md`, con el esquema JSON para `format` de Ollama.

`publicado_en` sale de la fecha del feed (`pubDate`, `updated`) o de los metadatos que extrae Trafilatura.

**Importante:** el `edicion_id` identifica el contenido editorial. Volver a publicar el mismo ID con otros títulos, resúmenes o campos nuevos da error 503, como ya pasaba con los textos. Solo se pueden agregar imágenes a una edición publicada.

## 3. Revisión automática antes de publicar

```bash
npx tsx scripts/brief-revisar-edicion.ts edicion.json --json
```

Devuelve `{ valida, errores, avisos: [{ nivel, regla, detalle, noticia }] }` y sale con código 1 si hay errores. Sugerencia de flujo:

1. Generar la edición.
2. Revisarla. Para cada noticia con `error` (título con pregunta, resumen fuera de rango, URL repetida), reescribirla una sola vez pasándole al redactor los `detalle`.
3. Si sigue con errores, descartar esa noticia.
4. Publicar.

La API de publicación (`POST /api/brief/latest`) también devuelve los `avisos` en la respuesta. No bloquean la publicación: sirven para registrar la calidad de cada edición.

## 4. Otras mejoras de la web que conviene conocer

- `GET /api/brief/estado` (con el token del publicador) devuelve `{ ultima: { id, generado_en }, leidas: [...] }` en una sola consulta.
- El feedback incluye motivos rápidos («Ya lo sabía», «Título flojo», «Resumen flojo», «Repetida», «Error o fuente dudosa», «No me interesa»). Llegan como texto en `comentario`, así que el proceso actual de `intereses.md` los toma sin cambios. Conviene contarlos por motivo: si «Título flojo» se repite, revisar el prompt de títulos.
- El lector escucha el brief con la voz del sistema. Los títulos con verbo y cifra se entienden mucho mejor en voz alta.

## 5. Pruebas

```bash
npx tsx scripts/test-brief-formato.ts
```

```bash
node --require ./scripts/brief-env.cjs ./node_modules/tsx/dist/cli.mjs scripts/test-brief.ts
```

La segunda requiere el servidor local en el puerto 3000 y `.env.brief.local`, igual que antes.
