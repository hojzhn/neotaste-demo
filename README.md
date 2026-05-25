# neotaste-demo

Vite + React + Tailwind CSS, ready to deploy on Vercel.

## Local development

```bash
npm install
npm run dev
```

App runs at http://localhost:5173.

## Build

```bash
npm run build      # output: dist/
npm run preview    # preview the production build locally
```

## Deploy to Vercel

Vercel auto-detects Vite — no configuration needed.

1. Push to GitHub.
2. Import the repo in [Vercel](https://vercel.com/new).
3. Accept the defaults (Framework: Vite, Build: `npm run build`, Output: `dist`).

## Stack

- [Vite](https://vite.dev) — dev server / bundler
- [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com) via `@tailwindcss/vite`
