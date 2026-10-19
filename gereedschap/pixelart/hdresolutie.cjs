// De resolutieproef (werklijst vraag 180; Marcels vijfde opdracht in gereedschap/ai/opdracht-comfyui.md, het verslag in
// gereedschap/ai/hd-resolutie.md): variant C van het wagenwiel (hdproef.cjs: de betere geometrie en de AI-materialen),
// precies gelijk, op 2×, 4×, 8× en 16× interne resolutie (kern.cjs o.fijn: echt fijner gerasterd, niet vergroot), en op
// 1× ter vergelijking. Naar zuidwest, in de acht standen van het lopen.
//
// Elke resolutie wordt verkleind tot de maat waarop hij op een scherm van 1920×1080 staat: een HD-sprite van 2× (het spel
// tekent die op halve zoom, één spritepixel per schermpixel) en de sprite van nu, 1× (2×2 schermpixels per spritepixel),
// met vier filters:
//   naast        nearest neighbour: de pixel in het midden van elk blok;
//   box          het gemiddelde van het blok in lineair licht (dekkend als de helft dekt);
//   lanczos      Lanczos-3, in lineair licht met voorvermenigvuldigde alfa: scherper dan box, met wat overshoot;
//   meerderheid  eerst naar het palet, dan per blok de kleur die het vaakst voorkomt: geen nieuwe kleuren, de pixel art
//                blijft zoals hij is.
// Daarna het palet van de doelmaat (64 kleuren, uit het ideaal hieronder) en een omlijning van één pixel op de doelmaat.
// Het ideaal: 16× met box, de echte gemiddelde kleur van elke schermpixel. Gemeten: de afwijking van dat ideaal, de
// scherpte, de onrust in beweging tegen die van het ideaal (aliasing maakt het onrustiger), en hoeveel pixels nog
// veranderen als de resolutie verdubbelt; en de rendertijd en het geheugen.
//
//   node gereedschap/pixelart/hdresolutie.cjs alles          rendert alles (parallel) en maakt de platen
//   node gereedschap/pixelart/hdresolutie.cjs render <f> <s> één beeld (dat doet `alles`)
//   node gereedschap/pixelart/hdresolutie.cjs platen         de platen en de metingen uit wat er gerenderd is
'use strict';
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const K = require('./kern.cjs');
const H = require('./hdproef.cjs');
const E = require('../ai/etiket.cjs');
const { apng } = require('./apng.cjs');
const { stijlmaat } = require('./stijlmaat.cjs');

const UIT = path.join(__dirname, 'uit', 'hdresolutie');
const RESOLUTIES = [2, 4, 8, 16];
const ALLE = [1, ...RESOLUTIES]; // 1× alleen ter vergelijking
const KANT = 'ZW';
const STANDEN = [0, 1, 2, 3, 4, 5, 6, 7];
const FILTERS = ['naast', 'box', 'lanczos', 'meerderheid'];
const PALET = 64;
// De uitsnede om het wiel naar zuidwest, op 1× (op N× maal N): het wiel is 42×52, met een rand.
const U1 = { x0: 70, y0: 58, b: 50, h: 60 };
const maal = (u, n) => ({ x0: u.x0 * n, y0: u.y0 * n, b: u.b * n, h: u.h * n });
// De naaf, voor de uitsnede die de details per resolutie toont (op 1×).
const NAAF = { x0: 85, y0: 77, b: 20, h: 20 };

// ---------------------------------------------------------------- render: één beeld

function renderEen(fijn, s) {
  const r = H.renderEen(H.VARIANTEN.C, KANT, H.STANDEN[s].hoek, fijn, false);
  let bytes = 0;
  for (const v of Object.values(r.B)) if (ArrayBuffer.isView(v)) bytes += v.byteLength;
  const dir = path.join(UIT, `${fijn}x`);
  H.bewaar(path.join(dir, `${KANT}-${s}.png`), H.alfaSnij(r.met, maal(U1, fijn)));
  H.bewaar(path.join(dir, `${KANT}-${s}-zl.png`), H.alfaSnij(r.zonder, maal(U1, fijn)));
  const uit = { fijn, stand: s, ms: Math.round(r.ms), pixels: r.B.b * r.B.h, buffersMB: +(bytes / 1e6).toFixed(1), piekMB: Math.round(process.resourceUsage().maxRSS / 1024) };
  fs.writeFileSync(path.join(dir, `${KANT}-${s}.json`), JSON.stringify(uit));
  console.log(`${fijn}x stand ${s}: ${uit.ms} ms, buffers ${uit.buffersMB} MB, piek ${uit.piekMB} MB`);
}

// ---------------------------------------------------------------- de filters

const dekt = (r, i) => r.rgba[i * 4 + 3] >= 128;
// Lanczos-3, langs x en dan langs y, met de kern n keer zo breed (verkleinen met factor n).
function lanczos(r, n) {
  const a = 3;
  const L = (x) => (x === 0 ? 1 : Math.abs(x) >= a ? 0 : (a * Math.sin(Math.PI * x) * Math.sin((Math.PI * x) / a)) / (Math.PI * Math.PI * x * x));
  const b = Math.floor(r.b / n);
  const h = Math.floor(r.h / n);
  const src = new Float32Array(r.b * r.h * 4);
  for (let i = 0; i < r.b * r.h; i++) {
    const A = r.rgba[i * 4 + 3] / 255;
    for (let c = 0; c < 3; c++) src[i * 4 + c] = H.lin(r.rgba[i * 4 + c]) * A;
    src[i * 4 + 3] = A;
  }
  const gewichten = (aantal, bron) => Array.from({ length: aantal }, (_, x) => {
    const c = (x + 0.5) * n - 0.5;
    const lijst = [];
    let som = 0;
    for (let s = Math.ceil(c - a * n); s <= Math.floor(c + a * n); s++) {
      if (s < 0 || s >= bron) continue;
      const w = L((s - c) / n);
      lijst.push([s, w]);
      som += w;
    }
    return lijst.map(([s, w]) => [s, w / som]);
  });
  const gx = gewichten(b, r.b);
  const gy = gewichten(h, r.h);
  const tus = new Float32Array(b * r.h * 4);
  for (let y = 0; y < r.h; y++) for (let x = 0; x < b; x++) for (const [s, w] of gx[x]) for (let c = 0; c < 4; c++) tus[(y * b + x) * 4 + c] += src[(y * r.b + s) * 4 + c] * w;
  const uit = { b, h, rgba: Buffer.alloc(b * h * 4) };
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
    const k = [0, 0, 0, 0];
    for (const [s, w] of gy[y]) for (let c = 0; c < 4; c++) k[c] += tus[(s * b + x) * 4 + c] * w;
    if (k[3] < 0.5) continue;
    const o = (y * b + x) * 4;
    for (let c = 0; c < 3; c++) uit.rgba[o + c] = H.srgb(Math.max(0, Math.min(1, k[c] / k[3])));
    uit.rgba[o + 3] = 255;
  }
  return uit;
}
// Meerderheid: per blok de paletkleur die het vaakst voorkomt; doorzichtig als minder dan de helft dekt.
function meerderheid(r, n, P) {
  const q = H.naarPalet(r, P);
  const b = Math.floor(r.b / n);
  const h = Math.floor(r.h / n);
  const uit = { b, h, rgba: Buffer.alloc(b * h * 4) };
  for (let y = 0; y < h; y++) for (let x = 0; x < b; x++) {
    const tel = new Map();
    let dek = 0;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const s = (y * n + j) * r.b + x * n + i;
      if (!dekt(q, s)) continue;
      dek++;
      const k = (q.rgba[s * 4] << 16) | (q.rgba[s * 4 + 1] << 8) | q.rgba[s * 4 + 2];
      tel.set(k, (tel.get(k) || 0) + 1);
    }
    if (dek * 2 < n * n) continue;
    let beste = 0;
    let max = -1;
    for (const [k, t] of tel) if (t > max) [beste, max] = [k, t];
    uit.rgba.set([beste >> 16, (beste >> 8) & 255, beste & 255, 255], (y * b + x) * 4);
  }
  return uit;
}
function verkleinMet(r, n, filter, P) {
  if (n === 1) return r;
  if (filter === 'naast') return H.verklein(r, n, 'naast');
  if (filter === 'box') return H.verklein(r, n, 'filter');
  if (filter === 'lanczos') return lanczos(r, n);
  return meerderheid(r, n, P);
}
// Op de doelmaat: het palet, een omlijning van één pixel, en de omlijning ook naar het palet.
const afmaken = (r, P) => H.naarPalet(H.omlijnBeeld(H.naarPalet(r, P)), P);

// ---------------------------------------------------------------- metingen

const afstand = (a, i, b, j) => Math.hypot(a.rgba[i * 4] - b.rgba[j * 4], a.rgba[i * 4 + 1] - b.rgba[j * 4 + 1], a.rgba[i * 4 + 2] - b.rgba[j * 4 + 2]);
const helder = (r, i) => 0.299 * r.rgba[i * 4] + 0.587 * r.rgba[i * 4 + 1] + 0.114 * r.rgba[i * 4 + 2];
// De afwijking van het ideaal: het gemiddelde kleurverschil waar beide dekken, en het deel van de pixels waar de een dekt
// en de ander niet (het silhouet).
function afwijking(a, b) {
  let som = 0, n = 0, rand = 0, samen = 0;
  for (let i = 0; i < a.b * a.h; i++) {
    const da = dekt(a, i), db = dekt(b, i);
    if (!da && !db) continue;
    samen++;
    if (da !== db) { rand++; continue; }
    som += afstand(a, i, b, i);
    n++;
  }
  return { kleur: som / Math.max(1, n), silhouet: rand / Math.max(1, samen) };
}
// Scherpte: het gemiddelde helderheidsverschil met de buur rechts en onder, binnen het wiel.
function scherpte(r) {
  let som = 0, n = 0;
  for (let y = 0; y + 1 < r.h; y++) for (let x = 0; x + 1 < r.b; x++) {
    const i = y * r.b + x;
    if (!dekt(r, i) || !dekt(r, i + 1) || !dekt(r, i + r.b)) continue;
    som += Math.abs(helder(r, i + 1) - helder(r, i)) + Math.abs(helder(r, i + r.b) - helder(r, i));
    n++;
  }
  return som / Math.max(1, n);
}
// Onrust: het gemiddelde kleurverschil per pixel tussen twee opeenvolgende standen. Het wiel draait, dus nooit nul; tegen
// die van het ideaal gedeeld zegt het hoeveel onrust de resolutie en het filter erbij doen (aliasing: boven 1).
function onrust(beelden) {
  let som = 0, n = 0;
  for (let s = 1; s < beelden.length; s++) {
    const a = beelden[s - 1], b = beelden[s];
    for (let i = 0; i < a.b * a.h; i++) {
      if (!dekt(a, i) || !dekt(b, i)) continue;
      som += afstand(a, i, b, i);
      n++;
    }
  }
  return som / Math.max(1, n);
}
// Hoeveel pixels anders zijn (in of uit, of meer dan 1 in kleur).
function anders(a, b) {
  let d = 0, samen = 0;
  for (let i = 0; i < a.b * a.h; i++) {
    if (!dekt(a, i) && !dekt(b, i)) continue;
    samen++;
    if (dekt(a, i) !== dekt(b, i) || afstand(a, i, b, i) > 1) d++;
  }
  return d / Math.max(1, samen);
}

// ---------------------------------------------------------------- platen

const grond = (r) => H.alfaSnijMetGrond(r);
const groot = (r, n) => H.snij(r, { x0: 0, y0: 0, b: r.b, h: r.h }, n);
const gem = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const r2 = (x, n = 2) => +x.toFixed(n);

function platen() {
  const lees = (f, s, zl) => H.lees(path.join(UIT, `${f}x`, `${KANT}-${s}${zl ? '-zl' : ''}.png`));
  const bron = {};
  for (const f of ALLE) bron[f] = { met: STANDEN.map((s) => lees(f, s, false)), zonder: STANDEN.map((s) => lees(f, s, true)) };
  const meting = { tijd: {}, verkleind: {} };
  // tijd en geheugen
  for (const f of ALLE) {
    const j = STANDEN.map((s) => JSON.parse(fs.readFileSync(path.join(UIT, `${f}x`, `${KANT}-${s}.json`))));
    const pngKB = STANDEN.reduce((t, s) => t + fs.statSync(path.join(UIT, `${f}x`, `${KANT}-${s}.png`)).size, 0) / STANDEN.length / 1024;
    meting.tijd[`${f}x`] = {
      msPerBeeld: Math.round(gem(j.map((x) => x.ms))),
      buffersMB: j[0].buffersMB,
      piekMB: Math.max(...j.map((x) => x.piekMB)),
      sprite: `${U1.b * f}×${U1.h * f}`,
      spriteKB: r2((U1.b * f * U1.h * f * 4) / 1024, 0),
      pngKB: r2(pngKB, 1),
    };
  }
  // per doelmaat (2: de HD-sprite, 1: de sprite van nu): het ideaal, zijn palet, en elke bron met elk filter
  const uitkomst = {};
  for (const t of [2, 1]) {
    const ruwIdeaal = STANDEN.map((s) => H.verklein(bron[16].zonder[s], 16 / t, 'filter'));
    const P = H.paletVan(ruwIdeaal, PALET);
    const ideaal = ruwIdeaal.map((r) => afmaken(r, P));
    const onrustIdeaal = onrust(ideaal);
    const rij = {};
    for (const f of ALLE.filter((x) => x >= t)) {
      for (const filter of f === t ? ['eigen'] : FILTERS) {
        const beelden = f === t ? bron[f].met.map((r) => H.naarPalet(r, P)) : bron[f].zonder.map((r) => afmaken(verkleinMet(r, f / t, filter, P), P));
        const afw = beelden.map((r, s) => afwijking(r, ideaal[s]));
        rij[`${f}x ${filter}`] = {
          f, filter, beelden,
          kleur: r2(gem(afw.map((a) => a.kleur)), 1),
          silhouet: r2(gem(afw.map((a) => a.silhouet)) * 100, 1),
          scherpte: r2(gem(beelden.map(scherpte)), 1),
          onrust: r2(onrust(beelden) / onrustIdeaal),
          stijl: stijlmaat(beelden[0]),
        };
      }
    }
    // hoeveel pixels nog veranderen als de bron verdubbelt (zelfde filter)
    for (const filter of FILTERS) for (const f of RESOLUTIES) {
      const a = rij[`${f}x ${filter}`] || rij[`${f}x eigen`];
      const b = rij[`${2 * f}x ${filter}`];
      if (a && b) b.tegenHalf = r2(gem(STANDEN.map((s) => anders(a.beelden[s], b.beelden[s]))) * 100, 1);
    }
    uitkomst[t] = { ideaal, rij, scherpteIdeaal: r2(gem(ideaal.map(scherpte)), 1) };
    meting.verkleind[`naar ${t}x`] = Object.fromEntries(Object.entries(rij).map(([k, v]) => [k, { kleur: v.kleur, silhouet: v.silhouet, scherpte: v.scherpte, onrust: v.onrust, tegenHalf: v.tegenHalf ?? null, druk: v.stijl.druk, contrast: v.stijl.contrast, kleuren: v.stijl.kleuren }]));
    meting.verkleind[`naar ${t}x`].ideaal = { scherpte: uitkomst[t].scherpteIdeaal };
  }
  fs.writeFileSync(path.join(UIT, 'metingen.json'), JSON.stringify(meting, null, 2));

  // 1. native: elke resolutie op zijn eigen pixels (stand 0, met zijn eigen omlijning, naar een palet van 64 uit die
  // resolutie), en de naaf: hetzelfde stukje wiel uit elke resolutie, om te bekijken vergroot tot dezelfde maat
  const nat = ALLE.map((f) => H.naarPalet(bron[f].met[0], H.paletVan(bron[f].met, PALET)));
  E.bewaar(path.join(UIT, '1-native.png'), [nat.map((r, i) => E.met(grond(r), `${ALLE[i]}× · ${r.b}×${r.h}`))],
    'Native: elke interne resolutie op zijn eigen pixels', 'Variant C, zuidwest, stand 0. Een pixel van het beeld is een pixel van de plaat; 1× staat er ter vergelijking bij.');
  const naafRij = ALLE.map((f, i) => {
    const u = maal({ x0: NAAF.x0 - U1.x0, y0: NAAF.y0 - U1.y0, b: NAAF.b, h: NAAF.h }, f);
    return E.met(groot(grond(H.alfaSnij(nat[i], u)), 16 / f), `${f}× (×${16 / f})`);
  });
  E.bewaar(path.join(UIT, '1-native-naaf.png'), [naafRij], 'De naaf uit elke resolutie, even groot', 'Hetzelfde stukje wiel (20×20 eenheden), alleen om te bekijken vergroot (nearest) tot dezelfde maat: zoveel detail heeft elke resolutie echt.');

  // 2. op 1920×1080: de HD-sprite (doelmaat 2, één spritepixel per schermpixel) en de sprite van nu (doelmaat 1, ×2)
  const ref = H.referentie(52 * 2);
  for (const t of [2, 1]) {
    const U = uitkomst[t];
    const z = 2 / t; // zo groot op het scherm
    const kolommen = ALLE.filter((x) => x >= t);
    const rijen = FILTERS.map((filter) => kolommen.map((f) => (f === t
      ? E.met(groot(grond(U.rij[`${f}x eigen`].beelden[0]), z), `${filter}: ${f}× native`)
      : E.met(groot(grond(U.rij[`${f}x ${filter}`].beelden[0]), z), `${filter}: ${f}×→${t}×`))));
    rijen.push([E.met(groot(grond(U.ideaal[0]), z), 'ideaal (16× box)'), ...(ref ? [E.met(t === 2 ? ref : H.referentie(52 * 2), 'doel (ChatGPT)')] : [])]);
    const titel = t === 2 ? 'Op 1920×1080, als HD-sprite (2 pixels per eenheid, één spritepixel per schermpixel)' : 'Op 1920×1080, als sprite van nu (1 pixel per eenheid, getekend als 2×2)';
    const uitleg = 'Even groot als in het spel. Per rij een filter, per kolom de interne resolutie waaruit verkleind is; daarna het palet van 64 en een omlijning op de doelmaat.';
    E.bewaar(path.join(UIT, `2-1080p-${t}x.png`), rijen, titel, uitleg);
    const plaat = H.lees(path.join(UIT, `2-1080p-${t}x.png`));
    fs.writeFileSync(path.join(UIT, `2-1080p-${t}x-vergroot.png`), K.pngVanBeeld(groot(plaat, 3)));
  }

  // 3. bewegend, als HD-sprite: per rij een filter (naast, box, meerderheid), per kolom 2×, 4×, 8×, 16× en het ideaal,
  // drie keer vergroot om te bekijken
  const U = uitkomst[2];
  const frames = STANDEN.map((s) => {
    const delen = [];
    for (const filter of ['naast', 'box', 'meerderheid']) {
      for (const f of RESOLUTIES) delen.push(groot(grond(f === 2 ? U.rij['2x eigen'].beelden[s] : U.rij[`${f}x ${filter}`].beelden[s]), 3));
      delen.push(groot(grond(U.ideaal[s]), 3));
    }
    return H.naastElkaar(delen, 5);
  });
  fs.writeFileSync(path.join(UIT, '3-draaien-hd.png'), apng(frames.map((r) => ({ b: r.b, h: r.h, rgba: () => r.rgba })), { fps: 6 }));

  console.log(JSON.stringify(meting.tijd, null, 1));
  for (const [t, rij] of Object.entries(meting.verkleind)) {
    console.log(t);
    for (const [k, v] of Object.entries(rij)) console.log(`  ${k}: ${JSON.stringify(v)}`);
  }
}

// ---------------------------------------------------------------- alles, parallel

async function alles() {
  const taken = [];
  for (const f of [16, 8, 4, 2, 1]) for (const s of STANDEN) taken.push([f, s]);
  const t0 = Date.now();
  let i = 0;
  const loop = async () => {
    while (i < taken.length) {
      const [f, s] = taken[i++];
      await new Promise((ok, mis) => execFile(process.execPath, ['--max-old-space-size=6000', __filename, 'render', String(f), String(s)], { maxBuffer: 1e7 }, (e, uit, fout) => {
        process.stdout.write(uit);
        if (e) return mis(new Error(fout || e.message));
        ok();
      }));
    }
  };
  await Promise.all(Array.from({ length: 6 }, loop));
  console.log(`gerenderd in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  platen();
}

const [wat, a1, a2] = require.main === module ? process.argv.slice(2) : ['geladen'];
if (wat === 'geladen');
else if (wat === 'render') renderEen(Number(a1), Number(a2));
else if (wat === 'platen') platen();
else if (wat === 'alles') alles().catch((e) => { console.error(e.message); process.exit(1); });
else console.log('node gereedschap/pixelart/hdresolutie.cjs alles | render <fijn> <stand> | platen');

module.exports = { lanczos, meerderheid, verkleinMet };
