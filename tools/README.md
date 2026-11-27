# Building and checking Humanity, Live

- `tools/tpl.html` is the source. `python3 tools/build.py` (run from `tools/`) writes `index.html` (CDN three.js) and `test.html` (local three.js for tests).
  It needs `mask.b64` and `topo.b64` next to it.
- Copy `tools/index.html` to `public/index.html` to ship.
- Stability check: `npm i three@0.128.0` inside `tools/`, `pip install playwright`, then `python3 tools/smoke.py`. It must print only PASS lines before anything is pushed.
- `public/changelog.json` feeds the "What's new" list in the app (newest first).
