# Brief local

El Mac genera las ediciones con Ollama a las 09:00 y 17:00 de Buenos Aires. Los LaunchAgents funcionan sin Codex abierto. Al despertar recuperan una edición pendiente; el Mac debe tener la sesión iniciada. No se usa una API de IA paga.

La web muestra la última edición en `/brief`, protegida por el PIN existente `NEWS_PIN` o la contraseña del administrador. La edición publicada sigue disponible cuando el Mac está dormido. El botón «Original» abre la fuente en una pestaña nueva; el navegador del usuario determina qué aplicación la abre.

`BRIEF_PUBLISH_TOKEN` autentica exclusivamente al publicador del Mac. `BRIEF_STORAGE_SECRET` cifra las ediciones y los registros de lectura con AES-256-GCM antes de guardarlos en GitHub. Son variables privadas de producción; no tienen prefijo `NEXT_PUBLIC_`. Las credenciales del Mac están fuera del repositorio, en `~/Library/Application Support/local-brief/`, con permisos 600.

La API lee los datos directamente de GitHub: publicar una edición no requiere desplegar nuevamente el sitio. `/api/brief/latest` recibe únicamente noticias terminadas, sin prompts ni datos internos. `/api/brief/lecturas` sincroniza ediciones leídas. El publicador comprueba cada cinco minutos y reintenta fallos sin volver a generar con IA. La edición de la tarde puede recuperar noticias importantes de la mañana si no se marcó como leída.

`brief.guidowain.com` puede apuntar al mismo proyecto de Vercel. La raíz de ese host se reescribe a `/brief`; requiere configurar también su DNS. La URL inicial es `https://www.guidowain.com/brief`.

Pruebas locales: cargar `.env.brief.local` con el preloader `scripts/brief-env.cjs`, iniciar Next en el puerto 3000 y ejecutar `node --require ./scripts/brief-env.cjs ./node_modules/tsx/dist/cli.mjs scripts/test-brief.ts`. Ese archivo de entorno contiene credenciales de prueba y se ignora en Git.

Cada noticia tiene un globo de feedback: Sirvió/No sirvió y comentario opcional. `/api/brief/feedback` autentica al lector, valida la noticia contra su edición y cifra la opinión. El Mac recibe todos los comentarios pendientes antes de preparar una edición; Qwen3.6 27B los integra en `~/Library/Application Support/local-brief/news/intereses.md`, de hasta 450 palabras, y usa esa memoria en la selección. Si falla, conserva los comentarios pendientes. No se entrenan pesos del modelo.

Las reglas fijas están en `/Users/wain/Documents/ai local/news/REGLAS.md`. El objetivo es diez minutos, hasta doce noticias y dos mil palabras, con resúmenes de 140–180 palabras cuando hay material suficiente. El RSS descubre noticias; Trafilatura extrae el artículo completo, DDGS busca cobertura pública alternativa cuando falta material y Ollama valida que sea el mismo acontecimiento. La redacción y la revisión reciben todo el artículo, nunca solamente sus primeros párrafos. Se conserva el enlace «Original» y se registran las fuentes consultadas.

La lectura se vuelve a consultar al abrir, recuperar el foco y volver a la pantalla. Una edición archivada también puede marcarse como leída. Cuando no se pudo comprobar la sincronización, se ofrece «Comprobar lectura»; no se asume que está pendiente. La interfaz evita presentaciones, avisos de acceso y texto de relleno.

La imagen principal se toma de los metadatos públicos de cada nota. Si falta o no carga, se busca cobertura relacionada y Ollama comprueba el contexto de la imagen. Solo se admiten URLs HTTPS públicas. La página carga las fotos inferiores al acercarse a ellas y reserva su proporción para evitar saltos; un fallo de carga no deja recuadros ni texto extra. Agregar imágenes a una edición publicada conserva su ID, noticias y estado de lectura.

Prueba específica: `node --require ./scripts/brief-env.cjs ./node_modules/tsx/dist/cli.mjs scripts/test-brief-images.ts`.

La edición funciona como diario personal: busca 12–14 noticias cuando hay material sólido y admite hasta 14. El editor recibe fecha de publicación e historial de ocho ediciones, y exige que el hecho sea nuevo durante el día calendario de Buenos Aires. La selección prioriza novedad, magnitud, efecto en decisiones y utilidad profesional; aplica exclusiones fijas para cripto fuera de bitcoin/ETF/regulación, ANSES, cotizaciones minuto a minuto y nombramientos de marketing.

La redacción sintetiza el artículo en 100–140 palabras, con el cambio central y 3–5 datos. Un borrador de más de 150 palabras, demasiado corto para una fuente extensa o con una secuencia literal de 14 palabras se reescribe una vez. La revisión de fidelidad también decide explícitamente si existe síntesis propia; de lo contrario descarta la nota.
