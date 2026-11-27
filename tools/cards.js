// Builds public/cards.json: the collectible card catalog, made only from the site's own sourced data.
// Seasons follow the world clock, so every card can only be earned while its era is playing.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const tpl = fs.readFileSync(path.join(__dirname, 'tpl.html'), 'utf8');
const J = f => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, 'public', f), 'utf8')) } catch (e) { return null } };

// pull a literal (array or object) out of the page source
function lit(name) {
  const i = tpl.indexOf('const ' + name + '=');
  if (i < 0) return null;
  let k = tpl.indexOf('=', i) + 1, open = tpl[k], close = open === '[' ? ']' : '}', d = 0, q = null;
  for (let j = k; j < tpl.length; j++) {
    const c = tpl[j];
    if (q) { if (c === '\\') { j++; continue } if (c === q) q = null; continue }
    if (c === '"' || c === "'" || c === '`') { q = c; continue }
    if (c === open) d++; else if (c === close) { d--; if (!d) return Function('return ' + tpl.slice(k, j + 1))() }
  }
  return null;
}

// seasons = eras of the clock (years are sim years; a season is live while the world is inside it)
const SEASONS = [
  ['dino', 'Age of Dinosaurs', -71.25e6, -66.0399e6, '🦖', '#c0612b'],
  ['paleo', 'Rise of the Mammals', -66.0399e6, -34e6, '🦣', '#6f8a3a'],
  ['grass', 'Age of Grasslands', -34e6, -5.3e6, '🌾', '#b08a3a'],
  ['ape', 'First Humans', -5.3e6, -70000, '🦴', '#8a6a4a'],
  ['ice', 'The Ice Age', -70000, -10000, '🧊', '#5a8ab0'],
  ['farm', 'Dawn of Farming', -10000, -3000, '🌱', '#5f8a3f'],
  ['ancient', 'Ancient Empires', -3000, 500, '🏛️', '#b8902f'],
  ['medieval', 'Middle Ages', 500, 1450, '🏰', '#7a5a8a'],
  ['explore', 'Age of Exploration', 1450, 1800, '⛵', '#2f6f8a'],
  ['industry', 'Industrial Age', 1800, 1914, '🏭', '#6a6a6a'],
  ['wars', 'World Wars', 1914, 1945, '⚔️', '#8a3a3a'],
  ['modern', 'Modern Era', 1945, 2000, '🚀', '#3a5a9a'],
  ['now', 'Our Time', 2000, 2027, '📱', '#2f8a7a'],
  ['future', 'The Future', 2027, 2100.01, '🔮', '#6a4ab0'],
];
const seasonOf = y => { for (const s of SEASONS) if (y >= s[2] && y < s[3]) return s[0]; return null };
const slug = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
const clean = n => String(n).replace(/\s*\(.*?\)\s*/g, ' ').trim();

const cards = [], seen = new Set();
// kind: an=animal pl=plant ev=event ms=milestone wo=wonder jr=journey ex=extinction st=storm lf=landform
function add(kind, key, name, year, rar, fact, wiki, extra) {
  const se = seasonOf(year);
  if (!se) return;
  const id = kind + '-' + slug(key || name);
  if (seen.has(id)) return;
  seen.add(id);
  cards.push([id, se, kind, name, rar, Math.round(year), fact || '', wiki || clean(name), extra || 0]);
}

const BIGGEST = new Set(['trex', 'trice', 'quetz', 'mosa', 'spino', 'titan', 'argentino', 'mammoth', 'smilodon', 'megalodon', 'baslo', 'paracer', 'megath', 'diprot']);
// animals: from the page's own list plus species.json (a card is earnable in each season the animal lived in)
const SP = lit('SP') || {};
const spj = J('species.json');
const animals = Object.entries(SP).map(([k, v]) => [k, v[0], v[4], v[5], v[3], v[10] || '', v[1]])
  .concat((spj && spj.sp || []).map(s => [s[0], s[1], s[4], s[5], (s[9] || 2) / 4, s[11] || '', s[2]]));
for (const [k, name, ma0, ma1, size, fact, mesh] of animals) {
  if (!(ma0 > 0)) continue;
  const a = -ma0 * 1e6, b = -Math.max(ma1, 0.000001) * 1e6;
  for (const s of SEASONS) {
    if (a < s[3] && b > s[2] && s[2] < -9000 && Math.min(b, s[3]) - Math.max(a, s[2]) > Math.min(3e5, (s[3] - s[2]) * .05)) {
      const y = Math.max(a, s[2]) + 1, rar = BIGGEST.has(k) ? 4 : size >= 1.6 ? 3 : size >= 1 ? 2 : 1;
      const id = 'an-' + slug(k) + '-' + s[0];
      if (seen.has(id)) continue; seen.add(id);
      cards.push([id, s[0], 'an', name, rar, Math.round(y), fact, clean(name), mesh]);
    }
  }
}
// ancient plants
for (const p of (spj && spj.plants || [])) {
  const a = -p[2] * 1e6, b = -p[3] * 1e6;
  for (const s of SEASONS) if (a < s[3] && b > s[2] && s[2] < -9000 && Math.min(b, s[3]) - Math.max(a, s[2]) > Math.min(3e5, (s[3] - s[2]) * .05)) {
    const id = 'pl-' + slug(p[0]) + '-' + s[0]; if (seen.has(id)) continue; seen.add(id);
    cards.push([id, s[0], 'pl', p[0], 1, Math.round(Math.max(a, s[2]) + 1), 'A fossil plant found in rocks of this age', clean(p[0]), 0]);
  }
}
// big events (witness cards: only claimable while the event is live)
for (const b of lit('BIG') || []) add('ev', b[1], b[1], b[0], /asteroid|mass extinction|atomic|moon|supereruption/i.test(b[1]) ? 5 : 4, '', b[1], 1);
// milestones and smaller events
for (const d of lit('DISC') || []) add('ms', d[1], d[1], d[0], 2, '', null, 0);
// wonders
for (const w of (J('wonders.json') || {}).won || []) add('wo', w[0], w[0], w[1], 3, w[9], w[8], 0);
// journeys
for (const j of (J('journeys.json') || {}).jrn || []) add('jr', j[1], j[1], j[0], 3, j[3] && j[3][0] && j[3][0][2], j[5], 0);
// extinctions: the last of their kind
for (const e of (J('extinctions.json') || {}).ext || []) add('ex', e[1], 'Last ' + e[1], e[0], 3, e[2], e[5], 0);
// tragic storms
for (const s of (J('storms.json') || {}).st || []) add('st', s[2], s[2], s[0], 2, s[8], s[9], 0);
// landforms
for (const l of (J('landforms.json') || {}).lf || []) add('lf', l[2], l[9] || l[2], l[0], 2, l[7], l[8], 0);

const RAR = [null, ['Common', 60], ['Uncommon', 25], ['Rare', 11], ['Epic', 3.5], ['Legendary', 0.5]];
const out = { v: 1, seasons: SEASONS, rarity: RAR, cards };
fs.writeFileSync(path.join(ROOT, 'public', 'cards.json'), JSON.stringify(out));
const per = {}; for (const c of cards) per[c[1]] = (per[c[1]] || 0) + 1;
console.log('cards', cards.length, JSON.stringify(per));
