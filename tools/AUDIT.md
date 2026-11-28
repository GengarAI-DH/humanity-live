# Realism audit log (newest first)

## 2026-11-27 (second run)
Audited: Maastrichtian Madagascar, Maevarano Formation (69 Ma); Ice Age interior Alaska (18,000 BCE); Madrid / western Europe (1969). Also checked every wonders.json date and every journeys.json date against standard references.
Checked fine: Maevarano fauna (Rapetosaurus, Masiakasaurus, Simosuchus, Beelzebufo, Mahajangasuchus; Krause et al. 2006-2007, Sampson et al.); all wonders start/end dates; journey dates other than the one below.
Fixed:
- City labels in the past scaled every city by (world population)^1.6, so Madrid read 888k in 1969 (real city about 3.1M). Cities in Europe, North America, Oceania and Japan grew far less than the world after 1970, so they now use exponents 0.35, 0.55, 0.8 and 0.5; other regions keep 1.6 (UN World Urbanization Prospects 2018, city populations 1970 vs 2018; national censuses). Clears the realism handoff item.
- Orellana journey said April 1541; he split from Gonzalo Pizarro's party in December 1541 (Britannica, "Francisco de Orellana"; Wikipedia, "Francisco de Orellana").
Not changed: humans in interior Alaska from 16,500 BCE (Bluefish Caves cut-marked bones about 24,000 cal BP are disputed; Swan Point about 14,000 cal BP is firm); Burke and Wills camel count (sources give 26 or 27).

## 2026-11-27
Audited: Eocene Messel, Germany (48 Ma); Lake Mungo, Australia (20,000 BCE); Mali / Timbuktu (1324 CE).
Checked fine: Messel plant and animal list against fossil sites; no Diprotodon at Mungo 20,000 BCE (megafauna gone by about 42,000 years ago); Mansa Musa 1324 route.
Fixed (public/journeys.json):
- NZ settlement text said AD 1025-1120; radiocarbon dating puts first settlement about AD 1250-1300 (Wilmshurst et al. 2011, PNAS, "High-precision radiocarbon dating shows recent and rapid initial human colonization of East Polynesia").
- Hannibal 218 BC said 20,000 horses; sources give 12,000 cavalry at the start and 50,000 infantry and 9,000 cavalry after garrisons were left (Polybius 3.35 via Walbank; Wikipedia, "Hannibal's crossing of the Alps").
Not changed: "Flint-knapping spot" at Australian camps (Australian knapping used chert, silcrete and quartzite, but the prop is shared); Timbuktu night weather can read "cold and clear" at 14 C.
