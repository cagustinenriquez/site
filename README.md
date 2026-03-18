# Portfolio Starter

Static React + TypeScript + Vite starter prepared for Cloudflare Pages.

## Commands

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run cf:dev`
- `npm run deploy`

## Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Wrangler config: `wrangler.toml`
- Deploy command from repo: `npm run deploy`

## Wrangler

- Current Pages project name in config: `agustin-enriquez-python-developer-blog`
- If your actual Cloudflare Pages project uses a different name, update `name` in `wrangler.toml` before deploying.

## Notes

- Uses `@headlessui/react` for accessible interactive UI.
- Keeps the site static by default.
