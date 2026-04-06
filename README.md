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

No hay variables de entorno necesarias.

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

## Actualizar imágenes

Las imágenes están en `src/app/page.tsx` en el array `portfolioImages`.
Cada entrada tiene: `src`, `alt`, y `span` (`normal` | `tall` | `wide`).

Para reemplazar una imagen:
1. Subí la imagen a `/public/images/nombre.jpg`
2. Cambiá el `src` a `/images/nombre.jpg`
3. Deploy

## Dominio

En el dashboard de Vercel → Settings → Domains → agregá `guidowain.com`.
Actualizá los DNS en tu registrar apuntando a Vercel.
