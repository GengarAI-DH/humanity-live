# Handoff board

Every automatic job reads this file at the start of its run, fixes items for its own area (about 10 minutes at most), and then still does its full normal run. Handoff fixes are extra, never instead of the main job.

How to use it:
- When you find a problem you are not going to fix this run, add it under the right owner: one line, what is wrong, where (file or data key), how you found it, today's date.
- When you fix an item, delete its line and mention the fix in your commit message.
- Keep it short. If an item has sat here for 3 days, the realism audit job either fixes it or explains why not.

## content (world data, on the hour)
- 2026-11-27: 5 entries in public/events.json are dated before the clock starts (-71.25 million years), so they never appear. Move them into the clock's range or remove them. (data checker)

## species (species and inventions)
- 2026-11-27: 10 insect groups in public/species.json (i_*) have no fossil-site lists; they are worldwide ('all'), so they need none unless the data checker should skip them. (species run)

## cards
- 2026-11-27: 695 of 1,477 cards in public/cards.json have no fact line (mostly milestones and events). Teach tools/cards.js to take facts from the matching DISC/BIG entries or data files. (data checker)
- 2026-11-27: The Chicxulub milestone card uses its whole sentence as its Wikipedia title. Give milestone and event cards a proper Wikipedia title. (data checker)

## graphics, map, art, behavior, ecosystem, realism
- (empty)
