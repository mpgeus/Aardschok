'use strict';
// node astar.cjs [uit.json] (npm run grootte -- --astar). Wat kost één T.zoekPad (js/pad.js)? Op de kaart van het gehucht (76×76), en op een grote lege kaart (256×256),
// met en zonder andere wezens in de weg (T.isBegaanbaar met wezensBlokkeren: T.wezenOp loopt alle wezens af).
const { T, beginSpel, nu, pct, gem } = require('./harnas.cjs');

// Een kaart in code, zoals T.maakProefkamers dat doet, maar dan een lege vlakte van L bij L.
function legeKaart(L) {
  const tegels = [];
  for (let y = 0; y < L; y++) tegels.push(new Array(L).fill('vloer'));
  return { b: L, h: L, tegels, deuren: new Map(), voorwerpen: [], wezens: [], kamers: [{ id: 'buiten', x1: 0, y1: 0, x2: L - 1, y2: L - 1 }], bekend: new Set(['buiten']), buiten: true };
}

// Wat het spel aan T.zoekPad meegeeft bij het dwalen (js/verkennen.js:382): begaanbaar met wezensBlokkeren, en vast.
const gewoon = (w) => ({ mag: (x, y) => T.isBegaanbaar(w, x, y), vast: (x, y) => T.isVast(w, x, y) });
const metWezens = (w, wie) => ({ mag: (x, y) => T.isBegaanbaar(w, x, y, { wezensBlokkeren: true, wie }), vast: (x, y) => T.isVast(w, x, y) });

// Tijd één aanroep: warm op, dan `n` herhalingen; geeft { ms (gemiddeld), min, pad (lengte of null), mags (aantal tegelvragen) }.
function tijd(w, van, naar, f, n, opties = {}) {
  let mags = 0;
  const tel = { mag: (x, y) => { mags++; return f.mag(x, y); }, vast: f.vast };
  const r0 = T.zoekPad(van, naar, tel.mag, tel.vast, opties); // telt de tegelvragen van één zoektocht
  const vragen = mags;
  for (let i = 0; i < 2; i++) T.zoekPad(van, naar, f.mag, f.vast, opties);
  const t = [];
  for (let i = 0; i < n; i++) {
    const s = nu();
    T.zoekPad(van, naar, f.mag, f.vast, opties);
    t.push(nu() - s);
  }
  return { ms: gem(t), min: Math.min(...t), p95: pct(t, 0.95), pad: r0 === null ? null : r0.length, vragen, n };
}

// De dichtstbijzijnde begaanbare tegel bij een hoek.
function dichtbij(w, x, y) {
  for (let r = 0; r < 40; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
        const xx = x + dx, yy = y + dy;
        if (xx >= 0 && yy >= 0 && xx < w.b && yy < w.h && T.isBegaanbaar(w, xx, yy)) return { x: xx, y: yy };
      }
    }
  }
  return null;
}

const uit = {};

// ── 1. Het gehucht zelf (76×76, 37 wezens) ──
{
  const S = beginSpel();
  const w = S.wereld;
  const L = w.b;
  const hoek = { nw: dichtbij(w, 0, 0), no: dichtbij(w, L - 1, 0), zw: dichtbij(w, 0, L - 1), zo: dichtbij(w, L - 1, L - 1) };
  const paren = [['nw→zo', hoek.nw, hoek.zo], ['no→zw', hoek.no, hoek.zw], ['nw→no (rand)', hoek.nw, hoek.no], ['nw→zw (rand)', hoek.nw, hoek.zw]];
  uit.gehucht = { kaart: `${w.b}×${w.h}`, wezens: w.wezens.length, hoeken: hoek, paren: {} };
  for (const [naam, a, b] of paren) {
    const zonder = tijd(w, a, b, gewoon(w), 200);
    const met = tijd(w, a, b, metWezens(w, null), 200);
    uit.gehucht.paren[naam] = { zonderWezens: zonder, metWezens: met };
  }
  // Onbereikbaar doel (een tegel die nergens aansluit: de hoek van een rechthoek van bomen): de hele kaart afzoeken.
  // We sluiten de noordwest-hoek af met een ring van vaste tegels (alleen in dit experiment), en zoeken er vanaf de rest heen.
  const a = hoek.zo;
  const kaart = w.tegels;
  const oud = [];
  const cx = 3, cy = 3;
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) === 2) { oud.push([cx + dx, cy + dy, kaart[cy + dy][cx + dx]]); kaart[cy + dy][cx + dx] = 'muur'; }
  }
  const nietBereikbaar = { x: cx, y: cy };
  uit.gehucht.onbereikbaar = { zonderWezens: tijd(w, a, nietBereikbaar, gewoon(w), 50), metWezens: tijd(w, a, nietBereikbaar, metWezens(w, null), 30) };
  for (const [x, y, t] of oud) kaart[y][x] = t;
  // Vanuit het midden naar de rand van het plein en naar de put: zoals een bewoner
  const plein = w.marskramer;
  const dorp = dichtbij(w, 20, 20);
  uit.gehucht.dorpsloop = { van: dorp, naar: plein, zonderWezens: tijd(w, dorp, plein, gewoon(w), 300), metWezens: tijd(w, dorp, plein, metWezens(w, null), 300) };
}

// ── 2. Een grote lege kaart ──
function groot(L, wezens) {
  const w = legeKaart(L);
  // Wezens willekeurig neerzetten (vaste volgorde), als "andere mensen".
  let n = 12345;
  const rnd = () => (n = (n * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < wezens; i++) {
    const x = 2 + Math.floor(rnd() * (L - 4));
    const y = 2 + Math.floor(rnd() * (L - 4));
    w.wezens.push({ tx: x, ty: y, dood: false, binnen: false });
  }
  return w;
}
function muurMetGat(w, x, gatY) {
  const oud = [];
  for (let y = 0; y < w.h; y++) if (y !== gatY) { oud.push([x, y, w.tegels[y][x]]); w.tegels[y][x] = 'muur'; }
  return oud;
}
uit.leeg = {};
for (const L of [76, 256]) {
  const reeks = {};
  for (const wezens of [0, 100, 400, 1600]) {
    const w = groot(L, wezens);
    const hoekA = { x: 0, y: 0 };
    const hoekB = { x: L - 1, y: L - 1 };
    const f = wezens ? metWezens(w, null) : gewoon(w);
    const rij = {};
    // (a) diagonaal van hoek tot hoek
    rij.diagonaal = tijd(w, hoekA, hoekB, f, L > 100 ? 20 : 100);
    // (b) hoek tot een tegel onder een andere hoek (niet diagonaal)
    rij.scheef = tijd(w, hoekA, { x: L - 1, y: Math.floor(L / 3) }, f, L > 100 ? 20 : 100);
    // (c) met een muur dwars over de kaart met één gat aan de overkant: de zoektocht moet de hele kaart rond
    const oud = muurMetGat(w, Math.floor(L / 2), L - 1);
    rij.muurMetGat = tijd(w, { x: 0, y: 0 }, { x: L - 1, y: 0 }, f, L > 100 ? 5 : 20);
    for (const [x, y, t] of oud) w.tegels[y][x] = t;
    // (d) onbereikbaar: het doel zit in een ommuurd hokje, dus de hele kaart wordt afgezocht
    const hok = [];
    const cx = L - 10, cy = L - 10;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (Math.max(Math.abs(dx), Math.abs(dy)) === 2) { hok.push([cx + dx, cy + dy, w.tegels[cy + dy][cx + dx]]); w.tegels[cy + dy][cx + dx] = 'muur'; }
    rij.onbereikbaar = tijd(w, { x: 0, y: 0 }, { x: cx, y: cy }, f, L > 100 ? 2 : 5);
    for (const [x, y, t] of hok) w.tegels[y][x] = t;
    reeks[`${wezens} wezens`] = rij;
  }
  uit.leeg[`${L}×${L}`] = reeks;
}

const f2 = (x) => (x == null ? '-' : x < 10 ? x.toFixed(3) : x.toFixed(1));
const rij = (naam, r) => `${naam.padEnd(16)} gem ${f2(r.ms).padStart(9)} ms  min ${f2(r.min).padStart(9)}  pad ${String(r.pad).padStart(4)}  tegelvragen ${String(r.vragen).padStart(7)}`;
console.log('== Het gehucht', uit.gehucht.kaart, 'met', uit.gehucht.wezens, 'wezens');
for (const [naam, r] of Object.entries(uit.gehucht.paren)) {
  console.log(rij(naam + ' zonder', r.zonderWezens));
  console.log(rij(naam + ' met wezens', r.metWezens));
}
console.log(rij('onbereikb. zonder', uit.gehucht.onbereikbaar.zonderWezens));
console.log(rij('onbereikb. met', uit.gehucht.onbereikbaar.metWezens));
console.log(rij('dorpsloop zonder', uit.gehucht.dorpsloop.zonderWezens), JSON.stringify(uit.gehucht.dorpsloop.van), '->', JSON.stringify(uit.gehucht.dorpsloop.naar));
console.log(rij('dorpsloop met', uit.gehucht.dorpsloop.metWezens));
for (const [maat, reeks] of Object.entries(uit.leeg)) {
  console.log('== Lege kaart', maat);
  for (const [wezens, r] of Object.entries(reeks)) for (const [naam, m] of Object.entries(r)) console.log(rij(`${wezens} ${naam}`, m));
}
require('node:fs').writeFileSync(process.argv[2] || 'uit/astar.json', JSON.stringify(uit, null, 1));
