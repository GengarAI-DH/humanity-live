# Species and inventions log

Newest first. Runs alternate: A = species run, B = inventions and things-made run.

## 2026-11-27 · Run B (inventions)
- Created public/inventions.json (134 entries: [year, event title, lat, lon, kind, one line, Wikipedia title, source, place, card name, linked]). Loaded lazily by loadInventions() in tools/tpl.html; facts() shows "Made by people", "First made in" and "Source"; cineKind() picks a short scene by kind (tool, build, voyage, flight, signal, power, space, science, farm, art).
  - 87 new events/cards (kind "iv", Invention): deep-time Africa (Lomekwi, Gona, Kokiselei, Kalambo Falls, Blombos, Diepkloof), Europe (Schöningen, Pesse canoe, Belovode, Varna), Asia (Dzudzuana, Kuahuqiao, Qingtaicun silk, Anyang oracle bones, Dujiangyan, Lingqu, Grand Canal, Jiaozi, Bi Sheng, Su Song, Hangul), Australia/Oceania (Kimberley axe, Wyrie Swamp boomerang, Kuk Swamp), Americas (Clovis, El Manatí rubber balls), Near East (Ohalo II, Shubayqa bread, Jericho tower, Areni shoe, Tarkhan dress, Merer papyri, Khufu ship, Proto-Sinaitic, Ugarit, Byblos, Royal Road, Meroë iron), then Roman roads/aqueducts, medieval China and al-Jazari, the Industrial Revolution, and 20th-century machines to Falcon 9 and ITER (planned 2034).
  - 47 entries are linked (last field 1) to milestones already in DISC (telephone, light bulb, Wright Flyer, ENIAC...): they add place, fact and source, and their milestone cards now get a fact line (cards without facts 695 -> 648).
- Not yet done: making the world's existing boats, cars, planes and buildings appear by these dates and regions; more Africa, South Asia, Americas and Islamic-world entries; more planned future projects (check official schedules first).
- Next run: A (species).

## 2026-11-27 · Run A (species)
- Added 35 animals and 16 fossil plants (species.json now 177 animals in "sp", 33 plants), all with Paleobiology Database occurrence ranges and fossil sites.
  - Asia: Mononykus, Alioramus, Saurornithoides, Shantungosaurus (Late Cretaceous Mongolia/China), Olorotitan (Amur, Russia), Indohyus (Eocene Kashmir), Stegodon.
  - Africa: Thalassotitan, Phosphatodraco, Ajnabia (Maastrichtian Moroccan phosphates), Phosphatherium, Phiomia, Proconsul, Sivatherium, Megalotragus.
  - South America: Pycnonemosaurus, Baurusuchus, Astrapotherium, Pyrotherium, Lestodon, Arctotherium, Andalgalornis, Smilodon populator.
  - Antarctica: Llanocetus. Australia: Thylacine, Protemnodon, Sthenurus, Phascolonus, Quinkana, Baru, Wonambi.
  - Oceans: Squalicorax, Enchodus, Xiphactinus, Globidens.
  - Plants: elm, birch, tree fern (Cyathea), soft tree fern (Dicksonia), cycad (Cycas), sweetgum, podocarp, kauri, fig, alder, spruce, walnut, beech, hickory, larch, Eucalyptus (southern-hemisphere fossils only; two marine-core spruce pollen sites dropped).
- Handoff: filled the 30 non-insect species that had empty fossil-site lists with PBDB sites.
- Skipped (PBDB ranges end before the clock starts at 71.25 Ma): Citipati, Oviraptor, Pinacosaurus, Saichania, Bagaceratops, Shuvuuia, Tsintaosaurus, Zhuchengtyrannus, Antarctopelta, Trinisaura, Zhejiangopterus. Skipped for unsourced size: Imperobator, Indosuchus, Embolotherium, Antarctosaurus, Zarafasaura, Plotosaurus, Notiomastodon.
- Gaps still thin: deep-time India, Antarctic Paleogene land animals, Cretaceous Australia, invertebrates (ammonites need a shell body).
- Next run: B (inventions). public/inventions.json does not exist yet.
