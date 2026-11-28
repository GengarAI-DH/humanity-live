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
// kind: an=animal pl=plant ev=event ms=milestone wo=wonder jr=journey ex=extinction st=storm lf=landform iv=invention
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
// inventions and things people made (new ones become cards; ones already in the timeline give their milestone card a fact)
for (const e of (J('inventions.json') || {}).inv || []) {
  if (!e || e.length < 10) continue;
  if (e[10]) { const c = cards.find(c => c[0] === 'ms-' + slug(e[1])); if (c && !c[6]) { c[6] = e[5]; c[7] = e[6] } continue }
  add('iv', e[9], e[9], e[0], e[0] < -10000 ? 3 : 2, e[5], e[6], 0);
}
// landforms
for (const l of (J('landforms.json') || {}).lf || []) add('lf', l[2], l[9] || l[2], l[0], 2, l[7], l[8], 0);


// ---- card quizzes: up to three questions per card, built only from the same sourced data as the card ----
// Answers are never written by hand: the right answer and every wrong option come from real records.
function rng(seed) { let h = 2166136261; for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296 }
function fmtY(y) { return y < -1e6 ? (-y / 1e6).toFixed(1).replace(/\.0$/, '') + ' million years ago' : y < -9999 ? Math.round(-y).toLocaleString('en-US') + ' years ago' : y < 0 ? Math.round(-y) + ' BC' : 'AD ' + Math.round(y) }
function fmtMa(a, b) { const f = x => x >= 1 ? (+x.toFixed(1)) + ' million' : Math.max(1, Math.round(x * 1000)).toLocaleString('en-US') + ' thousand'; if (!(b > 0)) return 'From about ' + f(a) + ' years ago to today'; const fa = f(a), fb = f(b); return 'About ' + (fa.endsWith(' million') && fb.endsWith(' million') ? fa.replace(' million', '') : fa) + ' to ' + fb + ' years ago' }
function mcq(r, q, right, wrongs) { const w = [...new Set(wrongs)].filter(x => x && x !== right); if (w.length < 2) return null; for (let i = w.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1));[w[i], w[j]] = [w[j], w[i]] } const opts = [right, ...w.slice(0, 3)]; for (let i = opts.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1));[opts[i], opts[j]] = [opts[j], opts[i]] } return [q, opts, opts.indexOf(right)] }
const far = (a, b) => { if (a > -1e4 || b > -1e4) return Math.abs(a - b) >= Math.max(60, Math.abs(Math.min(a, b) - 2026) * .25); return Math.max(-a, -b) / Math.min(-a, -b) >= 1.6 };
const SPD = {}; for (const s of (spj && spj.sp) || []) SPD[slug(s[0])] = s;
const SPB = {}; for (const [k, v] of Object.entries(SP)) SPB[slug(k)] = v;
const DIET = { carnivore: 'Other animals (meat)', herbivore: 'Plants', omnivore: 'Both plants and animals', insectivore: 'Insects and other small invertebrates' };
const km = (a, b) => { const r = Math.PI / 180, x = Math.sin((b[0] - a[0]) * r / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin((b[1] - a[1]) * r / 2) ** 2; return 12742 * Math.asin(Math.sqrt(x)) };
const goodSite = n => n && !/^fossil site/i.test(n) && !/Ma\)$/.test(n);
const allSites = []; for (const s of (spj && spj.sp) || []) for (const t of s[13] || []) if (goodSite(t[2])) allSites.push([s[0], t]);
const ranges = Object.values(SPD).filter(s => s[4] > 0).map(s => [s[4], Math.max(s[5], 0)]);
const PLD = {}; for (const p of (spj && spj.plants) || []) PLD[slug(p[0])] = p;
const quiz = {};
for (const c of cards) {
  const r = rng(c[0]), Q = [], add2 = x => { if (x) Q.push(x) }, nm = c[3];
  if (c[2] === 'an') {
    const key = c[0].slice(3, c[0].length - c[1].length - 1), s = SPD[key], b = SPB[key];
    const a0 = s ? s[4] : b && b[4], a1 = s ? Math.max(s[5], 0) : b && Math.max(b[5], 0);
    if (a0 > 0) add2(mcq(r, 'When did ' + nm + ' live?', fmtMa(a0, a1), ranges.filter(([x, y]) => x < a1 * .8 || y > a0 * 1.25).sort(() => r() - .5).map(([x, y]) => fmtMa(x, y))));
    if (s && DIET[s[10]]) add2(mcq(r, 'What did ' + nm + ' mainly eat?', DIET[s[10]], Object.values(DIET)));
    if (s && s[13] && s[13].length) {
      const good = s[13].filter(t => goodSite(t[2]));
      // a wrong option must be at least 1,500 km from every place this animal is known from, so it can't secretly be right
      if (good.length) add2(mcq(r, 'Where have ' + nm + ' fossils been found?', good[Math.floor(r() * good.length)][2], allSites.filter(([o, t]) => o !== s[0] && s[13].every(m => km(m, t) > 1500)).sort(() => r() - .5).map(x => x[1][2])));
    }
  } else if (c[2] === 'pl') {
    const p = PLD[slug(nm)];
    if (p) add2(mcq(r, 'About how far back does the fossil record of ' + nm + ' go?', fmtY(-p[2] * 1e6), Object.values(PLD).filter(o => o[2] / p[2] >= 1.6 || p[2] / o[2] >= 1.6).sort(() => r() - .5).map(o => fmtY(-o[2] * 1e6))));
  } else {
    const same = cards.filter(o => o[2] === c[2] && o[0] !== c[0]);
    const qy = c[2] === 'ex' ? 'When did the last ' + nm.replace(/^Last /, '') + ' die out?' : ['wo', 'iv'].includes(c[2]) ? 'When does ' + nm + ' date from?' : 'When did this happen: “' + nm + '”?';
    add2(mcq(r, qy, fmtY(c[5]), same.filter(o => far(o[5], c[5])).sort(() => r() - .5).map(o => fmtY(o[5]))));
    if (c[6] && c[6].length <= 170 && !/^A fossil plant/.test(c[6])) add2(mcq(r, 'Which fact belongs to ' + nm + '?', c[6], same.filter(o => o[6] && o[6].length <= 170 && o[6] !== c[6]).sort(() => r() - .5).map(o => o[6])));
  }
  if (Q.length) quiz[c[0]] = Q;
}
fs.mkdirSync(path.join(ROOT, 'public', 'quiz'), { recursive: true });
for (const s of SEASONS) { const o = {}; for (const c of cards) if (c[1] === s[0] && quiz[c[0]]) o[c[0]] = quiz[c[0]]; fs.writeFileSync(path.join(ROOT, 'public', 'quiz', s[0] + '.json'), JSON.stringify(o)) }
console.log('quiz cards', Object.keys(quiz).length, 'questions', Object.values(quiz).reduce((a, q) => a + q.length, 0));

const RAR = [null, ['Common', 60], ['Uncommon', 25], ['Rare', 11], ['Epic', 3.5], ['Legendary', 0.5]];
const out = { v: 1, seasons: SEASONS, rarity: RAR, cards };
fs.writeFileSync(path.join(ROOT, 'public', 'cards.json'), JSON.stringify(out));
const per = {}; for (const c of cards) per[c[1]] = (per[c[1]] || 0) + 1;
console.log('cards', cards.length, JSON.stringify(per));
