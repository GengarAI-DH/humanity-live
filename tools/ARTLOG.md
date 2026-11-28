# Art and tools log (newest first)
Runs alternate: ART (make things look like the real thing) and TOOLS (help the other jobs).

## 2026-11-27 ART
- Rebuilt the two most-seen Cretaceous shapes in initMeshes: 'thero' (T. rex, Edmontosaurus, Pachycephalosaurus, raptors, also ostrich/penguin/flamingo) and 'cera' (Triceratops, Protoceratops). Theropod: horizontal back balanced over the hips, ellipsoid body, deep wedge skull with lower jaw, tapering tail held off the ground, angled thigh/shin/foot legs, tiny arms. Ceratopsian: barrel body highest at the hips, big skull, swept-back frill, two long brow horns, short nose horn, beak, short tail, shorter front legs.
- Triangles per instance: thero 96 -> 187, cera 120 -> 235 (both under 300). spino copies thero so it changes too.
- perf.py Cretaceous, same-machine rerun: ground JS 1.54 -> 1.27-1.39 ms, tris 306k -> 317k (+3.4%); continent tris unchanged, JS within noise.
- A quick model-sheet viewer (renders the geometry arrays alone in daylight) was far more useful than in-world shots, which are at night in this era. Worth adding to tools/ next TOOLS run (models.py).
- Next ART candidates: 'sauro' (Alamosaurus: still a box with stick neck), 'ankylo' boxes, hadrosaurs share the theropod body (a duck-bill head variant would help).

## 2026-11-27 TOOLS
- New: harness.py (shared headless test page helpers), perf.py (5-era speed report with --save/--compare and a 5% flag), shots.py (any list of views, contact sheet, before/after pair sheet), validate.py (public/*.json and cards.json checker). smoke.py takes years to run only some cases.
- Baseline perf (software WebGL, this sandbox): JS 1.5-4.6 ms/frame, 12-63 draw calls, 0.31-0.43 M triangles; New York 1960 ground is the heaviest in draw calls (63).
- validate.py on the current data: 0 errors, 113 warnings. Worth a look by the content/realism jobs: the Chicxulub milestone card uses the whole sentence as its Wikipedia title; 695 of 1477 cards have no fact line; 40 species in species.json have empty fossil-site lists; 5 events.json entries are before the clock starts and never show.
- Seen in screenshots for the next ART run: Cretaceous dinosaurs at ground level read as boxy tan blocks with stick legs (Montana, 47N 107W); start there.
