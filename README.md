# guidowain.com

Portfolio personal de Guido Wain — photo retoucher. Next.js 14, TypeScript, deploy en Vercel.

## Setup local

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Deploy en Vercel

### Primera vez

```bash
npm i -g vercel
vercel
```

Seguí el wizard: vinculá con tu cuenta, elegí el proyecto, dominio `guidowain.com`.

### Deploys siguientes

Agregá este alias en `~/.zshrc`:

```bash
alias deploy-guidowain="cd ~/projects/guidowain && vercel --prod"
```

Luego: `deploy-guidowain`

### Variables de entorno

Para el sitio publico no hay variables necesarias. Para usar el back office:

```bash
ADMIN_PASSWORD=tu-password
ADMIN_SESSION_SECRET=un-string-largo-random
GITHUB_REPO=guidowain/web
GITHUB_BRANCH=main
GITHUB_TOKEN=github-token-con-permiso-de-escritura
```

En produccion, `ADMIN_PASSWORD`, `GITHUB_REPO` y `GITHUB_BRANCH` se configuran en Vercel. `GITHUB_TOKEN` tambien tiene que cargarse en Vercel para que el admin pueda guardar cambios en el repo.

## Estructura

```
src/
  app/
    layout.tsx      → metadata SEO + fonts
    page.tsx        → toda la página (nav, hero, grid, about, contact)
    page.module.css → estilos CSS Modules
    globals.css     → reset + CSS variables
next.config.js      → permite imágenes de framerusercontent.com
```

## Actualizar imagenes

Las imagenes estan en `public/images` y los trabajos del carrusel se editan desde `/admin`.

Para reemplazar una imagen manualmente:
1. Subi la imagen a `/public/images/nombre.jpg`
2. Cambia el `img` correspondiente en `src/content/site.json`
3. Deploy

## Dominio

En el dashboard de Vercel → Settings → Domains → agregá `guidowain.com`.
Actualizá los DNS en tu registrar apuntando a Vercel.
