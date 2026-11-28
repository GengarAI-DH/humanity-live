# Art and tools log (newest first)
Runs alternate: ART (make things look like the real thing) and TOOLS (help the other jobs).

## 2026-11-27 ART (2)
- Handoff top priority (animals slide around stiff): added GAIT(mesh, legTop, swing, biped, tailZ, tailAmp, mode, k, rate, idle) in tpl.html. Vertex-shader animation via onBeforeCompile on the instanced animal materials, with one per-instance attribute aGt = (gait phase, gait amount) written by gaitSet() in updWild/updAnimals. Phase advances only while the animal travels (x1.8 when running/fleeing), rate / sqrt(species scale) so big animals step slower; amount eases to 0 when resting. Mode 0 walkers: legs below legTop swing (diagonal pairs for quadrupeds, left/right for bipeds), body bobs, tail sways (always, slowly). Mode 1 fish: side-to-side body wave. Mode 2 ptero/plesio: wings/flippers flap. All modes: countershading (paler belly, darker back) in the colour stage.
- Covers wildM, aniM, thero, spino, sauro, cera, stego, ankylo, ptero, plesio, fish. Not yet: whaleM (has its own dive cycle), people (bodyM is one cone), SHorse, caravM, birdM.
- Rebuilt quad() (every Cenozoic wild mammal and domestic animal): rounded barrel, neck angled forward-up, tapered head, hanging tail, tapered legs. 72 -> 105 tris. Scaled 0.92 so nose-to-rump length matches the old box (MESHLEN unchanged).
- perf.py (same machine, -30000 and -480): JS ms within noise (lower), draw calls unchanged, triangles +3.4% to +6.4% per view (+5.0% total) from the 105-tri mammal shape; at the budget edge, so the next mammal detail should come from per-family shapes rather than more triangles on quad. smoke.py: 38 PASS, exit 0.
- Next: per-family mammal shapes (elephant/mammoth trunk, big cats, bovids with horns) chosen by species; sauro and ptero bodies still boxes; people walk cycle needs separate legs in bodyM.

## 2026-11-27 TOOLS (2)
- New: models.py (model sheet of every instanced shape in daylight, 3 views, triangles, height in people, --js to preview a new shape without editing tpl.html, triangle budget flags) and sizes.py (bytes per tpl.html section and biggest data lines, raw and gzipped, with --save/--compare).
- Found while building it: page variables are inside a block, so window.WMESH etc. are undefined; HS.X(code) evaluates inside the page scope. Documented in README.
- Current budgets: all shapes pass (largest animal cera 235 tris, spino 199, thero 187). sizes.py: tpl.html 618 KB (235 KB gz), built index.html 998 KB (402 KB gz); biggest section 'visuals: instanced meshes' 134 KB; topo.b64 alone is 338 KB embedded.
- Seen on the model sheet for the next ART run (most-seen first): aniM/wildM (every Cenozoic mammal, up to 1400 each) is a box body with a box head and stick legs, no neck or tail; sauro is boxes with a stick neck; ptero is a flat bar with no head crest or wing shape; caravM (caravan camel) has its head box floating apart from the body; SHorse is the same box animal. homB/bodyM are a plain truncated cone (no legs or arms).

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
