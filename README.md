# game-catholic-mt

![alt text](public/og-image.png)

## Development

Requires Node.js 22 or newer.

```sh
npm install
npm run dev
```

## Build and deploy

```sh
npm run build
npm run preview
npm run deploy
```

Vite builds the three HTML entry points from `public/` into `dist/`. Wrangler
deploys the generated `dist/` directory to Cloudflare Workers.
