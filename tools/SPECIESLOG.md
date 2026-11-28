# Species and inventions log

Newest first. Runs rotate A → B → C: A = dataset import, B = species run, C = history and inventions run. (Older entries below used the earlier labels: their "Run A" is today's B, their "Run B" is today's C.)

## 2026-11-28 · Run B (species: Cenozoic Australia, South America, Africa, Asia and seas)
- Added 79 extinct animals (species.json now 1,068 in "sp", 816 with dated sites in "fix"), each with Paleobiology Database occurrences (4,375 occurrences downloaded; up to 40 half-degree sites per animal with their own age ranges). Picked from PBDB genus lists (occs/taxa, extinct tetrapods since 71.5 Ma) for Australia+Antarctica, South America, Africa and Asia, most-recorded genera first, skipping ones already in the world.
  - Australia (19): Simosthenurus, Metasthenurus, Troposodon, Ganguroo, Propleopus, Euowenia, Nimiokoala, Ektopodon, Malleodectes, Megalibgwilia, giant megapodes Latagallina and Progura, crocodiles Paludirex (5 m, Ristevski et al. 2020), Mekosuchus (to about 3,000 years ago on Vanuatu, Mead et al. 2002), Australosuchus, Kambara, snakes Nanowana and Yurlunggur, Mammalodon.
  - Antarctica / Maastrichtian: Aristonectes, Polarornis, Homalocephale (Nemegt, Mongolia).
  - South America (20): Notiomastodon, Protypotherium, Paedotherium, Panochthus, Neosclerocalyptus, Cladosictis, Borhyaena, Scelidotherium, Catonyx, Hapalops, Palaeolama, Pampatherium, Propraopus, Eutatus, Macroeuphractus, Peltephilus, Protocyon, Nesodon, Granastrapotherium, Psilopterus.
  - Africa (24): Kolpochoerus, Metridiochoerus, Nyanzachoerus, Notochoerus, Gerontochoerus, Eurygnathohippus, Pelorovis, Menelikia, Rhinocolobus, Cercopithecoides, Victoriapithecus, Euthecodon, Primelephas, Stegotetrabelodon, Prodeinotherium, Palaeomastodon, Sivaonyx, Enhydriodon, Apterodon, Chasmaporthetes, sea cows Eotheroides and Eosiren, Saghacetus, Homiphoca.
  - Asia and wide-ranging (13): Cadurcodon, Anthracotherium, Eudinoceras, Gomphotherium, Zygolophodon, Stegolophodon, Listriodon, Palaeotragus, Ictitherium, Sinomegaceros, Amebelodon, Allodesmus, Metaxytherium.
- Ranges: first appearance = second-oldest early bound among occurrences dated to under 6 million years; last appearance = third-youngest occurrence midpoint (second with fewer than 10), so one coarse "Pleistocene" record does not stretch an animal to the end of the Ice Age. Ends under 130,000 years are set to 11,700 years (end of the Pleistocene). Some animals may therefore end a little before their true last record.
- No body lengths except Paludirex (others use per-mesh scale, like the p_ genera). Existing meshes only (quad, ankylo, thero, fish, whale, plesio, ptero). New animals ramp in rare and local through rampF.
- Skipped: Dracaena (living genus), Libytherium (often treated as Sivatherium, already in), Paranthropus (hominins left to the people side), Sarcophilus and Hydrodamalis (already in the modern list), Morturneria and Pallimnarchus (no genus-level occurrences returned).
- Viewer ideas: humanitylivewatch.com/api/ideas returned an empty list.
- Next run: C (history and inventions).

## 2026-11-28 · Run A (dataset import: Paleobiology Database fossil sites)
- Imported 1,921 dated fossil sites (Paleobiology Database occurrences, de-duplicated to half-degree cells, at most 40 per animal, each with its own age range) for 527 extinct land and flying animals that had at most a few undated sites. They go in species.json "fix" (now 745 animals), so each animal appears only near the places its fossils are from at that time, and its regions follow its fossil plates.
  - 470 Maastrichtian animals from the Maastrichtian vertebrate download (7,746 occurrences); 57 Cenozoic animals (Smilodon populator, Mammuthus exilis, Theropithecus, Dinofelis, Meiolania, Paleogene penguins, Antarctic and Indian Eocene mammals...) from a second download (1,530 occurrences). About 424 of the Maastrichtian sites are places not listed before.
  - fossilOK: when an animal has no dated site within the current time window, it now falls back to all its known sites instead of vanishing (gaps in the record).
  - cards.js: wrong answers in "where were its fossils found" quizzes now also stay 1,500 km from these dated sites.
  - Not found or skipped: Denversaurus, Qianzhousaurus, Pycnonemosaurus, Baurusuchus, Eurotamandua (no occurrences in the downloads), Palaeoloxodon falconeri (not in the PBDB taxonomy), living genera (Agama, Podocnemis, Trionyx...) so their modern ranges are not tied to fossil sites.
- Handoff (species): Cinnamomum now starts at 66 Ma; its Cretaceous leaf records (7 sites) were dropped as uncertain identifications (the laurel entry covers the Cretaceous laurel family). 46 PBDB facts said "A armoured / A eagle ray..."; fixed to "An".
- Found: 11 animals exist twice (p_ entry and a named entry from the 27 Nov species run: Abditosaurus, Alcione, Arambourgiania, Barbaridactylus, Cretalamna, Halisaurus, Nanuqsaurus, Pararhabdodon, Rhabdodon, Scapanorhynchus, Simurghia). Left for the cards owner (removing a species removes its card); noted in HANDOFF.
- Import queue note: four jobs with 140 genus names each never finished and blocked the queue for several minutes; smaller jobs (60 names) finished within a minute. Keep PBDB base_name lists short.
- Viewer ideas: humanitylivewatch.com/api/ideas could not be fetched this run.
- Next run: B (species).

## 2026-11-27 · Run C (inventions and things people made)
- Added 99 entries to public/inventions.json (now 233): 82 new events/cards and 17 linked to milestones already in the timeline (telescope, barometer, Micrographia cells, smallpox vaccine, periodic table, Suez and Panama canals, Koch, radio, radioactivity, Haber–Bosch, penicillin, DNA, polio vaccine, first heart transplant, IVF, Dolly), which now get place, fact and source.
  - Gaps filled first: Africa (Lebombo and Ishango bones, Aksum coins, Lalibela, al-Qarawiyyin, Roda Nilometer, Great Zimbabwe, Djinguereber, Barnard's transplant, M-Pesa), South Asia (Mehrgarh dentistry, Great Bath, Iron Pillar, Aryabhatiya, Gwalior zero, Rani ki vav, Parakrama Samudra, Jantar Mantar, Mysore rockets, Bombay–Thane railway), Islamic world (Baghdad paper, al-Khwarizmi, Banu Musa, al-Zahrawi, Ibn al-Haytham, Maragheh, Ulugh Beg), the Americas (Guilá Naquitz squash, Huaca Prieta indigo, Watson Brake, Caral, Olmec heads, Chiapa de Corzo Long Count, Syntex norethisterone), East Asia (Jiahu, Erlitou, Sanxingdui, Zhaozhou Bridge, Hōryū-ji, Wujing Zongyao, Jikji, instant noodles, Walkman), then European and American firsts (Sweet Track, Ljubljana wheel, Nebra disc, Eupalinos, Salisbury clock, Mercator, Newton, Leeuwenhoek, Harrison H4, Faraday's motor, Erie Canal, Braille, daguerreotype ... Z3, Colossus, RAMAC, Telstar, ATM, CT, email, cochlear implant, IBM PC, Linux).
- Dropped: Canon of Medicine (place of completion not certain).
- Handoff (species): new species now ramp in rare and local (rampF/rampOK in deepFauna): over their first ~300,000 years only a growing share of the zones near their fossils get them, at 1 animal; they fade the same way at the end, except at the K-Pg impact and for species that live on past the deep-time list.
- Viewer ideas: humanitylivewatch.com/api/ideas could not be reached from the update machine this run.
- Next run: A (dataset import).

## 2026-11-27 · Run A (species, second)
- Added 64 animals and 27 fossil plants (species.json now 989 entries in "sp", 60 plants), all with Paleobiology Database occurrence ranges and fossil sites.
  - 13 with sourced body sizes: Avimimus (Mongolia), Abditosaurus (Spain), Nanuqsaurus (Arctic Alaska), Kumimanu (Paleocene NZ penguin), Anthropornis (Antarctica), Puijila (Devon Island), Janjucetus (Victoria), Zygorhiza, Sicilian dwarf elephant, pygmy mammoth (Channel Islands), Meiolania, Holmesina; Desmostylus has no size (none sourced).
  - 51 PBDB-only genera with no body length (scale only, like the p_ genera): Eocene India (Cambaytherium, Kutchicetus, Remingtonocetus, Andrewsiphius), Eocene Antarctica (Antarctodolops, Polydolops, Notiolofos, Delphinornis, Archaeospheniscus, Palaeeudyptes), Asia (Embolotherium, Gobiatherium, Chilotherium, Sinonyx), Africa (Barytherium, Numidotherium, Saghatherium, Apidium, Anancus, Ancylotherium, Dinofelis, Pachycrocuta, Simbakubwa, Megistotherium, Libycosaurus, Theropithecus, Ekorus), South America (Notostylops, Leontinia, Thoatherium, Theosodon), Australia (Neohelos, Ngapakaldia, Ekaltadeta, Riversleigha), North America (Hyrachyus), Maastrichtian Europe (Rhabdodon, Pararhabdodon) and Morocco/Jordan pterosaurs (Alcione, Simurghia, Barbaridactylus, Arambourgiania), seas (Plioplatecarpus, Halisaurus, Scapanorhynchus, Cretalamna, Aetiocetus, Squalodon, Kentriodon, Enaliarctos, Paleoparadoxia).
  - Plants: Dacrydium, fir, katsura, hazel, juniper, willow, ash, poplar, sassafras, linden, Keteleeria, cedar, hemlock, Zelkova, hornbeam, holly, golden larch, tree of heaven, chestnut, China fir, umbrella pine, date palm, screw pine, laurel, cypress, Banksia, she-oak.
- Regions for the new land animals come from plateOf() on their PBDB sites. No new body type this run.
- Skipped: Tethyshadros (PBDB range ends 72.2 Ma, before the clock), Megaladapis (Holocene only, deep-time list never shows it), Haast's eagle (no PBDB records), moa / elephant bird / Steller's sea cow (already in the modern animal list).
- Note: entries from the first Run A put the source string at index 14, which the loader reads as scale; harmless while a length is set, so new entries without a length put a number at 14 and the source at 15.
- Next run: B (inventions).

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
