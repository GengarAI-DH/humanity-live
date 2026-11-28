# Code cleanup log (newest first)

The code cleanup job runs daily at 3 AM Pacific. It moves code to the right files, removes dead code and makes things faster without changing what visitors see. File map: CODEMAP.md.

## 2026-11-28: first split (no behaviour change)
- tools/tpl.html (3,397 lines, 735 KB) split into 36 files in tools/src/, one per system, cut at the existing `// ====` section headers. Nothing inside a line was changed.
- tools/build.py joins src/* in name order into tpl.html, then builds index.html and test.html as before. tpl.html is now generated: removed from git and added to .gitignore. build.py stops with a message naming the owning src/ file if tpl.html was edited by hand (`--force` overwrites it). cards.js, models.py and sizes.py still read the generated tpl.html.
- Proof: index.html and test.html built from the parts are byte-identical to the baseline (sha256 5fd3e2aa... and 252cc936...). Smoke: 52 PASS before and after. node --check on the main script: OK.
- Speed (identical page, so before = after). JS ms per frame / draw calls / triangles, continent | ground:
  - -66,040,010: 2.88 / 10 / 368k | 2.08 / 14 / 314k
  - -30,000: 4.78 / 20 / 415k | 4.85 / 29 / 381k
  - 1500: 5.27 / 47 / 446k | 6.51 / 49 / 432k
  - 1969: 6.11 / 59 / 424k | 4.11 / 79 / 400k
  - 2050: 6.99 / 52 / 464k | 5.71 / 76 / 436k
- Largest files: 12-world-data.js 52 KB, 20-sites.js 38 KB, 48-cities-labels-tags.js 36 KB, 28-species-fossils.js 35 KB, 58-watch-together-chat.js 34 KB. Longest: 20-sites.js and 15-terrain.js (~235 lines each; lines are long).

Next cleanups (not done yet):
- Some sections hold code from other systems (they grew there): 60-wonders-ideas-tour.js has the ideas box, privacy, tour, analytics and ad slot; 64-play-as-animal-settings.js has big labels, region labels, Settings, share and live viewer count; 22-people-languages.js holds part of the HS test hook; 42-heritage-towers-wrecks-migrations.js has quake rings and plumes (belong with 38). Move each to its owner (new 74-settings-share.js, 76-ideas-tour-analytics.js, etc.).
- `ratePerDay_old` in 10-utils-time.js and `_unused` in 12-world-data.js look dead: check callers and remove.
- Speed: check the frame loop (90) and updWild (32) for per-frame allocations.
