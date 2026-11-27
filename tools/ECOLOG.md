# Ecology log (newest first)

How to add interactions: see the "about" field in public/interactions.json for kinds. One real source per rule, keys must exist in the page (SP in tools/tpl.html, wildAt0/EXTRA, ANI, public/species.json). Note: 'seal' (sea) is defined but never spawned, so rules targeting it do nothing; use 'sealland'.

## Nov 27, 2026
- Added 328 rules (27 -> 355).
- Covered: modern Africa (lion, hyena, cheetah, leopard, baboon, chimp, elephant, giraffe, crocodile, vulture, marabou, ostrich, meerkat, hippo, rhino, okapi), Asia (tiger, leopard, komodo, snow leopard, ibex, saiga, Przewalski's horse, golden eagle, marmot), Europe (wolf, lynx, red fox, deer, boar, bear, chamois), North America (wolf, coyote, cougar, pronghorn, bison, prairie dog, elk, moose, caribou, bald eagle, polar bear, walrus, arctic fox), South America (jaguar, capybara, condor, caiman), Australia (dingo, thylacine, Tasmanian devil, kangaroo), Madagascar (fossa, lemur), Antarctic (leopard seal, penguins), Galapagos, oceans (orca, sharks, dolphins, tuna, reef fish, mantas, turtles, humpbacks).
- Ice Age: cave lion, cave hyena, cave bear, dire wolf, Smilodon (N and S America), American lion, Homotherium, Arctodus, glyptodonts, Thylacoleo, Megalania.
- Neogene/Paleogene: Livyatan, megalodon, O. chubutensis, Purussaurus vs Stupendemys, Borophagus, Epicyon, Thylacosmilus, entelodonts, Basilosaurus eating Dorudon.
- Cretaceous/Jurassic: Tarbosaurus vs Saurolophus and Deinocheirus, Velociraptor vs Protoceratops, Majungasaurus cannibalism, Sanajeh nest raiding, Hatzegopteryx and Quetzalcoatlus ground stalking, Prognathodon/Mosasaurus prey, Allosaurus vs Stegosaurus and sauropods, pachycephalosaur and Triceratops combat.
- New kinds in the engine: mobs (land and sea), cleans (sea), schools (sea). Sea predators now use 'hunts' rules (and may take smaller listed predators); sea animals also use follows/avoids. Birds (hab 'a') use scavenges/hunts/follows: they circle low over a fresh carcass or target.
- Gaps for next runs: Paleogene land mammals (Hyaenodon, Andrewsarchus, Mesonyx, nimravids), Triassic/Jurassic, phorusrhacids, hominins (prey filter skips hom_ species; would need engine work), insects/swarms, more South American and Asian Ice Age.
