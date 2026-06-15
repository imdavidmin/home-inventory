# Home Inventory

Monorepo for a home inventory app: a Svelte frontend and a Cloudflare Worker API backed by D1.

## Structure

| Path | Worker | Description |
|------|--------|-------------|
| `frontend/` | `home-inventory` | Svelte + Vite SPA (static assets) |
| `backend/` | `home-inventory-api` | REST API (`index.js`) with D1 binding |

## Local development

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

**Backend** (requires [Wrangler](https://developers.cloudflare.com/workers/wrangler/) and `wrangler login`)

```bash
cd backend
wrangler dev
```

Set `window.API_ENDPOINT` in `frontend/public/config.js` if the API runs on a non-default URL.

## Deployment

Both workers deploy from the same GitHub repo via Cloudflare Workers Builds (no GitHub Actions required).

| Worker | Root directory | Build command | Deploy command |
|--------|----------------|---------------|----------------|
| `home-inventory` | `frontend` | `npm ci && npm run build` | `npx wrangler deploy --assets ./dist` |
| `home-inventory-api` | `backend` | *(empty)* | `npx wrangler deploy` |

Pushes to the connected branch trigger a build for each worker.
