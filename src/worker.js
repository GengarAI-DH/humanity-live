// Humanity, Live: serves the page, the shared world's start time, live chat and
// presence (a Durable Object), and push alerts before big events (a cron job).
import { DurableObject } from "cloudflare:workers";

const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });

// ---------- the clock (same as the page) ----------
const SERIAL_MAX = 71250000;
const KN = [[0, -71.25e6], [5.21e6 / 86400, -66.04e6], [455, -70000], [575, -3000], [695, 1800], [825, 2100]];
function dayAt(y) { if (y > 2100) return 825 + (y - 2100) * 365.25; for (let i = 1; i < KN.length; i++) if (y <= KN[i][1]) { const a = KN[i - 1], b = KN[i]; return a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]); } return 825; }

// ---------- chat filter ----------
// Words are matched after folding look-alike characters (0->o, 1->i, $->s, @->a ...) and squeezing repeats.
const BAD = ["fuck", "shit", "bitch", "cunt", "dick", "pussy", "asshole", "bastard", "slut", "whore", "fag", "faggot", "retard", "nigger", "nigga", "chink", "spic", "kike", "wetback", "gook", "tranny", "coon", "beaner", "raghead", "towelhead", "cracker", "dyke", "paki", "motherfucker", "cock", "wanker", "twat", "prick", "jizz", "porn", "rape", "nazi", "hitler did nothing wrong", "kys", "kill yourself"];
const PROMO = [/\bfollow me\b/i, /\bsub(scribe)? to\b/i, /\bmy (channel|stream|page|server|discord|tiktok|insta|youtube|twitch|onlyfans|shop|store)\b/i, /\bcheck out my\b/i, /\bdm me\b/i, /\bpromo ?code\b/i, /\bfree (v-?bucks|robux|money|crypto)\b/i, /\b(buy|sell)ing\b.*\b(cheap|now)\b/i, /\bcrypto\b/i, /\bnft\b/i];
const LINK = [/https?:\/\//i, /\bwww\./i, /\b[a-z0-9-]{2,}\s*(\.|\(dot\)|\[dot\]| dot )\s*(com|net|org|io|gg|tv|co|me|ly|xyz|app|dev|link|ru|uk|us|ca|de|live|shop|site)\b/i, /discord\.gg|t\.me\//i, /@[a-z0-9_]{3,}/i];
function fold(s) { return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[0@4]/g, m => ({ "0": "o", "@": "a", "4": "a" })[m]).replace(/[1!|]/g, "i").replace(/3/g, "e").replace(/[5$]/g, "s").replace(/7/g, "t").replace(/8/g, "b").replace(/(.)\1{2,}/g, "$1$1"); }
function badWord(s) { const f0 = fold(s), f = f0.replace(/\b([a-z])[\s.*_-]+(?=[a-z]\b)/g, "$1"), squash = f.replace(/[^a-z]/g, ""), words = f.replace(/[^a-z ]/g, " ").split(/\s+/); for (const b of BAD) { if (b.includes(" ")) { if (f.includes(b)) return true; continue; } if (words.includes(b) || words.includes(b + "s")) return true; if (b.length >= 5 && squash.includes(b)) return true; } return false; }
function checkText(s, kind) {
  if (!s || !s.trim()) return "Say something first.";
  if (kind === "name") { if (s.length < 3 || s.length > 18) return "Names need 3 to 18 characters."; if (!/^[\p{L}\p{N} _.-]+$/u.test(s)) return "Names can use letters, numbers, spaces, _ . and -"; }
  else if (s.length > 200) return "Keep messages under 200 characters.";
  if (badWord(s)) return "No swearing, slurs or hate speech, please.";
  if (LINK.some(r => r.test(s))) return "Links and @handles aren't allowed.";
  if (PROMO.some(r => r.test(s))) return "No self-promotion, please.";
  const letters = s.replace(/[^A-Za-z]/g, ""); if (letters.length > 12 && letters.replace(/[^A-Z]/g, "").length / letters.length > .7) return "Please don't shout (too many capitals).";
  if (/(.)\1{7,}/.test(s)) return "That looks like spam.";
  return null;
}

// ---------- the room: chat + who is watching where ----------
export class Room extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env); this.env = env;
    ctx.blockConcurrencyWhile(async () => {
      this.sql = ctx.storage.sql;
      this.sql.exec("CREATE TABLE IF NOT EXISTS msg(id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER, name TEXT, uid TEXT, text TEXT, spot TEXT)");
      this.sql.exec("CREATE TABLE IF NOT EXISTS ban(uid TEXT PRIMARY KEY, ts INTEGER)");
      this.sql.exec("CREATE TABLE IF NOT EXISTS sub(ep TEXT PRIMARY KEY, json TEXT, ts INTEGER)");
      this.sql.exec("CREATE TABLE IF NOT EXISTS sent(k TEXT PRIMARY KEY)");
      this.sql.exec("CREATE TABLE IF NOT EXISTS idea(id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER, name TEXT, uid TEXT, text TEXT, k TEXT, votes INTEGER DEFAULT 0, status TEXT DEFAULT '')");
      this.sql.exec("CREATE TABLE IF NOT EXISTS wdoc(path TEXT PRIMARY KEY, json TEXT, ts INTEGER)");
      this.sql.exec("CREATE TABLE IF NOT EXISTS wlease(id INTEGER PRIMARY KEY, holder TEXT, until INTEGER)");
      this.sql.exec("CREATE TABLE IF NOT EXISTS report(mid INTEGER, uid TEXT, ts INTEGER, PRIMARY KEY(mid, uid))");
      this.sql.exec("CREATE TABLE IF NOT EXISTS fol(ep TEXT, title TEXT, at INTEGER, sent INTEGER DEFAULT 0, PRIMARY KEY(ep, title))");
      this.sql.exec("CREATE TABLE IF NOT EXISTS vote(iid INTEGER, uid TEXT, PRIMARY KEY(iid, uid))");
      // collectible cards
      this.sql.exec("CREATE TABLE IF NOT EXISTS ckey(kh TEXT PRIMARY KEY, uid TEXT, ts INTEGER)");
      this.sql.exec("CREATE TABLE IF NOT EXISTS cuser(uid TEXT PRIMARY KEY, gsub TEXT, name TEXT, created INTEGER, daily TEXT DEFAULT '', sday TEXT DEFAULT '', sn INTEGER DEFAULT 0)");
      this.sql.exec("CREATE UNIQUE INDEX IF NOT EXISTS cuser_g ON cuser(gsub)");
      this.sql.exec("CREATE TABLE IF NOT EXISTS card(uid TEXT, cid TEXT, n INTEGER, first INTEGER, PRIMARY KEY(uid, cid))");
      this.sql.exec("CREATE TABLE IF NOT EXISTS cinst(uid TEXT, cid TEXT, serial INTEGER, ts INTEGER, PRIMARY KEY(cid, serial))");
      this.sql.exec("CREATE INDEX IF NOT EXISTS cinst_u ON cinst(uid, cid)");
      this.sql.exec("CREATE TABLE IF NOT EXISTS cmint(cid TEXT PRIMARY KEY, n INTEGER)");
      // serial numbers are drawn at random from 1 to 71,250,000 (one for every year the world covers); move the first test copies onto random numbers once
      if (![...this.sql.exec("SELECT name FROM sqlite_master WHERE name='serial_v2'")].length) {
        for (const r of [...this.sql.exec("SELECT cid,serial FROM cinst")]) this.sql.exec("UPDATE cinst SET serial=? WHERE cid=? AND serial=?", this.freeSerial(r.cid), r.cid, r.serial);
        this.sql.exec("CREATE TABLE serial_v2(x INTEGER)");
      }
      this.sql.exec("CREATE TABLE IF NOT EXISTS offer(id INTEGER PRIMARY KEY AUTOINCREMENT, uid TEXT, give TEXT, want TEXT, ts INTEGER, status TEXT DEFAULT 'open', taker TEXT)");
      this.sql.exec("CREATE TABLE IF NOT EXISTS ipday(ip TEXT, day TEXT, n INTEGER, PRIMARY KEY(ip, day))");
    });
  }
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname.endsWith("/sub")) { const b = await req.json(); if (!b || !b.endpoint || !/^https:\/\//.test(b.endpoint)) return J({ ok: false }, 400); this.sql.exec("INSERT OR REPLACE INTO sub VALUES(?,?,?)", b.endpoint, JSON.stringify(b), Date.now()); return J({ ok: true }); }
    if (url.pathname.endsWith("/unsub")) { const b = await req.json(); this.sql.exec("DELETE FROM sub WHERE ep=?", b.endpoint || ""); return J({ ok: true }); }
    if (url.pathname.endsWith("/stats")) return J(this.stats());
    if (url.pathname.endsWith("/wlease")) { const b = await req.json().catch(() => ({})); const holder = String(b.holder || "").slice(0, 40), ttl = Math.min(120000, Math.max(10000, Number(b.ttlMs) || 90000)), now = Date.now(); if (!holder) return J({ acquired: false }, 400);
      const cur = [...this.sql.exec("SELECT holder, until FROM wlease WHERE id=1")][0]; if (!cur || cur.until < now || cur.holder === holder) { this.sql.exec("INSERT OR REPLACE INTO wlease VALUES(1,?,?)", holder, now + ttl); return J({ acquired: true }); } return J({ acquired: false }); }
    if (url.pathname.endsWith("/wget")) { const path = url.searchParams.get("path") || ""; const r = [...this.sql.exec("SELECT json FROM wdoc WHERE path=?", path)][0]; return new Response(r ? r.json : "null", { headers: { "content-type": "application/json", "cache-control": "no-store" } }); }
    if (url.pathname.endsWith("/wset")) { const path = url.searchParams.get("path") || "", holder = url.searchParams.get("holder") || ""; if (!/^world\/(meta|a\d{1,3}|d\d{1,3})$/.test(path)) return J({ ok: false }, 400);
      const cur = [...this.sql.exec("SELECT holder, until FROM wlease WHERE id=1")][0]; if (!cur || cur.holder !== holder || cur.until < Date.now()) return J({ ok: false, error: "not the lease holder" }, 409);
      const body = await req.text(); if (body.length > 1500000) return J({ ok: false, error: "too big" }, 413); try { JSON.parse(body); } catch (e) { return J({ ok: false }, 400); }
      this.sql.exec("INSERT OR REPLACE INTO wdoc VALUES(?,?,?)", path, body, Date.now()); return J({ ok: true }); }
    if (url.pathname.endsWith("/ideas")) return J(this.ideas());
    if (url.pathname.endsWith("/follow")) { const b = await req.json(); if (!b || !b.endpoint || !/^https:\/\//.test(b.endpoint)) return J({ ok: false }, 400); if (b.remove) this.sql.exec("DELETE FROM fol WHERE ep=? AND title=?", b.endpoint, String(b.remove)); for (const it of (b.items || []).slice(0, 50)) { if (typeof it.title !== "string" || typeof it.at !== "number") continue; this.sql.exec("INSERT OR IGNORE INTO fol(ep,title,at) VALUES(?,?,?)", b.endpoint, it.title.slice(0, 120), it.at); } return J({ ok: true }); }
    if (req.headers.get("Upgrade") !== "websocket") return J({ error: "expected websocket" }, 426);
    const pair = new WebSocketPair(); const [c, s] = Object.values(pair);
    const ip = req.headers.get("cf-connecting-ip") || "", uid = await hash(ip + (this.env.SALT || "hl"));
    this.ctx.acceptWebSocket(s); s.serializeAttachment({ uid, name: "", last: 0, recent: [], lat: null, lon: null, n: 0, win: 0 });
    const hist = [...this.sql.exec("SELECT ts,name,text,spot,id FROM msg ORDER BY id DESC LIMIT 60")].reverse();
    s.send(JSON.stringify({ t: "hist", m: hist }));
    s.send(JSON.stringify({ t: "stats", ...this.stats() }));
    return new Response(null, { status: 101, webSocket: c });
  }
  ideas() { return [...this.sql.exec("SELECT id,ts,name,text,votes,status FROM idea ORDER BY CASE status WHEN 'done' THEN 2 ELSE 0 END, votes DESC, ts DESC LIMIT 80")]; }
  stats() { const socks = this.ctx.getWebSockets(), heat = {}; for (const w of socks) { const a = w.deserializeAttachment(); if (a && a.lat != null) { const k = Math.round(a.lat / 5) * 5 + "," + Math.round(a.lon / 5) * 5; heat[k] = (heat[k] || 0) + 1; } } return { watching: socks.length, heat }; }
  broadcast(o) { const s = JSON.stringify(o); for (const w of this.ctx.getWebSockets()) { try { w.send(s); } catch (e) { } } }
  async webSocketMessage(ws, raw) {
    let m; try { m = JSON.parse(raw); } catch (e) { return; }
    const a = ws.deserializeAttachment() || {}; const now = Date.now();
    if (m.t === "pos") { if (typeof m.lat === "number" && typeof m.lon === "number") { a.lat = Math.max(-90, Math.min(90, m.lat)); a.lon = ((m.lon + 540) % 360) - 180; ws.serializeAttachment(a); } return; }
    if (m.t === "stats") { ws.send(JSON.stringify({ t: "stats", ...this.stats() })); return; }
    if (m.t === "ideas") { ws.send(JSON.stringify({ t: "ideas", list: this.ideas(), mine: [...this.sql.exec("SELECT iid FROM vote WHERE uid=?", a.uid)].map(r => r.iid) })); return; }
    if (m.t === "vote") { const id = Number(m.id); if (![...this.sql.exec("SELECT 1 FROM idea WHERE id=?", id)].length) return; const had = [...this.sql.exec("SELECT 1 FROM vote WHERE iid=? AND uid=?", id, a.uid)].length; if (had) { this.sql.exec("DELETE FROM vote WHERE iid=? AND uid=?", id, a.uid); this.sql.exec("UPDATE idea SET votes=votes-1 WHERE id=?", id); } else { this.sql.exec("INSERT INTO vote VALUES(?,?)", id, a.uid); this.sql.exec("UPDATE idea SET votes=votes+1 WHERE id=?", id); } this.broadcast({ t: "ideas_dirty" }); return; }
    if (m.t === "idea") {
      const ierr = (e) => ws.send(JSON.stringify({ t: "ierr", e }));
      if ([...this.sql.exec("SELECT 1 FROM ban WHERE uid=?", a.uid)].length) return ierr("You can't post here.");
      const name = String(m.name || "").trim(), text = String(m.text || "").trim().replace(/\s+/g, " ");
      let e = checkText(name, "name"); if (e) return ierr(e); e = checkText(text, "msg"); if (e) return ierr(e);
      if (text.length < 8) return ierr("Tell us a bit more (at least 8 characters).");
      if ([...this.sql.exec("SELECT COUNT(*) AS n FROM idea WHERE uid=? AND ts>?", a.uid, now - 864e5)][0].n >= 3) return ierr("You can post 3 ideas a day. Vote for others in the meantime!");
      const k = fold(text).replace(/[^a-z0-9]/g, ""); if ([...this.sql.exec("SELECT 1 FROM idea WHERE k=?", k)].length) return ierr("Someone already suggested that. Vote for it instead!");
      this.sql.exec("INSERT INTO idea(ts,name,uid,text,k,votes) VALUES(?,?,?,?,?,1)", now, name, a.uid, text, k);
      const id = [...this.sql.exec("SELECT last_insert_rowid() AS id")][0].id; this.sql.exec("INSERT INTO vote VALUES(?,?)", id, a.uid);
      this.broadcast({ t: "ideas_dirty" }); ws.send(JSON.stringify({ t: "iok" })); return;
    }
    if (m.t === "admin" && this.env.ADMIN_KEY && m.key === this.env.ADMIN_KEY) {
      if (m.reports) { ws.send(JSON.stringify({ t: "reports", list: [...this.sql.exec("SELECT r.mid AS id, COUNT(*) AS n, m.name, m.text FROM report r JOIN msg m ON m.id=r.mid GROUP BY r.mid ORDER BY n DESC LIMIT 50")] })); }
      if (m.ideaDel) { this.sql.exec("DELETE FROM idea WHERE id=?", m.ideaDel); this.sql.exec("DELETE FROM vote WHERE iid=?", m.ideaDel); this.broadcast({ t: "ideas_dirty" }); }
      if (m.ideaStatus) { this.sql.exec("UPDATE idea SET status=? WHERE id=?", String(m.ideaStatus.status || "").slice(0, 20), m.ideaStatus.id); this.broadcast({ t: "ideas_dirty" }); }
      if (m.del) { this.sql.exec("DELETE FROM msg WHERE id=?", m.del); this.broadcast({ t: "del", id: m.del }); }
      if (m.banName) { const r = [...this.sql.exec("SELECT uid FROM msg WHERE name=? ORDER BY id DESC LIMIT 1", m.banName)][0]; if (r) { this.sql.exec("INSERT OR REPLACE INTO ban VALUES(?,?)", r.uid, now); this.sql.exec("DELETE FROM msg WHERE uid=?", r.uid); this.broadcast({ t: "purge", name: m.banName }); } }
      return;
    }
    if (m.t === "report") { const id = Number(m.id); if (!id) return; this.sql.exec("INSERT OR IGNORE INTO report VALUES(?,?,?)", id, a.uid, now); const n = [...this.sql.exec("SELECT COUNT(*) AS n FROM report WHERE mid=?", id)][0].n; ws.send(JSON.stringify({ t: "reported", id })); if (n >= 3) { this.sql.exec("DELETE FROM msg WHERE id=?", id); this.broadcast({ t: "del", id }); } return; }
    if (m.t !== "say") return;
    const err = (e) => ws.send(JSON.stringify({ t: "err", e }));
    if ([...this.sql.exec("SELECT 1 FROM ban WHERE uid=?", a.uid)].length) return err("You can't post here.");
    const name = String(m.name || "").trim(), text = String(m.text || "").trim().replace(/\s+/g, " ");
    let e = checkText(name, "name"); if (e) return err(e);
    if (!m.spot) { e = checkText(text, "msg"); if (e) return err(e); }
    if (now - a.last < 3000) return err("Slow down a little (one message every 3 seconds).");
    a.win = now - (a.winT || 0) > 60000 ? 1 : (a.win || 0) + 1; if (a.win === 1) a.winT = now; if (a.win > 8) return err("Too many messages this minute. Take a breather.");
    const key = fold(text); if ((a.recent || []).includes(key) && !m.spot) return err("You just said that.");
    a.recent = [key, ...(a.recent || [])].slice(0, 5); a.last = now; a.name = name; ws.serializeAttachment(a);
    let spot = null; if (m.spot && typeof m.spot.lat === "number") spot = JSON.stringify({ lat: +m.spot.lat.toFixed(3), lon: +m.spot.lon.toFixed(3), alt: Math.max(.3, Math.min(200, +m.spot.alt || 2)), place: checkText(String(m.spot.place || ""), "msg") ? "" : String(m.spot.place || "").slice(0, 60) });
    const st = spot ? "" : text;
    this.sql.exec("INSERT INTO msg(ts,name,uid,text,spot) VALUES(?,?,?,?,?)", now, name, a.uid, st, spot);
    const id = [...this.sql.exec("SELECT last_insert_rowid() AS id")][0].id;
    this.sql.exec("DELETE FROM msg WHERE id < ?", id - 500);
    this.broadcast({ t: "msg", m: { id, ts: now, name, text: st, spot } });
  }
  // ---------- collectible cards ----------
  cUser(kh, make) {
    let r = [...this.sql.exec("SELECT uid FROM ckey WHERE kh=?", kh)][0];
    if (!r) { if (!make) return null; const uid = crypto.randomUUID().replace(/-/g, "").slice(0, 20); this.sql.exec("INSERT INTO ckey VALUES(?,?,?)", kh, uid, Date.now()); this.sql.exec("INSERT OR IGNORE INTO cuser(uid,created) VALUES(?,?)", uid, Date.now()); r = { uid }; }
    return [...this.sql.exec("SELECT * FROM cuser WHERE uid=?", r.uid)][0];
  }
  freeSerial(cid) { let s = 0; for (let i = 0; i < 50; i++) { s = 1 + Math.floor(Math.random() * SERIAL_MAX); if (![...this.sql.exec("SELECT 1 FROM cinst WHERE cid=? AND serial=?", cid, s)].length) break; } return s; }
  mint(uid, cid) { this.sql.exec("INSERT INTO cmint VALUES(?,1) ON CONFLICT(cid) DO UPDATE SET n=n+1", cid); const s = this.freeSerial(cid); this.sql.exec("INSERT INTO cinst VALUES(?,?,?,?)", uid, cid, s, Date.now()); return s; }
  move(from, to, cid) { const r = [...this.sql.exec("SELECT serial FROM cinst WHERE uid=? AND cid=? ORDER BY serial DESC LIMIT 1", from, cid)][0]; if (!r) return 0; this.sql.exec("UPDATE cinst SET uid=? WHERE cid=? AND serial=?", to, cid, r.serial); return r.serial; }
  cGive(uid, cid, k = 1) { for (let i = 0; i < k; i++) this.mint(uid, cid); }
  cHas(uid, cid) { return [...this.sql.exec("SELECT COUNT(*) AS n FROM cinst WHERE uid=? AND cid=?", uid, cid)][0].n; }
  backfill(uid) { for (const r of [...this.sql.exec("SELECT cid,n FROM card WHERE uid=?", uid)]) { const have = this.cHas(uid, r.cid); for (let i = have; i < r.n; i++) this.mint(uid, r.cid); } this.sql.exec("DELETE FROM card WHERE uid=?", uid); }
  cMe(u) {
    this.backfill(u.uid); const cards = {}, ser = {}, minted = {};
    for (const r of this.sql.exec("SELECT cid,serial FROM cinst WHERE uid=? ORDER BY serial", u.uid)) { cards[r.cid] = (cards[r.cid] || 0) + 1; (ser[r.cid] = ser[r.cid] || []).push(r.serial); }
    for (const r of this.sql.exec("SELECT m.cid,m.n FROM cmint m WHERE m.cid IN (SELECT DISTINCT cid FROM cinst WHERE uid=?)", u.uid)) minted[r.cid] = r.n;
    const offers = [...this.sql.exec("SELECT id,give,want,ts FROM offer WHERE uid=? AND status='open'", u.uid)];
    const day = new Date().toISOString().slice(0, 10);
    return { ok: true, id: u.uid.slice(0, 6), name: u.name || "", signedIn: !!u.gsub, cards, ser, minted, daily: u.daily !== day, spotsLeft: u.sday === day ? Math.max(0, 8 - u.sn) : 8, offers };
  }
  async cardsOp(op, b, ipH, ctx) {
    const day = new Date().toISOString().slice(0, 10), kh = b.k && /^[a-f0-9]{32,64}$/.test(b.k) ? await hash("k" + b.k) : null;
    if (op === "top") {
      const nm = "COALESCE(NULLIF(u.name,''),'Collector '||substr(u.uid,1,4))", real = "c.uid NOT LIKE '~%'";
      const all = [...this.sql.exec(`SELECT ${nm} AS name, COUNT(DISTINCT c.cid) AS uniq, COUNT(*) AS total FROM cinst c JOIN cuser u ON u.uid=c.uid WHERE ${real} GROUP BY c.uid ORDER BY uniq DESC, total DESC LIMIT 20`)];
      const ids = (b.season || []).slice(0, 400), ph = ids.map(() => "?").join(",") || "''";
      const season = [...this.sql.exec(`SELECT ${nm} AS name, COUNT(DISTINCT c.cid) AS uniq FROM cinst c JOIN cuser u ON u.uid=c.uid WHERE ${real} AND c.cid IN (${ph}) GROUP BY c.uid ORDER BY uniq DESC LIMIT 20`, ...ids)];
      const low = [...this.sql.exec(`SELECT c.cid, c.serial, ${nm} AS name FROM cinst c JOIN cuser u ON u.uid=c.uid WHERE ${real} ORDER BY c.serial ASC LIMIT 15`)];
      const first = [...this.sql.exec(`SELECT f.cid, f.ts, ${nm} AS name FROM (SELECT cid, uid, MIN(ts) AS ts FROM cinst GROUP BY cid) f JOIN cuser u ON u.uid=f.uid ORDER BY f.ts DESC LIMIT 25`)];
      const found = [...this.sql.exec("SELECT COUNT(*) AS n, COUNT(DISTINCT cid) AS kinds FROM cinst")][0];
      return { ok: true, all, season, low, first, found };
    }
    if (op === "offers") return { ok: true, offers: [...this.sql.exec("SELECT o.id,o.give,o.want,o.ts,u.name,substr(u.uid,1,6) AS who FROM offer o JOIN cuser u ON u.uid=o.uid WHERE o.status='open' ORDER BY o.id DESC LIMIT 200")] };
    if (!kh) return { ok: false, error: "Missing device key" };
    const u = this.cUser(kh, true);
    if (op === "me") return this.cMe(u);
    if (op === "name") { const nm = String(b.name || "").trim(), bad = checkText(nm, "name"); if (bad) return { ok: false, error: bad }; this.sql.exec("UPDATE cuser SET name=? WHERE uid=?", nm, u.uid); return this.cMe({ ...u, name: nm }); }
    if (op === "daily") {
      if (u.daily === day) return { ok: false, error: "You already opened today's free pack. Come back tomorrow." };
      const ip = [...this.sql.exec("SELECT n FROM ipday WHERE ip=? AND day=?", ipH, day)][0];
      if (ip && ip.n >= 4) return { ok: false, error: "Too many free packs from this network today." };
      this.sql.exec("INSERT INTO ipday VALUES(?,?,1) ON CONFLICT(ip,day) DO UPDATE SET n=n+1", ipH, day);
      this.sql.exec("UPDATE cuser SET daily=? WHERE uid=?", day, u.uid);
      for (const c of b.picks) this.cGive(u.uid, c);
      return { ...this.cMe({ ...u, daily: day }), got: b.picks };
    }
    if (op === "spot") {
      const sn = u.sday === day ? u.sn : 0; if (sn >= 8) return { ok: false, error: "No more spotting cards today." };
      this.sql.exec("UPDATE cuser SET sday=?, sn=? WHERE uid=?", day, sn + 1, u.uid);
      if (b.win) this.cGive(u.uid, b.cid);
      return { ...this.cMe({ ...u, sday: day, sn: sn + 1 }), got: b.win ? [b.cid] : [] };
    }
    if (op === "witness") { if (this.cHas(u.uid, b.cid)) return { ok: false, error: "You already have this card." }; this.cGive(u.uid, b.cid); return { ...this.cMe(u), got: [b.cid] }; }
    if (op === "google") {
      const g = b.g; let owner = [...this.sql.exec("SELECT uid FROM cuser WHERE gsub=?", g.sub)][0];
      if (!owner) { this.sql.exec("UPDATE cuser SET gsub=? WHERE uid=?", g.sub, u.uid); if (!u.name && g.name) { const nm = String(g.name).split(" ")[0].slice(0, 18); if (!checkText(nm, "name")) this.sql.exec("UPDATE cuser SET name=? WHERE uid=?", nm, u.uid); } return this.cMe(this.cUser(kh)); }
      if (owner.uid !== u.uid) { // this device joins the signed-in account and brings its cards along
        this.backfill(u.uid); this.sql.exec("UPDATE cinst SET uid=? WHERE uid=?", owner.uid, u.uid); this.sql.exec("UPDATE ckey SET uid=? WHERE kh=?", owner.uid, kh);
      }
      return this.cMe(this.cUser(kh));
    }
    if (op === "signout") { const nu = crypto.randomUUID().replace(/-/g, "").slice(0, 20); this.sql.exec("UPDATE ckey SET uid=? WHERE kh=?", nu, kh); this.sql.exec("INSERT OR IGNORE INTO cuser(uid,created) VALUES(?,?)", nu, Date.now()); return this.cMe(this.cUser(kh)); }
    // trading needs a signed-in account so cards can't be duped with throwaway devices
    if (["offer", "cancel", "accept"].includes(op) && !u.gsub) return { ok: false, error: "Sign in with Google to trade." };
    if (op === "offer") {
      if (!b.give || !b.want || b.give === b.want) return { ok: false, error: "Pick a card to give and a card you want." };
      if ([...this.sql.exec("SELECT COUNT(*) AS n FROM offer WHERE uid=? AND status='open'", u.uid)][0].n >= 5) return { ok: false, error: "You can have 5 open trades at a time." };
      if (!this.cHas(u.uid, b.give)) return { ok: false, error: "You don't have that card." };
      this.sql.exec("INSERT INTO offer(uid,give,want,ts) VALUES(?,?,?,?)", u.uid, b.give, b.want, Date.now());
      const oid = [...this.sql.exec("SELECT last_insert_rowid() AS id")][0].id; this.move(u.uid, "~o" + oid, b.give); // held until the trade completes or is cancelled
      return this.cMe(u);
    }
    if (op === "cancel") { const o = [...this.sql.exec("SELECT * FROM offer WHERE id=? AND uid=? AND status='open'", b.id, u.uid)][0]; if (!o) return { ok: false, error: "Trade not found." }; this.sql.exec("UPDATE offer SET status='cancelled' WHERE id=?", o.id); this.move("~o" + o.id, u.uid, o.give); return this.cMe(u); }
    if (op === "accept") {
      const o = [...this.sql.exec("SELECT * FROM offer WHERE id=? AND status='open'", b.id)][0]; if (!o) return { ok: false, error: "That trade is gone." };
      if (o.uid === u.uid) return { ok: false, error: "That's your own trade." };
      if (!this.cHas(u.uid, o.want)) return { ok: false, error: "You don't have the card they want." };
      this.ctx.storage.transactionSync(() => { this.sql.exec("UPDATE offer SET status='done', taker=? WHERE id=?", u.uid, o.id); this.move(u.uid, o.uid, o.want); this.move("~o" + o.id, u.uid, o.give); });
      return { ...this.cMe(u), got: [o.give] };
    }
    return { ok: false, error: "Unknown" };
  }
  // ---------- backups ----------
  dumpTables() { const out = {}; for (const t of BACKUP_TABLES) { try { out[t] = [...this.sql.exec(`SELECT * FROM ${t}`)]; } catch (e) { } } return out; }
  restoreTables(data, tables) {
    const done = [];
    this.ctx.storage.transactionSync(() => {
      for (const t of tables) { if (!BACKUP_TABLES.includes(t) || !Array.isArray(data[t])) continue; this.sql.exec(`DELETE FROM ${t}`);
        for (const r of data[t]) { const k = Object.keys(r); if (!k.length) continue; this.sql.exec(`INSERT OR REPLACE INTO ${t}(${k.join(",")}) VALUES(${k.map(() => "?").join(",")})`, ...k.map(x => r[x])); }
        done.push(t + ":" + data[t].length); }
    });
    return done;
  }
  async webSocketClose(ws) { try { ws.close(); } catch (e) { } }
  // ---------- push alerts (no payload: the phone fetches /api/alert) ----------
  async alerts(ev) {
    const subs = [...this.sql.exec("SELECT ep,json FROM sub")]; if (!subs.length || !this.env.VAPID_PRIVATE) return 0;
    const start = Number(this.env.WORLD_START), now = Date.now(); let due = null;
    for (const [y, title] of ev) { const at = start + dayAt(y) * 864e5; for (const [lead, lbl] of [[864e5, "in 24 hours"], [36e5, "in 1 hour"]]) { const k = title + "|" + lbl; if (now >= at - lead && now < at - lead + 20 * 60e3 && ![...this.sql.exec("SELECT 1 FROM sent WHERE k=?", k)].length) { due = { title, lbl, k }; } } }
    if (!due) return 0;
    this.sql.exec("INSERT INTO sent VALUES(?)", due.k); await this.ctx.storage.put("alert", { title: due.title, when: due.lbl, ts: now });
    let n = 0; for (const s of subs) { const r = await sendPush(s.ep, this.env); if (r === 404 || r === 410) this.sql.exec("DELETE FROM sub WHERE ep=?", s.ep); else n++; }
    return n;
  }
  async lastAlert(ep) { const g = (await this.ctx.storage.get("alert")) || null; if (ep) { const m = await this.ctx.storage.get("alert:" + await hash(ep)); if (m && (!g || m.ts >= g.ts)) return m; } return g; }
  async followAlerts() {
    if (!this.env.VAPID_PRIVATE) return 0; const now = Date.now(); let n = 0;
    for (const r of [...this.sql.exec("SELECT ep,title,at FROM fol WHERE sent=0 AND at<=? LIMIT 200", now)]) {
      this.sql.exec("UPDATE fol SET sent=1 WHERE ep=? AND title=?", r.ep, r.title);
      await this.ctx.storage.put("alert:" + await hash(r.ep), { title: r.title, when: "", ts: now, follow: 1 });
      const s = await sendPush(r.ep, this.env); if (s === 404 || s === 410) { this.sql.exec("DELETE FROM fol WHERE ep=?", r.ep); this.sql.exec("DELETE FROM sub WHERE ep=?", r.ep); } else n++;
    }
    return n;
  }
}

// ---------- cards: catalog, world clock, Google sign-in ----------
let CAT = null, CATT = 0;
async function catalog(env) {
  if (CAT && Date.now() - CATT < 600000) return CAT;
  const j = await (await env.ASSETS.fetch(new Request("https://assets.local/cards.json"))).json();
  const byId = {}; for (const c of j.cards) byId[c[0]] = c;
  CAT = { ...j, byId }; CATT = Date.now(); return CAT;
}
function yearAtDay(d) { for (let i = 1; i < KN.length; i++) if (d <= KN[i][0]) { const a = KN[i - 1], b = KN[i]; return a[1] + (b[1] - a[1]) * (d - a[0]) / (b[0] - a[0]); } return 2100 + (d - 825) / 365.25; }
function worldNow(env) { const d = (Date.now() - Number(env.WORLD_START)) / 864e5; return { d, y: yearAtDay(d) }; }
function seasonNow(cat, y) { for (const s of cat.seasons) if (y >= s[2] && y < s[3]) return s; return cat.seasons[cat.seasons.length - 1]; }
function pickCards(cat, season, n) {
  const pool = cat.cards.filter(c => c[1] === season && !(c[2] === "ev" && c[8])), W = [0, 60, 25, 11, 3.5, .5], out = [];
  for (let i = 0; i < n; i++) {
    let r = Math.random() * 100, rar = 1; for (let k = 5; k >= 1; k--) { const cum = W.slice(k).reduce((a, b) => a + b, 0); if (r < cum && k > rar) { rar = k; break; } }
    for (rar = Math.min(rar, 5); rar >= 1; rar--) { const p = pool.filter(c => c[4] === rar); if (p.length) { out.push(p[(Math.random() * p.length) | 0][0]); break; } }
  }
  return out;
}
let GK = null, GKT = 0;
const b64d = s => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), c => c.charCodeAt(0));
async function verifyGoogle(tok, env) {
  if (!env.GOOGLE_CLIENT_ID) return null;
  const [h, p, s] = String(tok || "").split("."); if (!s) return null;
  const head = JSON.parse(new TextDecoder().decode(b64d(h))), pay = JSON.parse(new TextDecoder().decode(b64d(p)));
  if (!GK || Date.now() - GKT > 36e5) { GK = (await (await fetch("https://www.googleapis.com/oauth2/v3/certs")).json()).keys; GKT = Date.now(); }
  const jwk = GK.find(k => k.kid === head.kid); if (!jwk) return null;
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
  const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, b64d(s), new TextEncoder().encode(h + "." + p));
  if (!ok || pay.aud !== env.GOOGLE_CLIENT_ID || !["accounts.google.com", "https://accounts.google.com"].includes(pay.iss) || pay.exp * 1000 < Date.now()) return null;
  return { sub: String(pay.sub), name: pay.given_name || pay.name || "" };
}
async function cardsApi(op, request, env, room) {
  const cat = await catalog(env), w = worldNow(env), se = seasonNow(cat, w.y);
  if (op === "catalog") return J({ ok: true, season: se[0], year: w.y, day: w.d, googleClient: env.GOOGLE_CLIENT_ID || null, shop: !!env.STRIPE_SECRET });
  const b = request.method === "POST" ? await request.json().catch(() => ({})) : {};
  const ipH = await hash("ip" + (request.headers.get("cf-connecting-ip") || "") + (env.SALT || "hl"));
  if (op === "daily") b.picks = pickCards(cat, se[0], 3);
  if (op === "spot") { const c = cat.byId[b.cid]; if (!c || !["an", "pl"].includes(c[2]) || c[1] !== se[0]) return J({ ok: false, error: "That card isn't in this season." }); b.win = Math.random() < .35; }
  if (op === "witness") { const c = cat.byId[b.cid]; if (!c || c[2] !== "ev") return J({ ok: false, error: "Not an event card." }); const ed = dayAt(c[5]); if (w.d < ed - 0.01 || w.d > ed + 0.25) return J({ ok: false, error: "You have to be watching when it happens." }); }
  if (["offer", "accept"].includes(op)) { const g = cat.byId[b.give], wa = cat.byId[b.want]; if (op === "offer" && (!g || !wa)) return J({ ok: false, error: "Unknown card." }); }
  if (op === "google") { const g = await verifyGoogle(b.cred, env); if (!g) return J({ ok: false, error: "Google sign-in failed." }); b.g = g; }
  if (op === "shop") return J({ ok: false, error: "Card packs aren't for sale yet." });
  if (op === "top") { b.season = cat.cards.filter(c => c[1] === se[0]).map(c => c[0]); const ck = new Request("https://cache.local/cards-top-" + se[0]), cache = caches.default, hit = await cache.match(ck); if (hit) return hit;
    const r = J(await room.cardsOp("top", b, ipH)); r.headers.set("cache-control", "public, max-age=60"); try { await cache.put(ck, r.clone()); } catch (e) { } return r; }
  return J(await room.cardsOp(op, b, ipH));
}
// ---------- nightly backups to KV (gzip, split into 20 MB parts, 30 days kept) ----------
const BACKUP_TABLES = ["wdoc", "msg", "ban", "idea", "vote", "report", "sub", "fol", "ckey", "cuser", "card", "cinst", "cmint", "offer"];
async function gz(str) { const s = new Blob([str]).stream().pipeThrough(new CompressionStream("gzip")); return new Uint8Array(await new Response(s).arrayBuffer()); }
async function gunz(buf) { const s = new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip")); return await new Response(s).text(); }
async function runBackup(env, room, force) {
  if (!env.BACKUPS) return { ok: false, error: "no BACKUPS binding" };
  const day = new Date().toISOString().slice(0, 10);
  if (!force && (await env.BACKUPS.get("last")) === day) return { ok: true, skipped: day };
  const data = await room.dumpTables(); const counts = {}; for (const k in data) counts[k] = data[k].length;
  const z = await gz(JSON.stringify({ v: 1, day, ts: Date.now(), data })), PART = 20 * 1024 * 1024, parts = Math.ceil(z.length / PART) || 1;
  for (let i = 0; i < parts; i++) await env.BACKUPS.put(`b:${day}:${i}`, z.slice(i * PART, (i + 1) * PART));
  const idx = JSON.parse((await env.BACKUPS.get("index")) || "[]").filter(e => e.day !== day); idx.push({ day, parts, bytes: z.length, counts });
  idx.sort((a, b) => a.day < b.day ? -1 : 1);
  while (idx.length > 30) { const old = idx.shift(); for (let i = 0; i < old.parts; i++) await env.BACKUPS.delete(`b:${old.day}:${i}`); }
  await env.BACKUPS.put("index", JSON.stringify(idx)); await env.BACKUPS.put("last", day);
  return { ok: true, day, parts, bytes: z.length, counts };
}
async function loadBackup(env, day) {
  const idx = JSON.parse((await env.BACKUPS.get("index")) || "[]"), e = idx.find(x => x.day === day); if (!e) return null;
  const bufs = []; for (let i = 0; i < e.parts; i++) bufs.push(new Uint8Array(await env.BACKUPS.get(`b:${day}:${i}`, "arrayBuffer")));
  const all = new Uint8Array(bufs.reduce((a, b) => a + b.length, 0)); let o = 0; for (const b of bufs) { all.set(b, o); o += b.length; }
  return JSON.parse(await gunz(all));
}
async function adminApi(op, request, env, room) {
  const b = request.method === "POST" ? await request.json().catch(() => ({})) : {}, key = b.key || new URL(request.url).searchParams.get("key");
  if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) return J({ ok: false }, 403);
  if (op === "backups") return J({ ok: true, index: JSON.parse((await env.BACKUPS.get("index")) || "[]") });
  if (op === "backup") return J(await runBackup(env, room, true));
  if (op === "restore") {
    if (b.confirm !== "RESTORE " + b.day) return J({ ok: false, error: 'Send confirm: "RESTORE <day>" to restore that backup over the live data.' }, 400);
    const bk = await loadBackup(env, b.day); if (!bk) return J({ ok: false, error: "No backup for that day" }, 404);
    await runBackup(env, room, true); // save the current state first, so a restore can be undone
    const tables = Array.isArray(b.tables) && b.tables.length ? b.tables : BACKUP_TABLES;
    return J({ ok: true, restored: await room.restoreTables(bk.data, tables) });
  }
  return J({ ok: false }, 404);
}
async function hash(s) { const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)); return [...new Uint8Array(d)].slice(0, 12).map(b => b.toString(16).padStart(2, "0")).join(""); }
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64u = (s) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4)), c => c.charCodeAt(0));
async function sendPush(endpoint, env) {
  const aud = new URL(endpoint).origin, exp = Math.floor(Date.now() / 1000) + 12 * 3600;
  const head = b64u(new TextEncoder().encode(JSON.stringify({ typ: "JWT", alg: "ES256" }))), body = b64u(new TextEncoder().encode(JSON.stringify({ aud, exp, sub: "mailto:buildswithdevin@gmail.com" })));
  const pub = unb64u(env.VAPID_PUBLIC), jwk = { kty: "EC", crv: "P-256", d: env.VAPID_PRIVATE, x: b64u(pub.slice(1, 33)), y: b64u(pub.slice(33, 65)), ext: true };
  const key = await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(head + "." + body));
  const r = await fetch(endpoint, { method: "POST", headers: { TTL: "3600", Urgency: "high", Authorization: `vapid t=${head}.${body}.${b64u(sig)}, k=${env.VAPID_PUBLIC}`, "Content-Length": "0" } });
  return r.status;
}

// ---------- recorded weather (ERA5 reanalysis via Open-Meteo, 1940 to now) ----------
const WMO = { 0: "clear", 1: "mostly clear", 2: "partly cloudy", 3: "overcast", 45: "fog", 48: "freezing fog", 51: "light drizzle", 53: "drizzle", 55: "heavy drizzle", 56: "freezing drizzle", 57: "freezing drizzle", 61: "light rain", 63: "rain", 65: "heavy rain", 66: "freezing rain", 67: "freezing rain", 71: "light snow", 73: "snow", 75: "heavy snow", 77: "snow grains", 80: "rain showers", 81: "rain showers", 82: "violent rain showers", 85: "snow showers", 86: "heavy snow showers", 95: "thunderstorm", 96: "thunderstorm with hail", 99: "thunderstorm with heavy hail" };
async function realWeather(url, ctx) {
  const lat = Math.round(Number(url.searchParams.get("lat")) * 2) / 2, lon = Math.round(Number(url.searchParams.get("lon")) * 2) / 2, date = String(url.searchParams.get("date") || "");
  if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return J({ ok: false }, 400);
  const key = new Request(`https://wx.cache/${lat}/${lon}/${date}`), cache = caches.default, hit = await cache.match(key); if (hit) return hit;
  const today = new Date().toISOString().slice(0, 10), recent = new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10);
  let src, live = false;
  if (date < "1940-01-01") return J({ ok: false, reason: "before records" });
  if (date <= recent) src = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${date}&end_date=${date}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,snowfall_sum,wind_speed_10m_max,weather_code&timezone=auto`;
  else if (date <= today) { live = true; src = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,snowfall,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=auto`; }
  else return J({ ok: false, reason: "future" });
  try {
    const r = await fetch(src); if (!r.ok) return J({ ok: false }, 502); const j = await r.json(); let o;
    if (live) o = { ok: true, live: true, date, t: j.current.temperature_2m, hi: j.daily.temperature_2m_max[0], lo: j.daily.temperature_2m_min[0], rain: j.current.precipitation, snow: j.current.snowfall, wind: j.current.wind_speed_10m, code: j.current.weather_code };
    else { const d = j.daily; o = { ok: true, date, hi: d.temperature_2m_max[0], lo: d.temperature_2m_min[0], rain: d.precipitation_sum[0], snow: d.snowfall_sum[0], wind: d.wind_speed_10m_max[0], code: d.weather_code[0] }; }
    o.kind = WMO[o.code] || ""; o.src = "ERA5 reanalysis (ECMWF) via Open-Meteo";
    const res = new Response(JSON.stringify(o), { headers: { "content-type": "application/json", "cache-control": live ? "max-age=900" : "max-age=2592000" } });
    ctx.waitUntil(cache.put(key, res.clone())); return res;
  } catch (e) { return J({ ok: false }, 502); }
}

// ---------- data imports from official sources ----------
// The update runs can't reach these sites directly, so they leave a job in the IMPORTS store
// (key "job:<id>", value = {"url": "..."}); every minute this downloads it and saves the result
// as "res:<id>" (raw bytes, metadata = status, type, url, size). Only approved official hosts are allowed.
// Art files (3D models made for the site) may only be imported as kept files ("keep": "<name>"), served at /a/<name>.
const ART_HOSTS = ["d2ol7oe51mr4n9.cloudfront.net"];
const IMPORT_HOSTS = ["volcano.si.edu", "www.ngdc.noaa.gov", "ngdc.noaa.gov", "www.ncei.noaa.gov", "ncei.noaa.gov", "earthquake.usgs.gov", "paleobiodb.org", "training.paleobiodb.org", "whc.unesco.org", "query.wikidata.org", "www.wikidata.org", "api.gbif.org", "zenodo.org", "www.naturalearthdata.com", "naciscdn.org", "data.giss.nasa.gov", "www.ncdc.noaa.gov", "psl.noaa.gov", "www.nhc.noaa.gov", "www.spc.noaa.gov", "eonet.gsfc.nasa.gov", "ssd.jpl.nasa.gov", "cneos.jpl.nasa.gov", "www.lpi.usra.edu", "impact.uwo.ca", "api.iucnredlist.org", "en.wikipedia.org"];
async function runImports(env) {
  if (!env.IMPORTS) return; const list = await env.IMPORTS.list({ prefix: "job:", limit: 5 });
  for (const k of list.keys) {
    const id = k.name.slice(4); let job; try { job = JSON.parse(await env.IMPORTS.get(k.name)); } catch (e) { await env.IMPORTS.delete(k.name); continue; }
    let meta = { url: job.url, status: 0, type: "", size: 0, at: Date.now() }, body = new Uint8Array();
    try {
      const u = new URL(job.url), keep = typeof job.keep === "string" && /^[a-z0-9_.-]{1,60}$/.test(job.keep) ? job.keep : ""; if (u.protocol !== "https:" || !(IMPORT_HOSTS.includes(u.hostname) || (keep && ART_HOSTS.includes(u.hostname)))) { meta.status = 403; meta.error = "host not on the approved list"; }
      else {
        const headers = { "user-agent": "HumanityLive/1.0 (educational Earth history simulation; buildswithdevin@gmail.com)", accept: job.accept || "*/*" };
        if (u.hostname === "api.iucnredlist.org" && env.IUCN_TOKEN) headers.authorization = "Bearer " + env.IUCN_TOKEN;
        if (job.method === "POST") headers["content-type"] = job.contentType || "application/x-www-form-urlencoded";
        const r = await fetch(u.toString(), { method: job.method === "POST" ? "POST" : "GET", headers, body: job.method === "POST" ? job.body || "" : undefined, redirect: "follow" });
        meta.status = r.status; meta.type = r.headers.get("content-type") || ""; const buf = new Uint8Array(await r.arrayBuffer());
        if (buf.length > 24 * 1024 * 1024) { meta.error = "too big (over 24 MB); filter the request"; meta.size = buf.length; } else { body = buf; meta.size = buf.length; }
      }
    } catch (e) { meta.error = String(e).slice(0, 300); }
    if (job.keep && meta.status === 200 && body.length && /^[a-z0-9_.-]{1,60}$/.test(job.keep)) await env.IMPORTS.put("file:" + job.keep, body, { metadata: { type: meta.type, size: body.length, url: job.url, at: meta.at } });
    await env.IMPORTS.put("res:" + id, body, { metadata: meta, expirationTtl: 3 * 86400 }); await env.IMPORTS.delete(k.name);
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url), room = env.ROOM.get(env.ROOM.idFromName("world"));
    if (url.pathname === "/api/world") return J({ start: Number(env.WORLD_START), name: "Humanity, Live", vapid: env.VAPID_PUBLIC || null });
    if (url.pathname === "/api/live") return room.fetch(request);
    if (url.pathname === "/api/wlease" && request.method === "POST") return room.fetch(new Request(url.origin + "/wlease", { method: "POST", body: await request.text() }));
    if (url.pathname === "/api/wdoc") { if (request.method === "PUT") return room.fetch(new Request(url.origin + "/wset" + url.search, { method: "POST", body: await request.text() })); return room.fetch(new Request(url.origin + "/wget" + url.search)); }
    if (url.pathname === "/api/stats") return room.fetch(new Request(url.origin + "/stats"));
    if (url.pathname.startsWith("/api/admin/")) return adminApi(url.pathname.slice(11), request, env, room);
    if (url.pathname.startsWith("/api/cards/")) { const op = url.pathname.slice(11); if (!/^(catalog|me|name|daily|spot|witness|offers|offer|cancel|accept|google|signout|shop|top)$/.test(op)) return J({ ok: false }, 404); return cardsApi(op, request, env, room); }
    if (url.pathname.startsWith("/a/")) { const n = url.pathname.slice(3); if (!/^[a-z0-9_.-]{1,60}$/.test(n)) return new Response("not found", { status: 404 }); const v = await env.IMPORTS.getWithMetadata("file:" + n, { type: "arrayBuffer", cacheTtl: 3600 }); if (!v.value) return new Response("not found", { status: 404 }); return new Response(v.value, { headers: { "content-type": "application/octet-stream", "cache-control": "public, max-age=86400", "access-control-allow-origin": "*" } }); }
    if (url.pathname === "/api/wx") return realWeather(url, ctx);
    if (url.pathname === "/api/ideas") return room.fetch(new Request(url.origin + "/ideas"));
    if (url.pathname === "/api/push/sub" && request.method === "POST") return room.fetch(new Request(url.origin + "/sub", { method: "POST", body: await request.text() }));
    if (url.pathname === "/api/push/unsub" && request.method === "POST") return room.fetch(new Request(url.origin + "/unsub", { method: "POST", body: await request.text() }));
    if (url.pathname === "/api/alert") return J((await room.lastAlert(url.searchParams.get("ep") || "")) || {});
    if (url.pathname === "/api/push/follow" && request.method === "POST") return room.fetch(new Request(url.origin + "/follow", { method: "POST", body: await request.text() }));
    return env.ASSETS.fetch(request);
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runImports(env)); if (event.cron === "* * * * *") return;
    const room = env.ROOM.get(env.ROOM.idFromName("world"));
    ctx.waitUntil((async () => { if (new Date().getUTCHours() === 11) { try { await runBackup(env, room, false); } catch (e) { console.error('backup', e); } } const ev = await (await env.ASSETS.fetch(new Request("https://assets.local/events.json"))).json(); await room.alerts(ev); await room.followAlerts(); })());
  },
};
