# Code map: where the page's code lives

The page is built from the parts in `tools/src/`. `python3 tools/build.py` joins them in file-name order
into `tools/tpl.html` (a generated file, not in git; build.py refuses to run if it was edited by hand),
then writes `index.html` and `test.html` exactly as before.

Rules for every job:
- Edit the file that owns the system you are changing (table below). Never edit `tools/tpl.html`.
- New code goes in the owning file, next to the code it belongs with. If nothing fits, add a new file
  with a number prefix that puts it in the right place in the join order (lowercase-with-dashes, e.g. `53-auroras.js`).
- All JS parts are ONE script inside ONE block: `08-body-markup.html` opens `<script>{` and `99-end.html` closes it.
  Names are shared across files; order only matters for code that runs at load time (top-level statements).
  A function can be used from any file.
- Number prefixes set the order. Leave gaps so new files can slot in.
- Keep each file under about 1,500 lines; the code cleanup job splits bigger ones.
- To find something: `grep -n 'function name' tools/src/*`.

| File | Owns |
|---|---|
| 00-head.html | doctype, meta tags, title, opening `<style>` |
| 05-style.css | all CSS |
| 08-body-markup.html | page markup (HUD, sheets, buttons, element IDs), three.js script tag, `MASK64`, opens the main `<script>{` |
| 10-utils-time.js | `$`, DEG/R/GW/GH, rnd/srng/hash/fbm noise, fmtY/fmtN, ll/v3 coordinate helpers, the world clock (SEG, Y0, yearAt, SEGI), planet vitals (`vitals`, rateText) |
| 12-world-data.js | big built-in tables: SITES_RAW (settlements), DISC (discoveries), EPI (epidemics), VOLC, COLC, TIERN, SKT, CS, MN, MK |
| 15-terrain.js | height and land mask (TOPO8), plates and paleogeography (initPlates, paleoPos, paleoMap), ice (ICEY, ICEG), rivers, lakes, biomes and climate (biomeCol, applyClimate), `hAt0` |
| 18-three-setup.js | renderer, scene, camera, lights, globe mesh and texture (makeGlobe, detailTex), clouds, globe heights, BASE geometries, `merge` |
| 20-sites.js | settlements: S (sites), nameAt/tierAt, frameSite, gH/gY ground height, houses and landmarks (buildSite, house, LM), crops, real sizes (LEN, MESHLEN), buildTrees |
| 22-people-languages.js | languages and faiths by era (LANG, FAITH), people: agents (mkAgent, genPop), jobs, names, clothes, disease and death (diseases, mort, die), leaders, trade network (tradeNet, tradeStep), `step` |
| 24-shared-world.js | shared world save and sync: KEY, snapshot/saveShared/loadShared, local save (save, loadLocal, restore), real-day clock (realDay, curDay, advance, TM) |
| 26-meshes-plants.js | instanced mesh setup (initMeshes, body, quad, mergeG, setInst), animal gait shader (GAIT, gaitSet), plants and giant trees (GIANTS, wildPlants, rebuildTrees, treeCull), fire/light points (rebuildPoints, nightCols), rails |
| 28-species-fossils.js | domestic animals (ANI, herdFor, rebuildAnimals), vehicles (VEH, vehName), species registry (SP, HOM, spec, spec0), fossil sites (FOSSIL, FOSSIL2, CROCF, fossilOK, crocOK), species ramps (rampF), deepFauna/faunaFor, living patches (CELL, cellType, updDyn, localPeople) |
| 30-wild-herds.js | wild herd zones (WZ, EXTRA), wildAt/wildAt0, abundance, ecoStep, rebuildWild, dung |
| 32-animal-behavior.js | species interactions (IXR from interactions.json, ixRules, ixHit, wpick, eatsOf), tar pits (TARS, tarStep), whale breathing (BRE, breathe), detailed .hlm models (MDL_LIST, loadHLM, loadModels), home ranges and routes (homeOf, routeOf, routePos), the per-frame wild animal update `updWild` |
| 34-transport.js | planes, ships, boats, trains: eras, speeds, routes (ROUTES, planeEra, shipLeg), `updTransport` |
| 36-space-sky.js | moon, sun sprite, planets (PLE, kep, helio, updPlanets), satellites, ISS, rockets (PADS, updRockets), `updSpace` |
| 38-weather-storms-volcanoes.js | local weather (WX, wxPick, updWeather), storms (STORMS, stormPos, stormTrack), wildfires (fireFuel, fireTell), meteors, eruptions (PLUMES), `updDisasters` |
| 40-data-events.js | loaders for public/*.json event feeds: landforms, deeptime, storms, sky, extinctions, inventions, quakes, NCEI quakes, hazards (tsunamis, eruptions), battles; their facts and fire* functions |
| 42-heritage-towers-wrecks-migrations.js | UNESCO heritage (loadHeritage), tall buildings (loadTall), shipwrecks (loadWrecks, wreckScene), quake rings and plumes, migrations (loadMigrations, MGX) |
| 44-agent-movement.js | per-frame movement of people and domestic animals (pickTarget, updAgents, updAnimals), sunDir |
| 46-camera.js | camera/drone: camFrame, camUpdate, flyTo, follow, tour captions, touch and pointer input (tap) |
| 48-cities-labels-tags.js | countries and borders, ice, Blue Marble and biome atlas textures, water, real cities (loadCities, cityGate, updCities), founding events (FD), geography labels, name tags |
| 50-effects-battles-scenes.js | particle system (PSys, emit), explosions, fire, dust, tsunamis, floods, scene figures (fig, putI), battles |
| 52-event-effects-sky.js | how each big event looks (evKind, playDisc, playScene), assassinations, sickness, memorials, famine, storms, Chernobyl, sky events (skyScene: eclipses, comets, aurorae), skirmishes |
| 54-severe-weather.js | tornadoes, thunderstorms, blizzards, dust storms, heatwaves, floods, landfalls (wxEvents) |
| 56-cinematics.js | cinematics for events (cine, updCine), extinctions view (renderExt), quality levels (QG, applyQ, govern), MOBILE |
| 58-watch-together-chat.js | weather at the drone (tempAt, recorded weather RWX), badges, Now list, while you were away, clips, music, narration, streamer mode, live chat/viewers/alerts (liveInit, liveConnect, drawChat), historic journeys |
| 60-wonders-ideas-tour.js | world wonders (WONDERS, updWonders, showWonder), follow, ideas box, privacy, guided tour (TOUR, runTour), analytics, ad slot |
| 62-cards.js | trading cards client: CARDS, packs, serials, card quests and quizzes (cState, cQuiz, cardFound), Google sign-in button, builder art |
| 64-play-as-animal-settings.js | play as an animal (PLAY, playAs, playSteer, playEat, updPlay), card witnessing, big labels, region labels, Settings sheet (openSettings), share view, live viewer count |
| 66-tap-info-cards.js | tap anything (spotCard, rayGlobe, BIOMEN/BIOMED), plant facts, Wikipedia links (WIKI, wikiURL), info cards (showEvent) |
| 68-sound-favorites.js | sound (AudioContext, startSound, updSound), favorites (FAVS) |
| 70-ui.js | toasts and the popup queue (toast, showT), sheets, HUD (updHud), info panel, place name, people/family tree, upcoming list, labels, LITE mode |
| 72-upcoming-asteroid-sun.js | upcoming big events (BIG, updBig), the asteroid impact (startImpact, impactWinter), sun position (updSun) |
| 90-frame-loop.js | rebuildAll, build checks, the main `frame` loop, resize, time-machine preview, boot/start |
| 99-end.html | closes the main block and `</script></body></html>` |

Where new code of each kind goes:
- New built-in data table: next to the code that uses it; only big shared tables go in 12-world-data.js.
- New public/*.json feed: a loader in 40-data-events.js (events) or the file of its system.
- New animal species or fossil sites: 28-species-fossils.js (or public/species.json). Behaviour: 32-animal-behavior.js.
- New 3D shape for an instanced mesh: 26-meshes-plants.js.
- New event visual or scene: 50/52; new severe weather: 54; new cinematic: 56.
- New sheet, button or HUD logic: 70-ui.js (markup in 08-body-markup.html, CSS in 05-style.css).
- Things that run every frame: hook them from `frame` in 90-frame-loop.js, but keep the code in its own system's file.
- Test hooks (`window.__R`, `__C`, `__PT`, `HS.X`) must keep their names; tests depend on them.
