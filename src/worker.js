// Humanity, Live: serves the page, the shared world's start time, live chat and
// presence (a Durable Object), and push alerts before big events (a cron job).
import { DurableObject } from "cloudflare:workers";

const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });

// ---------- the clock (same as the page) ----------
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
    });
  }
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname.endsWith("/sub")) { const b = await req.json(); if (!b || !b.endpoint || !/^https:\/\//.test(b.endpoint)) return J({ ok: false }, 400); this.sql.exec("INSERT OR REPLACE INTO sub VALUES(?,?,?)", b.endpoint, JSON.stringify(b), Date.now()); return J({ ok: true }); }
    if (url.pathname.endsWith("/unsub")) { const b = await req.json(); this.sql.exec("DELETE FROM sub WHERE ep=?", b.endpoint || ""); return J({ ok: true }); }
    if (url.pathname.endsWith("/stats")) return J(this.stats());
    if (req.headers.get("Upgrade") !== "websocket") return J({ error: "expected websocket" }, 426);
    const pair = new WebSocketPair(); const [c, s] = Object.values(pair);
    const ip = req.headers.get("cf-connecting-ip") || "", uid = await hash(ip + (this.env.SALT || "hl"));
    this.ctx.acceptWebSocket(s); s.serializeAttachment({ uid, name: "", last: 0, recent: [], lat: null, lon: null, n: 0, win: 0 });
    const hist = [...this.sql.exec("SELECT ts,name,text,spot,id FROM msg ORDER BY id DESC LIMIT 60")].reverse();
    s.send(JSON.stringify({ t: "hist", m: hist }));
    s.send(JSON.stringify({ t: "stats", ...this.stats() }));
    return new Response(null, { status: 101, webSocket: c });
  }
  stats() { const socks = this.ctx.getWebSockets(), heat = {}; for (const w of socks) { const a = w.deserializeAttachment(); if (a && a.lat != null) { const k = Math.round(a.lat / 5) * 5 + "," + Math.round(a.lon / 5) * 5; heat[k] = (heat[k] || 0) + 1; } } return { watching: socks.length, heat }; }
  broadcast(o) { const s = JSON.stringify(o); for (const w of this.ctx.getWebSockets()) { try { w.send(s); } catch (e) { } } }
  async webSocketMessage(ws, raw) {
    let m; try { m = JSON.parse(raw); } catch (e) { return; }
    const a = ws.deserializeAttachment() || {}; const now = Date.now();
    if (m.t === "pos") { if (typeof m.lat === "number" && typeof m.lon === "number") { a.lat = Math.max(-90, Math.min(90, m.lat)); a.lon = ((m.lon + 540) % 360) - 180; ws.serializeAttachment(a); } return; }
    if (m.t === "stats") { ws.send(JSON.stringify({ t: "stats", ...this.stats() })); return; }
    if (m.t === "admin" && this.env.ADMIN_KEY && m.key === this.env.ADMIN_KEY) {
      if (m.del) { this.sql.exec("DELETE FROM msg WHERE id=?", m.del); this.broadcast({ t: "del", id: m.del }); }
      if (m.banName) { const r = [...this.sql.exec("SELECT uid FROM msg WHERE name=? ORDER BY id DESC LIMIT 1", m.banName)][0]; if (r) { this.sql.exec("INSERT OR REPLACE INTO ban VALUES(?,?)", r.uid, now); this.sql.exec("DELETE FROM msg WHERE uid=?", r.uid); this.broadcast({ t: "purge", name: m.banName }); } }
      return;
    }
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
  async lastAlert() { return (await this.ctx.storage.get("alert")) || null; }
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url), room = env.ROOM.get(env.ROOM.idFromName("world"));
    if (url.pathname === "/api/world") return J({ start: Number(env.WORLD_START), name: "Humanity, Live", vapid: env.VAPID_PUBLIC || null });
    if (url.pathname === "/api/live") return room.fetch(request);
    if (url.pathname === "/api/stats") return room.fetch(new Request(url.origin + "/stats"));
    if (url.pathname === "/api/push/sub" && request.method === "POST") return room.fetch(new Request(url.origin + "/sub", { method: "POST", body: await request.text() }));
    if (url.pathname === "/api/push/unsub" && request.method === "POST") return room.fetch(new Request(url.origin + "/unsub", { method: "POST", body: await request.text() }));
    if (url.pathname === "/api/alert") return J((await room.lastAlert()) || {});
    return env.ASSETS.fetch(request);
  },
  async scheduled(ev, env, ctx) {
    const room = env.ROOM.get(env.ROOM.idFromName("world"));
    ctx.waitUntil((async () => { const ev = await (await env.ASSETS.fetch(new Request("https://assets.local/events.json"))).json(); await room.alerts(ev); })());
  },
};
