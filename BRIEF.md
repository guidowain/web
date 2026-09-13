# Brief local

El Mac genera las ediciones con Ollama a las 09:00 y 17:00 de Buenos Aires. Los LaunchAgents funcionan sin Codex abierto. Al despertar recuperan una edición pendiente; el Mac debe tener la sesión iniciada. No se usa una API de IA paga.

La web muestra la última edición en `/brief`, protegida por el PIN existente `NEWS_PIN` o la contraseña del administrador. La edición publicada sigue disponible cuando el Mac está dormido. El botón «Original» abre la fuente en una pestaña nueva; el navegador del usuario determina qué aplicación la abre.

`BRIEF_PUBLISH_TOKEN` autentica exclusivamente al publicador del Mac. `BRIEF_STORAGE_SECRET` cifra las ediciones y los registros de lectura con AES-256-GCM antes de guardarlos en GitHub. Son variables privadas de producción; no tienen prefijo `NEXT_PUBLIC_`. Las credenciales del Mac están fuera del repositorio, en `~/Library/Application Support/local-brief/`, con permisos 600.

La API lee los datos directamente de GitHub: publicar una edición no requiere desplegar nuevamente el sitio. `/api/brief/latest` recibe únicamente noticias terminadas, sin prompts ni datos internos. `/api/brief/lecturas` sincroniza ediciones leídas. El publicador comprueba cada cinco minutos y reintenta fallos sin volver a generar con IA. La edición de la tarde puede recuperar noticias importantes de la mañana si no se marcó como leída.

`brief.guidowain.com` puede apuntar al mismo proyecto de Vercel. La raíz de ese host se reescribe a `/brief`; requiere configurar también su DNS. La URL inicial es `https://www.guidowain.com/brief`.

Pruebas locales: cargar `.env.brief.local` con el preloader `scripts/brief-env.cjs`, iniciar Next en el puerto 3000 y ejecutar `node --require ./scripts/brief-env.cjs ./node_modules/tsx/dist/cli.mjs scripts/test-brief.ts`. Ese archivo de entorno contiene credenciales de prueba y se ignora en Git.
