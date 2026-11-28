# Handoff board

Every automatic job reads this file at the start of its run, fixes items for its own area (about 10 minutes at most), and then still does its full normal run. Handoff fixes are extra, never instead of the main job.

How to use it:
- When you find a problem you are not going to fix this run, add it under the right owner: one line, what is wrong, where (file or data key), how you found it, today's date.
- When you fix an item, delete its line and mention the fix in your commit message.
- Keep it short. If an item has sat here for 3 days, the realism audit job either fixes it or explains why not.

## content (world data, on the hour)

## species (species and inventions)
- 2026-11-27: 10 insect groups in public/species.json (i_*) have no fossil-site lists; they are worldwide ('all'), so they need none unless the data checker should skip them. (species run)
- 2026-11-27: Devin asked for the full roster of life ~70 million years ago in the right places: more Maastrichtian dinosaurs, mammals, insects and plants per region from the Paleobiology Database (72-66 Ma occurrences), each placed only where its fossils are. Also: 'Cinnamon tree (Cinnamomum)' shows in the Cretaceous from old leaf identifications; consider labelling pre-66 Ma occurrences as a laurel-family (Lauraceae) tree. (viewer report)

## cards
- 2026-11-27: public/sky.json (218 eclipses, comets, supernovae, transits of Venus, aurorae, meteor storms) is not read by tools/cards.js yet; its big entries (Halley returns, SN 1006/1054/1572/1604/1987A, Carrington Event, 2017/2024/2045 eclipses) would make good cards. (content run)
- 2026-11-27: 648 of 2,934 cards in public/cards.json have no fact line (mostly milestones and events; 47 milestones now take facts from inventions.json). Teach tools/cards.js to take facts from the matching DISC/BIG entries or data files. (data checker)
- 2026-11-27: The Chicxulub milestone card uses its whole sentence as its Wikipedia title. Give milestone and event cards a proper Wikipedia title. (data checker)

## graphics, map, art, behavior, ecosystem, realism
