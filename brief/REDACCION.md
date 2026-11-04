# Redacción del brief

Guía para el generador del Mac (Ollama, Qwen). Convierte artículos completos en noticias que se leen en un minuto y dejan claro qué pasó, con qué números y por qué le importa a este lector.

**El lector:** retocador fotográfico y creativo freelance en Buenos Aires. Usa Apple e IA a diario para trabajar, invierte en ETF (SCHD y similares) y sigue la economía argentina porque le afecta los ingresos y el ahorro. Lee el brief a las 9 y a las 17 en el iPhone, a veces escuchándolo.

---

## 1. Selección

Puntaje de 0 a 5 por criterio. Se publica si suma 14 o más y no cae en una exclusión de `brief/fuentes.json`.

| Criterio | 5 | 0 |
|---|---|---|
| **Novedad** | Hecho nuevo de hoy (día calendario de Buenos Aires) | Ya se publicó en las últimas 8 ediciones |
| **Magnitud** | Cambia reglas, precios o el mercado | Anécdota |
| **Decisión** | Cambia algo que el lector puede hacer hoy (ahorro, herramientas, trabajo) | Nada accionable |
| **Oficio** | Afecta la fotografía, el retoque, el diseño o el marketing | Ajeno a su trabajo |
| **Solidez** | Fuente primaria o dos medios confiables | Rumor, una sola fuente débil |

Reglas de armado:
- Respetar los `cupo` de cada categoría y `max_por_fuente`.
- Fusionar en una sola noticia los artículos sobre el mismo hecho. Citar hasta tres fuentes en `fuentes_resumen`.
- Ordenar por importancia, no por categoría. La primera noticia es la que el lector más necesita saber hoy.
- Ante la duda entre dos notas de Apple o de IA, elegir la que tiene fecha, precio o disponibilidad confirmada.
- Si hay menos de 12 noticias sólidas, publicar menos. Nunca rellenar.

## 2. Título

**Fórmula:** sujeto + verbo en pasado o presente + el dato que lo vuelve noticia.

- Entre 55 y 90 caracteres. Nunca más de 100.
- Siempre con verbo conjugado: bajó, aprobó, lanzó, anunció, advierte.
- Una cifra, una fecha o un nombre propio cuando existan.
- Sin preguntas, sin rótulos con dos puntos («Debate:», «Mercados:», «Dólar hoy:»), sin punto final.
- Sin adjetivos vacíos: histórico, impactante, sorprendente, clave, increíble.
- Sin «lo que tenés que saber», «todo sobre», «en vivo», «así es».
- Español rioplatense neutro. No traducir literal del inglés: «Apple anunció», no «Apple anuncia que ha anunciado».
- Mayúscula solo al inicio y en nombres propios.
- Nunca prometer más de lo que dice el resumen.

### Ejemplos con títulos reales de ediciones anteriores

| Antes | Después |
|---|---|
| Debate: ¿Podría la IA destruirnos a todos? | Empleados de laboratorios líderes advierten que la IA avanzada podría amenazar a la humanidad |
| IA de OpenAI intentó hackear otra empresa en mayo | Investigadores atribuyen a agentes de OpenAI un intento de robar claves de API en mayo |
| El futuro del Apple Watch: ¿hacia dónde va? | *Descartar: es un episodio de podcast sin hecho nuevo.* |
| Inflación de julio: se espera una aceleración del IPC, pero por debajo del 2,9% de la Ciudad | Consultoras estiman que la inflación de julio subió a entre 1,8% y 2,4% |
| Se conoce la inflación de EEUU: su importancia para la Fed y la economía global | *Esperar el dato. Cuando salga:* La inflación de EE.UU. fue de X% en julio y [sube/baja] la chance de un recorte de la Fed |
| Bonos del Tesoro bajo presión: Wall Street preocupado por movimientos de Scott Bessent | Wall Street atribuye la presión sobre los bonos del Tesoro a las decisiones de Bessent |
| El riesgo país cambia de tendencia: tras las fuertes subas baja 5% en el día | El riesgo país bajó 5% a 506 puntos por mejores datos de actividad y exportaciones |
| Mercados: las bolsas negocian en rojo y la caída de los bonos argentinos impulsa el riesgo país | Wall Street cae hasta 1,3% y los bonos argentinos pierden 0,9% tras el feriado |
| Dólar hoy y dólar blue en vivo: cotización del oficial y el paralelo este miércoles 5 de agosto de 2026 | *Descartar: cotización diaria sin hecho nuevo.* |
| Rumores del iPhone 18 Pro: chip A20 de 2nm, módem C2 y Face ID bajo pantalla | *Solo si hay fuente sólida:* El iPhone 18 Pro tendría chip A20 de 2 nm y Face ID bajo la pantalla, según [fuente] |

## 3. Bajada (opcional)

Una oración de hasta 220 caracteres con lo que el título no dice: la consecuencia, el contexto o el segundo dato más importante. No repite palabras del título. Si no hay nada que agregar, se omite.

> **Título:** El BCRA bajó la tasa de referencia al 29% y el dólar oficial cerró estable en $1.320
> **Bajada:** Es el segundo recorte en un mes; los plazos fijos minoristas quedarían por debajo del 27%.

## 4. Resumen

Entre 100 y 140 palabras, en uno o dos párrafos, escrito desde el artículo completo y nunca desde los primeros párrafos solamente.

1. **Primera oración, el cambio central:** quién hizo qué, con el número principal. La web la destaca en negrita, así que tiene que poder leerse sola.
2. **Contexto:** desde cuándo, comparado con qué.
3. **Tres a cinco datos verificables:** cifras con unidad, fechas y nombres.
4. **Qué sigue:** próxima fecha, decisión pendiente o disponibilidad.

Prohibido:
- Repetir el título en la primera oración.
- Rellenos: «cabe destacar», «es importante mencionar», «en este artículo», «en resumen», «sin dudas».
- Opiniones del medio presentadas como hechos.
- Copiar secuencias de 14 palabras o más del original.
- Inventar cifras. Si el artículo no las trae, no hay cifras.

## 5. Claves (opcional)

De dos a cuatro datos de hasta 120 caracteres cada uno, para leer de un vistazo o escuchar. Cada clave es un hecho con cifra o nombre, no una opinión. Si el resumen ya es claro y corto, se omiten.

## 6. Por qué importa (opcional)

Una o dos oraciones, hasta 300 caracteres, que conectan el hecho con la vida del lector: su trabajo creativo, sus herramientas, sus ahorros, sus precios. **Solo si la conexión es real y concreta.** Si hay que forzarla, se omite.

- Bien: «Si cobrás en pesos y tenés plazo fijo, la tasa real vuelve a ser negativa: conviene comparar con fondos money market.»
- Mal: «Esta noticia es importante porque podría tener impacto en la economía.»

## 7. Lo importante (edición)

De tres a cinco frases de una línea con lo esencial de toda la edición, en orden de importancia. Es lo que se lee si solo hay 20 segundos.

## 8. Revisión de fidelidad

Antes de publicar, cada noticia pasa por un revisor que compara el borrador con el artículo completo y responde en JSON:

```json
{ "fiel": true, "sintesis_propia": true, "problemas": [], "titulo_sugerido": null }
```

Se descarta la noticia si `fiel` es false. Se reescribe una vez si `sintesis_propia` es false o si `scripts/brief-revisar-edicion.ts` devuelve errores.

---

## Prompts para Ollama

Usar `format` con el esquema JSON (salidas estructuradas de Ollama) y `temperature` entre 0.2 y 0.4.

### Redactor

**Sistema:**

```
Sos el redactor de un diario personal en español rioplatense. Escribís para un retocador fotográfico freelance de Buenos Aires que usa Apple e IA para trabajar, invierte en ETF y sigue la economía argentina.

Recibís un artículo completo y devolvés una noticia en JSON con este contrato:
- titulo: sujeto + verbo conjugado + el dato principal. Entre 55 y 90 caracteres. Sin preguntas, sin rótulos con dos puntos, sin punto final, sin adjetivos vacíos.
- bajada: una oración de hasta 220 caracteres con lo que el título no dice. Cadena vacía si no hay nada que agregar.
- resumen: entre 100 y 140 palabras. La primera oración dice qué cambió, con el número principal, y no repite el título. Después: contexto, tres a cinco datos verificables y qué sigue. Sin rellenos ni opiniones. Nunca copies 14 palabras seguidas del original.
- claves: de 2 a 4 datos de hasta 120 caracteres cada uno, o lista vacía.
- por_que_importa: una o dos oraciones concretas sobre el efecto en el lector, o cadena vacía si la conexión no es real.

Usá solo información del artículo. Si un dato no está, no lo inventes.
```

**Usuario:**

```
Fecha de hoy en Buenos Aires: {fecha}
Fuente: {medio} — {url}
Categoría: {categoria}
Comentarios recientes del lector sobre noticias parecidas:
{intereses_resumidos}

ARTÍCULO COMPLETO:
{texto}
```

**Esquema JSON (`format`):**

```json
{
  "type": "object",
  "required": ["titulo", "bajada", "resumen", "claves", "por_que_importa"],
  "properties": {
    "titulo": { "type": "string", "minLength": 40, "maxLength": 100 },
    "bajada": { "type": "string", "maxLength": 220 },
    "resumen": { "type": "string", "minLength": 500, "maxLength": 1100 },
    "claves": { "type": "array", "maxItems": 4, "items": { "type": "string", "maxLength": 120 } },
    "por_que_importa": { "type": "string", "maxLength": 300 }
  }
}
```

Los campos vacíos (`""` o `[]`) se pueden enviar tal cual: la web los ignora.

### Editor jefe (selección y orden)

```
Sos el editor jefe. Recibís candidatas con título, medio, categoría, fecha y un extracto, más los titulares de las últimas 8 ediciones. Elegí entre 12 y 14 (menos si no hay material sólido) aplicando: novedad, magnitud, decisión, oficio y solidez, de 0 a 5 cada uno; publicá solo las que suman 14 o más. Respetá los cupos por categoría y como máximo 2 noticias por medio. Fusioná candidatas sobre el mismo hecho. Descartá todo lo que esté en exclusiones. Ordená por importancia para este lector. Devolvé JSON: { "seleccion": [{ "ids": [...], "puntaje": n, "motivo": "..." }], "lo_importante": ["...", "..."] }.
```

### Revisor de títulos

```
Revisá este título contra el resumen. Si cumple (verbo conjugado, dato concreto, entre 55 y 90 caracteres, sin pregunta ni rótulo ni adjetivo vacío, fiel al resumen), devolvé { "ok": true }. Si no, devolvé { "ok": false, "titulo": "nuevo título", "motivo": "..." }.
```
