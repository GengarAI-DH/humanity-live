# Humanity, Live

A 3D, real-time simulation of life on Earth: from the last dinosaurs 71.25 million years ago,
through the asteroid, the age of mammals, early humans and 100 Homo sapiens leaving East Africa,
to a projected year 2100. **One real second = one year**; nobody can speed it up.
The full run takes about 2 years and 3 months of real time.

- `public/index.html` – the built page (three.js r128 from cdnjs)
- `tools/tpl.html` – the source template; `tools/build.py` injects the land mask and builds the page
- `src/worker.js` – Cloudflare Worker: serves the page and `/api/world` (the shared world's start time)
- `wrangler.jsonc` – Cloudflare config; `WORLD_START` is the moment the shared world began (ms since 1970)

## Roadmap
- Server-side tick (Cloudflare cron + database) before the human era, so the world advances 24/7
  and every viewer sees the same people.
